/* ========================================================
   COLLEGE CGPA & SGPA TRACKER - JAVASCRIPT
   ======================================================== */

const GRADE_SCALE = [
  { letter: "O", points: 10, description: "Outstanding (10)" },
  { letter: "A", points: 9, description: "Excellent (9)" },
  { letter: "B", points: 8, description: "Very Good (8)" },
  { letter: "C", points: 7, description: "Good (7)" },
  { letter: "D", points: 6, description: "Above Average (6)" },
  { letter: "P", points: 5, description: "Average (5)" },
  { letter: "F", points: 0, description: "Fail / Reappear (0)" },
  { letter: "I", points: 0, description: "Incomplete (0)" },
  { letter: "ABS", points: 0, description: "ABSENT (0)" },
  { letter: "Custom", points: 10, description: "Manual / Custom Points..." }
];


// LocalStorage key for persisting data
const STORAGE_KEY = "college_cgpa_tracker_records";

// --- STATE MANAGEMENT ---
// List of all semesters with their subjects
let semesters = loadFromLocalStorage();

// --- DOM ELEMENTS ---
const overallCgpaEl = document.getElementById("overallCgpa");
const cgpaBadgeEl = document.getElementById("cgpaBadge");
const totalSemestersCountEl = document.getElementById("totalSemestersCount");
const totalSubjectsCountEl = document.getElementById("totalSubjectsCount");
const totalCreditsCountEl = document.getElementById("totalCreditsCount");

const semestersContainer = document.getElementById("semestersContainer");
const emptyStateEl = document.getElementById("emptyState");

// Header Action Buttons
const addSemesterBtn = document.getElementById("addSemesterBtn");
const emptyAddSemesterBtn = document.getElementById("emptyAddSemesterBtn");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

// Semester Modal
const semesterModal = document.getElementById("semesterModal");
const semesterForm = document.getElementById("semesterForm");
const semesterModalTitle = document.getElementById("semesterModalTitle");
const semesterEditIdInput = document.getElementById("semesterEditId");
const semesterNameInput = document.getElementById("semesterNameInput");
const semesterNameError = document.getElementById("semesterNameError");

// Subject Modal
const subjectModal = document.getElementById("subjectModal");
const subjectForm = document.getElementById("subjectForm");
const subjectModalTitle = document.getElementById("subjectModalTitle");
const subjectSemesterIdInput = document.getElementById("subjectSemesterId");
const subjectEditIdInput = document.getElementById("subjectEditId");
const subjectNameInput = document.getElementById("subjectNameInput");
const subjectCreditInput = document.getElementById("subjectCreditInput");
const subjectGradeSelect = document.getElementById("subjectGradeSelect");
const subjectGradePointInput = document.getElementById("subjectGradePointInput");

const subjectNameError = document.getElementById("subjectNameError");
const subjectCreditError = document.getElementById("subjectCreditError");
const subjectGradePointError = document.getElementById("subjectGradePointError");

const gradeScaleTableWrapper = document.getElementById("gradeScaleTableWrapper");


// ========================================================
// 1. LOCAL STORAGE FUNCTIONS
// ========================================================

/**
 * Loads saved semesters array from localStorage.
 */
function loadFromLocalStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Could not parse saved semesters from localStorage:", e);
      return [];
    }
  }
  return [];
}

/**
 * Saves current semesters array to localStorage.
 */
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters));
}


// ========================================================
// 2. MATHEMATICAL CALCULATIONS (SGPA & CGPA)
// ========================================================

/**
 * Calculates Semester Grade Point Average (SGPA)
 * SGPA = Σ(credits * gradePoints) / Σ(credits)
 */
function calculateSGPA(subjects) {
  if (!subjects || subjects.length === 0) {
    return { sgpa: 0, totalCredits: 0, totalPoints: 0 };
  }

  let totalCredits = 0;
  let totalPoints = 0;

  subjects.forEach((sub) => {
    const cred = parseFloat(sub.credits) || 0;
    const pts = parseFloat(sub.gradePoint) || 0;
    totalCredits += cred;
    totalPoints += cred * pts;
  });

  let sgpa = 0;
  if (totalCredits > 0) {
    sgpa = totalPoints / totalCredits;
  }
  return {
    sgpa: parseFloat(sgpa.toFixed(2)),
    totalCredits: parseFloat(totalCredits.toFixed(1)),
    totalPoints: parseFloat(totalPoints.toFixed(2))
  };
}

