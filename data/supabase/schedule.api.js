/* ========================================
   Digital Hub OS — Schedule Supabase API
   ======================================== */

import { getSupabase } from '../../config/supabase.js';

export class ScheduleAPI {
    constructor() {
        this.supabase = getSupabase();
        this.tableName = 'schedule';
        this.useLocalStorage = !this.supabase;
    }

    async getAll() {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_schedule');
            return raw ? JSON.parse(raw) : [];
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .order('date', { ascending: true });

            if (error) {
                console.error('[ScheduleAPI] Error fetching schedule:', error);
                const raw = localStorage.getItem('dhos_schedule');
                return raw ? JSON.parse(raw) : [];
            }

            return data || [];
        } catch (e) {
            console.error('[ScheduleAPI] Error fetching schedule:', e);
            const raw = localStorage.getItem('dhos_schedule');
            return raw ? JSON.parse(raw) : [];
        }
    }

    async getById(id) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_schedule');
            const schedule = raw ? JSON.parse(raw) : [];
            return schedule.find(s => s.id === id) || null;
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('[ScheduleAPI] Error fetching schedule entry:', error);
                const raw = localStorage.getItem('dhos_schedule');
                const schedule = raw ? JSON.parse(raw) : [];
                return schedule.find(s => s.id === id) || null;
            }

            return data;
        } catch (e) {
            console.error('[ScheduleAPI] Error fetching schedule entry:', e);
            const raw = localStorage.getItem('dhos_schedule');
            const schedule = raw ? JSON.parse(raw) : [];
            return schedule.find(s => s.id === id) || null;
        }
    }

    async create(entry) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_schedule');
            const schedule = raw ? JSON.parse(raw) : [];
            schedule.push(entry);
            localStorage.setItem('dhos_schedule', JSON.stringify(schedule));
            return entry;
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert(entry)
                .select()
                .single();

            if (error) {
                console.error('[ScheduleAPI] Error creating schedule entry:', error);
                const raw = localStorage.getItem('dhos_schedule');
                const schedule = raw ? JSON.parse(raw) : [];
                schedule.push(entry);
                localStorage.setItem('dhos_schedule', JSON.stringify(schedule));
                return entry;
            }

            return data;
        } catch (e) {
            console.error('[ScheduleAPI] Error creating schedule entry:', e);
            const raw = localStorage.getItem('dhos_schedule');
            const schedule = raw ? JSON.parse(raw) : [];
            schedule.push(entry);
            localStorage.setItem('dhos_schedule', JSON.stringify(schedule));
            return entry;
        }
    }

    async update(id, updatedFields) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_schedule');
            const schedule = raw ? JSON.parse(raw) : [];
            const index = schedule.findIndex(s => s.id === id);
            if (index === -1) return null;
            schedule[index] = { ...schedule[index], ...updatedFields };
            localStorage.setItem('dhos_schedule', JSON.stringify(schedule));
            return schedule[index];
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(updatedFields)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('[ScheduleAPI] Error updating schedule entry:', error);
                const raw = localStorage.getItem('dhos_schedule');
                const schedule = raw ? JSON.parse(raw) : [];
                const index = schedule.findIndex(s => s.id === id);
                if (index === -1) return null;
                schedule[index] = { ...schedule[index], ...updatedFields };
                localStorage.setItem('dhos_schedule', JSON.stringify(schedule));
                return schedule[index];
            }

            return data;
        } catch (e) {
            console.error('[ScheduleAPI] Error updating schedule entry:', e);
            const raw = localStorage.getItem('dhos_schedule');
            const schedule = raw ? JSON.parse(raw) : [];
            const index = schedule.findIndex(s => s.id === id);
            if (index === -1) return null;
            schedule[index] = { ...schedule[index], ...updatedFields };
            localStorage.setItem('dhos_schedule', JSON.stringify(schedule));
            return schedule[index];
        }
    }

    async delete(id) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_schedule');
            const schedule = raw ? JSON.parse(raw) : [];
            const initialLength = schedule.length;
            const filtered = schedule.filter(s => s.id !== id);
            if (filtered.length === initialLength) return false;
            localStorage.setItem('dhos_schedule', JSON.stringify(filtered));
            return true;
        }

        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) {
                console.error('[ScheduleAPI] Error deleting schedule entry:', error);
                const raw = localStorage.getItem('dhos_schedule');
                const schedule = raw ? JSON.parse(raw) : [];
                const initialLength = schedule.length;
                const filtered = schedule.filter(s => s.id !== id);
                if (filtered.length === initialLength) return false;
                localStorage.setItem('dhos_schedule', JSON.stringify(filtered));
                return true;
            }

            return true;
        } catch (e) {
            console.error('[ScheduleAPI] Error deleting schedule entry:', e);
            const raw = localStorage.getItem('dhos_schedule');
            const schedule = raw ? JSON.parse(raw) : [];
            const initialLength = schedule.length;
            const filtered = schedule.filter(s => s.id !== id);
            if (filtered.length === initialLength) return false;
            localStorage.setItem('dhos_schedule', JSON.stringify(filtered));
            return true;
        }
    }
}
