/* ========================================
   Digital Hub OS — Base Supabase Adapter
   ======================================== */

import { getSupabase } from '../../config/supabase.js';
import { localStorageAdapter } from '../adapters/local-storage.adapter.js';
import { AppError, ErrorCodes } from '../errors/app-error.js';

/**
 * Base Supabase adapter with localStorage fallback
 * @implements {import('../adapters/storage.adapter.js').StorageAdapter}
 */
export class BaseSupabaseAdapter {
    constructor(tableName, storageKey) {
        this.tableName = tableName;
        this.storageKey = storageKey;
        this.supabase = getSupabase();
        this.useLocalStorage = !this.supabase;
    }

    async load(key) {
        if (this.useLocalStorage) {
            return localStorageAdapter.load(key);
        }

        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*');

            if (error) {
                console.error(`[SupabaseAdapter] Error loading from ${this.tableName}:`, error);
                // Fallback to localStorage on error
                return localStorageAdapter.load(key);
            }

            return data || [];
        } catch (e) {
            console.error(`[SupabaseAdapter] Error loading key "${key}":`, e);
            // Fallback to localStorage on error
            return localStorageAdapter.load(key);
        }
    }

    async save(key, data) {
        if (this.useLocalStorage) {
            return localStorageAdapter.save(key, data);
        }

        try {
            // For array data, we need to handle upsert
            if (Array.isArray(data)) {
                // Clear existing data and insert new
                const { error: deleteError } = await this.supabase
                    .from(this.tableName)
                    .delete()
                    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

                if (deleteError) {
                    console.error(`[SupabaseAdapter] Error clearing ${this.tableName}:`, deleteError);
                    return localStorageAdapter.save(key, data);
                }

                if (data.length > 0) {
                    const { error: insertError } = await this.supabase
                        .from(this.tableName)
                        .insert(data);

                    if (insertError) {
                        console.error(`[SupabaseAdapter] Error inserting into ${this.tableName}:`, insertError);
                        return localStorageAdapter.save(key, data);
                    }
                }
            } else {
                // For object data (like attendance records)
                const { error } = await this.supabase
                    .from(this.tableName)
                    .upsert({ id: key, data });

                if (error) {
                    console.error(`[SupabaseAdapter] Error upserting into ${this.tableName}:`, error);
                    return localStorageAdapter.save(key, data);
                }
            }

            return true;
        } catch (e) {
            console.error(`[SupabaseAdapter] Error saving key "${key}":`, e);
            // Fallback to localStorage on error
            return localStorageAdapter.save(key, data);
        }
    }

    async remove(key) {
        if (this.useLocalStorage) {
            return localStorageAdapter.remove(key);
        }

        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', key);

            if (error) {
                console.error(`[SupabaseAdapter] Error deleting from ${this.tableName}:`, error);
                return localStorageAdapter.remove(key);
            }

            return true;
        } catch (e) {
            console.error(`[SupabaseAdapter] Error removing key "${key}":`, e);
            // Fallback to localStorage on error
            return localStorageAdapter.remove(key);
        }
    }

    async clear() {
        if (this.useLocalStorage) {
            return localStorageAdapter.clear();
        }

        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

            if (error) {
                console.error(`[SupabaseAdapter] Error clearing ${this.tableName}:`, error);
                return localStorageAdapter.clear();
            }

            return true;
        } catch (e) {
            console.error(`[SupabaseAdapter] Error clearing storage:`, e);
            // Fallback to localStorage on error
            return localStorageAdapter.clear();
        }
    }
}
