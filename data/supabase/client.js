/* ========================================
   Digital Hub OS — Supabase Client Accessor
   Réutilise le client unique défini dans config/supabase.js.
   Ne modifie PAS le système d'authentification.
   ======================================== */

import { getSupabase, initSupabase } from '../../config/supabase.js';

export { getSupabase, initSupabase };

/**
 * @returns {boolean} Vrai si le SDK Supabase est chargé et le client prêt.
 */
export function isSupabaseReady() {
    try {
        return !!getSupabase();
    } catch (e) {
        console.error('[Supabase] Client indisponible:', e);
        return false;
    }
}

/**
 * Récupère le client Supabase ou lève une erreur explicite.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function requireSupabase() {
    const client = getSupabase();
    if (!client) {
        throw new Error('[Supabase] Client non initialisé (SDK non chargé ?).');
    }
    return client;
}
