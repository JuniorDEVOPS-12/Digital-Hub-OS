import { api } from '../../backend/api.js';
import { $ } from '../core/dom.js';
import { openModal, closeModal } from '../core/modal.js';
import { showToast } from '../core/toast.js';
import { getAvatarColor, getInitials } from '../../config/constants.js';
import { PDFService } from '../../services/pdf.service.js';

export async function renderTrainers(container) {
    async function render() {
        const trainers = await api.trainers.getAll();
        const modules = await api.modules.getAll();

        container.innerHTML = `
            <div class="section-header">
                <div class="section-title"></div>
                <button class="btn btn-primary" id="addTrainerBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ajouter un formateur
                </button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Spécialité</th>
                            <th>Module assigné</th>
                            <th style="text-align:right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${trainers.map(t => {
                            const color = getAvatarColor(t.firstName + t.lastName);
                            const initials = getInitials(t.firstName, t.lastName);
                            const assignedModule = modules.find(m => m.trainerId === t.id);
                            return `
                                <tr>
                                    <td>
                                        <div class="cell-name">
                                            <div class="avatar-sm" style="background: ${color}">${initials}</div>
                                            <span>${t.firstName} ${t.lastName}</span>
                                        </div>
                                    </td>
                                    <td style="color: var(--text-secondary)">${t.email}</td>
                                    <td style="color: var(--text-secondary)">${t.phone}</td>
                                    <td><span class="badge badge-purple">${t.specialty}</span></td>
                                    <td>${assignedModule ? `<span class="badge-module" style="background: ${assignedModule.color}20; color: ${assignedModule.color}"><span class="dot" style="background: ${assignedModule.color}"></span>${assignedModule.name}</span>` : '<span style="color: var(--text-muted)">—</span>'}</td>
                                    <td>
                                        <div class="cell-actions">
                                            <button class="btn-icon" data-action="pdf-trainer" data-id="${t.id}" title="Télécharger PDF">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                            </button>
                                            <button class="btn-icon" data-action="edit-trainer" data-id="${t.id}" title="Modifier">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </button>
                                            <button class="btn-icon danger" data-action="delete-trainer" data-id="${t.id}" title="Supprimer">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                ${trainers.length === 0 ? '<div class="empty-state"><p>Aucun formateur enregistré</p></div>' : ''}
            </div>
        `;

        $('#addTrainerBtn').addEventListener('click', () => openTrainerForm(null, render));

        container.querySelectorAll('[data-action="pdf-trainer"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const pdfService = new PDFService();
                openPDFMenu(btn.dataset.id, pdfService);
            });
        });

        container.querySelectorAll('[data-action="edit-trainer"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const trainer = await api.trainers.getById(btn.dataset.id);
                if (trainer) openTrainerForm(trainer, render);
            });
        });

        container.querySelectorAll('[data-action="delete-trainer"]').forEach(btn => {
            btn.addEventListener('click', () => confirmDeleteTrainer(btn.dataset.id, render));
        });
    }

    render();
}

function openTrainerForm(trainer = null, onSave) {
    const isEdit = !!trainer;
    openModal(isEdit ? 'Modifier le formateur' : 'Nouveau formateur', (body) => {
        body.innerHTML = `
            <form id="trainerForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Prénom</label>
                        <input class="form-input" id="tfFirstName" placeholder="Prénom" value="${isEdit ? trainer.firstName : ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nom</label>
                        <input class="form-input" id="tfLastName" placeholder="Nom" value="${isEdit ? trainer.lastName : ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input class="form-input" type="email" id="tfEmail" placeholder="email@example.com" value="${isEdit ? trainer.email : ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Téléphone</label>
                    <input class="form-input" id="tfPhone" placeholder="+223 XX XX XX XX" value="${isEdit ? trainer.phone : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Spécialité</label>
                    <input class="form-input" id="tfSpecialty" placeholder="Ex: Développement Web" value="${isEdit ? trainer.specialty : ''}" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="tfCancel">Annuler</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Enregistrer' : 'Ajouter'}</button>
                </div>
            </form>
        `;

        $('#tfCancel').addEventListener('click', closeModal);
        $('#trainerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                firstName: $('#tfFirstName').value.trim(),
                lastName: $('#tfLastName').value.trim(),
                email: $('#tfEmail').value.trim(),
                phone: $('#tfPhone').value.trim(),
                specialty: $('#tfSpecialty').value.trim(),
            };

            if (!data.firstName || !data.lastName || !data.email || !data.specialty) {
                showToast('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }

            if (isEdit) {
                await api.trainers.update(trainer.id, data);
                showToast('Formateur modifié avec succès');
            } else {
                await api.trainers.create({ id: Math.random().toString(36).substring(2, 9), ...data });
                showToast('Formateur ajouté avec succès');
            }
            closeModal();
            onSave();
        });
    });
}

function confirmDeleteTrainer(trainerId, onDelete) {
    openModal('Confirmer la suppression', (body) => {
        body.innerHTML = `
            <p class="confirm-message">Êtes-vous sûr de vouloir supprimer ce formateur ? Cette action est irréversible.</p>
            <div class="confirm-actions">
                <button class="btn btn-secondary" id="cancelDelete">Annuler</button>
                <button class="btn btn-danger" id="confirmDeleteBtn">Supprimer</button>
            </div>
        `;

        $('#cancelDelete').addEventListener('click', closeModal);
        $('#confirmDeleteBtn').addEventListener('click', async () => {
            await api.trainers.delete(trainerId);
            closeModal();
            showToast('Formateur supprimé');
            onDelete();
        });
    });
}

async function openPDFMenu(trainerId, pdfService) {
    const trainer = await api.trainers.getById(trainerId);
    const modules = await api.trainers.getModules(trainerId);
    
    openModal('Documents PDF - ' + trainer.firstName + ' ' + trainer.lastName, (body) => {
        body.innerHTML = `
            <div class="pdf-menu">
                <button class="pdf-menu-item" data-pdf="contract">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span>Contrat de prestation</span>
                </button>
                <button class="pdf-menu-item" data-pdf="info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>Fiche de renseignements</span>
                </button>
                <button class="pdf-menu-item" data-pdf="charter">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    <span>Charte d'engagement</span>
                </button>
                <button class="pdf-menu-item" data-pdf="schedule" ${modules.length === 0 ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>Planning du formateur</span>
                </button>
                <button class="pdf-menu-item" data-pdf="honoraries" ${modules.length === 0 ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <span>Calcul des honoraires</span>
                </button>
                <button class="pdf-menu-item" data-pdf="certificate" ${modules.length === 0 ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                    <span>Attestation de collaboration</span>
                </button>
            </div>
        `;

        body.querySelectorAll('.pdf-menu-item:not([disabled])').forEach(btn => {
            btn.addEventListener('click', async () => {
                const pdfType = btn.dataset.pdf;
                closeModal();
                
                switch(pdfType) {
                    case 'contract':
                        await pdfService.generateTrainerContract(trainerId);
                        break;
                    case 'info':
                        await pdfService.generateTrainerInfoSheet(trainerId);
                        break;
                    case 'charter':
                        await pdfService.generateEngagementCharter(trainerId);
                        break;
                    case 'schedule':
                        await pdfService.generateTrainerSchedule(trainerId);
                        break;
                    case 'honoraries':
                        await pdfService.generateHonorariesCalculation(trainerId);
                        break;
                    case 'certificate':
                        await pdfService.generateCollaborationCertificate(trainerId);
                        break;
                }
                showToast('PDF généré avec succès');
            });
        });
    });
}
