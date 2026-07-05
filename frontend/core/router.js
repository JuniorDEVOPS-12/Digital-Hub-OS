import { $, $$ } from './dom.js';
import { SECTIONS } from '../../config/constants.js';

import { renderDashboard } from '../pages/dashboard.page.js';
import { renderStudents } from '../pages/students.page.js';
import { renderTrainers } from '../pages/trainers.page.js';
import { renderModules } from '../pages/modules.page.js';
import { renderSchedule } from '../pages/schedule.page.js';
import { renderAttendance } from '../pages/attendance.page.js';

const pages = {
    dashboard: renderDashboard,
    students: renderStudents,
    trainers: renderTrainers,
    modules: renderModules,
    schedule: renderSchedule,
    attendance: renderAttendance,
};

let currentSection = 'dashboard';

export function navigateTo(section) {
    if (!pages[section]) return;

    currentSection = section;

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
    const sidebar = $('#sidebar');
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

export function setupNavigation() {
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
