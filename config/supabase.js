/* ========================================
   Digital Hub OS — Supabase Configuration
   ======================================== */

// Configuration Supabase
// `import.meta.env` n'existe que sous un bundler (Vite). En service statique
// (server.ps1 / navigateur), on retombe sur les valeurs par défaut.
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://zwyojlrjirtgzztenned.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eW9qbHJqaXJ0Z3p6dGVubmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNDkwNjgsImV4cCI6MjA5ODgyNTA2OH0.OnIS7HKpe1lTKuAnY_mibUm5nNNRuNEqsge9RVghkVo';

// Client Supabase sera initialisé après chargement du script
let supabaseClient = null;

export function initSupabase() {
    if (typeof window.supabase !== 'undefined' && !supabaseClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

export async function signOut() {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getCurrentUser() {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
}

export async function onAuthStateChange(callback) {
    const supabase = getSupabase();
    return supabase.auth.onAuthStateChange(callback);
}
