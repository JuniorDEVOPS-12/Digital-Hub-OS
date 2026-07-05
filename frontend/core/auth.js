import { getSupabase, getCurrentUser, onAuthStateChange } from '../../config/supabase.js';

let isAuthenticated = false;
let currentUser = null;
let isCheckingAuth = false;

// Check authentication status
export async function checkAuth() {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error("Supabase n'est pas disponible (script non chargé ou configuration manquante).");
    }

    try {
        const { user, error } = await getCurrentUser();
        
        if (error) {
            console.error('🔐 Supabase auth.getUser() returned error:', error);
            // Check if error is network/availability related
            const isNetworkOrConfigError = 
                error.status === 0 || 
                error.status === 404 ||
                error.status >= 500 ||
                error.message?.includes('fetch') || 
                error.message?.includes('Network') ||
                error.message?.includes('Failed to fetch') ||
                error.message?.includes('not initialized') ||
                error.message?.includes('not available');
                
            if (isNetworkOrConfigError) {
                throw new Error(`Supabase indisponible : ${error.message}`);
            }
            
            // For other auth errors (e.g. invalid session, JWT expired), force login without crashing
            isAuthenticated = false;
            currentUser = null;
            return { isAuthenticated: false, user: null, error };
        }
        
        isAuthenticated = !!user;
        currentUser = user;
        console.log('🔐 checkAuth result:', { isAuthenticated, hasUser: !!user });
        return { isAuthenticated, user, error: null };
    } catch (err) {
        console.error('❌ Auth check fatal error:', err);
        isAuthenticated = false;
        currentUser = null;
        throw err; // Propagate fatal error
    }
}

// Get current auth state
export function getAuthState() {
    return { isAuthenticated, currentUser };
}

// Auth guard - redirects to login if not authenticated
export async function requireAuth() {
    console.log('🔐 requireAuth() called');
    
    // Prevent infinite redirect loop
    if (isCheckingAuth) {
        console.log('⚠️ Already checking auth, skipping');
        return true;
    }
    
    // If already on login page, don't check auth
    if (window.location.hash === '#login') {
        console.log('🔐 Already on login page, skipping auth check');
        return true;
    }

    // Cache check: if we already have a validated session, skip Supabase check
    if (isAuthenticated && currentUser) {
        console.log('🔐 Already authenticated (cached), allowing access');
        return true;
    }
    
    isCheckingAuth = true;
    
    try {
        const { isAuthenticated: authCheckResult, user, error } = await checkAuth();
        console.log('🔐 requireAuth result:', { isAuthenticated: authCheckResult, hasUser: !!user, error });
        
        if (!authCheckResult) {
            console.log('🔐 User not authenticated, redirecting to login');
            // Redirect to login
            window.location.hash = '#login';
            return false;
        }
        
        console.log('🔐 User authenticated, allowing access');
        return true;
    } catch (error) {
        console.error('❌ Auth guard fatal error:', error);
        throw error; // Propagate fatal error to block UI
    } finally {
        isCheckingAuth = false;
    }
}

// Initialize auth state listener
export function initAuthListener(callback) {
    try {
        return onAuthStateChange((event, session) => {
            isAuthenticated = !!session;
            currentUser = session?.user || null;
            
            if (callback) {
                callback({ isAuthenticated, currentUser, event, session });
            }
        });
    } catch (error) {
        console.error('Auth listener error:', error);
        return { data: { subscription: null } };
    }
}

// Logout function
export async function logout() {
    try {
        const { signOut } = await import('../../config/supabase.js');
        const { error } = await signOut();
        
        if (!error) {
            isAuthenticated = false;
            currentUser = null;
            window.location.hash = '#login';
        }
        
        return { error };
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect even on error
        isAuthenticated = false;
        currentUser = null;
        window.location.hash = '#login';
        return { error: { message: error.message } };
    }
}
