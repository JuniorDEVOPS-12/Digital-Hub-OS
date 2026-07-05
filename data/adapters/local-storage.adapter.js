/* ========================================
   Digital Hub OS — LocalStorage Adapter
   Seul point d'accès direct à localStorage.
   Remplaçable par SupabaseAdapter / PostgresAdapter.
   ======================================== */

/**
 * @typedef {import('./storage.adapter.js').StorageAdapter} StorageAdapter
 * @implements {StorageAdapter}
 */
export const localStorageAdapter = {
    load(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error(`[StorageAdapter] Error loading key "${key}":`, e);
            return null;
        }
    },

    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`[StorageAdapter] Error saving key "${key}":`, e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`[StorageAdapter] Error removing key "${key}":`, e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('[StorageAdapter] Error clearing storage:', e);
            return false;
        }
    },
};
