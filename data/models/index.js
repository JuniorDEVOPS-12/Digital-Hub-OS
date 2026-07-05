/* ========================================
   Digital Hub OS — Data Models Index
   ======================================== */

export { createStudent, updateStudentFields } from './student.model.js';
export { createTrainer, updateTrainerFields } from './trainer.model.js';
export { createModule, updateModuleFields } from './module.model.js';
export { createScheduleEntry } from './schedule.model.js';
export {
    ATTENDANCE_STATUS,
    isValidAttendanceStatus,
    createEmptyDayRecord,
    createEmptyAttendanceRecord,
} from './attendance.model.js';
export {
    SETTINGS_ID,
    createDefaultSettings,
    updateSettingsFields,
} from './settings.model.js';
