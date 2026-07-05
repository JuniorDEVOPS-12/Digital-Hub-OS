/* ========================================
   Digital Hub OS — Trainers Supabase API
   ======================================== */

import { getSupabase } from '../../config/supabase.js';

export class TrainersAPI {
    constructor() {
        this.supabase = getSupabase();
        this.tableName = 'trainers';
        this.useLocalStorage = !this.supabase;
    }

    async getAll() {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_trainers');
            return raw ? JSON.parse(raw) : [];
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .order('last_name', { ascending: true });

            if (error) {
                console.error('[TrainersAPI] Error fetching trainers:', error);
                const raw = localStorage.getItem('dhos_trainers');
                return raw ? JSON.parse(raw) : [];
            }

            return data || [];
        } catch (e) {
            console.error('[TrainersAPI] Error fetching trainers:', e);
            const raw = localStorage.getItem('dhos_trainers');
            return raw ? JSON.parse(raw) : [];
        }
    }

    async getById(id) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_trainers');
            const trainers = raw ? JSON.parse(raw) : [];
            return trainers.find(t => t.id === id) || null;
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('[TrainersAPI] Error fetching trainer:', error);
                const raw = localStorage.getItem('dhos_trainers');
                const trainers = raw ? JSON.parse(raw) : [];
                return trainers.find(t => t.id === id) || null;
            }

            return data;
        } catch (e) {
            console.error('[TrainersAPI] Error fetching trainer:', e);
            const raw = localStorage.getItem('dhos_trainers');
            const trainers = raw ? JSON.parse(raw) : [];
            return trainers.find(t => t.id === id) || null;
        }
    }

    async create(trainer) {
        console.log('[TrainersAPI] CREATE START', trainer);
        if (this.useLocalStorage) {
            console.log('[TrainersAPI] USING LOCALSTORAGE FALLBACK');
            const raw = localStorage.getItem('dhos_trainers');
            const trainers = raw ? JSON.parse(raw) : [];
            trainers.push(trainer);
            localStorage.setItem('dhos_trainers', JSON.stringify(trainers));
            console.log('[TrainersAPI] LOCALSTORAGE INSERT SUCCESS');
            return trainer;
        }

        try {
            console.log('[TrainersAPI] SUPABASE INSERT START', this.tableName);
            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert(trainer)
                .select()
                .single();

            if (error) {
                console.error('[TrainersAPI] SUPABASE INSERT ERROR:', error);
                console.log('[TrainersAPI] FALLING BACK TO LOCALSTORAGE');
                const raw = localStorage.getItem('dhos_trainers');
                const trainers = raw ? JSON.parse(raw) : [];
                trainers.push(trainer);
                localStorage.setItem('dhos_trainers', JSON.stringify(trainers));
                console.log('[TrainersAPI] LOCALSTORAGE FALLBACK SUCCESS');
                return trainer;
            }

            console.log('[TrainersAPI] SUPABASE INSERT SUCCESS', data);
            return data;
        } catch (e) {
            console.error('[TrainersAPI] SUPABASE INSERT EXCEPTION:', e);
            console.log('[TrainersAPI] FALLING BACK TO LOCALSTORAGE');
            const raw = localStorage.getItem('dhos_trainers');
            const trainers = raw ? JSON.parse(raw) : [];
            trainers.push(trainer);
            localStorage.setItem('dhos_trainers', JSON.stringify(trainers));
            console.log('[TrainersAPI] LOCALSTORAGE FALLBACK SUCCESS');
            return trainer;
        }
    }

    async update(id, updatedFields) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_trainers');
            const trainers = raw ? JSON.parse(raw) : [];
            const index = trainers.findIndex(t => t.id === id);
            if (index === -1) return null;
            trainers[index] = { ...trainers[index], ...updatedFields };
            localStorage.setItem('dhos_trainers', JSON.stringify(trainers));
            return trainers[index];
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(updatedFields)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('[TrainersAPI] Error updating trainer:', error);
                const raw = localStorage.getItem('dhos_trainers');
                const trainers = raw ? JSON.parse(raw) : [];
                const index = trainers.findIndex(t => t.id === id);
                if (index === -1) return null;
                trainers[index] = { ...trainers[index], ...updatedFields };
                localStorage.setItem('dhos_trainers', JSON.stringify(trainers));
                return trainers[index];
            }

            return data;
        } catch (e) {
            console.error('[TrainersAPI] Error updating trainer:', e);
            const raw = localStorage.getItem('dhos_trainers');
            const trainers = raw ? JSON.parse(raw) : [];
            const index = trainers.findIndex(t => t.id === id);
            if (index === -1) return null;
            trainers[index] = { ...trainers[index], ...updatedFields };
            localStorage.setItem('dhos_trainers', JSON.stringify(trainers));
            return trainers[index];
        }
    }

    async delete(id) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_trainers');
            const trainers = raw ? JSON.parse(raw) : [];
            const initialLength = trainers.length;
            const filtered = trainers.filter(t => t.id !== id);
            if (filtered.length === initialLength) return false;
            localStorage.setItem('dhos_trainers', JSON.stringify(filtered));
            return true;
        }

        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) {
                console.error('[TrainersAPI] Error deleting trainer:', error);
                const raw = localStorage.getItem('dhos_trainers');
                const trainers = raw ? JSON.parse(raw) : [];
                const initialLength = trainers.length;
                const filtered = trainers.filter(t => t.id !== id);
                if (filtered.length === initialLength) return false;
                localStorage.setItem('dhos_trainers', JSON.stringify(filtered));
                return true;
            }

            return true;
        } catch (e) {
            console.error('[TrainersAPI] Error deleting trainer:', e);
            const raw = localStorage.getItem('dhos_trainers');
            const trainers = raw ? JSON.parse(raw) : [];
            const initialLength = trainers.length;
            const filtered = trainers.filter(t => t.id !== id);
            if (filtered.length === initialLength) return false;
            localStorage.setItem('dhos_trainers', JSON.stringify(filtered));
            return true;
        }
    }
}
