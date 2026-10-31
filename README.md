# SMS — University Student Management System

A responsive university student management app with a plain HTML/CSS/JavaScript frontend, a Node.js API, and PostgreSQL for all application data.

## Run it

Create a PostgreSQL database (Neon has a free tier), then run `Copy-Item .env.example .env` in PowerShell. Open `.env` and replace the example values for `DATABASE_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` with your own. Then run `npm run dev` and visit `http://127.0.0.1:3000`. The app and API use PostgreSQL only. Run `npm run check` to check JavaScript syntax.

## Deploy to Vercel with persistent storage

The app always requires PostgreSQL; SQLite is not used by the app. For a Vercel deployment:

1. Create a free PostgreSQL database on Neon and copy its pooled connection string. Keep it private.
2. Copy `.env.example` to `.env` and enter the Neon connection string, production admin email, and a strong password in `.env`. Keep this file private. If you have existing local records in `data/students.sqlite`, migrate them before deploying:

   ```powershell
   npm run migrate:postgres
   ```

   The one-time migration tool reads the old SQLite file and writes to PostgreSQL; the running app itself never uses SQLite. It copies students and app metadata, then creates the admin with a salted password hash. It does not copy active sessions. Run again only if you need to sync old SQLite records; it will also reset the PostgreSQL admin to the credentials entered.
3. Push the project to GitHub and import it into Vercel using the **Other** framework preset. Leave build/output directory settings empty.
4. In Vercel project **Settings → Environment Variables**, set the same `DATABASE_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` values for Production (and Preview if used). Use a strong password of at least 12 characters. Never put the connection string or password in source code or commit them.
5. Redeploy. Vercel serves the static frontend and routes `/api/*` to `api/[...path].js`. Both data and login sessions are stored in PostgreSQL, so serverless instance restarts do not erase them.

The first database connection creates the schema automatically and imports sample students only when the database has no seed marker. Use Neon free-tier quotas/limits for a demo; check the provider's current plan before relying on it for production records.

## Admin sign-in

The dashboard opens behind an administrator sign-in screen. On the first run, the account is created using the exact `ADMIN_EMAIL` and `ADMIN_PASSWORD` values in `.env`. Choose and remember your own values.

The password is stored as a salted scrypt hash in PostgreSQL. Choose a private password of at least 12 characters before the first run. The account is created only when the administrators table is empty, so changing `.env` does not reset an existing password.

Successful sign-in uses an HttpOnly, SameSite session cookie that expires after eight hours. Session tokens are hashed and stored in the selected database, so sign-in survives server restarts and works across serverless instances. Sign out to revoke the current session.

To change the admin email and password, sign in and open **Settings → Admin account**. Enter the current password and the new email/password there; the server verifies the current password and stores the replacement as a salted hash. New passwords must contain at least 12 characters. Do not send passwords in chat or commit them to project files.

## Included

- University dashboard with academic statistics, semester enrollment chart, quick actions, recent students, and campus events.
- Student directory with search, semester/status filters, degree-program records, and CSV export.
- Populated faculty, courses, enrollments, grades, attendance, notices, and reports views with searchable demo records, filters, and CSV export.
- Editable university preferences saved in the current browser.
- REST API for listing, adding, editing, and deleting students.
- Admin sign-in and sign-out, with student and dashboard API routes protected by the administrator session.
- Admin email and password can be updated from Settings after verifying the current password.
- PostgreSQL storage for student records, admin accounts, and sessions, with unique student-ID and email constraints.
- `npm run migrate:postgres` as an optional one-time importer for an older `data/students.sqlite` database.
- Automatic one-time import of existing sample records from `data/students.json` when the database is empty; if no legacy file exists, eight demo students are seeded.
- Server-side required-field, email, semester, program, status, and duplicate ID/email validation.
- CSV export for student records.
- Responsive layouts for desktop, tablet, and mobile.

The sample student records and dashboard statistics are demo data. All student changes, admin accounts, and login sessions are stored in PostgreSQL. The old `data/students.json` file is retained as a seed source and is not changed. Faculty, courses, enrollments, grades, attendance, notices, and reports have sample records and CSV export; administration settings can be edited and saved in the current browser.

## API

- `GET /api/health` — server health check.
- `GET /api/auth/session` — check the current sign-in.
- `POST /api/auth/login` — sign in with JSON `{ "email": "...", "password": "..." }`.
- `POST /api/auth/logout` — sign out and revoke the session.
- `POST /api/auth/credentials` — update the admin email and password using `{ "currentPassword": "...", "email": "...", "password": "..." }`; requires an active admin session and current password.
- `GET /api/dashboard` — university dashboard totals; requires admin sign-in.
- `GET /api/students` — student list; requires admin sign-in and accepts optional `search`, `semester`, and `status` query parameters.
- `POST /api/students` — create a student; requires admin sign-in.
- `PUT /api/students/:id` — update a student; requires admin sign-in.
- `DELETE /api/students/:id` — delete a student; requires admin sign-in.

Student create/update requests use JSON with `firstName`, `lastName`, `email`, `studentId`, `semester` (`Semester 1`–`Semester 8`), `program`, and `status` (`Active`, `Pending`, or `Inactive`).
