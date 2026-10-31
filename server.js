"use strict";

require("dotenv").config();

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } = require("node:crypto");
const { Pool } = require("pg");

const ROOT = __dirname;
const DATA_DIRECTORY = path.join(ROOT, "data");
const LEGACY_DATA_FILE = path.join(DATA_DIRECTORY, "students.json");
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY_BYTES = 1024 * 1024;
const SESSION_COOKIE = "sms_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;
const DEMO_ADMIN_EMAIL = "admin@northwood.edu";
const DEMO_ADMIN_PASSWORD = "Northwood@123";
const STATIC_FILES = new Set(["/index.html", "/styles.css", "/app.js"]);
const STATUSES = new Set(["Active", "Pending", "Inactive"]);
const SEMESTERS = new Set(Array.from({ length: 8 }, (_, index) => `Semester ${index + 1}`));
const PROGRAMS = new Set([
  "Computer Science",
  "Biological Sciences",
  "Business Administration",
  "Electrical Engineering",
  "Mathematics",
  "Physics",
  "English Literature",
  "History",
  "Chemistry",
  "Fine Arts",
  "Psychology"
]);
const AVATAR_COLORS = ["lavender", "peach", "blue", "green", "pink", "yellow", "mint"];

const SEED_STUDENTS = [
  { id: "1", firstName: "Ayesha", lastName: "Khan", email: "ayesha.khan@northwood.edu", studentId: "STU-1023", semester: "Semester 6", program: "Computer Science", status: "Active", color: "lavender", joined: "2026-10-28" },
  { id: "2", firstName: "Muhammad", lastName: "Ali", email: "muhammad.ali@northwood.edu", studentId: "STU-1024", semester: "Semester 4", program: "Business Administration", status: "Active", color: "blue", joined: "2026-10-27" },
  { id: "3", firstName: "Sara", lastName: "Ahmed", email: "sara.ahmed@northwood.edu", studentId: "STU-1025", semester: "Semester 3", program: "Psychology", status: "Active", color: "peach", joined: "2026-10-26" },
  { id: "4", firstName: "Hamza", lastName: "Tariq", email: "hamza.tariq@northwood.edu", studentId: "STU-1026", semester: "Semester 5", program: "Electrical Engineering", status: "Active", color: "green", joined: "2026-10-25" },
  { id: "5", firstName: "Zainab", lastName: "Malik", email: "zainab.malik@northwood.edu", studentId: "STU-1027", semester: "Semester 2", program: "Biological Sciences", status: "Active", color: "pink", joined: "2026-10-24" },
  { id: "6", firstName: "Hassan", lastName: "Raza", email: "hassan.raza@northwood.edu", studentId: "STU-1028", semester: "Semester 7", program: "Mathematics", status: "Active", color: "yellow", joined: "2026-10-23" },
  { id: "7", firstName: "Noor", lastName: "Fatima", email: "noor.fatima@northwood.edu", studentId: "STU-1029", semester: "Semester 1", program: "English Literature", status: "Pending", color: "mint", joined: "2026-10-22" },
  { id: "8", firstName: "Usman", lastName: "Shah", email: "usman.shah@northwood.edu", studentId: "STU-1030", semester: "Semester 8", program: "Physics", status: "Active", color: "lavender", joined: "2026-10-21" }
];

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

let postgres;
const loginAttempts = new Map();

function hashPassword(password, salt = randomBytes(16)) {
  const hash = scryptSync(password, salt, 64);
  return { salt: salt.toString("hex"), hash: hash.toString("hex") };
}

function verifyPassword(password, storedHash) {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex || !/^[a-f0-9]{32}$/i.test(saltHex) || !/^[a-f0-9]{128}$/i.test(hashHex)) {
    return false;
  }
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

function isStudentRecord(student) {
  return student !== null
    && typeof student === "object"
    && ["id", "firstName", "lastName", "email", "studentId", "semester", "program", "status", "color", "joined"]
      .every((field) => typeof student[field] === "string" && student[field].length > 0)
    && STATUSES.has(student.status)
    && SEMESTERS.has(student.semester)
    && PROGRAMS.has(student.program)
    && AVATAR_COLORS.includes(student.color)
    && /^\d{4}-\d{2}-\d{2}$/.test(student.joined);
}

