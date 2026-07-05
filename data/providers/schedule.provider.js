import { ScheduleAPI } from '../supabase/schedule.api.js';
import { STORAGE_KEYS } from '../../config/constants.js';

export class ScheduleProvider {
    constructor() {
        this.api = new ScheduleAPI();
        this.storageKey = STORAGE_KEYS.schedule;
    }

    async getAll() {
        return await this.api.getAll();
    }

    async getById(id) {
        return await this.api.getById(id);
    }

    async saveAll(items) {
        if (Array.isArray(items)) {
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
        if (seedData && Array.isArray(seedData)) {
            for (const item of seedData) {
                await this.api.create(item);
            }
        }
    }

    async clear() {
        const items = await this.getAll();
        for (const item of items) {
            await this.api.delete(item.id);
        }
    }
}
