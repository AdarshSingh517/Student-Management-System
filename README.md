# 🎓 EduTrack — Student Management System

A fully functional **Student Management System** built with vanilla HTML, CSS, and JavaScript. Data is persisted in the browser via `localStorage` — no backend or build tools required.

---

## 🚀 Features

| Module | Capabilities |
|--------|-------------|
| **Dashboard** | KPI stats (total students, courses, avg GPA, attendance), recent students table, course enrollment bar chart |
| **Students** | Add / Edit / Delete students, search by name/email/ID, filter by course & status, auto-generated student IDs |
| **Courses** | View all courses with instructor, schedule, room, credits, enrollment count, and average grade |
| **Grades** | Add / Edit / Delete grade records, filter by student & course, letter-grade calculation (A–F), GPA tracking |
| **Attendance** | Mark / Edit / Delete attendance (Present / Absent / Late / Excused), filter by course & date |
| **Reports** | Grade distribution chart, attendance summary, top performers leaderboard, at-risk student alerts, CSV export, print |

---

## 🛠 Tech Stack

- **HTML5** — Semantic markup, accessible forms
- **CSS3** — Custom properties, CSS Grid, Flexbox, responsive layout
- **Vanilla JavaScript (ES6+)** — Modules, localStorage persistence, dynamic DOM rendering
- **No frameworks, no dependencies** — runs entirely in the browser

---

## 📂 Project Structure

```
student-management-system/
├── index.html       # App shell & all modals
├── style.css        # Design system & component styles
├── app.js           # Data store, business logic, UI rendering
└── README.md
```

---

## ▶️ How to Run

### Option 1 — Open directly
Double-click `index.html` in your file manager (or drag it into a browser tab).

### Option 2 — Local dev server
```bash
# Python 3
python -m http.server 8080

# Node (npx)
npx serve .
```
Then open `http://localhost:8080`.

---

## 📊 Data Model

```
Student   { id, firstName, lastName, email, phone, dob, enrollDate, course, year, status, address }
Course    { id, name, code, instructor, credits, schedule, room }
Grade     { id, studentId, courseId, assignment, score, date, remarks }
Attendance{ id, studentId, courseId, date, status, notes }
```

All data is stored in `localStorage` keys: `sms_students`, `sms_courses`, `sms_grades`, `sms_attendance`.

---

## 🌱 Seed Data

The app ships with **15 sample students**, **5 courses**, **75 grade records**, and **75 attendance records** so you can explore every feature immediately. Seed data is only inserted once (when `localStorage` is empty).

---

## 📤 Export

- **Export Students CSV** — all student records with GPA and attendance rate
- **Export Grades CSV** — all grade entries with letter grades
- **Print Report** — browser print dialog for the Reports page

---

## 🧑‍💻 Author

Developed as a Final Project for the Internship Program.

---

## 📝 License

MIT — free to use and modify.