function readLegacyStudents() {
  if (!fs.existsSync(LEGACY_DATA_FILE)) return SEED_STUDENTS;
  const parsed = JSON.parse(fs.readFileSync(LEGACY_DATA_FILE, "utf8"));
  if (!Array.isArray(parsed) || !parsed.every(isStudentRecord)) {
    throw new Error("The existing student JSON file contains invalid records; it was not imported.");
  }
  return parsed;
}

function toPostgresSql(sql) {
  let index = 0;
  return sql
    .replace(/\b(firstName|lastName|studentId|password_hash|created_at)\b/g, '"$1"')
    .replace(/\s+COLLATE\s+NOCASE/gi, "")
    .replace(/\?/g, () => `$${++index}`);
}

async function dbGet(sql, ...params) {
  const result = await postgres.query(toPostgresSql(sql), params);
  return result.rows[0];
}

async function dbAll(sql, ...params) {
  const result = await postgres.query(toPostgresSql(sql), params);
  return result.rows;
}

async function dbRun(sql, ...params) {
  const result = await postgres.query(toPostgresSql(sql), params);
  return { changes: result.rowCount };
}

async function initializeSchema() {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY NOT NULL,
      "firstName" TEXT NOT NULL CHECK(length("firstName") BETWEEN 1 AND 40),
      "lastName" TEXT NOT NULL CHECK(length("lastName") BETWEEN 1 AND 40),
      email TEXT NOT NULL CHECK(length(email) <= 100),
      "studentId" TEXT NOT NULL CHECK(length("studentId") BETWEEN 1 AND 20),
      semester TEXT NOT NULL CHECK(semester IN (${[...SEMESTERS].map((semester) => `'${semester}'`).join(", ")})),
      program TEXT NOT NULL CHECK(program IN (${[...PROGRAMS].map((program) => `'${program.replace(/'/g, "''")}'`).join(", ")})),
      status TEXT NOT NULL CHECK(status IN (${[...STATUSES].map((status) => `'${status}'`).join(", ")})),
      color TEXT NOT NULL CHECK(color IN (${AVATAR_COLORS.map((color) => `'${color}'`).join(", ")})),
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
}

async function ensureDatabase() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Create a PostgreSQL database and add its connection string to your .env file.");
  }
  if (process.env.VERCEL && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in Vercel before deployment.");
  }
  postgres = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" || process.env.VERCEL ? { rejectUnauthorized: false } : undefined,
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000
  });
  await postgres.query("SELECT 1");
  await initializeSchema();

  const initialization = await dbGet("SELECT value FROM app_meta WHERE key = 'students_seeded'");
  if (!initialization) {
    const existingStudentCount = Number((await dbGet("SELECT COUNT(*) AS count FROM students")).count);
    const sampleStudents = existingStudentCount > 0 ? [] : readLegacyStudents();
    for (const student of sampleStudents) {
      await dbRun(`
        INSERT INTO students (id, firstName, lastName, email, studentId, semester, program, status, color, joined)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT DO NOTHING
      `, student.id, student.firstName, student.lastName, student.email, student.studentId,
      student.semester, student.program, student.status, student.color, student.joined);
    }
    await dbRun("INSERT INTO app_meta (key, value) VALUES ('students_seeded', 'true') ON CONFLICT (key) DO NOTHING");
    if (sampleStudents.length > 0) {
      console.log(`Imported ${sampleStudents.length} sample student records into PostgreSQL.`);
    }
  }

  const adminEmail = (process.env.ADMIN_EMAIL || DEMO_ADMIN_EMAIL).trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || DEMO_ADMIN_PASSWORD;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }
  if (adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
  }
  if (Number((await dbGet("SELECT COUNT(*) AS count FROM administrators")).count) === 0) {
    const credentials = hashPassword(adminPassword);
    await dbRun(`
      INSERT INTO administrators (email, password_hash, created_at)
      VALUES (?, ?, ?)
      ON CONFLICT (email) DO NOTHING
    `, adminEmail, `${credentials.salt}:${credentials.hash}`, new Date().toISOString());
    console.log(`Created the university admin account for ${adminEmail}.`);
  }
  const demoCredentialsState = await dbGet("SELECT value FROM app_meta WHERE key = 'admin_demo_credentials'");
  if (!demoCredentialsState) {
    const admin = await dbGet("SELECT email, password_hash FROM administrators");
    const usesDemoCredentials = admin?.email === DEMO_ADMIN_EMAIL && verifyPassword(DEMO_ADMIN_PASSWORD, admin.password_hash);
    await dbRun("INSERT INTO app_meta (key, value) VALUES ('admin_demo_credentials', ?) ON CONFLICT (key) DO NOTHING", usesDemoCredentials ? "true" : "false");
  }
}

