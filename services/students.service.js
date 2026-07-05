import { COHORT_MAX_STUDENTS } from '../config/constants.js';
import { createStudent, updateStudentFields } from '../data/models/student.model.js';
import { AppError, ErrorCodes } from '../data/errors/app-error.js';

export class StudentsService {
    constructor(studentsProvider) {
        this.studentsProvider = studentsProvider;
    }

    async getAll() {
        return await this.studentsProvider.getAll();
    }

    async getById(id) {
        return await this.studentsProvider.getById(id);
    }

    async create(input) {
        const student = createStudent(input);
        const students = await this.getAll();
        const activeStudents = students.filter(s => s.status === 'active');
        if (student.status === 'active' && activeStudents.length >= COHORT_MAX_STUDENTS) {
            throw new AppError(
                `La cohorte est limitée à ${COHORT_MAX_STUDENTS} étudiants actifs.`,
                ErrorCodes.BUSINESS_RULE
            );
        }
        return await this.studentsProvider.create(student);
    }

    async update(id, updatedFields) {
        const existing = await this.studentsProvider.getById(id);
        if (!existing) {
            throw new AppError('Étudiant introuvable.', ErrorCodes.NOT_FOUND);
        }
        const updated = updateStudentFields(existing, updatedFields);
        return await this.studentsProvider.update(id, updated);
    }

    async delete(id) {
        const deleted = await this.studentsProvider.delete(id);
        if (!deleted) {
            throw new AppError('Étudiant introuvable.', ErrorCodes.NOT_FOUND);
        }
        return deleted;
    }

    async search(query) {
        if (!query) return await this.getAll();
        const lowerQuery = query.toLowerCase();
        const students = await this.getAll();
        return students.filter(s => {
            const fullName = `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase();
            return fullName.includes(lowerQuery);
        });
    }
}
