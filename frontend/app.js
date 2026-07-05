import { initDataLayer } from '../backend/api.js';
import { setupNavigation, navigateTo, getCurrentSection } from './core/router.js';
import { setupModalCloseEvents } from './core/modal.js';
import { logout, initAuthListener } from './core/auth.js';
import { hydrateSupabaseAdapters } from '../data/adapters/adapter-factory.js';
import { $ } from './core/dom.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Bootstrap data layer: hydrate depuis Supabase (entités migrées) puis seed
    await initDataLayer();

    // Ré-hydrate et rafraîchit l'écran après connexion (la session RLS devient
    // disponible), sans toucher au système d'authentification.
    initAuthListener(async ({ event }) => {
        if (event === 'SIGNED_IN') {
            await hydrateSupabaseAdapters();
            navigateTo(getCurrentSection());
        }
    });

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
