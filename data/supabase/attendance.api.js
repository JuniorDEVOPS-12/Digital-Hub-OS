/* ========================================
   Digital Hub OS — Attendance Supabase API
   ======================================== */

import { getSupabase } from '../../config/supabase.js';

export class AttendanceAPI {
    constructor() {
        this.supabase = getSupabase();
        this.tableName = 'attendance';
        this.useLocalStorage = !this.supabase;
    }

    async getAll() {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_attendance');
            return raw ? JSON.parse(raw) : {};
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*');

            if (error) {
                console.error('[AttendanceAPI] Error fetching attendance:', error);
                const raw = localStorage.getItem('dhos_attendance');
                return raw ? JSON.parse(raw) : {};
            }

            // Convert array to object format { date: { studentId: status } }
            const attendance = {};
            if (data) {
                data.forEach(record => {
                    if (record.data) {
                        Object.assign(attendance, record.data);
                    }
                });
            }
            return attendance;
        } catch (e) {
            console.error('[AttendanceAPI] Error fetching attendance:', e);
            const raw = localStorage.getItem('dhos_attendance');
            return raw ? JSON.parse(raw) : {};
        }
    }

    async getById(id) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_attendance');
            const attendance = raw ? JSON.parse(raw) : {};
            return attendance[id] || null;
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('[AttendanceAPI] Error fetching attendance record:', error);
                const raw = localStorage.getItem('dhos_attendance');
                const attendance = raw ? JSON.parse(raw) : {};
                return attendance[id] || null;
            }

            return data?.data || null;
        } catch (e) {
            console.error('[AttendanceAPI] Error fetching attendance record:', e);
            const raw = localStorage.getItem('dhos_attendance');
            const attendance = raw ? JSON.parse(raw) : {};
            return attendance[id] || null;
        }
    }

    async create(attendanceRecord) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_attendance');
            const attendance = raw ? JSON.parse(raw) : {};
            Object.assign(attendance, attendanceRecord);
            localStorage.setItem('dhos_attendance', JSON.stringify(attendance));
            return attendanceRecord;
        }

        try {
            // Store as a single record with all data
            const { data, error } = await this.supabase
                .from(this.tableName)
                .upsert({ id: 'attendance_data', data: attendanceRecord })
                .select()
                .single();

            if (error) {
                console.error('[AttendanceAPI] Error creating attendance record:', error);
                const raw = localStorage.getItem('dhos_attendance');
                const attendance = raw ? JSON.parse(raw) : {};
                Object.assign(attendance, attendanceRecord);
                localStorage.setItem('dhos_attendance', JSON.stringify(attendance));
                return attendanceRecord;
            }

            return data?.data || attendanceRecord;
        } catch (e) {
            console.error('[AttendanceAPI] Error creating attendance record:', e);
            const raw = localStorage.getItem('dhos_attendance');
            const attendance = raw ? JSON.parse(raw) : {};
            Object.assign(attendance, attendanceRecord);
            localStorage.setItem('dhos_attendance', JSON.stringify(attendance));
            return attendanceRecord;
        }
    }

    async update(id, updatedFields) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_attendance');
            const attendance = raw ? JSON.parse(raw) : {};
            attendance[id] = { ...attendance[id], ...updatedFields };
            localStorage.setItem('dhos_attendance', JSON.stringify(attendance));
            return attendance[id];
        }

        try {
            // Get current data
            const { data: currentData } = await this.supabase
                .from(this.tableName)
                .select('data')
                .eq('id', 'attendance_data')
                .single();

            const attendance = currentData?.data || {};
            attendance[id] = { ...attendance[id], ...updatedFields };

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update({ data: attendance })
                .eq('id', 'attendance_data')
                .select()
                .single();

            if (error) {
                console.error('[AttendanceAPI] Error updating attendance record:', error);
                const raw = localStorage.getItem('dhos_attendance');
                const attendance = raw ? JSON.parse(raw) : {};
                attendance[id] = { ...attendance[id], ...updatedFields };
                localStorage.setItem('dhos_attendance', JSON.stringify(attendance));
                return attendance[id];
            }

            return data?.data?.[id] || attendance[id];
        } catch (e) {
            console.error('[AttendanceAPI] Error updating attendance record:', e);
            const raw = localStorage.getItem('dhos_attendance');
            const attendance = raw ? JSON.parse(raw) : {};
            attendance[id] = { ...attendance[id], ...updatedFields };
            localStorage.setItem('dhos_attendance', JSON.stringify(attendance));
            return attendance[id];
        }
    }

    async delete(id) {
        if (this.useLocalStorage) {
            const raw = localStorage.getItem('dhos_attendance');
            const attendance = raw ? JSON.parse(raw) : {};
            delete attendance[id];
            localStorage.setItem('dhos_attendance', JSON.stringify(attendance));
            return true;
        }

        try {
            // Get current data
            const { data: currentData } = await this.supabase
                .from(this.tableName)
                .select('data')
                .eq('id', 'attendance_data')
                .single();

            const attendance = currentData?.data || {};
            delete attendance[id];

            const { error } = await this.supabase
                .from(this.tableName)
                .update({ data: attendance })
                .eq('id', 'attendance_data');

            if (error) {
                console.error('[AttendanceAPI] Error deleting attendance record:', error);
                const raw = localStorage.getItem('dhos_attendance');
                const attendance = raw ? JSON.parse(raw) : {};
                delete attendance[id];
                localStorage.setItem('dhos_attendance', JSON.stringify(attendance));
                return true;
            }

            return true;
        } catch (e) {
            console.error('[AttendanceAPI] Error deleting attendance record:', e);
            const raw = localStorage.getItem('dhos_attendance');
            const attendance = raw ? JSON.parse(raw) : {};
            delete attendance[id];
            localStorage.setItem('dhos_attendance', JSON.stringify(attendance));
            return true;
        }
    }
}
