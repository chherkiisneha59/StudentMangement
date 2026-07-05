// API Base URL
const API_URL = 'http://localhost:8080/api/students';

// DOM Elements
const kanbanBoard = document.getElementById('kanbanBoard');
const searchInput = document.getElementById('searchInput');
const batchNavbar = document.getElementById('batchNavbar');

// Offcanvas & Form Elements
const studentOffcanvasEl = document.getElementById('studentOffcanvas');
let studentOffcanvas; // Will be initialized as bootstrap.Offcanvas
const studentForm = document.getElementById('studentForm');
const offcanvasTitle = document.getElementById('offcanvasTitle');
const submitFormBtn = document.getElementById('submitFormBtn');

// Form Inputs
const studentIdInput = document.getElementById('studentId');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const branchInput = document.getElementById('branch');
const batchInput = document.getElementById('studentBatch');

// Counters
const totalStudentsCount = document.getElementById('totalStudentsCount');
const totalBranchesCount = document.getElementById('totalBranchesCount');

// Loader & Empty States
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');

// Mobile Navigation
const sidebar = document.getElementById('sidebar');
const mobileToggle = document.getElementById('mobileToggle');

// Application States
let allStudents = [];
let activeBatch = null;
let isEditMode = false;
let activeStudentId = null;

// Initialize Lucide Icons
function initIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Show Boostrap Style Toast Notifications
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white border-0 bg-${type === 'success' ? 'success' : 'danger'}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body d-flex align-items-center gap-2">
                <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" style="width: 18px; height: 18px;"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastEl);
    initIcons();
    
    const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
    bsToast.show();
    
    // Cleanup DOM element after toast closes
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

// Get Dynamic Color Class for Avatars
function getAvatarColors(index) {
    const sets = [
        { bg: 'var(--avatar-bg-1)', text: 'var(--avatar-text-1)' },
        { bg: 'var(--avatar-bg-2)', text: 'var(--avatar-text-2)' },
        { bg: 'var(--avatar-bg-3)', text: 'var(--avatar-text-3)' },
        { bg: 'var(--avatar-bg-4)', text: 'var(--avatar-text-4)' },
        { bg: 'var(--avatar-bg-5)', text: 'var(--avatar-text-5)' },
        { bg: 'var(--avatar-bg-6)', text: 'var(--avatar-text-6)' }
    ];
    return sets[index % sets.length];
}

// Toggle Loaders
function setLoading(isLoading) {
    if (isLoading) {
        loadingState.classList.remove('d-none');
        kanbanBoard.classList.add('d-none');
        emptyState.classList.add('d-none');
    } else {
        loadingState.classList.add('d-none');
        updateViewVisibility();
    }
}

// Show/Hide View containers depending on view choice
function updateViewVisibility() {
    const displayedList = getFilteredStudents();
    if (displayedList.length === 0) {
        kanbanBoard.classList.add('d-none');
        emptyState.classList.remove('d-none');
        return;
    }

    emptyState.classList.add('d-none');
    kanbanBoard.classList.remove('d-none');
}

// Retrieve students list matching active batch
function getFilteredStudents() {
    if (!activeBatch) return [];
    return allStudents.filter(s => (s.batch?.trim() || 'Unassigned') === activeBatch);
}

// Calculate and generate Batch filter navigation tags dynamically
function renderBatchNavbar() {
    const batches = Array.from(new Set(allStudents.map(s => s.batch?.trim() || 'Unassigned'))).sort();
    
    if (batches.length === 0) {
        batchNavbar.innerHTML = '<span class="text-muted fs-8">No active batches</span>';
        activeBatch = null;
        return;
    }

    if (!activeBatch || !batches.includes(activeBatch)) {
        activeBatch = batches[0];
    }

    let html = '';
    batches.forEach(batch => {
        const isActive = activeBatch === batch;
        html += `<button class="filter-btn ${isActive ? 'active' : ''}" onclick="selectBatch('${batch}')">Batch ${batch}</button>`;
    });
    
    batchNavbar.innerHTML = html;
}