/**
 * Calculates Overall Cumulative Grade Point Average (CGPA)
 * CGPA = Σ(all credits * gradePoints) / Σ(all credits)
 */
function calculateOverallCGPA() {
  let grandTotalCredits = 0;
  let grandTotalPoints = 0;
  let totalSubjects = 0;

  semesters.forEach((sem) => {
    sem.subjects.forEach((sub) => {
      const cred = parseFloat(sub.credits) || 0;
      const pts = parseFloat(sub.gradePoint) || 0;
      grandTotalCredits += cred;
      grandTotalPoints += cred * pts;
      totalSubjects += 1;
    });
  });

  let cgpa = 0;
  if (grandTotalCredits > 0) {
    cgpa = grandTotalPoints / grandTotalCredits;
  }
  return {
    cgpa: parseFloat(cgpa.toFixed(2)),
    totalSemesters: semesters.length,
    totalSubjects: totalSubjects,
    totalCredits: parseFloat(grandTotalCredits.toFixed(1))
  };
}

/**
 * Returns performance classification badge based on CGPA.
 */
function getPerformanceBadge(cgpa, totalCredits) {
  if (totalCredits === 0) return { text: "No Data", colorClass: "" };
  if (cgpa >= 9.0) return { text: "Outstanding (First Class with Distinction)", colorClass: "high" };
  if (cgpa >= 8.0) return { text: "Excellent (First Class)", colorClass: "high" };
  if (cgpa >= 7.0) return { text: "Very Good", colorClass: "medium" };
  if (cgpa >= 6.0) return { text: "Good", colorClass: "medium" };
  if (cgpa >= 5.0) return { text: "Average (Second Class)", colorClass: "low" };
  return { text: "Needs Improvement", colorClass: "fail" };
}


// ========================================================
// 3. UI RENDERING FUNCTIONS
// ========================================================

/**
 * Renders the entire dashboard, semesters list and empty states.
 */
