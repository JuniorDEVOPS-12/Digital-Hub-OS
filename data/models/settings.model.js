/* ========================================
   Digital Hub OS — Settings Model
   ======================================== */

import {
    COHORT_MAX_STUDENTS,
    COHORT_NAME,
    COHORT_YEAR,
    TRAINING_DURATION_MONTHS,
    TRAINING_START_TIME,
    TRAINING_END_TIME,
} from '../../config/constants.js';

export const SETTINGS_ID = 'app-settings';

/**
 * @typedef {Object} Settings
 * @property {string} id
 * @property {string} cohortName
 * @property {number} cohortYear
 * @property {number} maxStudents
 * @property {number} trainingDurationMonths
 * @property {string} trainingStartTime
 * @property {string} trainingEndTime
 * @property {string|null} trainingStartDate
 * @property {string} updatedAt
 */

/**
 * @param {Partial<Settings>} [overrides]
 * @returns {Settings}
 */
export function createDefaultSettings(overrides = {}) {
    return {
        id: SETTINGS_ID,
        cohortName: COHORT_NAME,
        cohortYear: COHORT_YEAR,
        maxStudents: COHORT_MAX_STUDENTS,
        trainingDurationMonths: TRAINING_DURATION_MONTHS,
        trainingStartTime: TRAINING_START_TIME,
        trainingEndTime: TRAINING_END_TIME,
        trainingStartDate: null,
        updatedAt: new Date().toISOString(),
        ...overrides,
    };
}

/**
 * @param {Settings} settings
 * @param {Partial<Settings>} fields
 * @returns {Settings}
 */
export function updateSettingsFields(settings, fields) {
    return {
        ...settings,
        ...fields,
        id: SETTINGS_ID,
        updatedAt: new Date().toISOString(),
    };
}