// Trigger Batch selection updates
function selectBatch(batch) {
    activeBatch = batch;
    
    const buttons = batchNavbar.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if (btn.textContent.includes(`Batch ${batch}`) || (batch === 'Unassigned' && btn.textContent.includes('Unassigned'))) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    updateViewVisibility();
    renderData();
}

let isUsingLocalMock = false;

// Retrieve data list and map metrics counters
async function fetchStudents() {
    setLoading(true);
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Could not establish database connection.');
        }
        allStudents = await response.json();
        isUsingLocalMock = false;
        
        // Refresh batch navigation & counters
        renderBatchNavbar();
        updateMetrics();
        renderData();
    } catch (error) {
        console.warn('Backend connection failed. Initializing local mock fallback engine.', error);
        initializeLocalMockData();
        isUsingLocalMock = true;
        showToast('Demo Mode (Local Mock Data)', 'warning');
        
        renderBatchNavbar();
        updateMetrics();
        renderData();
    } finally {
        setLoading(false);
    }
}

// Perform dynamic search
async function performSearch(keyword) {
    if (!keyword.trim()) {
        fetchStudents();
        return;
    }
    setLoading(true);
    try {
        const response = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`);
        if (!response.ok) {
            throw new Error('Database search query failed.');
        }
        allStudents = await response.json();
        renderData();
    } catch (error) {
        console.error('Search error:', error);
        showToast('Error executing search queries.', 'error');
    } finally {
        setLoading(false);
    }
}

// Update counters
function updateMetrics() {
    totalStudentsCount.textContent = allStudents.length;
    const branches = new Set(allStudents.map(s => s.branch?.trim()?.toLowerCase()).filter(Boolean));
    totalBranchesCount.textContent = branches.size;
}

// Render data outputs inside Kanban columns grouped by Branch Columns (CSE, CSEBCT, ECE, Mechanical, Civil, All) for the active batch
function renderData() {
    kanbanBoard.innerHTML = '';
    
    const list = getFilteredStudents();
    if (list.length === 0) {
        updateViewVisibility();
        return;
    }

    // Define columns
    const columnSpecs = [
        { key: 'CSE', title: 'CSE', icon: 'monitor' },
        { key: 'CSEBCT', title: 'CSE-BCT', icon: 'shield-check' },
        { key: 'IT', title: 'IT', icon: 'laptop' },
        { key: 'AIDS', title: 'AIDS', icon: 'brain-circuit' },
        { key: 'AIML', title: 'AIML', icon: 'bot' },
        { key: 'ECE', title: 'ECE', icon: 'cpu' },
        { key: 'CIVIL', title: 'CIVIL', icon: 'hard-hat' },
        { key: 'MECHANICAL', title: 'MECHANICAL', icon: 'settings' },
        { key: 'ELECTRICAL', title: 'ELECTRICAL', icon: 'zap' }
    ];
    
    columnSpecs.forEach(spec => {
        // Filter students matching this branch for this column
        const columnStudents = list.filter(s => s.branch?.trim()?.toLowerCase() === spec.key.toLowerCase());      
        const kanbanCol = document.createElement('div');
        kanbanCol.className = 'kanban-col';
        
        // Header for column
        kanbanCol.innerHTML = `
            <div class="kanban-col-header">
                <h4 class="kanban-col-title d-flex align-items-center gap-2">
                    <i data-lucide="${spec.icon}" style="width: 16px; height: 16px; color: var(--primary-color);"></i>
                    <span>${spec.title}</span>
                </h4>
                <span class="badge bg-secondary-subtle text-secondary rounded-pill fs-8">${columnStudents.length}</span>
            </div>
            <div class="kanban-col-body" id="col-body-${spec.key}">
                <!-- Student cards will be appended here -->
            </div>
        `;
        
        kanbanBoard.appendChild(kanbanCol);
        
        const colBody = document.getElementById(`col-body-${spec.key}`);
        
        if (columnStudents.length === 0) {
            // Empty state inside column
            colBody.innerHTML = `
                <div class="text-center py-5 text-muted opacity-50">
                    <i data-lucide="inbox" style="width: 32px; height: 32px; margin-bottom: 0.5rem;"></i>
                    <p class="fs-8 mb-0">No records</p>
                </div>
            `;
        } else {
            // Render compact cards
            columnStudents.forEach((student, studentIdx) => {
                const colors = getAvatarColors(studentIdx);
                
                const card = document.createElement('div');
                card.className = 'student-mini-card';
                card.title = `Email: ${student.email}${student.phone ? ' | Phone: ' + student.phone : ''}`;
                card.innerHTML = `
                    <div class="mini-card-header position-relative">
                        <div class="student-avatar" style="background: ${colors.bg}; color: ${colors.text}; width: 32px; height: 32px; font-size: 0.85rem; border-radius: 8px;">
                            ${student.firstName[0]}${student.lastName[0]}
                        </div>
                        <div class="d-flex flex-column" style="max-width: 180px;">
                            <div class="mini-card-name text-truncate" title="${student.firstName} ${student.lastName}">${student.firstName} ${student.lastName}</div>
                            <div class="mini-card-id">ID: ${student.registrationId}</div>
                        </div>
                        <div class="dropdown position-absolute top-50 end-0 translate-middle-y">
                            <button class="btn btn-link btn-sm text-secondary p-1 dropdown-toggle no-caret" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i data-lucide="more-vertical" style="width: 16px; height: 16px;"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                                <li>
                                    <a class="dropdown-item d-flex align-items-center gap-2 fs-8" href="#" onclick="openEditDrawer(${student.sId}); return false;">
                                        <i data-lucide="edit-3" style="width: 14px; height: 14px; color: var(--primary-color);"></i>
                                        <span>Edit</span>
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item d-flex align-items-center gap-2 fs-8 text-danger" href="#" onclick="deleteStudentRecord(${student.sId}); return false;">
                                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                                        <span>Delete</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                `;
                colBody.appendChild(card);
            });
        }
    });

    initIcons();
    updateViewVisibility();
}

// Branch code mapper (CSE -> CS, ECE -> EC, etc.)
function getBranchCode(branch) {
    switch(branch) {
        case 'CSE': return 'CS';
        case 'CSEBCT': return 'CB';
        case 'IT': return 'IT';
        case 'AIDS': return 'AD';
        case 'AIML': return 'AL';
        case 'ECE': return 'EC';
        case 'CIVIL': return 'CE';
        case 'MECHANICAL': return 'ME';
        case 'ELECTRICAL': return 'EE';
        default: return branch;
    }
}

// Live generated ID preview in form
function updateIdPreview() {
    const batch = batchInput.value;
    const branch = branchInput.value;
    const roll = studentIdInput.value;

    const idPreviewContainer = document.getElementById('idPreviewContainer');
    const generatedIdPreview = document.getElementById('generatedIdPreview');

    if (batch && branch && roll && !isEditMode) {
        const startYear = batch.substring(0, 4); // "2017-2021" -> "2017"
        const code = getBranchCode(branch);
        const rollVal = parseInt(roll, 10);
        const paddedRoll = rollVal < 100 ? (100 + rollVal).toString() : rollVal.toString();
        const generatedId = startYear + code + paddedRoll;
        generatedIdPreview.textContent = generatedId;
        idPreviewContainer.classList.remove('d-none');
    } else {
        idPreviewContainer.classList.add('d-none');
    }
}

// Open Slider Drawer (Create Mode)
function openAddDrawer() {
    isEditMode = false;
    activeStudentId = null;
    offcanvasTitle.textContent = 'Add Student Record';
    submitFormBtn.innerHTML = '<i data-lucide="plus" style="width: 16px; height: 16px;"></i> Add Student';
    
    studentForm.reset();
    studentIdInput.disabled = false;
    batchInput.value = '';
    
    document.getElementById('idPreviewContainer').classList.add('d-none');
    
    studentOffcanvas.show();
    initIcons();
}

// Open Slider Drawer (Edit Mode)
function openEditDrawer(id) {
    const student = allStudents.find(s => (s.sId || s.sid) === id);
    if (!student) return;

    isEditMode = true;
    activeStudentId = id;
    offcanvasTitle.textContent = 'Modify Student Record';
    submitFormBtn.innerHTML = '<i data-lucide="save" style="width: 16px; height: 16px;"></i> Update Record';
    
    // Extract roll number digits from the end of the alphanumeric registration ID
    const regId = student.registrationId || '';
    const rollNoVal = parseInt(regId.match(/\d+$/)?.[0] || '101', 10);
    studentIdInput.value = rollNoVal >= 100 ? rollNoVal - 100 : rollNoVal;
    studentIdInput.disabled = true; // Roll Number lock during edit
    
    firstNameInput.value = student.firstName;
    lastNameInput.value = student.lastName;
    emailInput.value = student.email;
    phoneInput.value = student.phone || '';
    branchInput.value = student.branch;
    batchInput.value = student.batch || '';
    
    document.getElementById('idPreviewContainer').classList.add('d-none');

    studentOffcanvas.show();
    initIcons();
}

// Delete Request handler
async function deleteStudentRecord(id) {
    if (confirm(`Confirm deletion of Student Record #${id}? This process is permanent.`)) {
        if (isUsingLocalMock) {
            allStudents = allStudents.filter(s => s.sId !== id);
            showToast(`Student #${id} deleted (Demo Mode).`, 'success');
            updateMetrics();
            renderData();
            return;
        }
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errMsg = await response.text();
                throw new Error(errMsg || 'Failed to delete student record.');
            }
            showToast(`Student #${id} deleted.`, 'success');
            fetchStudents();
        } catch (error) {
            console.error('Delete error:', error);
            showToast(error.message || 'Could not complete deletion.', 'error');
        }
    }
}

