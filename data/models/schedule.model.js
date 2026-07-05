/* ========================================
   Digital Hub OS — Schedule Entry Model
   ======================================== */

import { generateId, TRAINING_START_TIME, TRAINING_END_TIME } from '../../config/constants.js';

/**
 * @typedef {Object} ScheduleEntry
 * @property {string} id
 * @property {string} date
 * @property {string} moduleId
 * @property {string} startTime
 * @property {string} endTime
 * @property {string} createdAt
 */

/**
 * @param {Partial<ScheduleEntry>} input
 * @returns {ScheduleEntry}
 */
export function createScheduleEntry(input) {
    return {
        id: input.id ?? generateId(),
        date: input.date ?? '',
        moduleId: input.moduleId ?? '',
        startTime: input.startTime ?? TRAINING_START_TIME,
        endTime: input.endTime ?? TRAINING_END_TIME,
        createdAt: input.createdAt ?? new Date().toISOString(),
    };
}
