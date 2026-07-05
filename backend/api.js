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

// Instantiate Providers (Singleton instances)
const studentsProvider = new StudentsProvider();
const trainersProvider = new TrainersProvider();
const modulesProvider = new ModulesProvider();
const attendanceProvider = new AttendanceProvider();
const scheduleProvider = new ScheduleProvider();

// Instantiate Services (Injecting provider dependencies)
const studentsService = new StudentsService(studentsProvider);
const trainersService = new TrainersService(trainersProvider, modulesProvider);
const modulesService = new ModulesService(modulesProvider, scheduleProvider, trainersProvider);
const attendanceService = new AttendanceService(attendanceProvider);
const scheduleService = new ScheduleService(scheduleProvider, modulesProvider);

// Self-initialization & Seeding if empty
export async function initDatabase() {
    let trainers = await trainersProvider.getAll();
    if (trainers.length === 0) {
        trainers = seedTrainers();
        await trainersProvider.seed(trainers);
    }

    let students = await studentsProvider.getAll();
    if (students.length === 0) {
        students = seedStudents();
        await studentsProvider.seed(students);
    }

    let modules = await modulesProvider.getAll();
    if (modules.length === 0) {
        modules = seedModules(trainers);
        await modulesProvider.seed(modules);
    }

    let schedule = await scheduleProvider.getAll();
    if (schedule.length === 0) {
        await modulesService.regenerateSchedule();
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
