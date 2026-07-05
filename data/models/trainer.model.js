/* ========================================
   Digital Hub OS — Trainer Model
   ======================================== */

import { generateId } from '../../config/constants.js';

/**
 * @typedef {Object} Trainer
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {string} specialty
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @param {Partial<Trainer>} input
 * @returns {Trainer}
 */
export function createTrainer(input) {
    const now = new Date().toISOString();
    return {
        id: input.id ?? generateId(),
        firstName: input.firstName ?? '',
        lastName: input.lastName ?? '',
        email: input.email ?? '',
        phone: input.phone ?? '',
        specialty: input.specialty ?? '',
        createdAt: input.createdAt ?? now,
        updatedAt: input.updatedAt ?? now,
    };
}

/**
 * @param {Trainer} trainer
 * @param {Partial<Trainer>} fields
 * @returns {Trainer}
 */
export function updateTrainerFields(trainer, fields) {
    return {
        ...trainer,
        ...fields,
        id: trainer.id,
        updatedAt: new Date().toISOString(),
    };
}
