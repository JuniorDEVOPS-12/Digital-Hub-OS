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

    async getAll() {
        const modules = await this.modulesProvider.getAll();
        return modules.sort((a, b) => a.order - b.order);
    }

    async getById(id) {
        return await this.modulesProvider.getById(id);
    }

    async getActiveModule(date) {
        const schedule = await this.scheduleProvider.getAll();
        const todayEntry = schedule.find(s => s.date === date);
        if (!todayEntry) return null;

        const modules = await this.getAll();
        return modules.find(m => m.id === todayEntry.moduleId) || null;
    }

    async getTrainer(moduleId) {
        const module = await this.getById(moduleId);
        if (!module || !module.trainerId) return null;
        return await this.trainersProvider.getById(module.trainerId);
    }

    async create(input) {
        if (!input.trainerId) {
            throw new AppError('Un formateur doit être assigné au module', ErrorCodes.VALIDATION);
        }

        const trainer = await this.trainersProvider.getById(input.trainerId);
        if (!trainer) {
            throw new AppError('Le formateur spécifié n\'existe pas', ErrorCodes.NOT_FOUND);
        }

        const moduleItem = createModule(input);
        const created = await this.modulesProvider.create(moduleItem);
        await this.regenerateSchedule();
        return created;
    }

    async update(id, updatedFields) {
        if (updatedFields.trainerId) {
            const trainer = await this.trainersProvider.getById(updatedFields.trainerId);
            if (!trainer) {
                throw new AppError('Le formateur spécifié n\'existe pas', ErrorCodes.NOT_FOUND);
            }
        }

        const existing = await this.modulesProvider.getById(id);
        if (!existing) {
            throw new AppError('Module introuvable.', ErrorCodes.NOT_FOUND);
        }

        const updated = updateModuleFields(existing, updatedFields);
        const result = await this.modulesProvider.update(id, updated);

        if (updatedFields.duration !== undefined || updatedFields.order !== undefined) {
            await this.regenerateSchedule();
        }

        return result;
    }

    async delete(id) {
        const deleted = await this.modulesProvider.delete(id);
        if (!deleted) {
            throw new AppError('Module introuvable.', ErrorCodes.NOT_FOUND);
        }
        await this.regenerateSchedule();
        return deleted;
    }

    async regenerateSchedule() {
        if (!this.scheduleProvider) return;
        const modules = await this.getAll();

        if (modules.length === 0) {
            await this.scheduleProvider.saveAll([]);
            return;
        }

        const today = new Date();
        let startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        while (startDate.getDay() !== 1) {
            startDate.setDate(startDate.getDate() + 1);
        }

        const newSchedule = this.generateSchedule(startDate, modules);
        await this.scheduleProvider.saveAll(newSchedule);
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
