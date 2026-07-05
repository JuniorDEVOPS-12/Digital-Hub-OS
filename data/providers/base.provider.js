/* ========================================
   Digital Hub OS — Base Provider (Array CRUD)
   ======================================== */

import { defaultStorageAdapter } from '../adapters/storage.adapter.js';
import { AppError, ErrorCodes } from '../errors/app-error.js';

/** @implements {import('../repository.interface.js').IRepository} */
export class BaseProvider {
    /**
     * @param {string} storageKey
     * @param {import('../adapters/storage.adapter.js').StorageAdapter} [storageAdapter]
     */
    constructor(storageKey, storageAdapter = defaultStorageAdapter) {
        this.storageKey = storageKey;
        this.storage = storageAdapter;
    }

    getAll() {
        return this.storage.load(this.storageKey) || [];
    }

    getById(id) {
        const items = this.getAll();
        return items.find(item => item.id === id) || null;
    }

    saveAll(items) {
        const saved = this.storage.save(this.storageKey, items);
        if (!saved) {
            throw new AppError('Échec de la sauvegarde des données.', ErrorCodes.STORAGE);
        }
        return saved;
    }

    create(item) {
        const items = this.getAll();
        items.push(item);
        this.saveAll(items);
        return item;
    }

    update(id, updatedFields) {
        const items = this.getAll();
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return null;

        items[index] = { ...items[index], ...updatedFields };
        this.saveAll(items);
        return items[index];
    }

    delete(id) {
        const items = this.getAll();
        const initialLength = items.length;
        const filtered = items.filter(item => item.id !== id);

        if (filtered.length === initialLength) return false;

        this.saveAll(filtered);
        return true;
    }

    seed(seedData) {
        this.saveAll(seedData);
    }

    clear() {
        this.storage.remove(this.storageKey);
    }
}
