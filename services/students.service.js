import { COHORT_MAX_STUDENTS } from '../config/constants.js';
import { createStudent, updateStudentFields } from '../data/models/student.model.js';
import { AppError, ErrorCodes } from '../data/errors/app-error.js';

export class StudentsService {
    constructor(studentsProvider) {
        this.studentsProvider = studentsProvider;
    }

    getAll() {
        return this.studentsProvider.getAll();
    }

    getById(id) {
        return this.studentsProvider.getById(id);
    }

    create(input) {
        const student = createStudent(input);
        const students = this.getAll();
        const activeStudents = students.filter(s => s.status === 'active');
        if (student.status === 'active' && activeStudents.length >= COHORT_MAX_STUDENTS) {
            throw new AppError(
                `La cohorte est limitée à ${COHORT_MAX_STUDENTS} étudiants actifs.`,
                ErrorCodes.BUSINESS_RULE
            );
        }
        return this.studentsProvider.create(student);
    }

    update(id, updatedFields) {
        const existing = this.studentsProvider.getById(id);
        if (!existing) {
            throw new AppError('Étudiant introuvable.', ErrorCodes.NOT_FOUND);
        }
        const updated = updateStudentFields(existing, updatedFields);
        return this.studentsProvider.update(id, updated);
    }

    delete(id) {
        const deleted = this.studentsProvider.delete(id);
        if (!deleted) {
            throw new AppError('Étudiant introuvable.', ErrorCodes.NOT_FOUND);
        }
        return deleted;
    }

    search(query) {
        if (!query) return this.getAll();
        const lowerQuery = query.toLowerCase();
        return this.getAll().filter(s => {
            const fullName = `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase();
            return fullName.includes(lowerQuery);
        });
    }
}
