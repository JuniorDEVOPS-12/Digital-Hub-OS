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
    console.log('📍 navigateTo() called with:', section);
    try {
        if (!pages[section]) {
            console.error('❌ Unknown section:', section);
            return;
        }

        // Auth guard: redirect to login if not authenticated (except for login page)
        if (section !== 'login') {
            console.log('🔐 Checking auth for section:', section);
            const isAuth = await requireAuth();
            if (!isAuth) {
                console.log('🔐 Auth failed, navigation aborted');
                return;
            }
        }

        currentSection = section;
        console.log('📍 Navigating to section:', section);

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
            console.log('🎨 Rendering page:', section);
            area.innerHTML = '';
            // Reset animation
            area.style.animation = 'none';
            area.offsetHeight; // trigger reflow
            area.style.animation = '';
            
            await pages[section](area);
            console.log('✅ Page rendered:', section);
        } else {
            console.error('❌ Content area not found');
        }
    } catch (error) {
        console.error('❌ Navigation error:', error);
        // If it's a fatal auth / Supabase error, trigger the blocking fallback page
        if (error.message && (error.message.includes('indisponible') || error.message.includes('Supabase'))) {
            if (typeof window.showFallbackPage === 'function') {
                window.showFallbackPage(error.message);
                return;
            }
        }
        
        // Show error message in content area
        const area = $('#contentArea');
        if (area) {
            area.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <h2 style="color: var(--color-danger);">Erreur de navigation</h2>
                    <p>Une erreur s'est produite lors du chargement de la page.</p>
                    <button onclick="location.reload()" class="btn btn-primary">Réessayer</button>
                </div>
            `;
        }
    }
}

export function getCurrentSection() {
    return currentSection;
}

export async function setupNavigation() {
    console.log('🔧 setupNavigation() called');
    
    // Event binding for navigation items (MUST run always)
    try {
        console.log('🔗 Attaching nav item events...');
        const navItems = $$('.nav-item');
        console.log('🔗 Found nav items:', navItems.length);
        
        navItems.forEach((item, index) => {
            console.log(`🔗 Attaching event to nav item ${index}:`, item.dataset.section);
            item.addEventListener('click', (e) => {
                console.log('🖱️ Nav item clicked:', item.dataset.section);
                e.preventDefault();
                navigateTo(item.dataset.section);
            });
        });
        console.log('✅ Nav item events attached');

        const menuToggle = $('#menuToggle');
        const sidebar = $('#sidebar');
        if (menuToggle && sidebar) {
            console.log('🔗 Attaching menu toggle event...');
            menuToggle.addEventListener('click', () => {
                console.log('🖱️ Menu toggle clicked');
                sidebar.classList.toggle('open');
            });
            console.log('✅ Menu toggle attached');
        }
        
        console.log('✅ setupNavigation() completed');
    } catch (error) {
        console.error('❌ Event binding during setupNavigation failed:', error);
    }
}
