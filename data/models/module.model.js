/* ========================================
   Digital Hub OS — Module Model
   ======================================== */

import { generateId, MODULE_COLORS } from '../../config/constants.js';

/**
 * @typedef {Object} Module
 * @property {string} id
 * @property {string} name
 * @property {number} order
 * @property {number} duration
 * @property {string|null} trainerId
 * @property {string} description
 * @property {string} color
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @param {Partial<Module>} input
 * @returns {Module}
 */
export function createModule(input) {
    const now = new Date().toISOString();
    return {
        id: input.id ?? generateId(),
        name: input.name ?? '',
        order: input.order ?? 1,
        duration: input.duration ?? 1,
        trainerId: input.trainerId ?? null,
        description: input.description ?? '',
        color: input.color ?? MODULE_COLORS[0],
        createdAt: input.createdAt ?? now,
        updatedAt: input.updatedAt ?? now,
    };
}

/**
 * @param {Module} moduleItem
 * @param {Partial<Module>} fields
 * @returns {Module}
 */
export function updateModuleFields(moduleItem, fields) {
    return {
        ...moduleItem,
        ...fields,
        id: moduleItem.id,
        updatedAt: new Date().toISOString(),
    };
}
