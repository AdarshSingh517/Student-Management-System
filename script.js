/* ============================================================
   Education — Student Management System
   Application Logic (localStorage-based persistence)
   ============================================================ */

// ─── DATA STORE ─────────────────────────────────────────────
const STORE = {
  students:   load('sms_students')   || [],
  courses:    load('sms_courses')    || [],
  grades:     load('sms_grades')     || [],
  attendance: load('sms_attendance') || [],
  _id:        load('sms_id')         || { s: 1000, g: 100, a: 100 },
};

function load(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function save() {
  localStorage.setItem('sms_students',   JSON.stringify(STORE.students));
  localStorage.setItem('sms_courses',    JSON.stringify(STORE.courses));
  localStorage.setItem('sms_grades',     JSON.stringify(STORE.grades));
  localStorage.setItem('sms_attendance', JSON.stringify(STORE.attendance));
  localStorage.setItem('sms_id',         JSON.stringify(STORE._id));
}
function nextId(type) {
  STORE._id[type] += 1;
  save();
  return STORE._id[type];
}

// ─── SEED DATA (runs only once) ──────────────────────────────
function seed() {
  if (STORE.courses.length) return; // already seeded

  const courses = [
    { id: 'CS101',   name: 'Computer Science', code: 'CS101',   instructor: 'Dr. Alice Chen',   credits: 3, schedule: 'MWF 9–10am',  room: 'Lab A' },
    { id: 'MATH201', name: 'Mathematics',      code: 'MATH201', instructor: 'Prof. Bob Silva',  credits: 4, schedule: 'TTh 10–12pm', room: 'Room 204' },
    { id: 'ENG101',  name: 'English Lit',      code: 'ENG101',  instructor: 'Ms. Carol Wang',   credits: 3, schedule: 'MWF 11–12pm', room: 'Room 105' },
    { id: 'PHYS301', name: 'Physics',          code: 'PHYS301', instructor: 'Dr. David Park',   credits: 4, schedule: 'TTh 1–3pm',   room: 'Lab B' },
    { id: 'BUS201',  name: 'Business Admin',   code: 'BUS201',  instructor: 'Prof. Eva Torres', credits: 3, schedule: 'MWF 2–3pm',   room: 'Room 302' },
  ];
  STORE.courses.push(...courses);

  const names = [
    ['Alice','Johnson'],['Brian','Smith'],['Clara','Davis'],['David','Lee'],['Emma','Wilson'],
    ['Frank','Martinez'],['Grace','Anderson'],['Henry','Taylor'],['Isabella','Thomas'],['James','Jackson'],
    ['Karen','White'],['Liam','Harris'],['Mia','Clark'],['Noah','Lewis'],['Olivia','Robinson'],
  ];
  const courseIds = courses.map(c => c.id);
  const years = ['1st Year','2nd Year','3rd Year','4th Year'];
  const statuses = ['Active','Active','Active','Inactive'];

  names.forEach(([first, last], i) => {
    const id = 'S' + String(1001 + i).padStart(4, '0');
    const course = courseIds[i % courseIds.length];
    STORE.students.push({
      id, firstName: first, lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@school.edu`,
      phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
      dob: `200${Math.floor(i / 5)}-0${(i % 9) + 1}-15`,
      enrollDate: `2024-0${(i % 9) + 1}-01`,
      course, year: years[i % 4], status: statuses[i % 4],
      address: `${100 + i} Campus Drive`,
    });
  });

  // grades
  const assignments = ['Quiz 1', 'Midterm', 'Assignment 1', 'Lab Report', 'Finals'];
  STORE.students.forEach((s, si) => {
    assignments.forEach((asn, ai) => {
      const score = Math.max(50, Math.min(100, 65 + Math.round(Math.sin(si * 3.7 + ai) * 25)));
      STORE.grades.push({
        id: 'G' + String(STORE._id.g++),
        studentId: s.id, courseId: s.course, assignment: asn,
        score, date: `2025-0${ai + 1}-${10 + (si % 20)}`, remarks: '',
      });
    });
  });

  // attendance
  const dates = ['2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09', '2025-01-10'];
  const statOpts = ['Present', 'Present', 'Present', 'Absent', 'Late'];
  STORE.students.forEach((s, si) => {
    dates.forEach((date, di) => {
      STORE.attendance.push({
        id: 'A' + String(STORE._id.a++),
        studentId: s.id, courseId: s.course,
        date, status: statOpts[(si + di) % statOpts.length], notes: '',
      });
    });
  });

  save();
}

// ─── HELPERS ─────────────────────────────────────────────────
function getStudent(id) { return STORE.students.find(s => s.id === id); }
function getCourse(id)  { return STORE.courses.find(c => c.id === id); }
function scoreToGrade(s) {
  if (s >= 90) return 'A';
  if (s >= 80) return 'B';
  if (s >= 70) return 'C';
  if (s >= 60) return 'D';
  return 'F';
}
function studentGPA(studentId) {
  const grades = STORE.grades.filter(g => g.studentId === studentId);
  if (!grades.length) return null;
  return (grades.reduce((a, g) => a + g.score, 0) / grades.length / 10).toFixed(2);
}
function attendanceRate(studentId) {
  const recs = STORE.attendance.filter(a => a.studentId === studentId);
  if (!recs.length) return null;
  const present = recs.filter(a => a.status === 'Present' || a.status === 'Late').length;
  return Math.round((present / recs.length) * 100);
}
function toast(msg, duration = 2800) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.classList.remove('show'), duration);
}
function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// Standard CSS named colors used throughout charts (kept in sync with style.css)
const CHART_COLORS = ['blueviolet', 'mediumseagreen', 'orange', 'darkorchid', 'crimson', 'teal'];

// ─── NAVIGATION ──────────────────────────────────────────────
let currentPage = 'dashboard';
const PAGE_TITLES = {
  dashboard: 'Dashboard', students: 'Students', courses: 'Courses',
  grades: 'Grades', attendance: 'Attendance', reports: 'Reports',
};
const ADD_BTN_LABELS = {
  dashboard:  ['+ Add Student', () => openAddModal()],
  students:   ['+ Add Student', () => openAddModal()],
  courses:    [null, null],
  grades:     ['+ Add Grade', () => openAddGradeModal()],
  attendance: ['+ Mark Attendance', () => openAddAttendanceModal()],
  reports:    [null, null],
};

function navigate(page) {
  if (!PAGE_TITLES[page]) page = 'dashboard'; // guard against unknown page keys
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  const navEl  = document.querySelector(`[data-page="${page}"]`);
  if (pageEl) pageEl.classList.add('active');
  if (navEl)  navEl.classList.add('active');

  document.getElementById('pageTitle').textContent = PAGE_TITLES[page];
  const [label, fn] = ADD_BTN_LABELS[page];
  const btn = document.getElementById('topbarActionBtn');
  if (label) {
    btn.style.display = '';
    btn.textContent = label;
    btn.onclick = fn;
  } else {
    btn.style.display = 'none';
  }

  // close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');

  // render page
  if (page === 'dashboard')  renderDashboard();
  if (page === 'students')   renderStudents();
  if (page === 'courses')    renderCourses();
  if (page === 'grades')     { populateGradeFilters(); renderGrades(); }
  if (page === 'attendance') { populateAttendanceFilters(); renderAttendance(); }
  if (page === 'reports')    renderReports();
}

// ─── DASHBOARD ───────────────────────────────────────────────
function renderDashboard() {
  document.getElementById('statTotalStudents').textContent = STORE.students.length;
  document.getElementById('statTotalCourses').textContent  = STORE.courses.length;

  // avg GPA
  const gpas = STORE.students.map(s => parseFloat(studentGPA(s.id))).filter(v => !isNaN(v));
  document.getElementById('statAvgGrade').textContent = gpas.length
    ? (gpas.reduce((a, v) => a + v, 0) / gpas.length).toFixed(2) + ' GPA' : '—';

  // avg attendance
  const rates = STORE.students.map(s => attendanceRate(s.id)).filter(v => v !== null);
  document.getElementById('statAvgAttendance').textContent = rates.length
    ? Math.round(rates.reduce((a, v) => a + v, 0) / rates.length) + '%' : '—';

  // recent students table
  const recent = [...STORE.students].slice(-5).reverse();
  const tbody = document.getElementById('recentStudentsTbody');
  tbody.innerHTML = recent.map(s => {
    const course = getCourse(s.course);
    const gpa = studentGPA(s.id);
    return `<tr>
      <td><strong>${esc(s.firstName)} ${esc(s.lastName)}</strong></td>
      <td>${esc(course ? course.name : s.course)}</td>
      <td>${gpa ? gpa + ' GPA' : '—'}</td>
      <td><span class="badge ${s.status === 'Active' ? 'badge-green' : 'badge-gray'}">${esc(s.status)}</span></td>
    </tr>`;
  }).join('') || `<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);padding:20px">No students yet</td></tr>`;

  // enrollment bar chart
  const enrollChart = document.getElementById('courseEnrollmentChart');
  const max = Math.max(...STORE.courses.map(c => STORE.students.filter(s => s.course === c.id).length), 1);
  enrollChart.innerHTML = `<div class="bar-chart">${STORE.courses.map((c, i) => {
    const count = STORE.students.filter(s => s.course === c.id).length;
    const pct = Math.round((count / max) * 100);
    return `<div class="bar-row">
      <div class="bar-label" title="${esc(c.name)}">${esc(c.name)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${CHART_COLORS[i % CHART_COLORS.length]}"></div></div>
      <div class="bar-value">${count}</div>
    </div>`;
  }).join('')}</div>`;
}

// ─── STUDENTS ────────────────────────────────────────────────
function renderStudents() {
  const q      = (document.getElementById('studentSearch').value || '').toLowerCase();
  const course = document.getElementById('studentCourseFilter').value;
  const status = document.getElementById('studentStatusFilter').value;

  let list = STORE.students.filter(s => {
    const name = `${s.firstName} ${s.lastName} ${s.email} ${s.id}`.toLowerCase();
    return (!q || name.includes(q))
      && (!course || s.course === course)
      && (!status || s.status === status);
  });

  const tbody = document.getElementById('studentsTbody');
  const empty = document.getElementById('studentsEmpty');
  if (!list.length) {
    tbody.innerHTML = '';
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';
  tbody.innerHTML = list.map(s => {
    const course = getCourse(s.course);
    const gpa = studentGPA(s.id);
    return `<tr>
      <td><code style="font-size:12px;color:var(--text-secondary)">${esc(s.id)}</code></td>
      <td><strong>${esc(s.firstName)} ${esc(s.lastName)}</strong></td>
      <td>${esc(s.email)}</td>
      <td>${esc(course ? course.name : s.course)}</td>
      <td>${esc(s.year)}</td>
      <td>${gpa ? '<span class="grade-' + scoreToGrade(parseFloat(gpa) * 10) + '">' + gpa + '</span>' : '—'}</td>
      <td><span class="badge ${s.status === 'Active' ? 'badge-green' : 'badge-gray'}">${esc(s.status)}</span></td>
      <td>
        <div class="action-btns">
          <button type="button" class="btn btn-outline btn-sm" onclick="editStudent('${s.id}')">✏ Edit</button>
          <button type="button" class="btn btn-danger btn-sm" onclick="deleteStudent('${s.id}')">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // populate course filter once
  const cf = document.getElementById('studentCourseFilter');
  if (cf.options.length <= 1) {
    STORE.courses.forEach(c => {
      const o = document.createElement('option');
      o.value = c.id; o.textContent = c.name;
      cf.appendChild(o);
    });
  }
}

// ─── COURSES ─────────────────────────────────────────────────
function renderCourses() {
  const q = (document.getElementById('courseSearch').value || '').toLowerCase();
  const list = STORE.courses.filter(c =>
    !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
  );
  const grid  = document.getElementById('coursesGrid');
  const empty = document.getElementById('coursesEmpty');
  if (!list.length) { grid.innerHTML = ''; empty.style.display = ''; return; }
  empty.style.display = 'none';
  grid.innerHTML = list.map(c => {
    const enrolled = STORE.students.filter(s => s.course === c.id).length;
    const grades   = STORE.grades.filter(g => g.courseId === c.id);
    const avg      = grades.length ? Math.round(grades.reduce((a, g) => a + g.score, 0) / grades.length) : null;
    return `<div class="course-card">
      <div class="course-card-body">
        <div class="course-name">${esc(c.name)}</div>
        <div class="course-code">${esc(c.code)} &bull; ${esc(c.credits)} Credits</div>
        <div class="course-meta">
          <div class="course-meta-item"><span class="course-meta-label">Instructor</span><span class="course-meta-value">${esc(c.instructor)}</span></div>
          <div class="course-meta-item"><span class="course-meta-label">Schedule</span><span class="course-meta-value">${esc(c.schedule)}</span></div>
          <div class="course-meta-item"><span class="course-meta-label">Room</span><span class="course-meta-value">${esc(c.room)}</span></div>
          <div class="course-meta-item"><span class="course-meta-label">Avg Grade</span><span class="course-meta-value">${avg !== null ? avg + '%' : '—'}</span></div>
        </div>
        <div class="course-enrolled">
          <div class="course-enrolled-num">${enrolled}</div>
          <div class="course-enrolled-label">Students Enrolled</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ─── GRADES ──────────────────────────────────────────────────
function populateGradeFilters() {
  populateSelect('gradeStudentFilter', STORE.students,
    s => ({ value: s.id, label: s.firstName + ' ' + s.lastName }), 'All Students');
  populateSelect('gradeCourseFilter', STORE.courses,
    c => ({ value: c.id, label: c.name }), 'All Courses');
}
function renderGrades() {
  const sid = document.getElementById('gradeStudentFilter').value;
  const cid = document.getElementById('gradeCourseFilter').value;
  let list = STORE.grades.filter(g => (!sid || g.studentId === sid) && (!cid || g.courseId === cid));
  list = [...list].reverse();
  const tbody = document.getElementById('gradesTbody');
  const empty = document.getElementById('gradesEmpty');
  if (!list.length) { tbody.innerHTML = ''; empty.style.display = ''; return; }
  empty.style.display = 'none';
  tbody.innerHTML = list.map(g => {
    const s = getStudent(g.studentId);
    const c = getCourse(g.courseId);
    const grade = scoreToGrade(g.score);
    return `<tr>
      <td>${s ? esc(s.firstName + ' ' + s.lastName) : esc(g.studentId)}</td>
      <td>${c ? esc(c.name) : esc(g.courseId)}</td>
      <td>${esc(g.assignment)}</td>
      <td>${g.score}%</td>
      <td><span class="grade-${grade}">${grade}</span></td>
      <td>${g.date || '—'}</td>
      <td>
        <div class="action-btns">
          <button type="button" class="btn btn-outline btn-sm" onclick="editGrade('${g.id}')">✏</button>
          <button type="button" class="btn btn-danger btn-sm" onclick="deleteGrade('${g.id}')">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ─── ATTENDANCE ──────────────────────────────────────────────
function populateAttendanceFilters() {
  populateSelect('attendanceCourseFilter', STORE.courses,
    c => ({ value: c.id, label: c.name }), 'All Courses');
}
function renderAttendance() {
  const cid  = document.getElementById('attendanceCourseFilter').value;
  const date = document.getElementById('attendanceDateFilter').value;
  let list = STORE.attendance.filter(a => (!cid || a.courseId === cid) && (!date || a.date === date));
  list = [...list].reverse();
  const tbody = document.getElementById('attendanceTbody');
  const empty = document.getElementById('attendanceEmpty');
  if (!list.length) { tbody.innerHTML = ''; empty.style.display = ''; return; }
  empty.style.display = 'none';
  tbody.innerHTML = list.map(a => {
    const s = getStudent(a.studentId);
    const c = getCourse(a.courseId);
    return `<tr>
      <td>${s ? esc(s.firstName + ' ' + s.lastName) : esc(a.studentId)}</td>
      <td>${c ? esc(c.name) : esc(a.courseId)}</td>
      <td>${a.date}</td>
      <td><span class="att-${a.status}">${esc(a.status)}</span></td>
      <td>${esc(a.notes) || '—'}</td>
      <td>
        <div class="action-btns">
          <button type="button" class="btn btn-outline btn-sm" onclick="editAttendance('${a.id}')">✏</button>
          <button type="button" class="btn btn-danger btn-sm" onclick="deleteAttendance('${a.id}')">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ─── REPORTS ─────────────────────────────────────────────────
function renderReports() {
  // Grade Distribution
  const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  STORE.grades.forEach(g => dist[scoreToGrade(g.score)]++);
  const total = STORE.grades.length || 1;
  const gradeColors = { A: 'mediumseagreen', B: 'blueviolet', C: 'orange', D: 'crimson', F: 'darkorchid' };
  document.getElementById('gradeDistChart').innerHTML = `<div class="bar-chart">${
    Object.entries(dist).map(([g, n]) => `<div class="bar-row">
      <div class="bar-label">Grade ${g}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(n / total * 100)}%;background:${gradeColors[g]}"></div></div>
      <div class="bar-value">${n}</div>
    </div>`).join('')
  }</div>`;

  // Attendance Summary
  const attDist = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
  STORE.attendance.forEach(a => { attDist[a.status] = (attDist[a.status] || 0) + 1; });
  const attTotal = STORE.attendance.length || 1;
  const attColors = { Present: 'mediumseagreen', Absent: 'crimson', Late: 'orange', Excused: 'blueviolet' };
  document.getElementById('attendanceSummary').innerHTML = `<div class="bar-chart">${
    Object.entries(attDist).map(([s, n]) => `<div class="bar-row">
      <div class="bar-label">${s}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(n / attTotal * 100)}%;background:${attColors[s] || 'gray'}"></div></div>
      <div class="bar-value">${n}</div>
    </div>`).join('')
  }</div>`;

  // Top Performers
  const performers = STORE.students.map(s => ({ s, gpa: parseFloat(studentGPA(s.id)) || 0 }))
    .filter(x => x.gpa > 0).sort((a, b) => b.gpa - a.gpa).slice(0, 5);
  document.getElementById('topPerformers').innerHTML = `<div class="performer-list">${
    performers.map(({ s, gpa }, i) => `<div class="performer-item">
      <div class="performer-rank rank-${i + 1}">${i + 1}</div>
      <div class="performer-name">${esc(s.firstName + ' ' + s.lastName)}</div>
      <div class="performer-gpa">${gpa} GPA</div>
    </div>`).join('') || '<div style="color:var(--text-secondary);text-align:center;padding:20px">No data yet</div>'
  }</div>`;

  // At-Risk Students (attendance < 75% OR GPA < 2.0)
  const atRisk = STORE.students.filter(s => {
    const rate = attendanceRate(s.id);
    const gpa  = parseFloat(studentGPA(s.id));
    return (rate !== null && rate < 75) || (gpa && gpa < 2.0);
  }).slice(0, 5);
  document.getElementById('atRiskStudents').innerHTML = atRisk.length
    ? `<div class="performer-list">${atRisk.map(s => {
        const rate = attendanceRate(s.id);
        const gpa  = studentGPA(s.id);
        const reasons = [];
        if (rate !== null && rate < 75) reasons.push(`Attendance: ${rate}%`);
        if (gpa && parseFloat(gpa) < 2.0) reasons.push(`GPA: ${gpa}`);
        return `<div class="performer-item">
          <div class="performer-rank" style="background:mistyrose;color:crimson">⚠</div>
          <div class="performer-name">
            <div>${esc(s.firstName + ' ' + s.lastName)}</div>
            <div style="font-size:11px;color:var(--red);font-weight:400">${reasons.join(' · ')}</div>
          </div>
        </div>`;
      }).join('')}</div>`
    : '<div style="color:var(--text-secondary);text-align:center;padding:20px">🎉 No at-risk students</div>';
}

// ─── MODALS ──────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openAddModal() {
  document.getElementById('studentModalTitle').textContent = 'Add Student';
  document.getElementById('studentForm').reset();
  document.getElementById('studentId').value = '';
  document.getElementById('sfEnrollDate').value = new Date().toISOString().slice(0, 10);
  populateCourseSelect('sfCourse');
  openModal('studentModal');
}
function editStudent(id) {
  const s = getStudent(id);
  if (!s) return;
  document.getElementById('studentModalTitle').textContent = 'Edit Student';
  document.getElementById('studentId').value = s.id;
  document.getElementById('sfFirstName').value = s.firstName;
  document.getElementById('sfLastName').value  = s.lastName;
  document.getElementById('sfEmail').value     = s.email;
  document.getElementById('sfPhone').value     = s.phone || '';
  document.getElementById('sfDob').value       = s.dob || '';
  document.getElementById('sfEnrollDate').value = s.enrollDate || '';
  document.getElementById('sfYear').value      = s.year;
  document.getElementById('sfStatus').value    = s.status;
  document.getElementById('sfAddress').value   = s.address || '';
  populateCourseSelect('sfCourse', s.course);
  openModal('studentModal');
}
function saveStudent(e) {
  e.preventDefault();
  const id = document.getElementById('studentId').value;
  const data = {
    firstName:  document.getElementById('sfFirstName').value.trim(),
    lastName:   document.getElementById('sfLastName').value.trim(),
    email:      document.getElementById('sfEmail').value.trim(),
    phone:      document.getElementById('sfPhone').value.trim(),
    dob:        document.getElementById('sfDob').value,
    enrollDate: document.getElementById('sfEnrollDate').value,
    course:     document.getElementById('sfCourse').value,
    year:       document.getElementById('sfYear').value,
    status:     document.getElementById('sfStatus').value,
    address:    document.getElementById('sfAddress').value.trim(),
  };
  if (!data.firstName || !data.lastName || !data.email || !data.course) {
    toast('⚠ Please fill in all required fields');
    return;
  }
  if (id) {
    const idx = STORE.students.findIndex(s => s.id === id);
    if (idx !== -1) STORE.students[idx] = { ...STORE.students[idx], ...data };
    toast('✅ Student updated');
  } else {
    const newId = 'S' + String(nextId('s')).padStart(4, '0');
    STORE.students.push({ id: newId, ...data });
    toast('✅ Student added — ID: ' + newId);
  }
  save();
  closeModal('studentModal');
  if (currentPage === 'students') renderStudents();
  if (currentPage === 'dashboard') renderDashboard();
}
function deleteStudent(id) {
  if (!confirm('Delete this student? Their grades and attendance will also be removed.')) return;
  STORE.students   = STORE.students.filter(s => s.id !== id);
  STORE.grades     = STORE.grades.filter(g => g.studentId !== id);
  STORE.attendance = STORE.attendance.filter(a => a.studentId !== id);
  save();
  toast('🗑 Student deleted');
  renderStudents();
}

function openAddGradeModal() {
  document.getElementById('gradeModalTitle').textContent = 'Add Grade';
  document.getElementById('gradeForm').reset();
  document.getElementById('gradeId').value = '';
  document.getElementById('gfDate').value = new Date().toISOString().slice(0, 10);
  populateSelect('gfStudent', STORE.students, s => ({ value: s.id, label: s.firstName + ' ' + s.lastName }), 'Select Student');
  populateCourseSelect('gfCourse');
  openModal('gradeModal');
}
function editGrade(id) {
  const g = STORE.grades.find(x => x.id === id);
  if (!g) return;
  document.getElementById('gradeModalTitle').textContent = 'Edit Grade';
  document.getElementById('gradeId').value      = g.id;
  document.getElementById('gfAssignment').value = g.assignment;
  document.getElementById('gfScore').value      = g.score;
  document.getElementById('gfDate').value       = g.date;
  document.getElementById('gfRemarks').value    = g.remarks || '';
  populateSelect('gfStudent', STORE.students, s => ({ value: s.id, label: s.firstName + ' ' + s.lastName }), 'Select Student', g.studentId);
  populateCourseSelect('gfCourse', g.courseId);
  openModal('gradeModal');
}
function saveGrade(e) {
  e.preventDefault();
  const id = document.getElementById('gradeId').value;
  const scoreVal = parseInt(document.getElementById('gfScore').value, 10);
  const data = {
    studentId:  document.getElementById('gfStudent').value,
    courseId:   document.getElementById('gfCourse').value,
    assignment: document.getElementById('gfAssignment').value.trim(),
    score:      isNaN(scoreVal) ? 0 : Math.max(0, Math.min(100, scoreVal)),
    date:       document.getElementById('gfDate').value,
    remarks:    document.getElementById('gfRemarks').value.trim(),
  };
  if (!data.studentId || !data.courseId || !data.assignment) {
    toast('⚠ Please fill in all required fields');
    return;
  }
  if (id) {
    const idx = STORE.grades.findIndex(g => g.id === id);
    if (idx !== -1) STORE.grades[idx] = { ...STORE.grades[idx], ...data };
    toast('✅ Grade updated');
  } else {
    STORE.grades.push({ id: 'G' + nextId('g'), ...data });
    toast('✅ Grade added');
  }
  save();
  closeModal('gradeModal');
  if (currentPage === 'grades') renderGrades();
  if (currentPage === 'dashboard') renderDashboard();
}
function deleteGrade(id) {
  if (!confirm('Delete this grade record?')) return;
  STORE.grades = STORE.grades.filter(g => g.id !== id);
  save(); toast('🗑 Grade deleted'); renderGrades();
}

function openAddAttendanceModal() {
  document.getElementById('attendanceForm').reset();
  document.getElementById('attendanceId').value = '';
  document.getElementById('afDate').value = new Date().toISOString().slice(0, 10);
  populateSelect('afStudent', STORE.students, s => ({ value: s.id, label: s.firstName + ' ' + s.lastName }), 'Select Student');
  populateCourseSelect('afCourse');
  openModal('attendanceModal');
}
function editAttendance(id) {
  const a = STORE.attendance.find(x => x.id === id);
  if (!a) return;
  document.getElementById('attendanceId').value = a.id;
  document.getElementById('afDate').value   = a.date;
  document.getElementById('afStatus').value = a.status;
  document.getElementById('afNotes').value  = a.notes || '';
  populateSelect('afStudent', STORE.students, s => ({ value: s.id, label: s.firstName + ' ' + s.lastName }), 'Select Student', a.studentId);
  populateCourseSelect('afCourse', a.courseId);
  openModal('attendanceModal');
}
function saveAttendance(e) {
  e.preventDefault();
  const id = document.getElementById('attendanceId').value;
  const data = {
    studentId: document.getElementById('afStudent').value,
    courseId:  document.getElementById('afCourse').value,
    date:      document.getElementById('afDate').value,
    status:    document.getElementById('afStatus').value,
    notes:     document.getElementById('afNotes').value.trim(),
  };
  if (!data.studentId || !data.courseId || !data.date) {
    toast('⚠ Please fill in all required fields');
    return;
  }
  if (id) {
    const idx = STORE.attendance.findIndex(a => a.id === id);
    if (idx !== -1) STORE.attendance[idx] = { ...STORE.attendance[idx], ...data };
    toast('✅ Attendance updated');
  } else {
    STORE.attendance.push({ id: 'A' + nextId('a'), ...data });
    toast('✅ Attendance recorded');
  }
  save();
  closeModal('attendanceModal');
  if (currentPage === 'attendance') renderAttendance();
}
function deleteAttendance(id) {
  if (!confirm('Delete this attendance record?')) return;
  STORE.attendance = STORE.attendance.filter(a => a.id !== id);
  save(); toast('🗑 Record deleted'); renderAttendance();
}

// ─── SELECT HELPERS ──────────────────────────────────────────
function populateCourseSelect(selId, selectedId) {
  populateSelect(selId, STORE.courses, c => ({ value: c.id, label: c.name }), 'Select Course', selectedId);
}
function populateSelect(selId, items, mapper, placeholder, selectedVal) {
  const sel = document.getElementById(selId);
  sel.innerHTML = `<option value="">${esc(placeholder)}</option>` +
    items.map(i => {
      const { value, label } = mapper(i);
      return `<option value="${esc(value)}" ${value === selectedVal ? 'selected' : ''}>${esc(label)}</option>`;
    }).join('');
}

// ─── EXPORT ──────────────────────────────────────────────────
function exportCSV(filename, headers, rows) {
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = filename;
  a.click();
  toast('⬇ Export ready: ' + filename);
}
function exportStudentsCSV() {
  exportCSV('students.csv',
    ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Course', 'Year', 'Status', 'GPA', 'Attendance %'],
    STORE.students.map(s => {
      const c = getCourse(s.course);
      return [s.id, s.firstName, s.lastName, s.email, s.phone || '',
        c ? c.name : s.course, s.year, s.status, studentGPA(s.id) || '', attendanceRate(s.id) ?? ''];
    })
  );
}
function exportGradesCSV() {
  exportCSV('grades.csv',
    ['Grade ID', 'Student ID', 'Student Name', 'Course', 'Assignment', 'Score', 'Letter Grade', 'Date'],
    STORE.grades.map(g => {
      const s = getStudent(g.studentId);
      const c = getCourse(g.courseId);
      return [g.id, g.studentId, s ? s.firstName + ' ' + s.lastName : '', c ? c.name : g.courseId,
        g.assignment, g.score, scoreToGrade(g.score), g.date || ''];
    })
  );
}
function printReport() { window.print(); }

// ─── INIT (runs after DOM is ready — script is loaded at end of <body>) ─────
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) closeModal(o.id); });
});
document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigate(item.dataset.page);
  });
});

seed();
navigate('dashboard');