// Form Submission Event Listener
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let regIdValue;
    if (isEditMode) {
        const student = allStudents.find(s => (s.sId || s.sid) === activeStudentId);
        regIdValue = student ? student.registrationId : '';
    } else {
        const roll = studentIdInput.value;
        const startYear = batchInput.value.substring(0, 4);
        const code = getBranchCode(branchInput.value);
        const rollVal = parseInt(roll, 10);
        const paddedRoll = rollVal < 100 ? (100 + rollVal).toString() : rollVal.toString();
        regIdValue = startYear + code + paddedRoll;
    }

    const payload = {
        registrationId: regIdValue,
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        branch: branchInput.value.trim(),
        batch: batchInput.value.trim()
    };

    if (isUsingLocalMock) {
        if (isEditMode) {
            const student = allStudents.find(s => s.sId === activeStudentId);
            if (student) {
                student.firstName = payload.firstName;
                student.lastName = payload.lastName;
                student.email = payload.email;
                student.phone = payload.phone;
                student.branch = payload.branch;
                student.batch = payload.batch;
            }
            showToast(`Student record #${activeStudentId} updated (Demo Mode).`, 'success');
        } else {
            if (allStudents.some(s => s.registrationId === payload.registrationId)) {
                showToast('Registration ID already exists.', 'error');
                return;
            }
            payload.sId = allStudents.length + 1;
            payload.attendance = 90;
            payload.gpa = 8.5;
            payload.results = getCoursesForBranch(payload.branch).map((c, i) => ({
                courseName: c.name,
                courseCode: c.code,
                credits: c.credits,
                grade: 'A'
            }));
            allStudents.push(payload);
            showToast(`Student record created (Demo Mode).`, 'success');
        }
        studentOffcanvas.hide();
        updateMetrics();
        renderData();
        return;
    }

    const targetUrl = isEditMode ? `${API_URL}/${activeStudentId}` : API_URL;
    const requestMethod = isEditMode ? 'PUT' : 'POST';

    try {
        const response = await fetch(targetUrl, {
            method: requestMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(errMsg || 'Error posting student data.');
        }

        showToast(
            isEditMode 
                ? `Student record #${activeStudentId} updated.` 
                : `Student record created.`, 
            'success'
        );
        
        studentOffcanvas.hide();
        fetchStudents();
    } catch (error) {
        console.error('Submit error:', error);
        showToast(error.message || 'Error occurred while saving record.', 'error');
    }
});