function renderApp() {
  const stats = calculateOverallCGPA();

  // 1. Update CGPA Dashboard
  overallCgpaEl.textContent = stats.cgpa.toFixed(2);
  totalSemestersCountEl.textContent = stats.totalSemesters;
  totalSubjectsCountEl.textContent = stats.totalSubjects;
  totalCreditsCountEl.textContent = stats.totalCredits;

  const badgeInfo = getPerformanceBadge(stats.cgpa, stats.totalCredits);
  cgpaBadgeEl.textContent = badgeInfo.text;

  // 2. Toggle Empty State vs Semesters Container
  if (semesters.length === 0) {
    emptyStateEl.classList.remove("hidden");
    semestersContainer.innerHTML = "";
    return;
  }

  emptyStateEl.classList.add("hidden");
  semestersContainer.innerHTML = "";

  // 3. Render Each Semester Card
  semesters.forEach((sem) => {
    const semStats = calculateSGPA(sem.subjects);

    const semCard = document.createElement("section");
    semCard.className = "semester-card";
    semCard.id = `semester-${sem.id}`;

    // Generate table rows for subjects
    let subjectsTableHtml = "";
    if (sem.subjects.length === 0) {
      subjectsTableHtml = `
        <div class="semester-empty">
          <p>Is semester mein abhi koi subject nahi joda gaya hai.</p>
          <button class="btn btn-primary btn-sm" onclick="openAddSubjectModal('${sem.id}')">
            ＋ Add Subject
          </button>
        </div>
      `;
    } else {
      const rows = sem.subjects
        .map((sub) => {
          const cred = parseFloat(sub.credits);
          const gp = parseFloat(sub.gradePoint);
          const weightedPoints = (cred * gp).toFixed(2);

          let badgeClass = "medium";
          if (gp >= 9) badgeClass = "high";
          else if (gp < 5) badgeClass = "fail";
          else if (gp < 7) badgeClass = "low";

          return `
            <tr>
              <td class="subject-name-cell">${escapeHTML(sub.name)}</td>
              <td>${cred}</td>
              <td><span class="badge-grade ${badgeClass}">${escapeHTML(sub.gradeLetter || "-")} (${gp})</span></td>
              <td><strong>${weightedPoints}</strong></td>
              <td class="table-actions-cell">
                <button 
                  class="btn-icon-only" 
                  title="Edit Subject" 
                  aria-label="Edit Subject"
                  onclick="openEditSubjectModal('${sem.id}', '${sub.id}')"
                >
                  ✏️
                </button>
                <button 
                  class="btn-icon-only btn-delete" 
                  title="Delete Subject" 
                  aria-label="Delete Subject"
                  onclick="deleteSubject('${sem.id}', '${sub.id}')"
                >
                  🗑️
                </button>
              </td>
            </tr>
          `;
        })
        .join("");

      subjectsTableHtml = `
        <div class="subjects-wrapper">
          <table class="subjects-table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Credits</th>
                <th>Grade Point</th>
                <th>Score (Credits × Pts)</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    }

    semCard.innerHTML = `
      <div class="semester-header">
        <div class="semester-title-group">
          <h2 class="semester-title">${escapeHTML(sem.name)}</h2>
          <span class="badge-sgpa">SGPA: ${semStats.sgpa.toFixed(2)}</span>
          <span class="badge-credits">${semStats.totalCredits} Credits</span>
        </div>

        <div class="semester-controls">
          <button class="btn btn-primary btn-sm" onclick="openAddSubjectModal('${sem.id}')">
            <span class="btn-icon">＋</span> Add Subject
          </button>
          <button class="btn btn-outline btn-sm" title="Edit Semester Name" onclick="openEditSemesterModal('${sem.id}')">
            ✏️ Edit
          </button>
          <button class="btn btn-danger-outline btn-sm" title="Delete Semester" onclick="deleteSemester('${sem.id}')">
            🗑️ Delete
          </button>
        </div>
      </div>

      ${subjectsTableHtml}
    `;

    semestersContainer.appendChild(semCard);
  });
}

/**
 * Helper to escape HTML characters and prevent basic XSS.
 */
function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(/[&<>'"]/g, (tag) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[tag] || tag));
}


// ========================================================
// 4. GRADE SCALE SELECTOR SETUP
// ========================================================

/**
 * Injects grade options into the select element and renders the info table.
 */
function initializeGradeScaleUI() {
  subjectGradeSelect.innerHTML = "";
  GRADE_SCALE.forEach((scale) => {
    const opt = document.createElement("option");
    opt.value = scale.letter;
    opt.textContent = `${scale.letter} - ${scale.description}`;
    opt.dataset.points = scale.points;
    subjectGradeSelect.appendChild(opt);
  });

  // When grade dropdown changes, update grade point input automatically
  subjectGradeSelect.addEventListener("change", () => {
    const selectedOption = subjectGradeSelect.options[subjectGradeSelect.selectedIndex];
    if (selectedOption.value !== "Custom") {
      subjectGradePointInput.value = selectedOption.dataset.points;
      clearSubjectErrors();
    } else {
      subjectGradePointInput.focus();
    }
  });

  // Render info table in the accordion
  const rows = GRADE_SCALE.filter((g) => g.letter !== "Custom")
    .map(
      (g) => `
        <tr>
          <td><strong>${g.letter}</strong></td>
          <td>${g.points}</td>
          <td>${g.description}</td>
        </tr>
      `
    )
    .join("");

  gradeScaleTableWrapper.innerHTML = `
    <table class="scale-table">
      <thead>
        <tr>
          <th>Letter Grade</th>
          <th>Grade Points</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}


// ========================================================
// 5. MODAL MANAGEMENT & VALIDATION
// ========================================================

function openModal(modalEl) {
  modalEl.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(modalEl) {
  modalEl.classList.add("hidden");
  document.body.style.overflow = "";
}

// Close modals when clicking outside or clicking on cancel/close buttons
document.addEventListener("click", (e) => {
  if (e.target.dataset.close) {
    const modalId = e.target.dataset.close;
    const modalEl = document.getElementById(modalId);
    if (modalEl) closeModal(modalEl);
  } else if (e.target.classList.contains("modal-overlay")) {
    closeModal(e.target);
  }
});

// Close modals on Escape key press
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal(semesterModal);
    closeModal(subjectModal);
  }
});


// ========================================================
// 6. SEMESTER ACTIONS (ADD, EDIT, DELETE)
// ========================================================

function openAddSemesterModal() {
  semesterModalTitle.textContent = "Add Semester";
  semesterEditIdInput.value = "";
  semesterNameInput.value = `Semester ${semesters.length + 1}`;
  semesterNameError.classList.remove("show");
  semesterNameInput.classList.remove("input-error");
  openModal(semesterModal);
  semesterNameInput.focus();
}

function openEditSemesterModal(semesterId) {
  const sem = semesters.find((s) => s.id === semesterId);
  if (!sem) return;

  semesterModalTitle.textContent = "Edit Semester Name";
  semesterEditIdInput.value = sem.id;
  semesterNameInput.value = sem.name;
  semesterNameError.classList.remove("show");
  semesterNameInput.classList.remove("input-error");
  openModal(semesterModal);
  semesterNameInput.focus();
}

semesterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = semesterNameInput.value.trim();
  const editId = semesterEditIdInput.value;

  // Validation
  if (name === "") {
    semesterNameInput.classList.add("input-error");
    semesterNameError.classList.add("show");
    semesterNameInput.focus();
    return;
  }

  if (editId) {
    const sem = semesters.find((s) => s.id === editId);
    if (sem) sem.name = name;
  } else {
    const newSemester = {
      id: "sem-" + Date.now(),
      name: name,
      subjects: []
    };
    semesters.push(newSemester);
  }

  saveToLocalStorage();
  renderApp();
  closeModal(semesterModal);
});

