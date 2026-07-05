/* ========================================
   Digital Hub OS — Students Supabase API
   ======================================== */

import { getSupabase } from '../../config/supabase.js';
import { AppError, ErrorCodes } from '../errors/app-error.js';

export class StudentsAPI {
    constructor() {
        this.supabase = getSupabase();
        this.tableName = 'students';
        this.useLocalStorage = !this.supabase;
    }

    async getAll() {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_students');
            return raw ? JSON.parse(raw) : [];
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .order('last_name', { ascending: true });

            if (error) {
                console.error('[StudentsAPI] Error fetching students:', error);
                // Fallback to localStorage
                const raw = localStorage.getItem('dhos_students');
                return raw ? JSON.parse(raw) : [];
            }

            return data || [];
        } catch (e) {
            console.error('[StudentsAPI] Error fetching students:', e);
            // Fallback to localStorage
            const raw = localStorage.getItem('dhos_students');
            return raw ? JSON.parse(raw) : [];
        }
    }

    async getById(id) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_students');
            const students = raw ? JSON.parse(raw) : [];
            return students.find(s => s.id === id) || null;
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('[StudentsAPI] Error fetching student:', error);
                // Fallback to localStorage
                const raw = localStorage.getItem('dhos_students');
                const students = raw ? JSON.parse(raw) : [];
                return students.find(s => s.id === id) || null;
            }

            return data;
        } catch (e) {
            console.error('[StudentsAPI] Error fetching student:', e);
            // Fallback to localStorage
            const raw = localStorage.getItem('dhos_students');
            const students = raw ? JSON.parse(raw) : [];
            return students.find(s => s.id === id) || null;
        }
    }

    async create(student) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_students');
            const students = raw ? JSON.parse(raw) : [];
            students.push(student);
            localStorage.setItem('dhos_students', JSON.stringify(students));
            return student;
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert(student)
                .select()
                .single();

            if (error) {
                console.error('[StudentsAPI] Error creating student:', error);
                // Fallback to localStorage
                const raw = localStorage.getItem('dhos_students');
                const students = raw ? JSON.parse(raw) : [];
                students.push(student);
                localStorage.setItem('dhos_students', JSON.stringify(students));
                return student;
            }

            return data;
        } catch (e) {
            console.error('[StudentsAPI] Error creating student:', e);
            // Fallback to localStorage
            const raw = localStorage.getItem('dhos_students');
            const students = raw ? JSON.parse(raw) : [];
            students.push(student);
            localStorage.setItem('dhos_students', JSON.stringify(students));
            return student;
        }
    }

    async update(id, updatedFields) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_students');
            const students = raw ? JSON.parse(raw) : [];
            const index = students.findIndex(s => s.id === id);
            if (index === -1) return null;
            students[index] = { ...students[index], ...updatedFields };
            localStorage.setItem('dhos_students', JSON.stringify(students));
            return students[index];
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(updatedFields)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('[StudentsAPI] Error updating student:', error);
                // Fallback to localStorage
                const raw = localStorage.getItem('dhos_students');
                const students = raw ? JSON.parse(raw) : [];
                const index = students.findIndex(s => s.id === id);
                if (index === -1) return null;
                students[index] = { ...students[index], ...updatedFields };
                localStorage.setItem('dhos_students', JSON.stringify(students));
                return students[index];
            }

            return data;
        } catch (e) {
            console.error('[StudentsAPI] Error updating student:', e);
            // Fallback to localStorage
            const raw = localStorage.getItem('dhos_students');
            const students = raw ? JSON.parse(raw) : [];
            const index = students.findIndex(s => s.id === id);
            if (index === -1) return null;
            students[index] = { ...students[index], ...updatedFields };
            localStorage.setItem('dhos_students', JSON.stringify(students));
            return students[index];
        }
    }

    async delete(id) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_students');
            const students = raw ? JSON.parse(raw) : [];
            const initialLength = students.length;
            const filtered = students.filter(s => s.id !== id);
            if (filtered.length === initialLength) return false;
            localStorage.setItem('dhos_students', JSON.stringify(filtered));
            return true;
        }

        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) {
                console.error('[StudentsAPI] Error deleting student:', error);
                // Fallback to localStorage
                const raw = localStorage.getItem('dhos_students');
                const students = raw ? JSON.parse(raw) : [];
                const initialLength = students.length;
                const filtered = students.filter(s => s.id !== id);
                if (filtered.length === initialLength) return false;
                localStorage.setItem('dhos_students', JSON.stringify(filtered));
                return true;
            }

            return true;
        } catch (e) {
            console.error('[StudentsAPI] Error deleting student:', e);
            // Fallback to localStorage
            const raw = localStorage.getItem('dhos_students');
            const students = raw ? JSON.parse(raw) : [];
            const initialLength = students.length;
            const filtered = students.filter(s => s.id !== id);
            if (filtered.length === initialLength) return false;
            localStorage.setItem('dhos_students', JSON.stringify(filtered));
            return true;
        }
    }
}
