import { ATTENDANCE_STATUS } from '../config/constants.js';

export class AttendanceService {
    constructor(attendanceProvider) {
        this.attendanceProvider = attendanceProvider;
    }

    getByDate(date) {
        return this.attendanceProvider.getByDate(date);
    }

    setStatus(date, studentId, status) {
        return this.attendanceProvider.setStatus(date, studentId, status);
    }

    markAllPresent(date, activeStudentIds) {
        const current = this.getByDate(date);
        const updated = { ...current };
        activeStudentIds.forEach(id => {
            updated[id] = ATTENDANCE_STATUS.PRESENT;
        });
        this.attendanceProvider.saveAll({
            ...this.attendanceProvider.getAll(),
            [date]: updated
        });
        return updated;
    }

    clear(date) {
        return this.attendanceProvider.clearDate(date);
    }

    getStats(activeStudentIds) {
        const attendanceData = this.attendanceProvider.getAll();
        let totalPresent = 0;
        let totalRecords = 0;
        
        Object.values(attendanceData).forEach(dayData => {
            Object.entries(dayData).forEach(([studentId, status]) => {
                if (activeStudentIds.includes(studentId)) {
                    totalRecords++;
                    if (status === ATTENDANCE_STATUS.PRESENT) {
                        totalPresent++;
                    }
                }
            });
        });

        const rate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
        return {
            rate,
            totalPresent,
            totalRecords
        };
    }
}
