/* ========================================
   Digital Hub OS — Supabase Mappers
   Conversion entre les modèles applicatifs (camelCase, riches)
   et les lignes des tables Supabase (snake_case).
   ======================================== */

// --- Students -----------------------------------------------------------

/** @param {Object} row @returns {Object} */
export function studentFromRow(row) {
    return {
        id: row.id,
        firstName: row.first_name ?? '',
        lastName: row.last_name ?? '',
        email: row.email ?? '',
        phone: row.phone ?? '',
        status: row.status ?? 'active',
        createdAt: row.created_at ?? null,
        updatedAt: row.updated_at ?? null,
    };
}

/** @param {Object} s @returns {Object} */
export function studentToRow(s) {
    return {
        id: s.id,
        first_name: s.firstName ?? '',
        last_name: s.lastName ?? '',
        name: `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim(),
        email: s.email ?? '',
        phone: s.phone ?? '',
        status: s.status ?? 'active',
        created_at: s.createdAt ?? undefined,
        updated_at: s.updatedAt ?? undefined,
    };
}

// --- Trainers -----------------------------------------------------------

/** @param {Object} row @returns {Object} */
export function trainerFromRow(row) {
    return {
        id: row.id,
        firstName: row.first_name ?? '',
        lastName: row.last_name ?? '',
        email: row.email ?? '',
        phone: row.phone ?? '',
        specialty: row.specialty ?? '',
        createdAt: row.created_at ?? null,
        updatedAt: row.updated_at ?? null,
    };
}

/** @param {Object} t @returns {Object} */
export function trainerToRow(t) {
    return {
        id: t.id,
        first_name: t.firstName ?? '',
        last_name: t.lastName ?? '',
        name: `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim(),
        email: t.email ?? '',
        phone: t.phone ?? '',
        specialty: t.specialty ?? '',
        created_at: t.createdAt ?? undefined,
        updated_at: t.updatedAt ?? undefined,
    };
}

// --- Modules ------------------------------------------------------------

/** @param {Object} row @returns {Object} */
export function moduleFromRow(row) {
    return {
        id: row.id,
        name: row.name ?? row.title ?? '',
        order: row.order_index ?? 1,
        duration: row.duration ?? 1,
        trainerId: row.trainer_id ?? null,
        description: row.description ?? '',
        color: row.color ?? '#6366f1',
        createdAt: row.created_at ?? null,
        updatedAt: row.updated_at ?? null,
    };
}

/** @param {Object} m @returns {Object} */
export function moduleToRow(m) {
    return {
        id: m.id,
        name: m.name ?? '',
        title: m.name ?? '',
        order_index: m.order ?? 1,
        duration: m.duration ?? 1,
        trainer_id: m.trainerId ?? null,
        description: m.description ?? '',
        color: m.color ?? '#6366f1',
        created_at: m.createdAt ?? undefined,
        updated_at: m.updatedAt ?? undefined,
    };
}

// --- Schedule -----------------------------------------------------------

/** @param {Object} row @returns {Object} */
export function scheduleFromRow(row) {
    return {
        id: row.id,
        date: row.date ?? '',
        moduleId: row.module_id ?? '',
        startTime: row.start_time ?? '',
        endTime: row.end_time ?? '',
        createdAt: row.created_at ?? null,
    };
}

/** @param {Object} e @returns {Object} */
export function scheduleToRow(e) {
    return {
        id: e.id,
        date: e.date ?? '',
        module_id: e.moduleId ?? '',
        start_time: e.startTime ?? '',
        end_time: e.endTime ?? '',
        created_at: e.createdAt ?? undefined,
    };
}

// --- Attendance ---------------------------------------------------------
// App shape (map) : { [date]: { [studentId]: status } }
// Row shape       : { id, student_id, date, status, created_at }
// L'id de ligne est déterministe pour permettre un upsert idempotent.

/**
 * @param {string} date
 * @param {string} studentId
 * @returns {string}
 */
export function attendanceRowId(date, studentId) {
    return `${date}__${studentId}`;
}

/** @param {Object} row @returns {{ date: string, studentId: string, status: string }} */
export function attendanceCellFromRow(row) {
    return {
        date: row.date,
        studentId: row.student_id,
        status: row.status,
    };
}

/**
 * Transforme des lignes Supabase en carte applicative.
 * @param {Array<Object>} rows
 * @returns {Record<string, Record<string, string>>}
 */
export function attendanceMapFromRows(rows) {
    const map = {};
    (rows || []).forEach(row => {
        const { date, studentId, status } = attendanceCellFromRow(row);
        if (!date || !studentId) return;
        if (!map[date]) map[date] = {};
        map[date][studentId] = status;
    });
    return map;
}

/**
 * Aplati une carte applicative en lignes Supabase.
 * @param {Record<string, Record<string, string>>} map
 * @returns {Array<Object>}
 */
export function attendanceRowsFromMap(map) {
    const rows = [];
    Object.entries(map || {}).forEach(([date, dayRecord]) => {
        Object.entries(dayRecord || {}).forEach(([studentId, status]) => {
            rows.push({
                id: attendanceRowId(date, studentId),
                student_id: studentId,
                date,
                status,
            });
        });
    });
    return rows;
}
