import { store } from '../store.js';
import { STORAGE_KEYS } from '../../config/constants.js';

export class AttendanceProvider {
    constructor() {
        this.storageKey = STORAGE_KEYS.attendance;
    }

    getAll() {
        return store.load(this.storageKey) || {};
    }

    saveAll(attendanceData) {
        return store.save(this.storageKey, attendanceData);
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

    clear() {
        store.remove(this.storageKey);
    }
}
