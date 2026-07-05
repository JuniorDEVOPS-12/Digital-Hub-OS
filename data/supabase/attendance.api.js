/* ========================================
   Digital Hub OS — Supabase API: Attendance
   L'application manipule une carte { [date]: { [studentId]: status } }.
   La table Supabase stocke une ligne par (student_id, date).
   ======================================== */

import { requireSupabase } from './client.js';
import {
    attendanceMapFromRows,
    attendanceRowsFromMap,
    attendanceRowId,
    attendanceCellFromRow,
} from './mappers.js';

const TABLE = 'attendance';

export const attendanceApi = {
    /**
     * Retourne l'ensemble des présences sous forme de carte applicative.
     * @returns {Promise<Record<string, Record<string, string>>>}
     */
    async getAll() {
        const { data, error } = await requireSupabase().from(TABLE).select('*');
        if (error) throw error;
        return attendanceMapFromRows(data || []);
    },

    /**
     * @param {string} id Identifiant de ligne (`${date}__${studentId}`).
     * @returns {Promise<{date: string, studentId: string, status: string}|null>}
     */
    async getById(id) {
        const { data, error } = await requireSupabase()
            .from(TABLE).select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        return data ? attendanceCellFromRow(data) : null;
    },

    /**
     * @param {string} date
     * @returns {Promise<Record<string, string>>}
     */
    async getByDate(date) {
        const { data, error } = await requireSupabase()
            .from(TABLE).select('*').eq('date', date);
        if (error) throw error;
        const map = attendanceMapFromRows(data || []);
        return map[date] || {};
    },

    /**
     * @param {{date: string, studentId: string, status: string}} cell
     * @returns {Promise<{date: string, studentId: string, status: string}>}
     */
    async create(cell) {
        const row = {
            id: attendanceRowId(cell.date, cell.studentId),
            student_id: cell.studentId,
            date: cell.date,
            status: cell.status,
        };
        const { data, error } = await requireSupabase()
            .from(TABLE).upsert(row, { onConflict: 'id' }).select().single();
        if (error) throw error;
        return attendanceCellFromRow(data);
    },

    /**
     * @param {string} id
     * @param {{status: string}} fields
     * @returns {Promise<{date: string, studentId: string, status: string}|null>}
     */
    async update(id, fields) {
        const { data, error } = await requireSupabase()
            .from(TABLE).update({ status: fields.status }).eq('id', id).select().maybeSingle();
        if (error) throw error;
        return data ? attendanceCellFromRow(data) : null;
    },

    /** @param {string} id @returns {Promise<boolean>} */
    async delete(id) {
        const { error } = await requireSupabase().from(TABLE).delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    /**
     * Upsert de l'ensemble des présences (source de vérité = carte fournie).
     * @param {Record<string, Record<string, string>>} map
     */
    async upsertAll(map) {
        const rows = attendanceRowsFromMap(map);
        if (rows.length === 0) return;
        const { error } = await requireSupabase()
            .from(TABLE).upsert(rows, { onConflict: 'id' });
        if (error) throw error;
    },

    /**
     * Supprime toute ligne absente de la carte fournie.
     * @param {Record<string, Record<string, string>>} map
     */
    async deleteMissing(map) {
        const keepIds = attendanceRowsFromMap(map).map(r => r.id);
        let query = requireSupabase().from(TABLE).delete();
        query = keepIds.length > 0
            ? query.not('id', 'in', `(${keepIds.join(',')})`)
            : query.not('id', 'is', null);
        const { error } = await query;
        if (error) throw error;
    },
};
