"use strict";

const avatarColors = {
  lavender: ["#eeeaff", "#7869d7"],
  peach: ["#fff0e8", "#cd8056"],
  blue: ["#eaf1ff", "#6687ca"],
  green: ["#e8f7ef", "#4b9b76"],
  pink: ["#ffedf2", "#c66a86"],
  yellow: ["#fff6df", "#b28a38"],
  mint: ["#e4f7f3", "#409889"]
};
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const academicSections = {
  faculty: {
    title: "Faculty",
    subtitle: "Meet the faculty teaching across Northwood University's departments.",
    icon: "♟",
    filter: "Department",
    metrics: [["Faculty members", "45", "+5% this semester"], ["Departments", "6", "Academic departments"], ["Courses taught", "28", "Currently active"]],
    columns: ["Faculty member", "Faculty ID", "Department", "Email", "Courses", "Status"],
    rows: [
      ["Dr. Amina Yusuf", "FAC-201", "Computer Science", "amina.yusuf@northwood.edu", "3 courses", "Active"],
      ["Prof. Daniel Reed", "FAC-202", "Business", "daniel.reed@northwood.edu", "4 courses", "Active"],
      ["Dr. Sana Iqbal", "FAC-203", "Biological Sciences", "sana.iqbal@northwood.edu", "3 courses", "Active"],
      ["Prof. Michael Carter", "FAC-204", "Engineering", "michael.carter@northwood.edu", "4 courses", "Active"],
      ["Dr. Farah Siddiqui", "FAC-205", "Mathematics", "farah.siddiqui@northwood.edu", "2 courses", "On leave"],
      ["Prof. James Bennett", "FAC-206", "Physics", "james.bennett@northwood.edu", "3 courses", "Active"],
      ["Dr. Layla Hassan", "FAC-207", "Psychology", "layla.hassan@northwood.edu", "2 courses", "Active"],
      ["Prof. Omar Malik", "FAC-208", "Humanities", "omar.malik@northwood.edu", "3 courses", "Active"]
    ]
  },
  courses: {
    title: "Courses",
    subtitle: "Explore programs and courses offered this semester.",
    icon: "▣",
    filter: "Department",
    metrics: [["Active courses", "28", "Across all departments"], ["Enrolled students", "350", "This semester"], ["Departments", "6", "Undergraduate programs"]],
    columns: ["Course", "Course code", "Department", "Instructor", "Schedule", "Status"],
    rows: [
      ["Introduction to Computer Science", "CS-101", "Computer Science", "Dr. Amina Yusuf", "Mon / Wed · 09:00 AM", "Active"],
      ["Data Structures & Algorithms", "CS-204", "Computer Science", "Dr. Amina Yusuf", "Tue / Thu · 11:00 AM", "Active"],
      ["Principles of Management", "BUS-110", "Business", "Prof. Daniel Reed", "Mon / Wed · 10:30 AM", "Active"],
      ["Cell Biology", "BIO-205", "Biological Sciences", "Dr. Sana Iqbal", "Tue / Thu · 01:00 PM", "Active"],
      ["Circuit Analysis", "EE-202", "Engineering", "Prof. Michael Carter", "Mon / Fri · 02:00 PM", "Active"],
      ["Calculus II", "MTH-202", "Mathematics", "Dr. Farah Siddiqui", "Wed / Fri · 09:30 AM", "Full"],
      ["Classical Mechanics", "PHY-201", "Physics", "Prof. James Bennett", "Tue / Thu · 10:00 AM", "Active"],
      ["Introduction to Psychology", "PSY-101", "Psychology", "Dr. Layla Hassan", "Mon / Thu · 12:00 PM", "Active"]
    ]
  },
  enrollments: {
    title: "Enrollments",
    subtitle: "Review student program registrations and enrollment status.",
    icon: "⚑",
    filter: "Semester",
    metrics: [["Current enrollments", "350", "Across 8 semesters"], ["Pending review", "12", "Awaiting approval"], ["Programs", "11", "Degree programs"]],
    columns: ["Student", "Student ID", "Degree program", "Semester", "Enrollment date", "Status"],
    rows: [
      ["Ayesha Khan", "STU-1023", "Computer Science", "Semester 6", "Oct 28, 2026", "Active"],
      ["Muhammad Ali", "STU-1024", "Business Administration", "Semester 4", "Oct 27, 2026", "Active"],
      ["Sara Ahmed", "STU-1025", "Psychology", "Semester 3", "Oct 26, 2026", "Active"],
      ["Hamza Tariq", "STU-1026", "Electrical Engineering", "Semester 5", "Oct 25, 2026", "Active"],
      ["Zainab Malik", "STU-1027", "Biological Sciences", "Semester 2", "Oct 24, 2026", "Active"],
      ["Hassan Raza", "STU-1028", "Mathematics", "Semester 7", "Oct 23, 2026", "Active"],
      ["Noor Fatima", "STU-1029", "English Literature", "Semester 1", "Oct 22, 2026", "Pending"],
      ["Usman Shah", "STU-1030", "Physics", "Semester 8", "Oct 21, 2026", "Active"]
    ]
  },
  grades: {
    title: "Grades",
    subtitle: "Review recent assessments and academic performance.",
    icon: "▤",
    filter: "Grade",
    metrics: [["Class average", "84.6%", "Across this semester"], ["Grades submitted", "286", "Of 350 enrollments"], ["Honor roll", "42", "Students above 90%"]],
    columns: ["Student", "Student ID", "Course", "Assessment", "Score", "Grade"],
    rows: [
      ["Ayesha Khan", "STU-1023", "Data Structures", "Midterm exam", "94 / 100", "A"],
      ["Muhammad Ali", "STU-1024", "Principles of Management", "Case study", "88 / 100", "B+"],
      ["Sara Ahmed", "STU-1025", "Research Methods", "Project 1", "91 / 100", "A-"],
      ["Hamza Tariq", "STU-1026", "Circuit Analysis", "Lab practical", "79 / 100", "B"],
      ["Zainab Malik", "STU-1027", "Cell Biology", "Quiz 3", "86 / 100", "B+"],
      ["Hassan Raza", "STU-1028", "Calculus II", "Midterm exam", "97 / 100", "A+"],
      ["Noor Fatima", "STU-1029", "Academic Writing", "Essay 1", "82 / 100", "B"],
      ["Usman Shah", "STU-1030", "Classical Mechanics", "Problem set", "89 / 100", "B+"]
    ]
  },
  attendance: {
    title: "Attendance",
    subtitle: "Daily attendance overview for students across campus.",
    icon: "◉",
    filter: "Status",
    metrics: [["Today's attendance", "92%", "322 of 350 students"], ["Present today", "322", "Across all departments"], ["Needs follow-up", "18", "Absent or unmarked"]],
    columns: ["Student", "Student ID", "Course", "Date", "Check-in", "Status"],
    rows: [
      ["Ayesha Khan", "STU-1023", "Data Structures", "Oct 31, 2026", "08:52 AM", "Present"],
      ["Muhammad Ali", "STU-1024", "Business Management", "Oct 31, 2026", "08:57 AM", "Present"],
      ["Sara Ahmed", "STU-1025", "Research Methods", "Oct 31, 2026", "09:02 AM", "Present"],
      ["Hamza Tariq", "STU-1026", "Circuit Analysis", "Oct 31, 2026", "—", "Absent"],
      ["Zainab Malik", "STU-1027", "Cell Biology", "Oct 31, 2026", "09:05 AM", "Present"],
      ["Hassan Raza", "STU-1028", "Calculus II", "Oct 31, 2026", "09:11 AM", "Late"],
      ["Noor Fatima", "STU-1029", "Academic Writing", "Oct 31, 2026", "—", "Absent"],
      ["Usman Shah", "STU-1030", "Classical Mechanics", "Oct 31, 2026", "08:48 AM", "Present"]
    ]
  },
  notices: {
    title: "Notices",
    subtitle: "University announcements and important campus updates.",
    icon: "▰",
    filter: "Category",
    metrics: [["Published notices", "8", "For this semester"], ["Upcoming events", "3", "Next 14 days"], ["Departments", "6", "Receiving updates"]],
    columns: ["Announcement", "Category", "Audience", "Published", "Priority", "Status"],
    rows: [
      ["Mid Term Examination Schedule", "Examinations", "All departments", "Oct 29, 2026", "High", "Published"],
      ["Result Announcement — Fall 2026", "Academic", "All students", "Oct 27, 2026", "High", "Published"],
      ["Parent Teacher Meeting", "Campus event", "Students & families", "Oct 25, 2026", "Normal", "Published"],
      ["Library extended hours", "Campus update", "All students", "Oct 23, 2026", "Normal", "Published"],
      ["Scholarship application deadline", "Financial aid", "Undergraduate students", "Oct 20, 2026", "High", "Published"],
      ["Faculty development workshop", "Faculty", "Teaching staff", "Oct 18, 2026", "Normal", "Scheduled"]
    ]
  },
  reports: {
    title: "Reports",
    subtitle: "Academic insights and reports for university administration.",
    icon: "▧",
    filter: "Category",
    metrics: [["Reports available", "12", "Updated this semester"], ["Students covered", "350", "Across all programs"], ["Latest report", "Today", "Attendance summary"]],
    columns: ["Report", "Category", "Reporting period", "Last updated", "Format", "Status"],
    rows: [
      ["Daily attendance summary", "Attendance", "Oct 31, 2026", "Today · 09:15 AM", "CSV", "Ready"],
      ["Fall semester enrollment", "Enrollment", "Fall 2026", "Oct 30, 2026", "CSV", "Ready"],
      ["Student performance overview", "Academic", "Fall 2026", "Oct 29, 2026", "CSV", "Ready"],
      ["Department course capacity", "Courses", "Fall 2026", "Oct 27, 2026", "CSV", "Ready"],
      ["Faculty workload report", "Faculty", "Fall 2026", "Oct 24, 2026", "CSV", "Ready"],
      ["Semester grades distribution", "Academic", "Spring 2026", "Oct 21, 2026", "CSV", "Ready"]
    ]
  }
};

