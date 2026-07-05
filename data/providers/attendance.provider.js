import { BaseMapProvider } from './base-map.provider.js';
import { STORAGE_KEYS } from '../../config/constants.js';
import { createEmptyAttendanceRecord } from '../models/attendance.model.js';

export class AttendanceProvider extends BaseMapProvider {
    constructor(storageAdapter) {
        super(STORAGE_KEYS.attendance, storageAdapter);
    }

    getByDate(date) {
        const attendance = this.getAll();
        return attendance[date] || {};
    }

    setStatus(date, studentId, status) {
        const attendance = this.getAll();
        if (!attendance[date]) {
            attendance[date] = {};
        }

        if (status) {
            attendance[date][studentId] = status;
        } else {
            delete attendance[date][studentId];
        }

        this.saveAll(attendance);
        return attendance[date];
    }

    clearDate(date) {
        const attendance = this.getAll();
        delete attendance[date];
        this.saveAll(attendance);
        return {};
    }

    seed(seedData) {
        this.saveAll(seedData ?? createEmptyAttendanceRecord());
    }
}
