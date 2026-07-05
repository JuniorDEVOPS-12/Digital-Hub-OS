import { api } from '../../backend/api.js';
import { $ } from '../core/dom.js';
import { PDFService } from '../../services/pdf.service.js';
import { DAY_NAMES } from '../../config/constants.js';

export function renderSchedule(container) {
    const schedule = api.schedule.getAll();
    const modules = api.modules.getAll();
    const trainers = api.trainers.getAll();
    const weeks = api.schedule.getWeeks();

    if (schedule.length === 0 || weeks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <p>Aucun planning généré. Ajoutez des modules pour générer automatiquement le planning.</p>
            </div>`;
        return;
    }

    const pdfService = new PDFService();

    let currentWeek = 0;
    // Align with current date
    const todayStr = new Date().toISOString().split('T')[0];
    const todayWeekIdx = weeks.findIndex(w => w.days.includes(todayStr));
    if (todayWeekIdx >= 0) {
        currentWeek = todayWeekIdx;
    }

    function renderWeek() {
        const week = weeks[currentWeek];

        let gridHTML = `
            <div class="week-nav">
                <button id="prevWeek" ${currentWeek === 0 ? 'disabled style="opacity:0.3"' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span class="week-label">${week.label}</span>
                <button id="nextWeek" ${currentWeek === weeks.length - 1 ? 'disabled style="opacity:0.3"' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <button id="downloadWeekPDF" class="btn btn-secondary" style="margin-left: auto; font-size: var(--font-size-sm);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    PDF Semaine
                </button>
                <span style="margin-left: 10px; font-size: var(--font-size-xs); color: var(--text-muted);">Semaine ${currentWeek + 1} / ${weeks.length}</span>
            </div>
            <div class="schedule-grid">
                <div class="schedule-header-cell"></div>
        `;

        // Day headers
        for (let d = 0; d < 5; d++) {
            const dateObj = new Date(week.days[d] + 'T00:00:00');
            const isToday = week.days[d] === todayStr;
            gridHTML += `
                <div class="schedule-header-cell day-name" style="${isToday ? 'color: var(--accent-primary); font-weight: 700;' : ''}">
                    ${DAY_NAMES[d]}<br>
                    <span style="font-size: var(--font-size-xs); color: ${isToday ? 'var(--accent-primary)' : 'var(--text-muted)'}; font-weight: 400;">
                        ${dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                </div>`;
        }

        // Single row for fixed 16h-19h duration
        gridHTML += `<div class="schedule-time-cell">16h — 19h</div>`;

        for (let d = 0; d < 5; d++) {
            const dateStr = week.days[d];
            const entry = schedule.find(s => s.date === dateStr);

            if (entry) {
                const mod = modules.find(m => m.id === entry.moduleId);
                const trainer = mod ? trainers.find(t => t.id === mod.trainerId) : null;
                const color = mod ? mod.color : '#6366f1';
                gridHTML += `
                    <div class="schedule-cell">
                        <div class="schedule-block" style="background: ${color}15; border-color: ${color}; color: ${color};">
                            <div class="module-name">${mod ? mod.name : 'Module inconnu'}</div>
                            <div class="trainer-name">${trainer ? trainer.firstName + ' ' + trainer.lastName : ''}</div>
                        </div>
                    </div>
                `;
            } else {
                gridHTML += `<div class="schedule-cell"></div>`;
            }
        }

        gridHTML += '</div>';
        container.innerHTML = gridHTML;

        // Nav click event bindings
        const prevBtn = $('#prevWeek');
        const nextBtn = $('#nextWeek');
        const pdfBtn = $('#downloadWeekPDF');
        
        if (prevBtn && currentWeek > 0) {
            prevBtn.addEventListener('click', () => { currentWeek--; renderWeek(); });
        }
        if (nextBtn && currentWeek < weeks.length - 1) {
            nextBtn.addEventListener('click', () => { currentWeek++; renderWeek(); });
        }
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => {
                pdfService.generateAttendanceSheet(week.days[0]);
            });
        }
    }

    renderWeek();
}
