import { AttendanceAPI } from '../supabase/attendance.api.js';
import { STORAGE_KEYS } from '../../config/constants.js';
import { createEmptyAttendanceRecord } from '../models/attendance.model.js';

export class AttendanceProvider {
    constructor() {
        this.api = new AttendanceAPI();
        this.storageKey = STORAGE_KEYS.attendance;
    }

    async getAll() {
        return await this.api.getAll();
    }

    async getById(id) {
        return await this.api.getById(id);
    }

    async getByDate(date) {
        const attendance = await this.getAll();
        return attendance[date] || {};
    }

    async setStatus(date, studentId, status) {
        const attendance = await this.getAll();
        if (!attendance[date]) {
            attendance[date] = {};
        }

        if (status) {
            attendance[date][studentId] = status;
        } else {
            delete attendance[date][studentId];
        }

        await this.api.create(attendance);
        return attendance[date];
    }

    async clearDate(date) {
        const attendance = await this.getAll();
        delete attendance[date];
        await this.api.create(attendance);
        return {};
    }

    async saveAll(items) {
        return await this.api.create(items);
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
        await this.api.create(seedData ?? createEmptyAttendanceRecord());
    }

    async clear() {
        await this.api.create({});
    }
}
