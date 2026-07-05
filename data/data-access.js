/* ========================================
   Digital Hub OS — Data Access Layer
   Point d'accès unique à la persistance.
   ======================================== */

import { localStorageAdapter } from './adapters/local-storage.adapter.js';
import { adapterFor } from './adapters/adapter-factory.js';
import { StudentsProvider } from './providers/students.provider.js';
import { TrainersProvider } from './providers/trainers.provider.js';
import { ModulesProvider } from './providers/modules.provider.js';
import { AttendanceProvider } from './providers/attendance.provider.js';
import { ScheduleProvider } from './providers/schedule.provider.js';
import { SettingsProvider } from './providers/settings.provider.js';

/** Adaptateur de repli (settings reste sur localStorage : pas de table Supabase). */
export const storageAdapter = localStorageAdapter;

/**
 * Registre central des providers — seule couche d'accès aux données.
 * L'adaptateur est choisi par entité (Supabase ou localStorage) selon les
 * drapeaux de migration progressive (data/supabase/config.js).
 */
export const dataAccess = {
    students: new StudentsProvider(adapterFor('students')),
    trainers: new TrainersProvider(adapterFor('trainers')),
    modules: new ModulesProvider(adapterFor('modules')),
    attendance: new AttendanceProvider(adapterFor('attendance')),
    schedule: new ScheduleProvider(adapterFor('schedule')),
    settings: new SettingsProvider(storageAdapter),
};

/**
 * @returns {typeof dataAccess}
 */
export function getDataAccess() {
    return dataAccess;
}
