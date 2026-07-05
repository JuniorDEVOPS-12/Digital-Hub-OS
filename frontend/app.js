import { initDatabase } from '../backend/api.js';
import { setupNavigation, navigateTo } from './core/router.js';
import { setupModalCloseEvents } from './core/modal.js';
import { logout } from './core/auth.js';
import { $ } from './core/dom.js';

document.addEventListener('DOMContentLoaded', () => {
    // Bootstrap database and seed configuration
    initDatabase();

    // Setup SPA router and navigation event listeners
    setupNavigation();

    // Register modal close and escape key hooks
    setupModalCloseEvents();

    // Display current human readable date in the top bar header
    const now = new Date();
    const dateContainer = $('#currentDate');
    if (dateContainer) {
        dateContainer.textContent = now.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }

    // Setup logout button
    const logoutBtn = $('#logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logout();
        });
    }

    // Load initial entry point
    navigateTo('dashboard');
});
