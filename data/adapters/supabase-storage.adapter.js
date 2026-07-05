/* ========================================
   Digital Hub OS — Supabase Storage Adapter
   ----------------------------------------
   Implémente le contrat StorageAdapter (synchrone) attendu par les
   providers, tout en s'appuyant sur Supabase comme source principale.

   Stratégie :
   - Un cache mémoire (hydraté depuis Supabase au démarrage) sert les
     lectures synchrones exigées par le frontend existant.
   - Les écritures mettent à jour le cache, miroitent dans localStorage
     (repli temporaire) et sont propagées à Supabase en tâche de fond.
   - En cas d'échec Supabase (hors-ligne, session expirée), les données
     restent disponibles via localStorage : dégradation gracieuse.
   ======================================== */

import { localStorageAdapter } from './local-storage.adapter.js';
import { isSupabaseReady } from '../supabase/client.js';

/** Adaptateurs actifs, pour hydratation groupée au démarrage. */
const REGISTRY = [];

export class SupabaseStorageAdapter {
    /**
     * @param {Object} opts
     * @param {string} opts.key            Clé de stockage (ex: dhos_students).
     * @param {'array'|'map'} opts.shape   Forme du blob applicatif.
     * @param {Object} opts.api            API Supabase de l'entité.
     * @param {Object} [opts.fallback]     Adaptateur de repli (localStorage).
     */
    constructor({ key, shape, api, fallback = localStorageAdapter }) {
        this.key = key;
        this.shape = shape;
        this.api = api;
        this.fallback = fallback;
        this.hydrated = false;
        /** Cache initial : dernières données connues (localStorage). */
        this.cache = fallback.load(key) ?? this._empty();
        /** Sérialise les écritures pour éviter les courses. */
        this._chain = Promise.resolve();
        REGISTRY.push(this);
    }

    _empty() {
        return this.shape === 'map' ? {} : [];
    }

    // --- StorageAdapter (synchrone) --------------------------------------

    load() {
        return this.cache;
    }

    save(key, data) {
        this.cache = data;
        this.fallback.save(key, data); // repli localStorage (miroir)
        this._enqueue(data);
        return true;
    }

    remove(key) {
        this.cache = this._empty();
        this.fallback.remove(key);
        this._enqueue(this._empty());
        return true;
    }

    clear() {
        return this.remove(this.key);
    }

    // --- Synchronisation Supabase (asynchrone, en arrière-plan) ----------

    _enqueue(data) {
        if (!isSupabaseReady()) return;
        this._chain = this._chain
            .then(() => this._pushToSupabase(data))
            .catch(err => console.error(`[Supabase:${this.key}] Échec de synchronisation:`, err));
    }

    async _pushToSupabase(data) {
        if (this.shape === 'map') {
            await this.api.upsertAll(data);
            await this.api.deleteMissing(data);
        } else {
            const items = data || [];
            await this.api.upsertAll(items);
            await this.api.deleteMissing(items.map(item => item.id));
        }
    }

    /**
     * Charge les données depuis Supabase vers le cache (et localStorage).
     * En cas d'échec, conserve le repli localStorage déjà en cache.
     * @returns {Promise<void>}
     */
    async hydrate() {
        if (!isSupabaseReady()) return;
        try {
            const blob = await this.api.getAll();
            this.cache = blob ?? this._empty();
            this.fallback.save(this.key, this.cache);
            this.hydrated = true;
        } catch (err) {
            console.warn(`[Supabase:${this.key}] Hydratation impossible, repli localStorage:`, err);
        }
    }
}

/**
 * Fabrique un adaptateur Supabase pour une entité.
 * @param {Object} opts
 * @returns {SupabaseStorageAdapter}
 */
export function createSupabaseAdapter(opts) {
    return new SupabaseStorageAdapter(opts);
}

/**
 * Hydrate tous les adaptateurs Supabase enregistrés (à appeler au démarrage,
 * une fois le SDK chargé). Résilient : n'interrompt jamais le boot.
 * @returns {Promise<void>}
 */
export async function hydrateSupabaseAdapters() {
    if (REGISTRY.length === 0) return;
    await Promise.allSettled(REGISTRY.map(adapter => adapter.hydrate()));
}
