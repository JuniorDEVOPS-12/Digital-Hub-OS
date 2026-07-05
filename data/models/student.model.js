/* ========================================
   Digital Hub OS — Student Model
   ======================================== */

import { generateId, STUDENT_STATUS } from '../../config/constants.js';

/**
 * @typedef {Object} Student
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {'active'|'inactive'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @param {Partial<Student>} input
 * @returns {Student}
 */
export function createStudent(input) {
    const now = new Date().toISOString();
    return {
        id: input.id ?? generateId(),
        firstName: input.firstName ?? '',
        lastName: input.lastName ?? '',
        email: input.email ?? '',
        phone: input.phone ?? '',
        status: input.status ?? STUDENT_STATUS.ACTIVE,
        createdAt: input.createdAt ?? now,
        updatedAt: input.updatedAt ?? now,
    };
}

/**
 * @param {Student} student
 * @param {Partial<Student>} fields
 * @returns {Student}
 */
export function updateStudentFields(student, fields) {
    return {
        ...student,
        ...fields,
        id: student.id,
        updatedAt: new Date().toISOString(),
    };
}
