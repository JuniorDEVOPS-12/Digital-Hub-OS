import { api } from '../../backend/api.js';
import { $, el } from '../core/dom.js';
import { openModal, closeModal } from '../core/modal.js';
import { showToast } from '../core/toast.js';
import { getAvatarColor, getInitials, STUDENT_STATUS } from '../../config/constants.js';

let searchTerm = '';

export function renderStudents(container) {
    function render() {
        const filtered = api.students.search(searchTerm);

        container.innerHTML = `
            <div class="section-header">
                <div class="search-bar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input type="text" id="studentSearch" placeholder="Rechercher un étudiant..." value="${searchTerm}">
                </div>
                <button class="btn btn-primary" id="addStudentBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ajouter
                </button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Statut</th>
                            <th style="text-align:right">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="studentsTableBody">
                        ${filtered.map(s => {
                            const color = getAvatarColor(s.firstName + s.lastName);
                            const initials = getInitials(s.firstName, s.lastName);
                            const statusBadge = s.status === STUDENT_STATUS.ACTIVE
                                ? '<span class="badge badge-success">Actif</span>'
                                : '<span class="badge badge-danger">Inactif</span>';
                            return `
                                <tr>
                                    <td>
                                        <div class="cell-name">
                                            <div class="avatar-sm" style="background: ${color}">${initials}</div>
                                            <span>${s.firstName} ${s.lastName}</span>
                                        </div>
                                    </td>
                                    <td style="color: var(--text-secondary)">${s.email}</td>
                                    <td style="color: var(--text-secondary)">${s.phone}</td>
                                    <td>${statusBadge}</td>
                                    <td>
                                        <div class="cell-actions">
                                            <button class="btn-icon" data-action="edit-student" data-id="${s.id}" title="Modifier">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </button>
                                            <button class="btn-icon danger" data-action="delete-student" data-id="${s.id}" title="Supprimer">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                ${filtered.length === 0 ? '<div class="empty-state"><p>Aucun étudiant trouvé</p></div>' : ''}
            </div>
        `;

        // Attach listeners
        const searchInput = $('#studentSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                render();
                // Restore search input focus
                const newInput = $('#studentSearch');
                if (newInput) {
                    newInput.focus();
                    newInput.setSelectionRange(searchTerm.length, searchTerm.length);
                }
            });
        }

        const addBtn = $('#addStudentBtn');
        if (addBtn) addBtn.addEventListener('click', () => openStudentForm(null, render));

        container.querySelectorAll('[data-action="edit-student"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const student = api.students.getById(btn.dataset.id);
                if (student) openStudentForm(student, render);
            });
        });

        container.querySelectorAll('[data-action="delete-student"]').forEach(btn => {
            btn.addEventListener('click', () => confirmDeleteStudent(btn.dataset.id, render));
        });
    }

    render();
}

function openStudentForm(student = null, onSave) {
    const isEdit = !!student;
    openModal(isEdit ? "Modifier l'étudiant" : 'Nouvel étudiant', (body) => {
        body.innerHTML = `
            <form id="studentForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Prénom</label>
                        <input class="form-input" id="sfFirstName" placeholder="Prénom" value="${isEdit ? student.firstName : ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nom</label>
                        <input class="form-input" id="sfLastName" placeholder="Nom" value="${isEdit ? student.lastName : ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input class="form-input" type="email" id="sfEmail" placeholder="email@example.com" value="${isEdit ? student.email : ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Téléphone</label>
                    <input class="form-input" id="sfPhone" placeholder="+223 XX XX XX XX" value="${isEdit ? student.phone : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Statut</label>
                    <select class="form-select" id="sfStatus">
                        <option value="active" ${!isEdit || student.status === 'active' ? 'selected' : ''}>Actif</option>
                        <option value="inactive" ${isEdit && student.status === 'inactive' ? 'selected' : ''}>Inactif</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="sfCancel">Annuler</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Enregistrer' : 'Ajouter'}</button>
                </div>
            </form>
        `;

        $('#sfCancel').addEventListener('click', closeModal);
        $('#studentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                firstName: $('#sfFirstName').value.trim(),
                lastName: $('#sfLastName').value.trim(),
                email: $('#sfEmail').value.trim(),
                phone: $('#sfPhone').value.trim(),
                status: $('#sfStatus').value,
            };

            if (!data.firstName || !data.lastName || !data.email) {
                showToast('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }

            try {
                if (isEdit) {
                    api.students.update(student.id, data);
                    showToast('Étudiant modifié avec succès');
                } else {
                    api.students.create({ id: Math.random().toString(36).substring(2, 9), ...data });
                    showToast('Étudiant ajouté avec succès');
                }
                closeModal();
                onSave();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    });
}

function confirmDeleteStudent(studentId, onDelete) {
    openModal('Confirmer la suppression', (body) => {
        body.innerHTML = `
            <p class="confirm-message">Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible.</p>
            <div class="confirm-actions">
                <button class="btn btn-secondary" id="cancelDelete">Annuler</button>
                <button class="btn btn-danger" id="confirmDeleteBtn">Supprimer</button>
            </div>
        `;

        $('#cancelDelete').addEventListener('click', closeModal);
        $('#confirmDeleteBtn').addEventListener('click', () => {
            api.students.delete(studentId);
            closeModal();
            showToast('Étudiant supprimé');
            onDelete();
        });
    });
}
