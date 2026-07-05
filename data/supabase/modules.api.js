/* ========================================
   Digital Hub OS — Supabase API: Modules
   ======================================== */

import { requireSupabase } from './client.js';
import { moduleFromRow, moduleToRow } from './mappers.js';

const TABLE = 'modules';

export const modulesApi = {
    /** @returns {Promise<Array<Object>>} */
    async getAll() {
        const { data, error } = await requireSupabase().from(TABLE).select('*');
        if (error) throw error;
        return (data || []).map(moduleFromRow);
    },

    /** @param {string} id @returns {Promise<Object|null>} */
    async getById(id) {
        const { data, error } = await requireSupabase()
            .from(TABLE).select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        return data ? moduleFromRow(data) : null;
    },

    /** @param {Object} moduleItem @returns {Promise<Object>} */
    async create(moduleItem) {
        const { data, error } = await requireSupabase()
            .from(TABLE).insert(moduleToRow(moduleItem)).select().single();
        if (error) throw error;
        return moduleFromRow(data);
    },

    /** @param {string} id @param {Object} fields @returns {Promise<Object|null>} */
    async update(id, fields) {
        const { data, error } = await requireSupabase()
            .from(TABLE).update(moduleToRow({ ...fields, id })).eq('id', id).select().maybeSingle();
        if (error) throw error;
        return data ? moduleFromRow(data) : null;
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
            .from(TABLE).upsert(items.map(moduleToRow), { onConflict: 'id' });
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