async function hasDemoAdminCredentials() {
  return (await dbGet("SELECT value FROM app_meta WHERE key = 'admin_demo_credentials'"))?.value === "true";
}

async function readStudents() {
  return dbAll("SELECT id, firstName, lastName, email, studentId, semester, program, status, color, joined FROM students ORDER BY joined DESC, firstName ASC");
}

async function insertStudent(student) {
  return dbRun(`
    INSERT INTO students (id, firstName, lastName, email, studentId, semester, program, status, color, joined)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, student.id, student.firstName, student.lastName, student.email, student.studentId,
  student.semester, student.program, student.status, student.color, student.joined);
}

async function updateStudent(student) {
  return dbRun(`
    UPDATE students
    SET firstName = ?, lastName = ?, email = ?, studentId = ?,
        semester = ?, program = ?, status = ?
    WHERE id = ?
  `, student.firstName, student.lastName, student.email, student.studentId,
  student.semester, student.program, student.status, student.id);
}

async function deleteStudent(id) {
  return dbRun("DELETE FROM students WHERE id = ?", id);
}

async function countStudents() {
  return Number((await dbGet("SELECT COUNT(*) AS count FROM students")).count);
}

async function findStudentById(id) {
  return dbGet("SELECT id, firstName, lastName, email, studentId, semester, program, status, color, joined FROM students WHERE id = ?", id);
}

function sendJson(response, status, value) {
  const body = JSON.stringify(value);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(body);
}

async function readJsonBody(request) {
  const contentType = request.headers["content-type"] || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "Send the request body as application/json.");
  }

  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_BODY_BYTES) {
      throw new HttpError(413, "Request body is too large.");
    }
    chunks.push(chunk);
  }
  if (totalBytes === 0) {
    throw new HttpError(400, "A JSON request body is required.");
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Request body must contain valid JSON.");
  }
}

async function validateStudent(input, existingStudent = null) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new HttpError(400, "Student details must be sent as a JSON object.");
  }

  const fields = ["firstName", "lastName", "email", "studentId", "semester", "program", "status"];
  const values = {};
  for (const field of fields) {
    if (typeof input[field] !== "string" || !input[field].trim()) {
      throw new HttpError(400, `${field} is required.`);
    }
    values[field] = input[field].trim();
  }

  if (values.firstName.length > 40 || values.lastName.length > 40) {
    throw new HttpError(400, "Student names must be 40 characters or fewer.");
  }
  if (values.email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    throw new HttpError(400, "Enter a valid email address (maximum 100 characters).");
  }
  if (values.studentId.length > 20) {
    throw new HttpError(400, "Student ID must be 20 characters or fewer.");
  }
  if (!SEMESTERS.has(values.semester)) {
    throw new HttpError(400, "Choose a semester from 1 to 8.");
  }
  if (!PROGRAMS.has(values.program)) {
    throw new HttpError(400, "Choose a valid university degree program.");
  }
  if (!STATUSES.has(values.status)) {
    throw new HttpError(400, "Choose Active, Pending, or Inactive status.");
  }

  const duplicateId = await dbGet("SELECT 1 FROM students WHERE lower(studentId) = lower(?) AND id != ?", values.studentId, existingStudent?.id || "");
  if (duplicateId) {
    throw new HttpError(409, "That student ID is already in use.");
  }
  const duplicateEmail = await dbGet("SELECT 1 FROM students WHERE lower(email) = lower(?) AND id != ?", values.email, existingStudent?.id || "");
  if (duplicateEmail) {
    throw new HttpError(409, "That email address is already in use.");
  }

  return {
    ...values,
    id: existingStudent?.id || randomUUID(),
    color: existingStudent?.color || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    joined: existingStudent?.joined || new Date().toISOString().slice(0, 10)
  };
}

function filterStudents(students, searchParams) {
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const semester = searchParams.get("semester") || "";
  const status = searchParams.get("status") || "";
  return students.filter((student) => {
    const searchable = `${student.firstName} ${student.lastName} ${student.email} ${student.studentId} ${student.program} ${student.semester}`.toLowerCase();
    return (!search || searchable.includes(search))
      && (!semester || student.semester === semester)
      && (!status || student.status === status);
  });
}

async function getDashboardSummary() {
  return {
    totalStudents: await countStudents(),
    totalFaculty: 45,
    totalCourses: 28,
    attendanceRate: 92
  };
}

function getRequestCookies(request) {
  const cookies = new Map();
  for (const part of (request.headers.cookie || "").split(";")) {
    const separator = part.indexOf("=");
    if (separator > 0) {
      cookies.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
    }
  }
  return cookies;
}

async function getAdminSession(request) {
  const token = getRequestCookies(request).get(SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const session = await dbGet("SELECT token_hash, email, expires_at FROM admin_sessions WHERE token_hash = ?", tokenHash);
  if (!session) return null;
  if (Date.parse(session.expires_at) <= Date.now()) {
    await dbRun("DELETE FROM admin_sessions WHERE token_hash = ?", tokenHash);
    return null;
  }
  return { tokenHash, email: session.email };
}

function setSessionCookie(response, token, request, maxAge) {
  const secure = isSecureRequest(request) ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`
  );
}

