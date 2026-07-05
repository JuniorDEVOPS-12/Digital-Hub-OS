/* ========================================
   Digital Hub OS — Configuration & Rules
   ======================================== */

// --- Cohort Rules ---
export const COHORT_MAX_STUDENTS = 50;
export const COHORT_NAME = 'Cohorte 2026';
export const COHORT_YEAR = 2026;

// --- Training Schedule Rules ---
export const TRAINING_DURATION_MONTHS = 1;
export const TRAINING_DAYS = [1, 2, 3, 4, 5]; // Mon=1 … Fri=5
export const TRAINING_START_TIME = '16:00';
export const TRAINING_END_TIME = '19:00';

// --- Day Labels ---
export const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

// --- Module Colors ---
export const MODULE_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b',
];

// --- Avatar Colors ---
export const AVATAR_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b',
    '#3b82f6', '#ef4444', '#22c55e', '#06b6d4', '#e11d48',
];

// --- Attendance Statuses ---
export const ATTENDANCE_STATUS = {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
};

// --- Student Statuses ---
export const STUDENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
};

// --- Storage Keys (namespace) ---
export const STORAGE_KEYS = {
    students: 'dhos_students',
    trainers: 'dhos_trainers',
    modules: 'dhos_modules',
    attendance: 'dhos_attendance',
    schedule: 'dhos_schedule',
};

// --- Sections (navigation) ---
export const SECTIONS = {
    dashboard:  { title: 'Tableau de bord',  subtitle: 'Vue d\'ensemble de la formation' },
    students:   { title: 'Étudiants',        subtitle: 'Gestion des 50 étudiants de la cohorte' },
    trainers:   { title: 'Formateurs',       subtitle: 'Équipe pédagogique' },
    modules:    { title: 'Modules',          subtitle: 'Parcours de formation séquentiel' },
    schedule:   { title: 'Planning',         subtitle: 'Emploi du temps — Lun-Ven 16h-19h' },
    attendance: { title: 'Présences',        subtitle: 'Suivi de présence quotidien' },
};

// --- Helpers (pure, stateless) ---

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(firstName, lastName) {
    const f = firstName.replace(/^(Dr\.|Mme?\.|M\.)\s*/, '');
    return (f[0] + lastName[0]).toUpperCase();
}

export function formatDateFR(dateStr, options = {}) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', ...options });
}
