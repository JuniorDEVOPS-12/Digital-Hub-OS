import { signInWithEmail } from '../../config/supabase.js';
import { showToast } from '../core/toast.js';

export function renderLogin(container) {
    container.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <div class="login-header">
                    <img src="assets/logo.svg" alt="Digital Hub Logo" class="login-logo">
                    <h1 class="login-title">Digital Hub OS</h1>
                    <p class="login-subtitle">Centre de Formation</p>
                </div>
                
                <form id="loginForm" class="login-form">
                    <div class="form-group">
                        <label class="form-label" for="loginEmail">Email</label>
                        <input 
                            type="email" 
                            id="loginEmail" 
                            class="form-input" 
                            placeholder="votre@email.com" 
                            required
                            autocomplete="email"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="loginPassword">Mot de passe</label>
                        <input 
                            type="password" 
                            id="loginPassword" 
                            class="form-input" 
                            placeholder="••••••••" 
                            required
                            autocomplete="current-password"
                        >
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full" id="loginBtn">
                        <span>Se connecter</span>
                    </button>
                </form>
                
                <div class="login-footer">
                    <p class="login-info">
                        Utilisez vos identifiants Supabase pour accéder à l'application.
                    </p>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            showToast('Veuillez remplir tous les champs', 'error');
            return;
        }

        // Disable button during loading
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span>Connexion en cours...</span>';

        try {
            const { data, error } = await signInWithEmail(email, password);
            
            if (error) {
                showToast(error.message || 'Erreur de connexion', 'error');
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<span>Se connecter</span>';
                return;
            }

            if (data.user) {
                showToast('Connexion réussie', 'success');
                // Redirect will be handled by auth guard
                window.location.hash = '#dashboard';
            }
        } catch (err) {
            showToast('Erreur de connexion', 'error');
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span>Se connecter</span>';
        }
    });
}