const sectionIcons = { faculty: "♟", courses: "▣", enrollments: "⚑", grades: "▤", attendance: "◉", notices: "▰", reports: "▧", settings: "⚙" };

let students = [];
const sectionFilters = {};
let activeAdminEmail = "";

function showLoginGate(message = "", showDemoCredentials = false) {
  $("#appShell").hidden = true;
  $("#authGate").hidden = false;
  $("#loginError").textContent = message;
  $("#loginError").hidden = !message;
  $("#demoCredentials").hidden = !showDemoCredentials;
}

function showDashboard(email) {
  $("#authGate").hidden = true;
  $("#appShell").hidden = false;
  activeAdminEmail = email;
  $("#adminEmail").textContent = email;
  $("#topAdminEmail").textContent = email;
}

async function apiRequest(endpoint, options = {}) {
  const headers = { Accept: "application/json", ...options.headers };
  if (options.body) headers["Content-Type"] = "application/json";
  const response = await fetch(endpoint, { ...options, headers });
  if (response.status === 204) return null;
  if (response.status === 401 && endpoint !== "/api/auth/login" && endpoint !== "/api/auth/session") {
    showLoginGate("Your session has expired. Sign in again to continue.");
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }
  if (!response.ok) {
    const error = new Error(result.error || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return result;
}

function initials(student) {
  return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function studentRow(student) {
  const [background, foreground] = avatarColors[student.color] || avatarColors.lavender;
  const statusClass = `status-${student.status.toLowerCase()}`;
  return `<tr>
    <td><input type="checkbox" class="student-checkbox" aria-label="Select ${escapeHTML(student.firstName)} ${escapeHTML(student.lastName)}" data-student-id="${escapeHTML(student.id)}"></td>
    <td><div class="student-person"><span class="student-avatar" style="background:${background};color:${foreground}">${escapeHTML(initials(student))}</span><span class="student-name"><strong>${escapeHTML(student.firstName)} ${escapeHTML(student.lastName)}</strong><span>${escapeHTML(student.email)}</span></span></div></td>
    <td><span class="student-id">${escapeHTML(student.studentId)}</span></td>
    <td>${escapeHTML(student.semester)}</td>
    <td><span class="course-cell"><i class="course-dot"></i>${escapeHTML(student.program)}</span></td>
    <td><span class="status-badge ${statusClass}">${escapeHTML(student.status)}</span></td>
    <td><div class="row-actions"><button class="row-menu" data-edit-student="${escapeHTML(student.id)}" aria-label="Edit ${escapeHTML(student.firstName)} ${escapeHTML(student.lastName)}">✎</button><button class="row-menu delete-action" data-delete-student="${escapeHTML(student.id)}" aria-label="Delete ${escapeHTML(student.firstName)} ${escapeHTML(student.lastName)}">⌫</button></div></td>
  </tr>`;
}

function recentStudentRow(student) {
  const [background, foreground] = avatarColors[student.color] || avatarColors.lavender;
  return `<tr>
    <td><div class="student-person"><span class="student-avatar" style="background:${background};color:${foreground}">${escapeHTML(initials(student))}</span><span class="student-name"><strong>${escapeHTML(student.firstName)} ${escapeHTML(student.lastName)}</strong></span></div></td>
    <td><span class="student-id">${escapeHTML(student.studentId)}</span></td>
    <td><span class="status-badge status-${student.status.toLowerCase()}">${escapeHTML(student.status)}</span></td>
  </tr>`;
}

function renderStudents() {
  const sortedStudents = [...students].sort((a, b) => b.joined.localeCompare(a.joined));
  const recent = sortedStudents.slice(0, 4);
  $("#recentStudentsBody").innerHTML = recent.map(recentStudentRow).join("");
  $("#studentsTableBody").innerHTML = sortedStudents.map(studentRow).join("");
  $("#totalStudents").textContent = students.length.toLocaleString();
  $("#navStudentCount").textContent = students.length;
  $("#allStudentCount").textContent = students.length;
  $("#dashboardEmpty").hidden = students.length !== 0;
  $("#recentStudentsBody").closest("table").hidden = students.length === 0;
  applyStudentFilters();
}

function renderDashboardSummary(summary) {
  $("#totalStudents").textContent = Number(summary.totalStudents).toLocaleString();
  $("#totalFaculty").textContent = Number(summary.totalFaculty).toLocaleString();
  $("#totalCourses").textContent = Number(summary.totalCourses).toLocaleString();
  $("#attendanceRate").textContent = String(summary.attendanceRate);
}

async function refreshDashboardSummary() {
  renderDashboardSummary(await apiRequest("/api/dashboard"));
}

function applyStudentFilters() {
  const query = $("#studentSearch").value.trim().toLowerCase();
  const semester = $("#semesterFilter").value;
  const status = $("#statusFilter").value;
  const filtered = [...students]
    .sort((a, b) => b.joined.localeCompare(a.joined))
    .filter((student) => {
      const searchable = `${student.firstName} ${student.lastName} ${student.email} ${student.studentId} ${student.program} ${student.semester}`.toLowerCase();
      return (!query || searchable.includes(query)) && (!semester || student.semester === semester) && (!status || student.status === status);
    });
  $("#studentsTableBody").innerHTML = filtered.map(studentRow).join("");
  $("#studentsEmpty").hidden = filtered.length !== 0;
  $("#studentsTableBody").closest("table").hidden = filtered.length === 0;
  $("#paginationText").textContent = `Showing ${filtered.length} of ${students.length} student${students.length === 1 ? "" : "s"}`;
  $("#selectAllListStudents").checked = false;
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast${type === "error" ? " error" : ""}`;
  toast.innerHTML = `<span class="toast-icon">${type === "error" ? "!" : "✓"}</span><span>${escapeHTML(message)}</span>`;
  $("#toastRegion").append(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function openModal(student = null) {
  const form = $("#studentForm");
  form.reset();
  $("#studentRecordId").value = student?.id || "";
  $("#modalTitle").textContent = student ? "Edit student" : "Add a student";
  $("#saveStudentButton").textContent = student ? "Save changes" : "Add student";
  if (student) {
    $("#firstName").value = student.firstName;
    $("#lastName").value = student.lastName;
    $("#email").value = student.email;
    $("#studentId").value = student.studentId;
    $("#semester").value = student.semester;
    $("#program").value = student.program;
    $("#status").value = student.status;
  }
  $("#studentModal").hidden = false;
  document.body.style.overflow = "hidden";
  window.setTimeout(() => $("#firstName").focus(), 0);
}

function closeModal() {
  $("#studentModal").hidden = true;
  document.body.style.overflow = "";
}

function statusBadge(value) {
  const statusClass = String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `<span class="status-badge status-${escapeHTML(statusClass)}">${escapeHTML(value)}</span>`;
}

function renderAcademicTable(page) {
  const section = academicSections[page];
  if (!section) return;
  const body = $(`#${page}TableBody`);
  const search = ($(`#${page}Search`)?.value || "").trim().toLowerCase();
  const filterValue = $(`#${page}Filter`)?.value || "";
  const filterIndex = section.columns.indexOf(section.filter);
  const filteredRows = section.rows.filter((row) => {
    const matchesSearch = !search || row.join(" ").toLowerCase().includes(search);
    const matchesFilter = !filterValue || row[filterIndex] === filterValue;
    return matchesSearch && matchesFilter;
  });
  body.innerHTML = filteredRows.map((row) => `<tr>${row.map((cell, index) => {
    const isStatus = section.columns[index] === "Status" || (page === "attendance" && section.columns[index] === "Status");
    const isGrade = page === "grades" && section.columns[index] === "Grade";
    const content = isStatus || isGrade ? statusBadge(cell) : escapeHTML(cell);
    return `<td>${content}</td>`;
  }).join("")}${page === "notices" ? `<td><button class="button button-outline notice-read-button" data-notice-index="${section.rows.indexOf(row)}">${row[5] === "Read" ? "Read" : "Mark read"}</button></td>` : ""}${page === "reports" ? `<td><button class="row-menu report-download" data-report-index="${section.rows.indexOf(row)}" aria-label="Download ${escapeHTML(row[0])}">↓</button></td>` : ""}</tr>`).join("");
  const recordLabel = page === "faculty" ? "faculty members" : page;
  $(`#${page}ResultCount`).textContent = `Showing ${filteredRows.length} of ${section.rows.length} ${recordLabel}`;
  $(`#${page}Empty`).hidden = filteredRows.length !== 0;
  $(`#${page}Table`).hidden = filteredRows.length === 0;
}

function renderAcademicSection(page) {
  const host = $("#sectionContent");
  host.dataset.page = page;
  if (page === "settings") {
    renderSettings(host);
    return;
  }
  const section = academicSections[page];
  if (!section) return;
  const filterOptions = [...new Set(section.rows.map((row) => row[section.columns.indexOf(section.filter)]))];
  const filterPlural = { Status: "statuses", Grade: "grades", Category: "categories" }[section.filter] || `${section.filter.toLowerCase()}s`;
  host.innerHTML = `
    <div class="section-metrics">
      ${section.metrics.map(([label, value, note], index) => `<article class="section-metric-card metric-tone-${index + 1}"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong><small>${escapeHTML(note)}</small></article>`).join("")}
    </div>
    <section class="panel academic-table-panel">
      <div class="panel-heading students-heading academic-table-heading">
        <div class="section-title"><span class="section-title-icon">${section.icon}</span><div><h2>${escapeHTML(section.title)} directory <span class="heading-count">${section.rows.length}</span></h2><p>Sample records for Northwood University · Fall 2026</p></div></div>
        <button class="button button-outline" id="sectionExportButton"><span>↓</span> Export CSV</button>
      </div>
      <div class="table-toolbar">
        <label class="table-search"><span>⌕</span><input id="${page}Search" type="search" placeholder="Search ${escapeHTML(section.title.toLowerCase())}..." aria-label="Search ${escapeHTML(section.title.toLowerCase())}"></label>
        <div class="filter-group"><select class="select-control" id="${page}Filter" aria-label="Filter by ${escapeHTML(section.filter.toLowerCase())}"><option value="">All ${escapeHTML(filterPlural)}</option>${filterOptions.map((option) => `<option>${escapeHTML(option)}</option>`).join("")}</select></div>
      </div>
      <div class="table-wrap academic-table-wrap">
        <table id="${page}Table"><thead><tr>${section.columns.map((column) => `<th>${escapeHTML(column.toUpperCase())}</th>`).join("")}${page === "notices" || page === "reports" ? "<th>ACTIONS</th>" : ""}</tr></thead><tbody id="${page}TableBody"></tbody></table>
        <div class="empty-state" id="${page}Empty" hidden><span>⌕</span><strong>No matching records</strong><p>Try changing your search or filters.</p></div>
      </div>
      <div class="table-pagination"><span id="${page}ResultCount"></span><span class="sample-record-note">Demo data · Not connected to live university records</span></div>
    </section>
    <div class="section-note"><span>ⓘ</span> Sample academic data is provided for demonstration and can be replaced with your university's records.</div>`;
  renderAcademicTable(page);
}

function renderSettings(host) {
  let settings = {};
  try {
    settings = JSON.parse(localStorage.getItem("northwood-university-settings") || "{}");
  } catch (error) {
    console.error("Could not load university settings.", error);
    showToast("Saved settings could not be loaded.", "error");
  }
  const currentSettings = {
    universityName: settings.universityName || "Northwood University",
    campus: settings.campus || "Main campus",
    academicYear: settings.academicYear || "2026–2027",
    semester: settings.semester || "Fall 2026",
    contactEmail: settings.contactEmail || "admin@northwood.edu",
    emailNotifications: settings.emailNotifications !== false
  };
  host.innerHTML = `
    <div class="section-metrics">
      <article class="section-metric-card metric-tone-1"><span>Current academic year</span><strong>${escapeHTML(currentSettings.academicYear)}</strong><small>University calendar</small></article>
      <article class="section-metric-card metric-tone-2"><span>Active semester</span><strong>${escapeHTML(currentSettings.semester)}</strong><small>Academic session</small></article>
      <article class="section-metric-card metric-tone-3"><span>Campus</span><strong>${escapeHTML(currentSettings.campus)}</strong><small>University location</small></article>
    </div>
    <form class="panel settings-form" id="settingsForm">
      <div class="panel-heading settings-heading"><div class="section-title"><span class="section-title-icon">⚙</span><div><h2>University settings</h2><p>Update the details shown in your administration workspace.</p></div></div></div>
      <div class="settings-grid">
        <label class="form-field"><span>University name</span><input name="universityName" maxlength="80" required value="${escapeHTML(currentSettings.universityName)}"></label>
        <label class="form-field"><span>Campus</span><input name="campus" maxlength="60" required value="${escapeHTML(currentSettings.campus)}"></label>
        <label class="form-field"><span>Academic year</span><input name="academicYear" maxlength="20" required value="${escapeHTML(currentSettings.academicYear)}"></label>
        <label class="form-field"><span>Current semester</span><select name="semester"><option ${currentSettings.semester === "Fall 2026" ? "selected" : ""}>Fall 2026</option><option ${currentSettings.semester === "Spring 2027" ? "selected" : ""}>Spring 2027</option><option ${currentSettings.semester === "Summer 2027" ? "selected" : ""}>Summer 2027</option></select></label>
        <label class="form-field form-field-wide"><span>Administration contact email</span><input name="contactEmail" type="email" maxlength="100" required value="${escapeHTML(currentSettings.contactEmail)}"></label>
        <label class="settings-checkbox"><input type="checkbox" name="emailNotifications" ${currentSettings.emailNotifications ? "checked" : ""}><span><strong>Email notifications</strong><small>Receive academic announcements and attendance alerts.</small></span></label>
      </div>
      <div class="settings-actions"><span>Settings are saved in this browser.</span><button class="button button-primary" type="submit">Save settings</button></div>
    </form>
    <form class="panel settings-form account-form" id="credentialsForm">
      <div class="panel-heading settings-heading"><div class="section-title"><span class="section-title-icon">♙</span><div><h2>Admin account</h2><p>Change your administrator email and password.</p></div></div></div>
      <div class="settings-grid">
        <label class="form-field form-field-wide"><span>Current admin email</span><input type="email" value="${escapeHTML(activeAdminEmail)}" readonly></label>
        <label class="form-field form-field-wide"><span>Current password <b>*</b></span><input name="currentPassword" type="password" required maxlength="256" autocomplete="current-password" placeholder="Enter your current password"></label>
        <label class="form-field form-field-wide"><span>New admin email <b>*</b></span><input name="email" type="email" required maxlength="254" autocomplete="username" value="${escapeHTML(activeAdminEmail)}" placeholder="admin@university.edu"></label>
        <label class="form-field form-field-wide"><span>New password <b>*</b></span><input name="password" type="password" required minlength="12" maxlength="256" autocomplete="new-password" placeholder="At least 12 characters"></label>
        <p class="login-error settings-error" id="credentialsError" role="alert" hidden></p>
      </div>
      <div class="settings-actions"><span>Password must be at least 12 characters.</span><button class="button button-primary" id="saveCredentialsButton" type="submit">Update admin login</button></div>
    </form>
    <div class="section-note"><span>ⓘ</span> Profile and academic settings are demo preferences; student records are stored separately in the SQLite database.</div>`;
}

function exportAcademicSection(page) {
  const section = academicSections[page];
  if (!section) return;
  const csvEscape = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const content = [section.columns, ...section.rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const downloadUrl = URL.createObjectURL(new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `northwood-${page}-fall-2026.csv`;
  link.click();
  URL.revokeObjectURL(downloadUrl);
  showToast(`${section.title} sample data exported.`);
}

function showPage(page) {
  const knownPages = ["dashboard", "students", "faculty", "courses", "enrollments", "grades", "attendance", "notices", "reports", "settings"];
  const selectedPage = knownPages.includes(page) ? page : "dashboard";
  $$(".page-section").forEach((section) => section.classList.remove("active"));
  $$(".nav-item[data-page]").forEach((item) => item.classList.toggle("active", item.dataset.page === selectedPage));
  if (selectedPage === "dashboard" || selectedPage === "students") {
    $(`#${selectedPage}Page`).classList.add("active");
  } else {
    $("#placeholderPage").classList.add("active");
    const labels = { faculty: "Faculty", courses: "Courses", enrollments: "Enrollments", grades: "Grades", attendance: "Attendance", notices: "Notices", reports: "Reports", settings: "Settings" };
    $("#placeholderTitle").textContent = labels[selectedPage];
    $("#placeholderSubtitle").textContent = academicSections[selectedPage]?.subtitle || "Manage university profile and academic preferences.";
    renderAcademicSection(selectedPage);
  }
  $("#sidebar").classList.remove("mobile-open");
}

function exportCSV() {
  if (students.length === 0) {
    showToast("There are no student records to export.", "error");
    return;
  }
  const columns = ["First name", "Last name", "Email", "Student ID", "Semester", "Degree program", "Status"];
  const rows = students.map((student) => [student.firstName, student.lastName, student.email, student.studentId, student.semester, student.program, student.status]);
  const escapeCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const csv = [columns, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "classroom-students.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Student list exported as CSV.");
}

$("#addStudentButton").addEventListener("click", () => openModal());
$("#addStudentListButton").addEventListener("click", () => openModal());
$("#emptyAddStudent").addEventListener("click", () => openModal());
$("#closeModal").addEventListener("click", closeModal);
$("#cancelModal").addEventListener("click", closeModal);
$("#studentModal").addEventListener("click", (event) => {
  if (event.target === $("#studentModal")) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !$("#studentModal").hidden) closeModal();
});

$("#studentForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const recordId = $("#studentRecordId").value;
  const existingStudent = students.find((student) => student.id === recordId);
  const formData = new FormData(event.currentTarget);
  const studentDetails = {
    firstName: String(formData.get("firstName")).trim(),
    lastName: String(formData.get("lastName")).trim(),
    email: String(formData.get("email")).trim(),
    studentId: String(formData.get("studentId")).trim(),
    semester: String(formData.get("semester")),
    program: String(formData.get("program")),
    status: String(formData.get("status"))
  };
  const saveButton = $("#saveStudentButton");
  saveButton.disabled = true;
  try {
    const savedStudent = await apiRequest(
      recordId ? `/api/students/${encodeURIComponent(recordId)}` : "/api/students",
      { method: recordId ? "PUT" : "POST", body: JSON.stringify(studentDetails) }
    );
    students = existingStudent
      ? students.map((item) => item.id === savedStudent.id ? savedStudent : item)
      : [...students, savedStudent];
    renderStudents();
    closeModal();
    showToast(existingStudent ? "Student details updated." : "Student added successfully.");
    refreshDashboardSummary().catch((error) => {
      showToast(`Student saved, but dashboard stats could not be refreshed: ${error.message}`, "error");
    });
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    saveButton.disabled = false;
  }
});

$("#studentSearch").addEventListener("input", applyStudentFilters);
$("#semesterFilter").addEventListener("change", applyStudentFilters);
$("#statusFilter").addEventListener("change", applyStudentFilters);
$("#exportStudents").addEventListener("click", exportCSV);
$("#viewAllStudents").addEventListener("click", () => showPage("students"));
$$(".nav-item[data-page]").forEach((item) => item.addEventListener("click", () => showPage(item.dataset.page)));

async function handleStudentAction(event) {
  const editButton = event.target.closest("[data-edit-student]");
  if (editButton) {
    const student = students.find((item) => item.id === editButton.dataset.editStudent);
    if (student) openModal(student);
    return;
  }
  const deleteButton = event.target.closest("[data-delete-student]");
  if (!deleteButton) return;
  const student = students.find((item) => item.id === deleteButton.dataset.deleteStudent);
  if (!student || !window.confirm(`Delete ${student.firstName} ${student.lastName} from the student list?`)) return;
  deleteButton.disabled = true;
  try {
    await apiRequest(`/api/students/${encodeURIComponent(student.id)}`, { method: "DELETE" });
    students = students.filter((item) => item.id !== student.id);
    renderStudents();
    showToast("Student removed.");
    refreshDashboardSummary().catch((error) => {
      showToast(`Student deleted, but dashboard stats could not be refreshed: ${error.message}`, "error");
    });
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    deleteButton.disabled = false;
  }
}
$("#recentStudentsBody").addEventListener("click", handleStudentAction);
$("#studentsTableBody").addEventListener("click", handleStudentAction);

$("#sectionContent").addEventListener("input", (event) => {
  const page = event.currentTarget.dataset.page;
  if (event.target.matches(`#${page}Search`)) renderAcademicTable(page);
});
$("#sectionContent").addEventListener("change", (event) => {
  const page = event.currentTarget.dataset.page;
  if (event.target.matches(`#${page}Filter`)) renderAcademicTable(page);
});
$("#sectionContent").addEventListener("click", (event) => {
  const page = event.currentTarget.dataset.page;
  if (event.target.closest("#sectionExportButton")) {
    exportAcademicSection(page);
    return;
  }
  const noticeButton = event.target.closest("[data-notice-index]");
  if (noticeButton) {
    const notice = academicSections.notices.rows[Number(noticeButton.dataset.noticeIndex)];
    if (notice) {
      notice[5] = "Read";
      renderAcademicTable("notices");
      showToast("Notice marked as read.");
    }
    return;
  }
  if (event.target.closest("[data-report-index]")) exportAcademicSection("reports");
});
$("#sectionContent").addEventListener("submit", (event) => {
  if (event.target.id === "credentialsForm") {
    event.preventDefault();
    const form = event.target;
    const submitButton = $("#saveCredentialsButton");
    const errorMessage = $("#credentialsError");
    const formData = new FormData(form);
    errorMessage.hidden = true;
    submitButton.disabled = true;
    submitButton.textContent = "Updating...";
    apiRequest("/api/auth/credentials", {
      method: "POST",
      body: JSON.stringify({
        currentPassword: String(formData.get("currentPassword")),
        email: String(formData.get("email")).trim(),
        password: String(formData.get("password"))
      })
    }).then((result) => {
      showDashboard(result.email);
      form.reset();
      showPage("settings");
      showToast("Admin email and password updated.");
    }).catch((error) => {
      errorMessage.textContent = error.message || "Admin login could not be updated.";
      errorMessage.hidden = false;
    }).finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = "Update admin login";
    });
    return;
  }
  if (event.target.id !== "settingsForm") return;
  event.preventDefault();
  const formData = new FormData(event.target);
  const settings = {
    universityName: String(formData.get("universityName")).trim(),
    campus: String(formData.get("campus")).trim(),
    academicYear: String(formData.get("academicYear")).trim(),
    semester: String(formData.get("semester")),
    contactEmail: String(formData.get("contactEmail")).trim(),
    emailNotifications: formData.get("emailNotifications") === "on"
  };
  try {
    localStorage.setItem("northwood-university-settings", JSON.stringify(settings));
    showToast("University settings saved.");
  } catch (error) {
    console.error("Could not save university settings.", error);
    showToast("Settings could not be saved in this browser.", "error");
  }
});

function setupSelectAll(masterId, tableBodyId) {
  const master = $(`#${masterId}`);
  master.addEventListener("change", () => {
    $(`#${tableBodyId}`).querySelectorAll(".student-checkbox").forEach((checkbox) => { checkbox.checked = master.checked; });
  });
}
setupSelectAll("selectAllListStudents", "studentsTableBody");

$("#globalSearch").addEventListener("input", (event) => {
  const input = event.currentTarget;
  if (input.value.trim()) {
    showPage("students");
    $("#studentSearch").value = input.value;
    applyStudentFilters();
  } else {
    $("#studentSearch").value = "";
    applyStudentFilters();
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    $("#globalSearch").focus();
  }
});

$("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("mobile-open"));
$("#notificationButton").addEventListener("click", () => showToast("You're all caught up."));
$("#addCourseButton").addEventListener("click", () => showPage("courses"));
$("#viewReportsButton").addEventListener("click", () => showPage("reports"));
$("#manageNoticesButton").addEventListener("click", () => showPage("notices"));
$("#upcomingEventsButton").addEventListener("click", () => showPage("notices"));
$("#profileButton").addEventListener("click", () => showToast("Signed in as university admin."));
$("#topProfileButton").addEventListener("click", () => showToast("Signed in as university admin."));
$("#chartPeriod").addEventListener("change", (event) => {
  showToast(event.currentTarget.value === "year" ? "Showing enrollment for this year." : "Showing enrollment for this semester.");
});

$("#passwordToggle").addEventListener("click", (event) => {
  const password = $("#loginPassword");
  const showPassword = password.type === "password";
  password.type = showPassword ? "text" : "password";
  event.currentTarget.textContent = showPassword ? "Hide" : "Show";
  event.currentTarget.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
  event.currentTarget.setAttribute("aria-pressed", String(showPassword));
});

$("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = $("#loginSubmit");
  const errorMessage = $("#loginError");
  errorMessage.hidden = true;
  submitButton.disabled = true;
  submitButton.textContent = "Signing in...";
  try {
    const session = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: $("#loginEmail").value.trim(),
        password: $("#loginPassword").value
      })
    });
    showDashboard(session.email);
    $("#loginForm").reset();
    await initializeDashboard();
  } catch (error) {
    errorMessage.textContent = error.message || "Sign-in failed. Please try again.";
    errorMessage.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Sign in to dashboard <span aria-hidden="true">→</span>';
  }
});

$("#logoutButton").addEventListener("click", async () => {
  const button = $("#logoutButton");
  button.disabled = true;
  try {
    const result = await apiRequest("/api/auth/logout", { method: "POST", body: "{}" });
    $("#loginForm").reset();
    showLoginGate("You have been signed out.", result.demoCredentials);
    $("#loginEmail").focus();
  } catch (error) {
    showToast(`Could not sign out: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

async function initializeDashboard() {
  try {
    const [studentRecords, summary] = await Promise.all([
      apiRequest("/api/students"),
      apiRequest("/api/dashboard")
    ]);
    students = studentRecords;
    renderDashboardSummary(summary);
    renderStudents();
  } catch (error) {
    if (error.status === 401) return;
    showToast(`Could not connect to the backend: ${error.message}`, "error");
  }
}

async function initializeApplication() {
  try {
    const session = await apiRequest("/api/auth/session");
    if (!session.authenticated) {
      showLoginGate("", session.demoCredentials);
      return;
    }
    showDashboard(session.email);
    await initializeDashboard();
  } catch (error) {
    showLoginGate(`Could not connect to the server: ${error.message}`);
  }
}

initializeApplication();
