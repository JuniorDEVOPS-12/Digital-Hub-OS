import { getCurrentUser, onAuthStateChange } from '../../config/supabase.js';

let isAuthenticated = false;
let currentUser = null;

// Check authentication status
export async function checkAuth() {
    const { user, error } = await getCurrentUser();
    isAuthenticated = !!user;
    currentUser = user;
    return { isAuthenticated, user, error };
}

// Get current auth state
export function getAuthState() {
    return { isAuthenticated, currentUser };
}

// Auth guard - redirects to login if not authenticated
export async function requireAuth() {
    const { isAuthenticated, user } = await checkAuth();
    
    if (!isAuthenticated) {
        // Redirect to login
        window.location.hash = '#login';
        return false;
    }
    
    return true;
}

// Initialize auth state listener
export function initAuthListener(callback) {
    return onAuthStateChange((event, session) => {
        isAuthenticated = !!session;
        currentUser = session?.user || null;
        
        if (callback) {
            callback({ isAuthenticated, currentUser, event, session });
        }
    });
}

// Logout function
export async function logout() {
    const { signOut } = await import('../../config/supabase.js');
    const { error } = await signOut();
    
    if (!error) {
        isAuthenticated = false;
        currentUser = null;
        window.location.hash = '#login';
    }
    
    return { error };
}