// Search input listener (Debounced)
let searchTimer;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        performSearch(e.target.value);
    }, 300);
});

// Mobile layout toggling
mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('show');
});

// Close sidebar on clicking main content body on mobile screens
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992) {
        if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
            sidebar.classList.remove('show');
        }
    }
});

// Global bindings for HTML actions
window.openEditDrawer = openEditDrawer;
window.deleteStudentRecord = deleteStudentRecord;
window.selectBatch = selectBatch;

// Page Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Bootstrap Offcanvas creation
    studentOffcanvas = new bootstrap.Offcanvas(studentOffcanvasEl);
    
    // Wire dynamic live preview triggers
    studentIdInput.addEventListener('input', updateIdPreview);
    batchInput.addEventListener('change', updateIdPreview);
    branchInput.addEventListener('change', updateIdPreview);
    
    initIcons();
    fetchStudents();
});

// Student Portal Login Form Listener
document.addEventListener('DOMContentLoaded', () => {
    const studentLoginForm = document.getElementById('studentLoginForm');
    const loginRegIdInput = document.getElementById('loginRegId');
    const loginEmailInput = document.getElementById('loginEmail');
    const resStudentName = document.getElementById('resStudentName');
    const resStudentId = document.getElementById('resStudentId');
    const resStudentBranch = document.getElementById('resStudentBranch');
    const resAttendance = document.getElementById('resAttendance');
    const resGPA = document.getElementById('resGPA');
    const gradesTableBody = document.getElementById('gradesTableBody');

    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const regId = loginRegIdInput.value.trim().toUpperCase();
            const email = loginEmailInput.value.trim().toLowerCase();
            
            // Look up student in local store
            const student = allStudents.find(s => 
                (s.registrationId || '').toUpperCase() === regId &&
                (s.email || '').toLowerCase() === email
            );
            
            if (!student) {
                showToast('Invalid Registration ID or Email Address.', 'error');
                return;
            }
            
            // Hide Login Modal and populate Results Modal
            const loginModalEl = document.getElementById('loginModal');
            const loginModal = bootstrap.Modal.getInstance(loginModalEl) || new bootstrap.Modal(loginModalEl);
            loginModal.hide();
            
            resStudentName.textContent = `${student.firstName} ${student.lastName}`;
            resStudentId.textContent = `ID: ${student.registrationId}`;
            resStudentBranch.textContent = `Branch: ${student.branch}`;
            
            // Read GPA and Attendance from database properties
            resAttendance.textContent = student.attendance ? `${student.attendance}%` : 'N/A';
            resGPA.textContent = student.gpa ? student.gpa.toFixed(2) : 'N/A';
            
            // Map course grades list from database results association
            const studentResults = student.results || [];
            let tableHtml = '';
            if (studentResults.length > 0) {
                studentResults.forEach((res) => {
                    tableHtml += `
                        <tr>
                            <td class="ps-4 py-3 fw-semibold text-dark fs-8">${res.courseName}</td>
                            <td class="py-3 text-center text-muted fs-8 font-monospace">${res.courseCode}</td>
                            <td class="py-3 text-center text-dark fs-8 fw-semibold">${res.credits}</td>
                            <td class="pe-4 py-3 text-end">
                                <span class="badge ${getGradeBadgeClass(res.grade)} px-2 py-1 fs-8" style="font-weight: 600;">${res.grade}</span>
                            </td>
                        </tr>
                    `;
                });
            } else {
                tableHtml = `
                    <tr>
                        <td colspan="4" class="text-center py-4 text-muted fs-8">No academic records found in database.</td>
                    </tr>
                `;
            }
            
            gradesTableBody.innerHTML = tableHtml;
            
            // Show Results Modal
            const resultsModalEl = document.getElementById('resultsModal');
            const resultsModal = bootstrap.Modal.getInstance(resultsModalEl) || new bootstrap.Modal(resultsModalEl);
            resultsModal.show();
            
            initIcons();
        });
    }
});