function isSecureRequest(request) {
  const forwardedProtocol = process.env.VERCEL ? request.headers["x-forwarded-proto"] : null;
  return forwardedProtocol
    ? forwardedProtocol.split(",")[0].trim().toLowerCase() === "https"
    : Boolean(request.socket.encrypted);
}

function checkRequestOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return;
  let parsedOrigin;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    throw new HttpError(403, "This request origin is not allowed.");
  }
  const protocol = isSecureRequest(request) ? "https:" : "http:";
  if (parsedOrigin.origin !== `${protocol}//${request.headers.host}`) {
    throw new HttpError(403, "This request origin is not allowed.");
  }
}

function checkLoginRateLimit(address) {
  const now = Date.now();
  const attempts = (loginAttempts.get(address) || []).filter((timestamp) => now - timestamp < LOGIN_WINDOW_MS);
  loginAttempts.set(address, attempts);
  if (attempts.length >= MAX_LOGIN_ATTEMPTS) {
    throw new HttpError(429, "Too many unsuccessful sign-in attempts. Try again in 15 minutes.");
  }
  return attempts;
}

async function handleAuthApi(request, response, url) {
  if (url.pathname === "/api/auth/session" && request.method === "GET") {
    const session = await getAdminSession(request);
    sendJson(response, 200, session
      ? { authenticated: true, email: session.email, role: "admin" }
      : { authenticated: false, demoCredentials: await hasDemoAdminCredentials() });
    return true;
  }

  if (url.pathname === "/api/auth/login" && request.method === "POST") {
    checkRequestOrigin(request);
    const address = request.socket.remoteAddress || "unknown";
    const attempts = checkLoginRateLimit(address);
    const credentials = await readJsonBody(request);
    if (!credentials || typeof credentials.email !== "string" || typeof credentials.password !== "string"
      || credentials.email.length > 254 || credentials.password.length > 256) {
      throw new HttpError(400, "Enter your admin email and password.");
    }

    const email = credentials.email.trim().toLowerCase();
    const admin = await dbGet("SELECT email, password_hash FROM administrators WHERE lower(email) = lower(?)", email);
    const valid = admin && verifyPassword(credentials.password, admin.password_hash);
    if (!valid) {
      attempts.push(Date.now());
      throw new HttpError(401, "The email or password you entered is incorrect.");
    }

    loginAttempts.delete(address);
    const previousSession = await getAdminSession(request);
    if (previousSession) await dbRun("DELETE FROM admin_sessions WHERE token_hash = ?", previousSession.tokenHash);
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    await dbRun("DELETE FROM admin_sessions WHERE expires_at <= ?", new Date().toISOString());
    await dbRun("INSERT INTO admin_sessions (token_hash, email, expires_at) VALUES (?, ?, ?)", tokenHash, admin.email, expiresAt);
    setSessionCookie(response, token, request, SESSION_TTL_MS / 1000);
    sendJson(response, 200, { authenticated: true, email: admin.email, role: "admin" });
    return true;
  }

  if (url.pathname === "/api/auth/logout" && request.method === "POST") {
    checkRequestOrigin(request);
    const session = await getAdminSession(request);
    if (session) await dbRun("DELETE FROM admin_sessions WHERE token_hash = ?", session.tokenHash);
    setSessionCookie(response, "", request, 0);
    sendJson(response, 200, { authenticated: false, demoCredentials: await hasDemoAdminCredentials() });
    return true;
  }

  if (url.pathname === "/api/auth/credentials" && request.method === "POST") {
    checkRequestOrigin(request);
    const session = await getAdminSession(request);
    if (!session) throw new HttpError(401, "Admin sign-in is required.");
    const credentials = await readJsonBody(request);
    if (!credentials || typeof credentials !== "object" || Array.isArray(credentials)
      || typeof credentials.currentPassword !== "string" || credentials.currentPassword.length > 256
      || typeof credentials.email !== "string" || typeof credentials.password !== "string") {
      throw new HttpError(400, "Enter your current password, admin email, and new password.");
    }

    const email = credentials.email.trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpError(400, "Enter a valid admin email address.");
    }
    if (credentials.password.length < 12 || credentials.password.length > 256) {
      throw new HttpError(400, "Your new password must be between 12 and 256 characters.");
    }

    const admin = await dbGet("SELECT email, password_hash FROM administrators WHERE lower(email) = lower(?)", session.email);
    if (!admin || !verifyPassword(credentials.currentPassword, admin.password_hash)) {
      throw new HttpError(401, "Your current password is incorrect.");
    }
    const conflictingAdmin = await dbGet("SELECT 1 FROM administrators WHERE lower(email) = lower(?) AND email != ?", email, admin.email);
    if (conflictingAdmin) throw new HttpError(409, "That admin email address is already in use.");

    const password = hashPassword(credentials.password);
    await dbRun("UPDATE administrators SET email = ?, password_hash = ? WHERE email = ?", email, `${password.salt}:${password.hash}`, admin.email);
    const usesDemoCredentials = email === DEMO_ADMIN_EMAIL && credentials.password === DEMO_ADMIN_PASSWORD;
    await dbRun("UPDATE app_meta SET value = ? WHERE key = 'admin_demo_credentials'", usesDemoCredentials ? "true" : "false");
    await dbRun("UPDATE admin_sessions SET email = ? WHERE token_hash = ?", email, session.tokenHash);
    sendJson(response, 200, { authenticated: true, email, role: "admin" });
    return true;
  }

  return false;
}

