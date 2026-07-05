/* ========================================
   Digital Hub OS — Base Map Provider (Key-Value CRUD)
   ======================================== */

import { defaultStorageAdapter } from '../adapters/storage.adapter.js';
import { AppError, ErrorCodes } from '../errors/app-error.js';

/** @implements {import('../repository.interface.js').IMapRepository} */
export class BaseMapProvider {
    /**
     * @param {string} storageKey
     * @param {import('../adapters/storage.adapter.js').StorageAdapter} [storageAdapter]
     */
    constructor(storageKey, storageAdapter = defaultStorageAdapter) {
        this.storageKey = storageKey;
        this.storage = storageAdapter;
    }

    getAll() {
        return this.storage.load(this.storageKey) || {};
    }

    saveAll(data) {
        const saved = this.storage.save(this.storageKey, data);
        if (!saved) {
            throw new AppError('Échec de la sauvegarde des données.', ErrorCodes.STORAGE);
        }
        return saved;
    }

    clear() {
        this.storage.remove(this.storageKey);
    }
}
