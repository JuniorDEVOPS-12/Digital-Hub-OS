/* ========================================
   Digital Hub OS — Supabase Data Layer (Index)
   Point d'accès unique aux APIs Supabase par entité.
   ======================================== */

import { studentsApi } from './students.api.js';
import { trainersApi } from './trainers.api.js';
import { modulesApi } from './modules.api.js';
import { attendanceApi } from './attendance.api.js';
import { scheduleApi } from './schedule.api.js';

export { studentsApi, trainersApi, modulesApi, attendanceApi, scheduleApi };

/**
 * Registre des APIs Supabase (mêmes clés que le registre de providers).
 */
export const supabaseApi = {
    students: studentsApi,
    trainers: trainersApi,
    modules: modulesApi,
    attendance: attendanceApi,
    schedule: scheduleApi,
};

export { USE_SUPABASE, SUPABASE_ENTITIES, isEntityMigrated } from './config.js';
export { getSupabase, isSupabaseReady } from './client.js';
