/* ========================================
   Digital Hub OS — Supabase API: Students
   ======================================== */

import { requireSupabase } from './client.js';
import { studentFromRow, studentToRow } from './mappers.js';

const TABLE = 'students';

export const studentsApi = {
    /** @returns {Promise<Array<Object>>} */
    async getAll() {
        const { data, error } = await requireSupabase().from(TABLE).select('*');
        if (error) throw error;
        return (data || []).map(studentFromRow);
    },

    /** @param {string} id @returns {Promise<Object|null>} */
    async getById(id) {
        const { data, error } = await requireSupabase()
            .from(TABLE).select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        return data ? studentFromRow(data) : null;
    },

    /** @param {Object} student @returns {Promise<Object>} */
    async create(student) {
        const { data, error } = await requireSupabase()
            .from(TABLE).insert(studentToRow(student)).select().single();
        if (error) throw error;
        return studentFromRow(data);
    },

    /** @param {string} id @param {Object} fields @returns {Promise<Object|null>} */
    async update(id, fields) {
        const { data, error } = await requireSupabase()
            .from(TABLE).update(studentToRow({ ...fields, id })).eq('id', id).select().maybeSingle();
        if (error) throw error;
        return data ? studentFromRow(data) : null;
    },

    /** @param {string} id @returns {Promise<boolean>} */
    async delete(id) {
        const { error } = await requireSupabase().from(TABLE).delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    /** Upsert en masse (source de vérité = liste fournie). @param {Array<Object>} items */
    async upsertAll(items) {
        if (!items || items.length === 0) return;
        const { error } = await requireSupabase()
            .from(TABLE).upsert(items.map(studentToRow), { onConflict: 'id' });
        if (error) throw error;
    },

    /** Supprime les lignes absentes de la liste d'ids fournie. @param {Array<string>} keepIds */
    async deleteMissing(keepIds) {
        let query = requireSupabase().from(TABLE).delete();
        query = keepIds && keepIds.length > 0
            ? query.not('id', 'in', `(${keepIds.join(',')})`)
            : query.not('id', 'is', null);
        const { error } = await query;
        if (error) throw error;
    },
};
