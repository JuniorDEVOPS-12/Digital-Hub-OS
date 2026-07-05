import { TRAINING_START_TIME, TRAINING_END_TIME } from '../config/constants.js';
import { createModule, updateModuleFields } from '../data/models/module.model.js';
import { createScheduleEntry } from '../data/models/schedule.model.js';
import { AppError, ErrorCodes } from '../data/errors/app-error.js';

export class ModulesService {
    constructor(modulesProvider, scheduleProvider, trainersProvider) {
        this.modulesProvider = modulesProvider;
        this.scheduleProvider = scheduleProvider;
        this.trainersProvider = trainersProvider;
    }

    getAll() {
        return this.modulesProvider.getAll().sort((a, b) => a.order - b.order);
    }

    getById(id) {
        return this.modulesProvider.getById(id);
    }

    getActiveModule(date) {
        const schedule = this.scheduleProvider.getAll();
        const todayEntry = schedule.find(s => s.date === date);
        if (!todayEntry) return null;

        const modules = this.getAll();
        return modules.find(m => m.id === todayEntry.moduleId) || null;
    }

    getTrainer(moduleId) {
        const module = this.getById(moduleId);
        if (!module || !module.trainerId) return null;
        return this.trainersProvider.getById(module.trainerId);
    }

    create(input) {
        if (!input.trainerId) {
            throw new AppError('Un formateur doit être assigné au module', ErrorCodes.VALIDATION);
        }

        const trainer = this.trainersProvider.getById(input.trainerId);
        if (!trainer) {
            throw new AppError('Le formateur spécifié n\'existe pas', ErrorCodes.NOT_FOUND);
        }

        const moduleItem = createModule(input);
        const created = this.modulesProvider.create(moduleItem);
        this.regenerateSchedule();
        return created;
    }

    update(id, updatedFields) {
        if (updatedFields.trainerId) {
            const trainer = this.trainersProvider.getById(updatedFields.trainerId);
            if (!trainer) {
                throw new AppError('Le formateur spécifié n\'existe pas', ErrorCodes.NOT_FOUND);
            }
        }

        const existing = this.modulesProvider.getById(id);
        if (!existing) {
            throw new AppError('Module introuvable.', ErrorCodes.NOT_FOUND);
        }

        const updated = updateModuleFields(existing, updatedFields);
        const result = this.modulesProvider.update(id, updated);

        if (updatedFields.duration !== undefined || updatedFields.order !== undefined) {
            this.regenerateSchedule();
        }

        return result;
    }

    delete(id) {
        const deleted = this.modulesProvider.delete(id);
        if (!deleted) {
            throw new AppError('Module introuvable.', ErrorCodes.NOT_FOUND);
        }
        this.regenerateSchedule();
        return deleted;
    }

    regenerateSchedule() {
        if (!this.scheduleProvider) return;
        const modules = this.getAll();

        if (modules.length === 0) {
            this.scheduleProvider.saveAll([]);
            return;
        }

        const today = new Date();
        let startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        while (startDate.getDay() !== 1) {
            startDate.setDate(startDate.getDate() + 1);
        }

        const newSchedule = this.generateSchedule(startDate, modules);
        this.scheduleProvider.saveAll(newSchedule);
    }

    generateSchedule(startDate, modules) {
        const schedule = [];
        let currentDate = new Date(startDate);
        let moduleIndex = 0;
        let daysInCurrentModule = 0;

        for (let day = 0; day < 30; day++) {
            const dayOfWeek = currentDate.getDay();

            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                if (moduleIndex < modules.length) {
                    const currentModule = modules[moduleIndex];

                    schedule.push(createScheduleEntry({
                        date: currentDate.toISOString().split('T')[0],
                        moduleId: currentModule.id,
                        startTime: TRAINING_START_TIME,
                        endTime: TRAINING_END_TIME,
                    }));

                    daysInCurrentModule++;

                    if (daysInCurrentModule >= currentModule.duration) {
                        moduleIndex++;
                        daysInCurrentModule = 0;
                    }
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return schedule;
    }
}
