import { initDatabase } from '../backend/api.js';
import { setupNavigation, navigateTo } from './core/router.js';
import { setupModalCloseEvents } from './core/modal.js';
import { checkAuth, logout, getAuthState } from './core/auth.js';
import { $ } from './core/dom.js';

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (event.error?.message && (event.error.message.includes('indisponible') || event.error.message.includes('Supabase'))) {
        showFallbackPage(event.error.message);
    }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (event.reason?.message && (event.reason.message.includes('indisponible') || event.reason.message.includes('Supabase'))) {
        showFallbackPage(event.reason.message);
    }
});

function showFallbackPage(message) {
    document.body.innerHTML = `
        <div style="
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            font-family: 'Inter', sans-serif;
            padding: 20px;
        ">
            <div style="
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                padding: 40px;
                max-width: 500px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                text-align: center;
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: #fee2e2;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                ">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h1 style="color: #1a365d; font-size: 24px; font-weight: 700; margin: 0 0 16px;">Service Indisponible</h1>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">${message}</p>
                <button 
                    onclick="location.reload()" 
                    style="
                        background: linear-gradient(135deg, #f97316, #ea580c);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'"
                >
                    Réessayer
                </button>
            </div>
        </div>
    `;
    document.body.style.display = 'block';
}
window.showFallbackPage = showFallbackPage;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 APP INIT START');
    
    // Hide UI elements initially during bootstrap to avoid flash of content
    document.body.style.display = 'none';
    
    try {
        // 1. Initial auth check - MUST pass successfully without throwing configuration errors
        console.log('🔐 Performing initial authentication check...');
        const { isAuthenticated } = await checkAuth();
        console.log('🔐 Auth status:', isAuthenticated);

        // 2. Initialize database
        console.log('📦 Initializing database...');
        await initDatabase();
        console.log('✅ Database initialized');

        // 3. Setup navigation event bindings (resilient, no double auth check)
        console.log('🔧 Setting up navigation...');
        setupNavigation();
        console.log('ROUTER READY');

        // 4. Register modal events
        setupModalCloseEvents();
        console.log('✅ Modal events attached');

        // 5. Date Container
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

        // 6. Setup logout button
        const logoutBtn = $('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await logout();
                } catch (error) {
                    console.error('Logout error:', error);
                }
            });
        }

        // 7. Setup verification test button
        const testBtn = $('#testJSBtn');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                window.testJS();
            });
        }

        // Add test function globally
        window.testJS = () => {
            console.log('✅ JavaScript is working! Test button clicked.');
            alert('JavaScript est actif ! Les interactions fonctionnent.');
        };

        console.log('EVENTS ATTACHED');

        // 8. Route to initial section depending on auth state
        const initialSection = window.location.hash.replace('#', '') || 'dashboard';
        
        if (!isAuthenticated) {
            console.log('🔐 Redirecting unauthenticated user to login...');
            window.location.hash = '#login';
            await navigateTo('login');
        } else {
            console.log('🔐 User is authenticated. Loading page:', initialSection);
            if (initialSection === 'login') {
                window.location.hash = '#dashboard';
                await navigateTo('dashboard');
            } else {
                await navigateTo(initialSection);
            }
        }

        // Make body visible now that initial routing is complete
        document.body.style.display = '';
        console.log('APP INIT OK');
        
    } catch (error) {
        console.error('❌ Fatal application bootstrap error:', error);
        showFallbackPage(error.message || 'Erreur lors de l\'initialisation de l\'application');
    }
});

// Global hashchange event listener for clean dynamic SPA routing
window.addEventListener('hashchange', () => {
    const section = window.location.hash.replace('#', '') || 'dashboard';
    console.log('🔗 Hash changed, navigating to:', section);
    
    // Auth redirect rule: if logged in, prevent going to login page manually
    const { isAuthenticated } = getAuthState();
    if (isAuthenticated && section === 'login') {
        window.location.hash = '#dashboard';
        return;
    }
    
    navigateTo(section);
});