// String hashing helper for deterministic seeder attributes
String.prototype.hashCode = function() {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
        hash = this.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
};

// Course Mapper
function getCoursesForBranch(branch) {
    const defaultCourses = [
        { name: 'Core Mathematics II', code: 'MA102', credits: 4 },
        { name: 'Advanced Physics', code: 'PH101', credits: 3 },
        { name: 'Environmental Sciences', code: 'EV100', credits: 2 }
    ];
    
    switch (branch?.toUpperCase()) {
        case 'CSE':
        case 'CSEBCT':
            return [
                { name: 'Data Structures & Algorithms', code: 'CS201', credits: 4 },
                { name: 'Database Management Systems', code: 'CS202', credits: 4 },
                { name: 'Discrete Mathematics', code: 'CS203', credits: 3 },
                { name: 'Object Oriented Programming', code: 'CS204', credits: 3 },
                { name: 'Digital Electronics Lab', code: 'CS205L', credits: 1 }
            ];
        case 'IT':
            return [
                { name: 'Software Engineering', code: 'IT201', credits: 4 },
                { name: 'Web Application Development', code: 'IT202', credits: 4 },
                { name: 'Operating Systems Principles', code: 'IT203', credits: 3 },
                { name: 'Computer Communication Networks', code: 'IT204', credits: 3 },
                { name: 'Linux Operations Lab', code: 'IT205L', credits: 1 }
            ];
        case 'AIDS':
        case 'AIML':
            return [
                { name: 'Machine Learning Foundation', code: 'AI201', credits: 4 },
                { name: 'Data Visualization Techniques', code: 'AI202', credits: 3 },
                { name: 'Linear Algebra & Optimization', code: 'AI203', credits: 4 },
                { name: 'Python for AI Lab', code: 'AI204L', credits: 2 },
                { name: 'Ethics in AI Practices', code: 'AI205', credits: 1 }
            ];
        case 'ECE':
            return [
                { name: 'Microprocessors & Controllers', code: 'EC201', credits: 4 },
                { name: 'Analog Electronic Circuits', code: 'EC202', credits: 4 },
                { name: 'Signals & Systems Analysis', code: 'EC203', credits: 3 },
                { name: 'Electromagnetic Field Theory', code: 'EC204', credits: 3 },
                { name: 'Digital System Design Lab', code: 'EC205L', credits: 1 }
            ];
        case 'CIVIL':
            return [
                { name: 'Structural Analysis I', code: 'CE201', credits: 4 },
                { name: 'Geotechnical Engineering', code: 'CE202', credits: 4 },
                { name: 'Fluid Mechanics & Hydraulics', code: 'CE203', credits: 3 },
                { name: 'Building Materials & Layout', code: 'CE204', credits: 3 },
                { name: 'Surveying Field Practice Lab', code: 'CE205L', credits: 1 }
            ];
        case 'MECHANICAL':
            return [
                { name: 'Thermodynamics Foundation', code: 'ME201', credits: 4 },
                { name: 'Strength of Materials', code: 'ME202', credits: 4 },
                { name: 'Fluid Mechanics & Machinery', code: 'ME203', credits: 3 },
                { name: 'Kinematics of Machinery', code: 'ME204', credits: 3 },
                { name: 'CAD Modeling Laboratory', code: 'ME205L', credits: 1 }
            ];
        case 'ELECTRICAL':
            return [
                { name: 'Electrical Machines I', code: 'EE201', credits: 4 },
                { name: 'Network Analysis & Synthesis', code: 'EE202', credits: 4 },
                { name: 'Control Systems Engineering', code: 'EE203', credits: 3 },
                { name: 'Power Systems Generation', code: 'EE204', credits: 3 },
                { name: 'Electrical Engineering Lab', code: 'EE205L', credits: 1 }
            ];
        default:
            return defaultCourses;
    }
}