async function handleApi(request, response, url) {
  if (url.pathname === "/api/health" && request.method === "GET") {
    sendJson(response, 200, { status: "ok" });
    return true;
  }

  if (await handleAuthApi(request, response, url)) return true;
  if (url.pathname.startsWith("/api/")) {
    checkRequestOrigin(request);
    if (!await getAdminSession(request)) {
      throw new HttpError(401, "Admin sign-in is required.");
    }
  }

  if (url.pathname === "/api/dashboard" && request.method === "GET") {
    sendJson(response, 200, await getDashboardSummary());
    return true;
  }

  if (url.pathname === "/api/students" && request.method === "GET") {
    sendJson(response, 200, filterStudents(await readStudents(), url.searchParams));
    return true;
  }

  if (url.pathname === "/api/students" && request.method === "POST") {
    const student = await validateStudent(await readJsonBody(request));
    await insertStudent(student);
    sendJson(response, 201, student);
    return true;
  }

  const studentRoute = url.pathname.match(/^\/api\/students\/([^/]+)$/);
  if (studentRoute && (request.method === "PUT" || request.method === "DELETE")) {
    let id;
    try {
      id = decodeURIComponent(studentRoute[1]);
    } catch {
      throw new HttpError(400, "Student ID in the URL is invalid.");
    }

    if (request.method === "DELETE") {
      const result = await deleteStudent(id);
      if (result.changes === 0) throw new HttpError(404, "Student was not found.");
      response.writeHead(204, { "Cache-Control": "no-store" });
      response.end();
      return true;
    }

    const body = await readJsonBody(request);
    const existingStudent = await findStudentById(id);
    if (!existingStudent) throw new HttpError(404, "Student was not found.");
    const updatedStudent = await validateStudent(body, existingStudent);
    await updateStudent(updatedStudent);
    sendJson(response, 200, updatedStudent);
    return true;
  }

  if (url.pathname.startsWith("/api/")) {
    throw new HttpError(404, "API endpoint was not found.");
  }
  return false;
}

