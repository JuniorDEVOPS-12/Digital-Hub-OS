/* ========================================
   Digital Hub OS — Data Access Layer
   Point d'accès unique à la persistance.
   ======================================== */

import { localStorageAdapter } from './adapters/local-storage.adapter.js';
import { StudentsProvider } from './providers/students.provider.js';
import { TrainersProvider } from './providers/trainers.provider.js';
import { ModulesProvider } from './providers/modules.provider.js';
import { AttendanceProvider } from './providers/attendance.provider.js';
import { ScheduleProvider } from './providers/schedule.provider.js';
import { SettingsProvider } from './providers/settings.provider.js';

/** Adaptateur de stockage actif (localStorage). Remplaçable sans toucher aux pages. */
export const storageAdapter = localStorageAdapter;

/** Registre central des providers — seule couche d'accès aux données */
export const dataAccess = {
    students: new StudentsProvider(),
    trainers: new TrainersProvider(),
    modules: new ModulesProvider(),
    attendance: new AttendanceProvider(),
    schedule: new ScheduleProvider(),
    settings: new SettingsProvider(storageAdapter),
};

/**
 * @returns {typeof dataAccess}
 */
export function getDataAccess() {
    return dataAccess;
}
