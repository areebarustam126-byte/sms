"use strict";

require("dotenv").config();

const path = require("node:path");
const { randomBytes, scryptSync } = require("node:crypto");
const Database = require("better-sqlite3");
const { Pool } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;
const SQLITE_FILE = process.env.DATABASE_PATH || path.join(__dirname, "..", "data", "students.sqlite");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!DATABASE_URL) {
  console.error("Set DATABASE_URL to the Neon PostgreSQL connection string before running this migration.");
  process.exitCode = 1;
} else {
  migrate().catch((error) => {
    console.error("SQLite to PostgreSQL migration failed:", error.message);
    process.exitCode = 1;
  });
}

async function migrate() {
  const sqlite = new Database(SQLITE_FILE, { readonly: true, fileMustExist: true });
  const postgres = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 10000
  });
  let client;
  let transactionStarted = false;

  try {
    client = await postgres.connect();
    const students = sqlite.prepare("SELECT id, firstName, lastName, email, studentId, semester, program, status, color, joined FROM students").all();
    const administrators = sqlite.prepare("SELECT email, password_hash, created_at FROM administrators").all();
    const metadata = sqlite.prepare("SELECT key, value FROM app_meta").all();
    if (Boolean(ADMIN_EMAIL) !== Boolean(ADMIN_PASSWORD)) {
      throw new Error("Set both ADMIN_EMAIL and ADMIN_PASSWORD, or neither, before migration.");
    }
    if (ADMIN_EMAIL && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL)
      || ADMIN_PASSWORD.length < 12 || ADMIN_PASSWORD.length > 256)) {
      throw new Error("ADMIN_EMAIL must be valid and ADMIN_PASSWORD must contain 12–256 characters.");
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY NOT NULL,
        "firstName" TEXT NOT NULL CHECK(length("firstName") BETWEEN 1 AND 40),
        "lastName" TEXT NOT NULL CHECK(length("lastName") BETWEEN 1 AND 40),
        email TEXT NOT NULL CHECK(length(email) <= 100),
        "studentId" TEXT NOT NULL CHECK(length("studentId") BETWEEN 1 AND 20),
        semester TEXT NOT NULL CHECK(semester IN ('Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8')),
        program TEXT NOT NULL CHECK(program IN ('Computer Science', 'Biological Sciences', 'Business Administration', 'Electrical Engineering', 'Mathematics', 'Physics', 'English Literature', 'History', 'Chemistry', 'Fine Arts', 'Psychology')),
        status TEXT NOT NULL CHECK(status IN ('Active', 'Pending', 'Inactive')),
        color TEXT NOT NULL CHECK(color IN ('lavender', 'peach', 'blue', 'green', 'pink', 'yellow', 'mint')),
        joined TEXT NOT NULL CHECK(joined ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_students_email_lower ON students (lower(email));
      CREATE UNIQUE INDEX IF NOT EXISTS idx_students_student_id_lower ON students (lower("studentId"));
      CREATE INDEX IF NOT EXISTS idx_students_joined ON students (joined DESC);
      CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS administrators (
        email TEXT PRIMARY KEY NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS admin_sessions (
        token_hash TEXT PRIMARY KEY NOT NULL,
        email TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry ON admin_sessions (expires_at);
    `);

    await client.query("BEGIN");
    transactionStarted = true;
    for (const student of students) {
      await client.query(`
        INSERT INTO students (id, "firstName", "lastName", email, "studentId", semester, program, status, color, joined)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          "firstName" = EXCLUDED."firstName", "lastName" = EXCLUDED."lastName",
          email = EXCLUDED.email, "studentId" = EXCLUDED."studentId",
          semester = EXCLUDED.semester, program = EXCLUDED.program,
          status = EXCLUDED.status, color = EXCLUDED.color, joined = EXCLUDED.joined
      `, [student.id, student.firstName, student.lastName, student.email, student.studentId,
        student.semester, student.program, student.status, student.color, student.joined]);
    }

    if (ADMIN_EMAIL) {
      const salt = randomBytes(16);
      const passwordHash = scryptSync(ADMIN_PASSWORD, salt, 64);
      await client.query("DELETE FROM administrators");
      await client.query(`
        INSERT INTO administrators (email, password_hash, created_at)
        VALUES ($1, $2, $3)
      `, [ADMIN_EMAIL, `${salt.toString("hex")}:${passwordHash.toString("hex")}`, new Date().toISOString()]);
    } else {
      for (const admin of administrators) {
        await client.query(`
          INSERT INTO administrators (email, password_hash, created_at)
          VALUES ($1, $2, $3)
          ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, created_at = EXCLUDED.created_at
        `, [admin.email.toLowerCase(), admin.password_hash, admin.created_at]);
      }
    }

    for (const entry of metadata) {
      await client.query(`
        INSERT INTO app_meta (key, value) VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `, [entry.key, entry.value]);
    }
    if (ADMIN_EMAIL) {
      const isDemoLogin = ADMIN_EMAIL === "admin@northwood.edu" && ADMIN_PASSWORD === "Northwood@123";
      await client.query(`
        INSERT INTO app_meta (key, value) VALUES ('admin_demo_credentials', $1)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `, [isDemoLogin ? "true" : "false"]);
    }
    await client.query("COMMIT");
    transactionStarted = false;
    console.log(`Migrated ${students.length} student records and ${administrators.length} admin account(s) to PostgreSQL.`);
    console.log(ADMIN_EMAIL
      ? `Configured the PostgreSQL admin account as ${ADMIN_EMAIL}; only a salted password hash was stored.`
      : "Admin password hashes were copied as-is; plaintext passwords were not read or transferred.");
  } catch (error) {
    if (transactionStarted) await client.query("ROLLBACK");
    throw error;
  } finally {
    if (client) client.release();
    try {
      await postgres.end();
    } finally {
      sqlite.close();
    }
  }
}
