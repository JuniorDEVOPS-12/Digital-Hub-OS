/* ========================================
   Digital Hub OS — Supabase Configuration
   ======================================== */

// Configuration Supabase
// Configuration Supabase
let supabaseUrlTemp = 'https://zwyojlrjirtgzztenned.supabase.co';
let supabaseAnonKeyTemp = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eW9qbHJqaXJ0Z3p6dGVubmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNDkwNjgsImV4cCI6MjA5ODgyNTA2OH0.OnIS7HKpe1lTKuAnY_mibUm5nNNRuNEqsge9RVghkVo';

try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        if (import.meta.env.VITE_SUPABASE_URL) supabaseUrlTemp = import.meta.env.VITE_SUPABASE_URL;
        if (import.meta.env.VITE_SUPABASE_ANON_KEY) supabaseAnonKeyTemp = import.meta.env.VITE_SUPABASE_ANON_KEY;
    }
} catch (e) {
    // import.meta.env is not defined or not accessible
}

const SUPABASE_URL = supabaseUrlTemp;
const SUPABASE_ANON_KEY = supabaseAnonKeyTemp;

// Client Supabase sera initialisé après chargement du script
let supabaseClient = null;

export function initSupabase() {
    try {
        if (typeof window.supabase !== 'undefined' && !supabaseClient) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        supabaseClient = null;
    }
    return supabaseClient;
}

export function getSupabase() {
    if (!supabaseClient) {
        initSupabase();
    }
    return supabaseClient;
}

export async function signInWithEmail(email, password) {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            return { data: null, error: { message: 'Supabase not initialized' } };
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    } catch (error) {
        console.error('Sign in error:', error);
        return { data: null, error: { message: error.message } };
    }
}

export async function signOut() {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            return { error: { message: 'Supabase not initialized' } };
        }
        const { error } = await supabase.auth.signOut();
        return { error };
    } catch (error) {
        console.error('Sign out error:', error);
        return { error: { message: error.message } };
    }
}

export async function getCurrentUser() {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            return { user: null, error: { message: 'Supabase not initialized' } };
        }
        const { data: { user }, error } = await supabase.auth.getUser();
        return { user, error };
    } catch (error) {
        console.error('Get user error:', error);
        return { user: null, error: { message: error.message } };
    }
}

export async function onAuthStateChange(callback) {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            console.warn('Supabase not initialized, auth state change listener not set');
            return { data: { subscription: null } };
        }
        return supabase.auth.onAuthStateChange(callback);
    } catch (error) {
        console.error('Auth state change error:', error);
        return { data: { subscription: null } };
    }
}