async function serveStatic(request, response, pathname) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    throw new HttpError(405, "This method is not allowed for static files.");
  }

  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  if (!STATIC_FILES.has(requestedPath)) {
    throw new HttpError(404, "Page was not found.");
  }
  const filePath = path.resolve(ROOT, `.${requestedPath}`);
  if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
    throw new HttpError(404, "Page was not found.");
  }

  let file;
  try {
    file = await fs.promises.readFile(filePath);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      throw new HttpError(404, "Page was not found.");
    }
    throw error;
  }

  response.writeHead(200, {
    "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(request.method === "HEAD" ? undefined : file);
}

async function handleRequest(request, response) {
  let url;
  try {
    url = new URL(request.url, "http://localhost");
    url.pathname = decodeURIComponent(url.pathname);
  } catch {
    throw new HttpError(400, "Request URL is invalid.");
  }

  if (await handleApi(request, response, url)) {
    return;
  }
  await serveStatic(request, response, url.pathname);
}

const databaseReady = ensureDatabase();
function handleNodeRequest(request, response) {
  databaseReady.then(() => handleRequest(request, response)).catch((error) => {
    const status = error instanceof HttpError ? error.status : 500;
    if (status >= 500) {
      console.error("Request failed:", error);
    }
    if (!response.headersSent) {
      sendJson(response, status, { error: status === 500 ? "An internal server error occurred." : error.message });
    } else {
      response.destroy(error);
    }
  });
}

if (require.main === module) {
  const server = http.createServer(handleNodeRequest);
  databaseReady.then(() => {
    server.listen(PORT, process.env.HOST || (process.env.RENDER ? "0.0.0.0" : "127.0.0.1"), () => {
      console.log(`University student management server is running on port ${PORT}`);
      console.log("Database: PostgreSQL");
    });
  }).catch((error) => {
    console.error("Could not initialize the database:", error);
    process.exitCode = 1;
  });

  server.on("error", (error) => {
    console.error("Could not start the server:", error);
    process.exitCode = 1;
  });

  function closeDatabase() {
    if (postgres) postgres.end().catch((error) => console.error("Could not close the PostgreSQL pool:", error));
  }

  process.on("SIGINT", () => {
    server.close(() => {
      closeDatabase();
      process.exit(0);
    });
  });
  process.on("SIGTERM", () => {
    server.close(() => {
      closeDatabase();
      process.exit(0);
    });
  });
}

module.exports = { handleNodeRequest };
