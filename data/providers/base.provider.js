import { store } from '../store.js';

export class BaseProvider {
    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    getAll() {
        return store.load(this.storageKey) || [];
    }

    getById(id) {
        const items = this.getAll();
        return items.find(item => item.id === id) || null;
    }

    saveAll(items) {
        return store.save(this.storageKey, items);
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
        store.remove(this.storageKey);
    }
}
