/* ========================================
   Digital Hub OS — Supabase API: Schedule
   ======================================== */

import { requireSupabase } from './client.js';
import { scheduleFromRow, scheduleToRow } from './mappers.js';

const TABLE = 'schedule';

export const scheduleApi = {
    /** @returns {Promise<Array<Object>>} */
    async getAll() {
        const { data, error } = await requireSupabase().from(TABLE).select('*');
        if (error) throw error;
        return (data || []).map(scheduleFromRow);
    },

    /** @param {string} id @returns {Promise<Object|null>} */
    async getById(id) {
        const { data, error } = await requireSupabase()
            .from(TABLE).select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        return data ? scheduleFromRow(data) : null;
    },

    /** @param {Object} entry @returns {Promise<Object>} */
    async create(entry) {
        const { data, error } = await requireSupabase()
            .from(TABLE).insert(scheduleToRow(entry)).select().single();
        if (error) throw error;
        return scheduleFromRow(data);
    },

    /** @param {string} id @param {Object} fields @returns {Promise<Object|null>} */
    async update(id, fields) {
        const { data, error } = await requireSupabase()
            .from(TABLE).update(scheduleToRow({ ...fields, id })).eq('id', id).select().maybeSingle();
        if (error) throw error;
        return data ? scheduleFromRow(data) : null;
    },

    /** @param {string} id @returns {Promise<boolean>} */
    async delete(id) {
        const { error } = await requireSupabase().from(TABLE).delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    /** @param {Array<Object>} items */
    async upsertAll(items) {
        if (!items || items.length === 0) return;
        const { error } = await requireSupabase()
            .from(TABLE).upsert(items.map(scheduleToRow), { onConflict: 'id' });
        if (error) throw error;
    },

    /** @param {Array<string>} keepIds */
    async deleteMissing(keepIds) {
        let query = requireSupabase().from(TABLE).delete();
        query = keepIds && keepIds.length > 0
            ? query.not('id', 'in', `(${keepIds.join(',')})`)
            : query.not('id', 'is', null);
        const { error } = await query;
        if (error) throw error;
    },
};
