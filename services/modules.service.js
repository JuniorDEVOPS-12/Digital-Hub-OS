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

    create(moduleItem) {
        // Validation: trainerId is required
        if (!moduleItem.trainerId) {
            throw new Error('Un formateur doit être assigné au module');
        }
        
        // Validate trainer exists
        const trainer = this.trainersProvider.getById(moduleItem.trainerId);
        if (!trainer) {
            throw new Error('Le formateur spécifié n\'existe pas');
        }
        
        const created = this.modulesProvider.create(moduleItem);
        this.regenerateSchedule();
        return created;
    }

    update(id, updatedFields) {
        // If trainerId is being updated, validate it exists
        if (updatedFields.trainerId) {
            const trainer = this.trainersProvider.getById(updatedFields.trainerId);
            if (!trainer) {
                throw new Error('Le formateur spécifié n\'existe pas');
            }
        }
        
        const updated = this.modulesProvider.update(id, updatedFields);
        
        // Only regenerate schedule if duration or order changed
        if (updatedFields.duration !== undefined || updatedFields.order !== undefined) {
            this.regenerateSchedule();
        }
        
        return updated;
    }

    delete(id) {
        const deleted = this.modulesProvider.delete(id);
        if (deleted) {
            this.regenerateSchedule();
        }
        return deleted;
    }

    regenerateSchedule() {
        if (!this.scheduleProvider) return;
        const modules = this.getAll();
        
        if (modules.length === 0) {
            this.scheduleProvider.saveAll([]);
            return;
        }
        
        // Find starting Monday for current month
        const today = new Date();
        let startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        while (startDate.getDay() !== 1) { // 1 = Monday
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
        
        // Generate 30 days of schedule
        for (let day = 0; day < 30; day++) {
            const dayOfWeek = currentDate.getDay(); // 1=Mon, ..., 5=Fri
            
            // Only weekdays (1-5)
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                if (moduleIndex < modules.length) {
                    const currentModule = modules[moduleIndex];
                    
                    schedule.push({
                        id: Math.random().toString(36).substring(2, 9),
                        date: currentDate.toISOString().split('T')[0],
                        moduleId: currentModule.id,
                        startTime: '16:00',
                        endTime: '19:00',
                    });
                    
                    daysInCurrentModule++;
                    
                    // Move to next module if duration reached
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
