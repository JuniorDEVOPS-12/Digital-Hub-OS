/* ========================================
   Digital Hub OS — Attendance Model
   ======================================== */

import { ATTENDANCE_STATUS } from '../../config/constants.js';

/**
 * @typedef {'present'|'absent'|'late'} AttendanceStatus
 */

/**
 * Présences d'une date : { [studentId]: AttendanceStatus }
 * @typedef {Record<string, AttendanceStatus>} AttendanceDayRecord
 */

/**
 * Ensemble des présences : { [date: string]: AttendanceDayRecord }
 * @typedef {Record<string, AttendanceDayRecord>} AttendanceRecord
 */

export { ATTENDANCE_STATUS };

/**
 * @param {AttendanceStatus} status
 * @returns {boolean}
 */
export function isValidAttendanceStatus(status) {
    return Object.values(ATTENDANCE_STATUS).includes(status);
}

/**
 * @returns {AttendanceDayRecord}
 */
export function createEmptyDayRecord() {
    return {};
}

/**
 * @returns {AttendanceRecord}
 */
export function createEmptyAttendanceRecord() {
    return {};
}
