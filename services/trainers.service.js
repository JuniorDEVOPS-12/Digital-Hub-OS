import { createTrainer, updateTrainerFields } from '../data/models/trainer.model.js';
import { AppError, ErrorCodes } from '../data/errors/app-error.js';

export class TrainersService {
    constructor(trainersProvider, modulesProvider) {
        this.trainersProvider = trainersProvider;
        this.modulesProvider = modulesProvider;
    }

    getAll() {
        return this.trainersProvider.getAll();
    }

    getById(id) {
        return this.trainersProvider.getById(id);
    }

    getByModule(moduleId) {
        const module = this.modulesProvider.getById(moduleId);
        if (!module || !module.trainerId) return null;
        return this.getById(module.trainerId);
    }

    getModules(trainerId) {
        const modules = this.modulesProvider.getAll();
        return modules.filter(m => m.trainerId === trainerId);
    }

    create(input) {
        const trainer = createTrainer(input);
        return this.trainersProvider.create(trainer);
    }

    update(id, updatedFields) {
        const existing = this.trainersProvider.getById(id);
        if (!existing) {
            throw new AppError('Formateur introuvable.', ErrorCodes.NOT_FOUND);
        }
        const updated = updateTrainerFields(existing, updatedFields);
        return this.trainersProvider.update(id, updated);
    }

    delete(id) {
        const deleted = this.trainersProvider.delete(id);
        if (!deleted) {
            throw new AppError('Formateur introuvable.', ErrorCodes.NOT_FOUND);
        }
        if (this.modulesProvider) {
            const modules = this.modulesProvider.getAll();
            let updated = false;
            modules.forEach(mod => {
                if (mod.trainerId === id) {
                    mod.trainerId = null;
                    updated = true;
                }
            });
            if (updated) {
                this.modulesProvider.saveAll(modules);
            }
        }
        return deleted;
    }
}
