/* ========================================
   Digital Hub OS — Modules Supabase API
   ======================================== */

import { getSupabase } from '../../config/supabase.js';

export class ModulesAPI {
    constructor() {
        this.supabase = getSupabase();
        this.tableName = 'modules';
        this.useLocalStorage = !this.supabase;
    }

    async getAll() {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_modules');
            return raw ? JSON.parse(raw) : [];
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .order('order', { ascending: true });

            if (error) {
                console.error('[ModulesAPI] Error fetching modules:', error);
                const raw = localStorage.getItem('dhos_modules');
                return raw ? JSON.parse(raw) : [];
            }

            return data || [];
        } catch (e) {
            console.error('[ModulesAPI] Error fetching modules:', e);
            const raw = localStorage.getItem('dhos_modules');
            return raw ? JSON.parse(raw) : [];
        }
    }

    async getById(id) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_modules');
            const modules = raw ? JSON.parse(raw) : [];
            return modules.find(m => m.id === id) || null;
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('[ModulesAPI] Error fetching module:', error);
                const raw = localStorage.getItem('dhos_modules');
                const modules = raw ? JSON.parse(raw) : [];
                return modules.find(m => m.id === id) || null;
            }

            return data;
        } catch (e) {
            console.error('[ModulesAPI] Error fetching module:', e);
            const raw = localStorage.getItem('dhos_modules');
            const modules = raw ? JSON.parse(raw) : [];
            return modules.find(m => m.id === id) || null;
        }
    }

    async create(module) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_modules');
            const modules = raw ? JSON.parse(raw) : [];
            modules.push(module);
            localStorage.setItem('dhos_modules', JSON.stringify(modules));
            return module;
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert(module)
                .select()
                .single();

            if (error) {
                console.error('[ModulesAPI] Error creating module:', error);
                const raw = localStorage.getItem('dhos_modules');
                const modules = raw ? JSON.parse(raw) : [];
                modules.push(module);
                localStorage.setItem('dhos_modules', JSON.stringify(modules));
                return module;
            }

            return data;
        } catch (e) {
            console.error('[ModulesAPI] Error creating module:', e);
            const raw = localStorage.getItem('dhos_modules');
            const modules = raw ? JSON.parse(raw) : [];
            modules.push(module);
            localStorage.setItem('dhos_modules', JSON.stringify(modules));
            return module;
        }
    }

    async update(id, updatedFields) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_modules');
            const modules = raw ? JSON.parse(raw) : [];
            const index = modules.findIndex(m => m.id === id);
            if (index === -1) return null;
            modules[index] = { ...modules[index], ...updatedFields };
            localStorage.setItem('dhos_modules', JSON.stringify(modules));
            return modules[index];
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(updatedFields)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('[ModulesAPI] Error updating module:', error);
                const raw = localStorage.getItem('dhos_modules');
                const modules = raw ? JSON.parse(raw) : [];
                const index = modules.findIndex(m => m.id === id);
                if (index === -1) return null;
                modules[index] = { ...modules[index], ...updatedFields };
                localStorage.setItem('dhos_modules', JSON.stringify(modules));
                return modules[index];
            }

            return data;
        } catch (e) {
            console.error('[ModulesAPI] Error updating module:', e);
            const raw = localStorage.getItem('dhos_modules');
            const modules = raw ? JSON.parse(raw) : [];
            const index = modules.findIndex(m => m.id === id);
            if (index === -1) return null;
            modules[index] = { ...modules[index], ...updatedFields };
            localStorage.setItem('dhos_modules', JSON.stringify(modules));
            return modules[index];
        }
    }

    async delete(id) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_modules');
            const modules = raw ? JSON.parse(raw) : [];
            const initialLength = modules.length;
            const filtered = modules.filter(m => m.id !== id);
            if (filtered.length === initialLength) return false;
            localStorage.setItem('dhos_modules', JSON.stringify(filtered));
            return true;
        }

        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) {
                console.error('[ModulesAPI] Error deleting module:', error);
                const raw = localStorage.getItem('dhos_modules');
                const modules = raw ? JSON.parse(raw) : [];
                const initialLength = modules.length;
                const filtered = modules.filter(m => m.id !== id);
                if (filtered.length === initialLength) return false;
                localStorage.setItem('dhos_modules', JSON.stringify(filtered));
                return true;
            }

            return true;
        } catch (e) {
            console.error('[ModulesAPI] Error deleting module:', e);
            const raw = localStorage.getItem('dhos_modules');
            const modules = raw ? JSON.parse(raw) : [];
            const initialLength = modules.length;
            const filtered = modules.filter(m => m.id !== id);
            if (filtered.length === initialLength) return false;
            localStorage.setItem('dhos_modules', JSON.stringify(filtered));
            return true;
        }
    }
}
