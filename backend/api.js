import { StudentsProvider } from '../data/providers/students.provider.js';
import { TrainersProvider } from '../data/providers/trainers.provider.js';
import { ModulesProvider } from '../data/providers/modules.provider.js';
import { AttendanceProvider } from '../data/providers/attendance.provider.js';
import { ScheduleProvider } from '../data/providers/schedule.provider.js';

import { StudentsService } from '../services/students.service.js';
import { TrainersService } from '../services/trainers.service.js';
import { ModulesService } from '../services/modules.service.js';
import { AttendanceService } from '../services/attendance.service.js';
import { ScheduleService } from '../services/schedule.service.js';

import { seedStudents } from '../data/seeds/students.seed.js';
import { seedTrainers } from '../data/seeds/trainers.seed.js';
import { seedModules } from '../data/seeds/modules.seed.js';

import { adapterFor, hydrateSupabaseAdapters } from '../data/adapters/adapter-factory.js';

// Instantiate Providers (Singleton instances).
// L'adaptateur de stockage est choisi par entité (Supabase ou localStorage)
// selon les drapeaux de migration progressive — voir data/supabase/config.js.
const studentsProvider = new StudentsProvider(adapterFor('students'));
const trainersProvider = new TrainersProvider(adapterFor('trainers'));
const modulesProvider = new ModulesProvider(adapterFor('modules'));
const attendanceProvider = new AttendanceProvider(adapterFor('attendance'));
const scheduleProvider = new ScheduleProvider(adapterFor('schedule'));

// Instantiate Services (Injecting provider dependencies)
const studentsService = new StudentsService(studentsProvider);
const trainersService = new TrainersService(trainersProvider, modulesProvider);
const modulesService = new ModulesService(modulesProvider, scheduleProvider, trainersProvider);
const attendanceService = new AttendanceService(attendanceProvider);
const scheduleService = new ScheduleService(scheduleProvider, modulesProvider);

// Bootstrap asynchrone : hydrate d'abord les données depuis Supabase (pour les
// entités migrées) puis applique le seeding local si nécessaire. À appeler au
// démarrage à la place de initDatabase() lorsque Supabase est actif.
export async function initDataLayer() {
    await hydrateSupabaseAdapters();
    initDatabase();
}

// Self-initialization & Seeding if empty
export function initDatabase() {
    let trainers = trainersProvider.getAll();
    if (trainers.length === 0) {
        trainers = seedTrainers();
        trainersProvider.seed(trainers);
    }

    let students = studentsProvider.getAll();
    if (students.length === 0) {
        students = seedStudents();
        studentsProvider.seed(students);
    }

    let modules = modulesProvider.getAll();
    if (modules.length === 0) {
        modules = seedModules(trainers);
        modulesProvider.seed(modules);
    }

    let schedule = scheduleProvider.getAll();
    if (schedule.length === 0) {
        modulesService.regenerateSchedule();
    }
}

// Unified API Facade to separate Frontend from Backend details
export const api = {
    students: {
        getAll: () => studentsService.getAll(),
        getById: (id) => studentsService.getById(id),
        create: (student) => studentsService.create(student),
        update: (id, fields) => studentsService.update(id, fields),
        delete: (id) => studentsService.delete(id),
        search: (query) => studentsService.search(query),
    },
    trainers: {
        getAll: () => trainersService.getAll(),
        getById: (id) => trainersService.getById(id),
        getByModule: (moduleId) => trainersService.getByModule(moduleId),
        getModules: (trainerId) => trainersService.getModules(trainerId),
        create: (trainer) => trainersService.create(trainer),
        update: (id, fields) => trainersService.update(id, fields),
        delete: (id) => trainersService.delete(id),
    },
    modules: {
        getAll: () => modulesService.getAll(),
        getById: (id) => modulesService.getById(id),
        getActiveModule: (date) => modulesService.getActiveModule(date),
        getTrainer: (moduleId) => modulesService.getTrainer(moduleId),
        create: (mod) => modulesService.create(mod),
        update: (id, fields) => modulesService.update(id, fields),
        delete: (id) => modulesService.delete(id),
    },
    schedule: {
        getAll: () => scheduleService.getAll(),
        getByDate: (date) => scheduleService.getByDate(date),
        getByModule: (moduleId) => scheduleService.getByModule(moduleId),
        getWeeks: () => scheduleService.getWeeks(),
        getWeekSchedule: (weekDays) => scheduleService.getWeekSchedule(weekDays),
    },
    attendance: {
        getByDate: (date) => attendanceService.getByDate(date),
        setStatus: (date, studentId, status) => attendanceService.setStatus(date, studentId, status),
        markAllPresent: (date, studentIds) => attendanceService.markAllPresent(date, studentIds),
        clear: (date) => attendanceService.clear(date),
        getStats: (studentIds) => attendanceService.getStats(studentIds),
    }
};
