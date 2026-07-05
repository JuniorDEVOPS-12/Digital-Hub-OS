/* ========================================
   Digital Hub OS — Supabase Migration Flags
   Contrôle la migration progressive localStorage → Supabase.
   ======================================== */

/**
 * Interrupteur maître. Quand `false`, l'application reste 100% localStorage
 * (comportement d'origine). Quand `true`, chaque entité activée ci-dessous
 * utilise Supabase comme source principale, avec localStorage en repli.
 */
export const USE_SUPABASE = true;

/**
 * Migration progressive, entité par entité (ordre imposé) :
 * Students → Trainers → Modules → Attendance → Schedule.
 * Passer une entité à `false` la garde sur localStorage uniquement.
 * @type {Record<'students'|'trainers'|'modules'|'attendance'|'schedule', boolean>}
 */
export const SUPABASE_ENTITIES = {
    students: true,
    trainers: true,
    modules: true,
    attendance: true,
    schedule: true,
};

/**
 * @param {keyof typeof SUPABASE_ENTITIES} entity
 * @returns {boolean} Vrai si l'entité doit utiliser Supabase.
 */
export function isEntityMigrated(entity) {
    return USE_SUPABASE && SUPABASE_ENTITIES[entity] === true;
}
