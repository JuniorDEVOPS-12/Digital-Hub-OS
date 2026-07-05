export class ScheduleService {
    constructor(scheduleProvider, modulesProvider) {
        this.scheduleProvider = scheduleProvider;
        this.modulesProvider = modulesProvider;
    }

    getAll() {
        return this.scheduleProvider.getAll().sort((a, b) => a.date.localeCompare(b.date));
    }

    getByDate(date) {
        const schedule = this.getAll();
        return schedule.find(s => s.date === date) || null;
    }

    getByModule(moduleId) {
        const schedule = this.getAll();
        return schedule.filter(s => s.moduleId === moduleId);
    }

    getWeeks() {
        const schedule = this.getAll();
        if (schedule.length === 0) return [];

        const allDates = schedule.map(s => s.date).sort();
        const startDate = new Date(allDates[0] + 'T00:00:00');
        const endDate = new Date(allDates[allDates.length - 1] + 'T00:00:00');

        const weeks = [];
        let weekStart = new Date(startDate);
        
        // Align to Monday
        while (weekStart.getDay() !== 1) {
            weekStart.setDate(weekStart.getDate() - 1);
        }

        while (weekStart <= endDate) {
            const weekDays = [];
            for (let d = 0; d < 5; d++) {
                const day = new Date(weekStart);
                day.setDate(day.getDate() + d);
                weekDays.push(day.toISOString().split('T')[0]);
            }
            weeks.push({
                label: `Semaine du ${weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
                days: weekDays,
            });
            weekStart.setDate(weekStart.getDate() + 7);
        }

        return weeks;
    }

    getWeekSchedule(weekDays) {
        const schedule = this.getAll();
        return weekDays.map(date => {
            const entry = schedule.find(s => s.date === date);
            return entry || null;
        });
    }

    clear() {
        this.scheduleProvider.saveAll([]);
    }
}
