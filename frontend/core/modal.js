import { $ } from './dom.js';

export function openModal(title, contentFn) {
    const modalTitle = $('#modalTitle');
    const modalBody = $('#modalBody');
    const overlay = $('#modalOverlay');

    if (!modalTitle || !modalBody || !overlay) return;

    modalTitle.textContent = title;
    modalBody.innerHTML = '';
    contentFn(modalBody);
    overlay.classList.add('active');
}

export function closeModal() {
    const overlay = $('#modalOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Global window-level close event handling helpers
export function setupModalCloseEvents() {
    const overlay = $('#modalOverlay');
    const closeBtn = $('#modalClose');

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}