function getGradeForScore(score) {
    if (score >= 95) return 'O';
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    return 'C';
}

function getGradeBadgeClass(grade) {
    switch (grade) {
        case 'O': return 'bg-success text-white';
        case 'A+': return 'bg-primary-subtle text-primary border border-primary-subtle';
        case 'A': return 'bg-info-subtle text-info border border-info-subtle';
        case 'B+': return 'bg-warning-subtle text-warning border border-warning-subtle';
        case 'B': return 'bg-secondary-subtle text-secondary';
        default: return 'bg-danger-subtle text-danger';
    }
}

// Local Mock Fallback Generator
function initializeLocalMockData() {
    if (allStudents.length > 0) return;
    
    const batches = [
        "2017-2021", "2018-2022", "2019-2023", "2020-2024",
        "2021-2025", "2022-2026", "2023-2027"
    ];
    const branches = [
        "CSE", "CSEBCT", "IT", "AIDS", "AIML", "ECE", "CIVIL", "MECHANICAL", "ELECTRICAL"
    ];
    const firstNames = [
        "Amit", "Neha", "Rahul", "Sneha", "Aarav", "Priya", "Vikram", "Arjun", "Ananya", "Rohan",
        "Vijay", "Kavya", "Ishaan", "Siddharth", "Riya", "Aditya", "Kabir", "Divya", "Suresh", "Meera",
        "Rajesh", "Pooja", "Anil", "Sunita", "Deepak", "Kiran", "Sanjay", "Jyoti", "Alok", "Ritu"
    ];
    const lastNames = [
        "Sharma", "Verma", "Gupta", "Patel", "Singh", "Nair", "Reddy", "Sen", "Joshi", "Das",
        "Mishra", "Kumar", "Prasad", "Rao", "Jha", "Bose", "Mehta", "Bahl", "Malhotra", "Bhat",
        "Pillai", "Shetty", "Gowda", "Naidu", "Roy", "Banerjee", "Chatterjee", "Saxena", "Kapoor", "Choudhury"
    ];

    let mockId = 1;
    batches.forEach(batch => {
        const startYear = batch.substring(0, 4);
        branches.forEach(branch => {
            const code = getBranchCode(branch);
            for (let roll = 1; roll <= 10; roll++) {
                const regId = startYear + code + (100 + roll);
                
                const baseHash = Math.abs((batch + branch).hashCode() + roll);
                const firstName = firstNames[baseHash % firstNames.length];
                const lastName = lastNames[(baseHash + roll) % lastNames.length];
                const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${startYear.substring(2)}${100 + roll}@university.edu`;
                
                const phoneSeed = Math.abs((regId).hashCode());
                const phone = (7000000000 + (phoneSeed % 290000000)).toString();
                
                const attendance = 80 + (baseHash % 19);
                const gpa = parseFloat((7.0 + (baseHash % 29) * 0.1).toFixed(2));
                
                const coursesList = getCoursesForBranch(branch);
                const results = coursesList.map((c, idx) => {
                    const grade = getGradeForScore(80 + ((baseHash + idx) % 19));
                    return {
                        courseName: c.name,
                        courseCode: c.code,
                        credits: c.credits,
                        grade: grade
                    };
                });
                
                allStudents.push({
                    sId: mockId++,
                    registrationId: regId,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phone: phone,
                    branch: branch,
                    batch: batch,
                    attendance: attendance,
                    gpa: gpa,
                    results: results
                });
            }
        });
    });
}
