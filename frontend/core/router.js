import { $, $$ } from './dom.js';
import { SECTIONS } from '../../config/constants.js';
import { requireAuth, checkAuth } from './auth.js';

import { renderDashboard } from '../pages/dashboard.page.js';
import { renderStudents } from '../pages/students.page.js';
import { renderTrainers } from '../pages/trainers.page.js';
import { renderModules } from '../pages/modules.page.js';
import { renderSchedule } from '../pages/schedule.page.js';
import { renderAttendance } from '../pages/attendance.page.js';
import { renderLogin } from '../pages/login.page.js';

const pages = {
    login: renderLogin,
    dashboard: renderDashboard,
    students: renderStudents,
    trainers: renderTrainers,
    modules: renderModules,
    schedule: renderSchedule,
    attendance: renderAttendance,
};

let currentSection = 'dashboard';

export async function navigateTo(section) {
    if (!pages[section]) return;

    // Auth guard: redirect to login if not authenticated (except for login page)
    if (section !== 'login') {
        const isAuth = await requireAuth();
        if (!isAuth) return;
    }

    currentSection = section;

    // Show/hide sidebar and topbar based on login state
    const sidebar = $('#sidebar');
    const topbar = $('.topbar');
    const mainContent = $('#mainContent');
    
    if (section === 'login') {
        if (sidebar) sidebar.style.display = 'none';
        if (topbar) topbar.style.display = 'none';
        if (mainContent) mainContent.style.marginLeft = '0';
    } else {
        if (sidebar) sidebar.style.display = 'flex';
        if (topbar) topbar.style.display = 'flex';
        if (mainContent) mainContent.style.marginLeft = '';
    }

    // Update active state in sidebar nav items
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = $(`.nav-item[data-section="${section}"]`);
    if (navItem) navItem.classList.add('active');

    // Update Page Header (Topbar) title and subtitle
    const meta = SECTIONS[section];
    if (meta) {
        const pageTitle = $('#pageTitle');
        const pageSubtitle = $('#pageSubtitle');
        if (pageTitle) pageTitle.textContent = meta.title;
        if (pageSubtitle) pageSubtitle.textContent = meta.subtitle;
    }

    // Close Mobile Sidebar if open
    if (sidebar) sidebar.classList.remove('open');

    // Render the page
    const area = $('#contentArea');
    if (area) {
        area.innerHTML = '';
        // Reset animation
        area.style.animation = 'none';
        area.offsetHeight; // trigger reflow
        area.style.animation = '';
        
        pages[section](area);
    }
}

export function getCurrentSection() {
    return currentSection;
}

export async function setupNavigation() {
    // Check auth on initial load
    const { isAuthenticated } = await checkAuth();
    
    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && window.location.hash !== '#login') {
        window.location.hash = '#login';
    }

    $$('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.section);
        });
    });

    const menuToggle = $('#menuToggle');
    const sidebar = $('#sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}
