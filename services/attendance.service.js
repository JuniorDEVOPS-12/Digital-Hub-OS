import { ATTENDANCE_STATUS, isValidAttendanceStatus } from '../data/models/attendance.model.js';
import { AppError, ErrorCodes } from '../data/errors/app-error.js';

export class AttendanceService {
    constructor(attendanceProvider) {
        this.attendanceProvider = attendanceProvider;
    }

    async getByDate(date) {
        return await this.attendanceProvider.getByDate(date);
    }

    async setStatus(date, studentId, status) {
        if (status && !isValidAttendanceStatus(status)) {
            throw new AppError('Statut de présence invalide.', ErrorCodes.VALIDATION);
        }
        return await this.attendanceProvider.setStatus(date, studentId, status);
    }

    async markAllPresent(date, activeStudentIds) {
        const current = await this.getByDate(date);
        const updated = { ...current };
        activeStudentIds.forEach(id => {
            updated[id] = ATTENDANCE_STATUS.PRESENT;
        });
        await this.attendanceProvider.saveAll({
            ...(await this.attendanceProvider.getAll()),
            [date]: updated,
        });
        return updated;
    }

    async clear(date) {
        return await this.attendanceProvider.clearDate(date);
    }

    async getStats(activeStudentIds) {
        const attendanceData = await this.attendanceProvider.getAll();
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
            totalRecords,
        };
    }
}
