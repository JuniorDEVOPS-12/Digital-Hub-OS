import { createTrainer, updateTrainerFields } from '../data/models/trainer.model.js';
import { AppError, ErrorCodes } from '../data/errors/app-error.js';

export class TrainersService {
    constructor(trainersProvider, modulesProvider) {
        this.trainersProvider = trainersProvider;
        this.modulesProvider = modulesProvider;
    }

    async getAll() {
        return await this.trainersProvider.getAll();
    }

    async getById(id) {
        return await this.trainersProvider.getById(id);
    }

    async getByModule(moduleId) {
        const module = await this.modulesProvider.getById(moduleId);
        if (!module || !module.trainerId) return null;
        return await this.getById(module.trainerId);
    }

    async getModules(trainerId) {
        const modules = await this.modulesProvider.getAll();
        return modules.filter(m => m.trainerId === trainerId);
    }

    async create(input) {
        const trainer = createTrainer(input);
        return await this.trainersProvider.create(trainer);
    }

    async update(id, updatedFields) {
        const existing = await this.trainersProvider.getById(id);
        if (!existing) {
            throw new AppError('Formateur introuvable.', ErrorCodes.NOT_FOUND);
        }
        const updated = updateTrainerFields(existing, updatedFields);
        return await this.trainersProvider.update(id, updated);
    }

    async delete(id) {
        const deleted = await this.trainersProvider.delete(id);
        if (!deleted) {
            throw new AppError('Formateur introuvable.', ErrorCodes.NOT_FOUND);
        }
        if (this.modulesProvider) {
            const modules = await this.modulesProvider.getAll();
            let updated = false;
            modules.forEach(mod => {
                if (mod.trainerId === id) {
                    mod.trainerId = null;
                    updated = true;
                }
            });
            if (updated) {
                await this.modulesProvider.saveAll(modules);
            }
        }
        return deleted;
    }
}
