import { api } from '../../backend/api.js';
import { $ } from '../core/dom.js';
import { showToast } from '../core/toast.js';
import { getAvatarColor, getInitials, ATTENDANCE_STATUS, formatDateFR } from '../../config/constants.js';
import { PDFService } from '../../services/pdf.service.js';

export function renderAttendance(container) {
    const scheduled = [...new Set(api.schedule.getAll().map(s => s.date))].sort();

    if (scheduled.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <p>Aucun cours programmé. Configurez les modules et le planning d'abord.</p>
            </div>`;
        return;
    }

    const pdfService = new PDFService();
    const todayStr = new Date().toISOString().split('T')[0];
    let currentDateIdx = scheduled.findIndex(d => d >= todayStr);
    if (currentDateIdx < 0) {
        currentDateIdx = scheduled.length - 1;
    }

    function renderDay() {
        const dateStr = scheduled[currentDateIdx];
        const scheduleEntry = api.schedule.getAll().find(s => s.date === dateStr);
        const mod = scheduleEntry ? api.modules.getAll().find(m => m.id === scheduleEntry.moduleId) : null;
        const trainer = mod ? api.trainers.getAll().find(t => t.id === mod.trainerId) : null;
        const dateLabel = formatDateFR(dateStr);

        const dayAttendance = api.attendance.getByDate(dateStr);
        const activeStudents = api.students.getAll().filter(s => s.status === 'active');

        // Stats calculation
        let presentCount = 0, absentCount = 0, lateCount = 0;
        activeStudents.forEach(s => {
            const status = dayAttendance[s.id];
            if (status === ATTENDANCE_STATUS.PRESENT) presentCount++;
            else if (status === ATTENDANCE_STATUS.ABSENT) absentCount++;
            else if (status === ATTENDANCE_STATUS.LATE) lateCount++;
        });

        container.innerHTML = `
            <div class="attendance-controls">
                <div class="attendance-date-display">
                    <button id="prevDate" ${currentDateIdx === 0 ? 'disabled style="opacity:0.3"' : ''}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <span class="date-text">${dateLabel}</span>
                    <button id="nextDate" ${currentDateIdx === scheduled.length - 1 ? 'disabled style="opacity:0.3"' : ''}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
                <div style="display:flex; align-items:center; gap: var(--space-sm);">
                    ${mod ? `<span class="badge-module" style="background: ${mod.color}20; color: ${mod.color}"><span class="dot" style="background: ${mod.color}"></span>${mod.name}</span>` : ''}
                    ${trainer ? `<span style="font-size: var(--font-size-xs); color: var(--text-muted);">${trainer.firstName} ${trainer.lastName}</span>` : ''}
                </div>
                <div class="attendance-summary">
                    <span class="attendance-stat"><span class="dot present"></span> ${presentCount} présents</span>
                    <span class="attendance-stat"><span class="dot absent"></span> ${absentCount} absents</span>
                    <span class="attendance-stat"><span class="dot late"></span> ${lateCount} retards</span>
                </div>
                <button class="btn btn-sm btn-secondary" id="downloadAttendancePDF" style="margin-left: auto;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    PDF
                </button>
            </div>
            <div style="display: flex; gap: var(--space-md); margin-bottom: var(--space-md);">
                <button class="btn btn-sm btn-secondary" id="markAllPresent">✓ Tout marquer présent</button>
                <button class="btn btn-sm btn-secondary" id="clearAll">Réinitialiser</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 40px">#</th>
                            <th>Étudiant</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeStudents.map((s, i) => {
                            const color = getAvatarColor(s.firstName + s.lastName);
                            const initials = getInitials(s.firstName, s.lastName);
                            const status = dayAttendance[s.id] || '';
                            return `
                                <tr>
                                    <td style="color: var(--text-muted); font-size: var(--font-size-xs);">${i + 1}</td>
                                    <td>
                                        <div class="cell-name">
                                            <div class="avatar-sm" style="background: ${color}">${initials}</div>
                                            <span>${s.firstName} ${s.lastName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="attendance-status-group">
                                            <button class="attendance-btn present ${status === ATTENDANCE_STATUS.PRESENT ? 'active' : ''}" data-student="${s.id}" data-status="present">Présent</button>
                                            <button class="attendance-btn late ${status === ATTENDANCE_STATUS.LATE ? 'active' : ''}" data-student="${s.id}" data-status="late">Retard</button>
                                            <button class="attendance-btn absent ${status === ATTENDANCE_STATUS.ABSENT ? 'active' : ''}" data-student="${s.id}" data-status="absent">Absent</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Add event listeners
        const prevBtn = $('#prevDate');
        const nextBtn = $('#nextDate');
        if (prevBtn && currentDateIdx > 0) {
            prevBtn.addEventListener('click', () => { currentDateIdx--; renderDay(); });
        }
        if (nextBtn && currentDateIdx < scheduled.length - 1) {
            nextBtn.addEventListener('click', () => { currentDateIdx++; renderDay(); });
        }

        container.querySelectorAll('.attendance-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const studentId = btn.dataset.student;
                const status = btn.dataset.status;
                const active = btn.classList.contains('active');
                
                // Toggle status
                api.attendance.setStatus(dateStr, studentId, active ? null : status);
                renderDay();
            });
        });

        $('#markAllPresent').addEventListener('click', () => {
            const studentIds = activeStudents.map(s => s.id);
            api.attendance.markAllPresent(dateStr, studentIds);
            showToast('Tous les étudiants marqués présents');
            renderDay();
        });

        $('#clearAll').addEventListener('click', () => {
            api.attendance.clear(dateStr);
            showToast('Présences réinitialisées', 'info');
            renderDay();
        });

        $('#downloadAttendancePDF').addEventListener('click', () => {
            pdfService.generateAttendanceSheet(dateStr);
            showToast('PDF généré avec succès');
        });
    }

    renderDay();
}
