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

    create(trainer) {
        return this.trainersProvider.create(trainer);
    }

    update(id, updatedFields) {
        return this.trainersProvider.update(id, updatedFields);
    }

    delete(id) {
        // Business logic: if trainer is deleted, remove assignment from modules
        const deleted = this.trainersProvider.delete(id);
        if (deleted && this.modulesProvider) {
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
