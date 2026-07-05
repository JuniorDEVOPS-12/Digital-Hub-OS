import { COHORT_MAX_STUDENTS } from '../config/constants.js';

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

    create(student) {
        const students = this.getAll();
        const activeStudents = students.filter(s => s.status === 'active');
        if (activeStudents.length >= COHORT_MAX_STUDENTS) {
            throw new Error(`La cohorte est limitée à ${COHORT_MAX_STUDENTS} étudiants actifs.`);
        }
        return this.studentsProvider.create(student);
    }

    update(id, updatedFields) {
        return this.studentsProvider.update(id, updatedFields);
    }

    delete(id) {
        return this.studentsProvider.delete(id);
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
