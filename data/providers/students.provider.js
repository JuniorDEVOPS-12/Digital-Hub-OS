import { StudentsAPI } from '../supabase/students.api.js';
import { STORAGE_KEYS } from '../../config/constants.js';

export class StudentsProvider {
    constructor() {
        this.api = new StudentsAPI();
        this.storageKey = STORAGE_KEYS.students;
    }

    async getAll() {
        return await this.api.getAll();
    }

    async getById(id) {
        return await this.api.getById(id);
    }

    async saveAll(items) {
        // For Supabase, we handle this differently - clear and insert
        // But for compatibility, we'll just use the API
        if (Array.isArray(items)) {
            // Clear all and re-insert
            // This is a simplified approach - in production you'd want better upsert logic
            for (const item of items) {
                await this.api.create(item);
            }
            return items;
        }
        return items;
    }

    async create(item) {
        return await this.api.create(item);
    }

    async update(id, updatedFields) {
        return await this.api.update(id, updatedFields);
    }

    async delete(id) {
        return await this.api.delete(id);
    }

    async seed(seedData) {
        // Clear existing and seed new data
        if (seedData && Array.isArray(seedData)) {
            for (const item of seedData) {
                await this.api.create(item);
            }
        }
    }

    async clear() {
        // Get all items and delete them one by one
        const items = await this.getAll();
        for (const item of items) {
            await this.api.delete(item.id);
        }
    }
}
