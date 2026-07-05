import { api } from '../../backend/api.js';

export async function renderDashboard(container) {
    const students = await api.students.getAll();
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const trainers = await api.trainers.getAll();
    const totalTrainers = trainers.length;
    const modules = await api.modules.getAll();
    const totalModules = modules.length;

    // Calculate attendance stats
    const activeStudentIds = students.filter(s => s.status === 'active').map(s => s.id);
    const attStats = await api.attendance.getStats(activeStudentIds);

    const statsHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">Étudiants</span>
                    <div class="stat-icon indigo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                </div>
                <div class="stat-value">${totalStudents}</div>
                <div class="stat-meta">${activeStudents} actifs sur ${totalStudents}</div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">Formateurs</span>
                    <div class="stat-icon green">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                </div>
                <div class="stat-value">${totalTrainers}</div>
                <div class="stat-meta">${totalTrainers} formateur${totalTrainers > 1 ? 's' : ''} assigné${totalTrainers > 1 ? 's' : ''}</div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">Modules</span>
                    <div class="stat-icon purple">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                    </div>
                </div>
                <div class="stat-value">${totalModules}</div>
                <div class="stat-meta">Parcours séquentiel</div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">Taux de présence</span>
                    <div class="stat-icon amber">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 11l3 3L22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                    </div>
                </div>
                <div class="stat-value">${attStats.rate > 0 ? attStats.rate + '%' : '—'}</div>
                <div class="stat-meta">${attStats.totalRecords > 0 ? `${attStats.totalPresent}/${attStats.totalRecords} présences` : 'Aucune donnée'}</div>
            </div>
        </div>
    `;

    const modulesListHTML = (await Promise.all(modules.map(async mod => {
        const trainer = trainers.find(t => t.id === mod.trainerId);
        const scheduleDays = (await api.schedule.getAll()).filter(s => s.moduleId === mod.id).length;
        
        // determine status
        const today = new Date().toISOString().split('T')[0];
        const modDates = (await api.schedule.getAll()).filter(s => s.moduleId === mod.id).map(s => s.date).sort();
        let statusBadge = '';
        if (modDates.length === 0) {
            statusBadge = '<span class="badge badge-info">Non planifié</span>';
        } else if (today < modDates[0]) {
            statusBadge = '<span class="badge badge-info">À venir</span>';
        } else if (today > modDates[modDates.length - 1]) {
            statusBadge = '<span class="badge badge-success">Terminé</span>';
        } else {
            statusBadge = '<span class="badge badge-warning">En cours</span>';
        }

        return `
            <div class="module-progress-item">
                <div class="module-order" style="background: ${mod.color}">M${mod.order}</div>
                <div class="module-progress-info">
                    <div class="module-progress-name">${mod.name}</div>
                    <div class="module-progress-trainer">${trainer ? trainer.firstName + ' ' + trainer.lastName : 'Non assigné'} · ${scheduleDays} jours</div>
                </div>
                <div class="module-progress-status">${statusBadge}</div>
            </div>
        `;
    }))).join('');

    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingDays = (await api.schedule.getAll())
        .filter(s => s.date >= todayStr)
        .slice(0, 5);

    const upcomingHTML = upcomingDays.length > 0
        ? upcomingDays.map(s => {
            const mod = modules.find(m => m.id === s.moduleId);
            const dateObj = new Date(s.date + 'T00:00:00');
            const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
            return `
                <div class="recent-attendance-item">
                    <div class="recent-attendance-info">
                        <div class="module-order" style="background: ${mod ? mod.color : '#6366f1'}; width:24px; height:24px; font-size:0.65rem;">M${mod ? mod.order : '?'}</div>
                        <div>
                            <div class="recent-date">${dayName}</div>
                            <div class="recent-module">${mod ? mod.name : 'Module inconnu'} · ${s.startTime}-${s.endTime}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('')
        : '<div class="empty-state"><p>Aucun cours à venir</p></div>';

    container.innerHTML = `
        ${statsHTML}
        <div class="dashboard-grid">
            <div class="info-card">
                <div class="info-card-header">
                    <h3 class="info-card-title">Modules de formation</h3>
                    <span class="badge badge-purple">${totalModules} modules</span>
                </div>
                <div class="info-card-body">${modulesListHTML}</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <h3 class="info-card-title">Prochains cours</h3>
                    <span class="badge badge-info">Planning</span>
                </div>
                <div class="info-card-body">${upcomingHTML}</div>
            </div>
        </div>
    `;
}
