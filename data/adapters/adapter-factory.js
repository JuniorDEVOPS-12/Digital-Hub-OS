/* ========================================
   Digital Hub OS — Storage Adapter Factory
   ----------------------------------------
   Sélectionne l'adaptateur de stockage par entité selon les drapeaux de
   migration (config/supabase). Cœur de la migration PROGRESSIVE :
   chaque entité bascule indépendamment sur Supabase, les autres restant
   sur localStorage. Aucun impact sur l'UI ni sur les services.
   ======================================== */

import { STORAGE_KEYS } from '../../config/constants.js';
import { localStorageAdapter } from './local-storage.adapter.js';
import { createSupabaseAdapter } from './supabase-storage.adapter.js';
import { supabaseApi, isEntityMigrated } from '../supabase/index.js';

/** @type {Record<string, { key: string, shape: 'array'|'map' }>} */
const ENTITY_META = {
    students: { key: STORAGE_KEYS.students, shape: 'array' },
    trainers: { key: STORAGE_KEYS.trainers, shape: 'array' },
    modules: { key: STORAGE_KEYS.modules, shape: 'array' },
    attendance: { key: STORAGE_KEYS.attendance, shape: 'map' },
    schedule: { key: STORAGE_KEYS.schedule, shape: 'array' },
};

/** Adaptateurs mémoïsés (une instance par entité). */
const CACHE = new Map();

/**
 * Retourne l'adaptateur de stockage pour une entité donnée.
 * Supabase si l'entité est migrée, sinon localStorage (repli).
 * @param {keyof typeof ENTITY_META} entity
 * @returns {import('./storage.adapter.js').StorageAdapter}
 */
export function adapterFor(entity) {
    if (CACHE.has(entity)) return CACHE.get(entity);

    const meta = ENTITY_META[entity];
    let adapter = localStorageAdapter;

    if (meta && isEntityMigrated(entity)) {
        adapter = createSupabaseAdapter({
            key: meta.key,
            shape: meta.shape,
            api: supabaseApi[entity],
        });
    }

    CACHE.set(entity, adapter);
    return adapter;
}

export { hydrateSupabaseAdapters } from './supabase-storage.adapter.js';
