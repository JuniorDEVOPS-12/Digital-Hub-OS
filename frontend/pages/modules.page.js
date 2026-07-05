import { api } from '../../backend/api.js';
import { $, delegateEvent } from '../core/dom.js';
import { openModal, closeModal } from '../core/modal.js';
import { showToast } from '../core/toast.js';
import { getAvatarColor, getInitials, MODULE_COLORS } from '../../config/constants.js';
import { PDFService } from '../../services/pdf.service.js';

export async function renderModules(container) {
    async function render() {
        const modules = await api.modules.getAll();
        const trainers = await api.trainers.getAll();

        container.innerHTML = `
            <div class="section-header">
                <div class="section-title"></div>
                <button class="btn btn-primary" id="addModuleBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ajouter un module
                </button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Ordre</th>
                            <th>Module</th>
                            <th>Formateur</th>
                            <th>Durée</th>
                            <th>Description</th>
                            <th style="text-align:right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${modules.map(mod => {
                            const trainer = trainers.find(t => t.id === mod.trainerId);
                            return `
                                <tr>
                                    <td>
                                        <div class="module-order" style="background: ${mod.color}">M${mod.order}</div>
                                    </td>
                                    <td><strong>${mod.name}</strong></td>
                                    <td>
                                        ${trainer
                                            ? `<div class="cell-name"><div class="avatar-sm" style="background: ${getAvatarColor(trainer.firstName + trainer.lastName)}">${getInitials(trainer.firstName, trainer.lastName)}</div><span>${trainer.firstName} ${trainer.lastName}</span></div>`
                                            : '<span style="color: var(--text-muted)">Non assigné</span>'
                                        }
                                    </td>
                                    <td><span class="badge badge-info">${mod.duration} jours</span></td>
                                    <td style="color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${mod.description || '—'}</td>
                                    <td>
                                        <div class="cell-actions">
                                            <button class="btn-icon" data-action="pdf-module" data-id="${mod.id}" title="Télécharger PDF">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                            </button>
                                            <button class="btn-icon" data-action="edit-module" data-id="${mod.id}" title="Modifier">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </button>
                                            <button class="btn-icon danger" data-action="delete-module" data-id="${mod.id}" title="Supprimer">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                ${modules.length === 0 ? '<div class="empty-state"><p>Aucun module créé</p></div>' : ''}
            </div>
        `;

        // Event delegation pour le bouton Ajouter module
        delegateEvent(container, '#addModuleBtn', 'click', () => {
            console.log('MODULE BUTTON CLICKED');
            openModuleForm(null, render);
        });

        // Event delegation pour les boutons PDF
        delegateEvent(container, '[data-action="pdf-module"]', 'click', (e, target) => {
            const pdfService = new PDFService();
            openModulePDFMenu(target.dataset.id, pdfService);
        });

        // Event delegation pour les boutons Edit
        delegateEvent(container, '[data-action="edit-module"]', 'click', async (e, target) => {
            const mod = await api.modules.getById(target.dataset.id);
            if (mod) openModuleForm(mod, render);
        });

        // Event delegation pour les boutons Delete
        delegateEvent(container, '[data-action="delete-module"]', 'click', (e, target) => {
            confirmDeleteModule(target.dataset.id, render);
        });
    }

    render();
}

async function openModuleForm(mod = null, onSave) {
    console.log('MODULE FORM OPENING', mod ? 'EDIT' : 'CREATE');
    const isEdit = !!mod;
    const modules = await api.modules.getAll();
    const trainers = await api.trainers.getAll();
    const nextOrder = modules.length > 0 ? Math.max(...modules.map(m => m.order)) + 1 : 1;
    console.log('MODULE FORM DATA LOADED', { modulesCount: modules.length, trainersCount: trainers.length, nextOrder });

    openModal(isEdit ? 'Modifier le module' : 'Nouveau module', (body) => {
        body.innerHTML = `
            <form id="moduleForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nom du module</label>
                        <input class="form-input" id="mfName" placeholder="Ex: Développement Web" value="${isEdit ? mod.name : ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Ordre</label>
                        <input class="form-input" type="number" id="mfOrder" min="1" value="${isEdit ? mod.order : nextOrder}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Formateur</label>
                        <select class="form-select" id="mfTrainer" required>
                            <option value="">Sélectionner...</option>
                            ${trainers.map(t => `<option value="${t.id}" ${isEdit && mod.trainerId === t.id ? 'selected' : ''}>${t.firstName} ${t.lastName}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Durée (jours)</label>
                        <input class="form-input" type="number" id="mfDuration" min="1" max="30" value="${isEdit ? mod.duration : 5}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Couleur</label>
                    <select class="form-select" id="mfColor">
                        ${MODULE_COLORS.map((c, i) => `<option value="${c}" ${isEdit && mod.color === c ? 'selected' : (!isEdit && i === 0 ? 'selected' : '')} style="color:${c}">● Couleur ${i + 1}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" id="mfDesc" placeholder="Description du module...">${isEdit ? (mod.description || '') : ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="mfCancel">Annuler</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Enregistrer' : 'Ajouter'}</button>
                </div>
            </form>
        `;

        $('#mfCancel').addEventListener('click', closeModal);
        $('#moduleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('MODULE SUBMIT START', { isEdit });
            const data = {
                name: $('#mfName').value.trim(),
                order: parseInt($('#mfOrder').value),
                trainerId: $('#mfTrainer').value,
                duration: parseInt($('#mfDuration').value),
                color: $('#mfColor').value,
                description: $('#mfDesc').value.trim(),
            };
            console.log('MODULE FORM DATA', data);

            if (!data.name || !data.trainerId) {
                showToast('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }

            try {
                if (isEdit) {
                    console.log('MODULE UPDATE START', mod.id);
                    await api.modules.update(mod.id, data);
                    console.log('MODULE UPDATE SUCCESS');
                    showToast('Module modifié avec succès et planning régénéré');
                } else {
                    console.log('MODULE INSERT START');
                    const newId = Math.random().toString(36).substring(2, 9);
                    await api.modules.create({ id: newId, ...data });
                    console.log('MODULE INSERT SUCCESS', newId);
                    showToast('Module ajouté avec succès et planning régénéré');
                }
                closeModal();
                onSave();
            } catch (err) {
                console.error('MODULE INSERT ERROR', err);
                showToast('Erreur lors de l\'enregistrement: ' + err.message, 'error');
            }
        });
    });
}

function confirmDeleteModule(moduleId, onDelete) {
    openModal('Confirmer la suppression', (body) => {
        body.innerHTML = `
            <p class="confirm-message">Êtes-vous sûr de vouloir supprimer ce module ? Le planning sera automatiquement régénéré sans ce module.</p>
            <div class="confirm-actions">
                <button class="btn btn-secondary" id="cancelDelete">Annuler</button>
                <button class="btn btn-danger" id="confirmDeleteBtn">Supprimer</button>
            </div>
        `;

        $('#cancelDelete').addEventListener('click', closeModal);
        $('#confirmDeleteBtn').addEventListener('click', async () => {
            await api.modules.delete(moduleId);
            closeModal();
            showToast('Module supprimé et planning régénéré');
            onDelete();
        });
    });
}

async function openModulePDFMenu(moduleId, pdfService) {
    const module = await api.modules.getById(moduleId);
    const trainer = await api.trainers.getById(module.trainerId);
    
    openModal('Documents PDF - ' + module.name, (body) => {
        body.innerHTML = `
            <div class="pdf-menu">
                <button class="pdf-menu-item" data-pdf="materials">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    <span>Remise des supports pédagogiques</span>
                </button>
                <button class="pdf-menu-item" data-pdf="report">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span>Rapport de fin de module</span>
                </button>
                <button class="pdf-menu-item" data-pdf="evaluation">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    <span>Évaluation du formateur</span>
                </button>
            </div>
        `;

        body.querySelectorAll('.pdf-menu-item').forEach(btn => {
            btn.addEventListener('click', async () => {
                const pdfType = btn.dataset.pdf;
                closeModal();
                
                switch(pdfType) {
                    case 'materials':
                        await pdfService.generateTeachingMaterialsReceipt(trainer.id, moduleId);
                        break;
                    case 'report':
                        await pdfService.generateModuleReport(moduleId);
                        break;
                    case 'evaluation':
                        await pdfService.generateTrainerEvaluation(trainer.id, moduleId);
                        break;
                }
                showToast('PDF généré avec succès');
            });
        });
    });
}