semesterNameInput.addEventListener("input", () => {
  if (semesterNameInput.value.trim() !== "") {
    semesterNameInput.classList.remove("input-error");
    semesterNameError.classList.remove("show");
  }
});

function deleteSemester(semesterId) {
  const sem = semesters.find((s) => s.id === semesterId);
  if (!sem) return;

  const confirmDelete = window.confirm(
    `Kya aap sach me "${sem.name}" aur iske sabhi subjects ko delete karna chahte hain?`
  );
  if (!confirmDelete) return;

  semesters = semesters.filter((s) => s.id !== semesterId);
  saveToLocalStorage();
  renderApp();
}


// ========================================================
// 7. SUBJECT ACTIONS (ADD, EDIT, DELETE)
// ========================================================

function clearSubjectErrors() {
  subjectNameError.classList.remove("show");
  subjectCreditError.classList.remove("show");
  subjectGradePointError.classList.remove("show");

  subjectNameInput.classList.remove("input-error");
  subjectCreditInput.classList.remove("input-error");
  subjectGradePointInput.classList.remove("input-error");
}

function openAddSubjectModal(semesterId) {
  subjectModalTitle.textContent = "Add Subject";
  subjectSemesterIdInput.value = semesterId;
  subjectEditIdInput.value = "";

  subjectNameInput.value = "";
  subjectCreditInput.value = "4";
  subjectGradeSelect.value = "A+";
  subjectGradePointInput.value = "9";

  clearSubjectErrors();
  openModal(subjectModal);
  subjectNameInput.focus();
}

function openEditSubjectModal(semesterId, subjectId) {
  const sem = semesters.find((s) => s.id === semesterId);
  if (!sem) return;
  const sub = sem.subjects.find((s) => s.id === subjectId);
  if (!sub) return;

  subjectModalTitle.textContent = "Edit Subject";
  subjectSemesterIdInput.value = semesterId;
  subjectEditIdInput.value = subjectId;

  subjectNameInput.value = sub.name;
  subjectCreditInput.value = sub.credits;

  const matchingScale = GRADE_SCALE.find((g) => g.letter === sub.gradeLetter);
  subjectGradeSelect.value = matchingScale ? matchingScale.letter : "Custom";
  subjectGradePointInput.value = sub.gradePoint;

  clearSubjectErrors();
  openModal(subjectModal);
  subjectNameInput.focus();
}

subjectForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const semesterId = subjectSemesterIdInput.value;
  const editId = subjectEditIdInput.value;

  const name = subjectNameInput.value.trim();
  const credits = parseFloat(subjectCreditInput.value);
  const gradePoint = parseFloat(subjectGradePointInput.value);
  const gradeLetter = subjectGradeSelect.value;

  let isValid = true;
  clearSubjectErrors();

  // Validate Subject Name
  if (name === "") {
    subjectNameInput.classList.add("input-error");
    subjectNameError.classList.add("show");
    isValid = false;
  }

  // Validate Credits (> 0)
  if (isNaN(credits) || credits <= 0) {
    subjectCreditInput.classList.add("input-error");
    subjectCreditError.classList.add("show");
    isValid = false;
  }

  // Validate Grade Point (>= 0 and <= 10)
  if (isNaN(gradePoint) || gradePoint < 0 || gradePoint > 10) {
    subjectGradePointInput.classList.add("input-error");
    subjectGradePointError.classList.add("show");
    isValid = false;
  }

  if (!isValid) return;

  const sem = semesters.find((s) => s.id === semesterId);
  if (!sem) return;

  if (editId) {
    const sub = sem.subjects.find((s) => s.id === editId);
    if (sub) {
      sub.name = name;
      sub.credits = credits;
      sub.gradePoint = gradePoint;
      sub.gradeLetter = gradeLetter;
    }
  } else {
    const newSubject = {
      id: "sub-" + Date.now(),
      name: name,
      credits: credits,
      gradePoint: gradePoint,
      gradeLetter: gradeLetter
    };
    sem.subjects.push(newSubject);
  }

  saveToLocalStorage();
  renderApp();
  closeModal(subjectModal);
});

[subjectNameInput, subjectCreditInput, subjectGradePointInput].forEach((input) => {
  input.addEventListener("input", clearSubjectErrors);
});

function deleteSubject(semesterId, subjectId) {
  const sem = semesters.find((s) => s.id === semesterId);
  if (!sem) return;

  const sub = sem.subjects.find((s) => s.id === subjectId);
  const subName = sub ? sub.name : "this subject";

  const confirmDelete = window.confirm(`Kya aap "${subName}" ko delete karna chahte hain?`);
  if (!confirmDelete) return;

  sem.subjects = sem.subjects.filter((s) => s.id !== subjectId);
  saveToLocalStorage();
  renderApp();
}


// ========================================================
// 8. DEMO DATA & CLEAR ALL HANDLERS
// ========================================================

function loadDemoData() {
  semesters = [
    {
      id: "sem-demo-1",
      name: "Semester 1",
      subjects: [
        { id: "sub-1", name: "Engineering Mathematics I", credits: 4, gradeLetter: "O", gradePoint: 10 },
        { id: "sub-2", name: "Programming in C / Python", credits: 4, gradeLetter: "A+", gradePoint: 9 },
        { id: "sub-3", name: "Engineering Physics", credits: 3, gradeLetter: "A", gradePoint: 8 },
        { id: "sub-4", name: "Basic Electrical Engineering", credits: 3, gradeLetter: "B+", gradePoint: 7 },
        { id: "sub-5", name: "Computer Programming Lab", credits: 1.5, gradeLetter: "O", gradePoint: 10 }
      ]
    },
    {
      id: "sem-demo-2",
      name: "Semester 2",
      subjects: [
        { id: "sub-6", name: "Data Structures & Algorithms", credits: 4, gradeLetter: "O", gradePoint: 10 },
        { id: "sub-7", name: "Engineering Mathematics II", credits: 4, gradeLetter: "A+", gradePoint: 9 },
        { id: "sub-8", name: "Digital Logic Design", credits: 3, gradeLetter: "A+", gradePoint: 9 },
        { id: "sub-9", name: "Environmental Science", credits: 2, gradeLetter: "A", gradePoint: 8 },
        { id: "sub-10", name: "DSA Practical Lab", credits: 1.5, gradeLetter: "O", gradePoint: 10 }
      ]
    }
  ];

  saveToLocalStorage();
  renderApp();
}

function clearAllData() {
  if (semesters.length === 0) return;

  const confirmClear = window.confirm(
    "Warning: Kya aap sach me saare semesters aur subjects ka data delete karna chahte hain? Yeh wapas nahi aayega."
  );
  if (!confirmClear) return;

  semesters = [];
  saveToLocalStorage();
  renderApp();
}


// ========================================================
// 9. EVENT LISTENERS INITIALIZATION
// ========================================================

addSemesterBtn.addEventListener("click", openAddSemesterModal);
emptyAddSemesterBtn.addEventListener("click", openAddSemesterModal);
loadSampleBtn.addEventListener("click", loadDemoData);
clearAllBtn.addEventListener("click", clearAllData);


// ========================================================
// 10. APP STARTUP
// ========================================================
initializeGradeScaleUI();
renderApp();
