/* ========================================
   Digital Hub OS — LocalStorage Data Store
   ======================================== */

export const store = {
    load(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error(`Error loading key "${key}" from localStorage:`, e);
            return null;
        }
    },

    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`Error saving key "${key}" to localStorage:`, e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`Error removing key "${key}" from localStorage:`, e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error("Error clearing localStorage:", e);
            return false;
        }
    }
};
