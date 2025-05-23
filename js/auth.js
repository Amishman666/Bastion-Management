// js/auth.js - Authentication Management Module

export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.loginCallbacks = [];
        this.logoutCallbacks = [];
        
        // Default users - in production this would be handled by a backend
        this.users = {
            'jon': { 
                password: 'bastion2024', 
                role: 'player',
                displayName: 'Jon',
                lastLogin: null,
                preferences: {}
            },
            'gm': { 
                password: 'gmbastion2024', 
                role: 'gm',
                displayName: 'Game Master',
                lastLogin: null,
                preferences: {}
            }
        };
        
        this.init();
    }

    init() {
        // Check for existing session
        this.loadSession();
        
        // Set up login form if it exists
        this.setupLoginForm();
        
        // Set up role selection
        this.setupRoleSelection();
        
        // Check for auto-login from URL params (for development)
        this.checkAutoLogin();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    setupRoleSelection() {
        const roleBtns = document.querySelectorAll('.role-btn');
        roleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleRoleSelection(e));
            
            // Keyboard navigation
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleRoleSelection(e);
                }
            });
        });
    }

    handleRoleSelection(e) {
        // Remove active from all buttons
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-checked', 'false');
        });
        
        // Add active to clicked button
        e.target.closest('.role-btn').classList.add('active');
        e.target.closest('.role-btn').setAttribute('aria-checked', 'true');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const username = formData.get('username')?.trim();
        const accessCode = formData.get('accessCode');
        const selectedRole = document.querySelector('.role-btn.active')?.dataset.role;
        
        // Validate input
        if (!username || !accessCode || !selectedRole) {
            this.showLoginError('Please fill in all fields');
            return;
        }

        // Show loading state
        this.setLoginLoading(true);
        
        try {
            // Simulate async authentication (replace with actual API call)
            await this.sleep(500);
            
            const isValid = await this.validateCredentials(username, accessCode, selectedRole);
            
            if (isValid) {
                await this.login(username, selectedRole);
            } else {
                this.showLoginError('Invalid credentials or role mismatch');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError('Login failed. Please try again.');
        } finally {
            this.setLoginLoading(false);
        }
    }

    async validateCredentials(username, accessCode, selectedRole) {
        const user = this.users[username.toLowerCase()];
        
        if (!user) {
            return false;
        }
        
        if (user.password !== accessCode) {
            return false;
        }
        
        if (user.role !== selectedRole) {
            return false;
        }
        
        return true;
    }

    async login(username, role) {
        const user = this.users[username.toLowerCase()];
        
        if (!user) {
            throw new Error('User not found');
        }

        // Set current user
        this.currentUser = {
            username: username.toLowerCase(),
            displayName: user.displayName,
            role: role,
            loginTime: new Date(),
            preferences: user.preferences || {}
        };
        
        this.userRole = role;
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        
        // Save session
        this.saveSession();
        
        // Update UI
        this.updateLoginUI();
        
        // Clear login form
        this.clearLoginForm();
        
        // Log the login
        this.logSecurityEvent('login', { username, role });
        
        // Trigger callbacks
        this.triggerLoginCallbacks(username, role);
        
        console.log(`✅ User ${username} logged in as ${role}`);
    }

    logout() {
        if (!this.currentUser) {
            return;
        }
        
        const username = this.currentUser.username;
        const role = this.currentUser.role;
        
        // Log the logout
        this.logSecurityEvent('logout', { username, role });
        
        // Clear current user
        this.currentUser = null;
        this.userRole = null;
        
        // Clear session
        this.clearSession();
        
        // Update UI
        this.updateLogoutUI();
        
        // Trigger callbacks
        this.triggerLogoutCallbacks();
        
        console.log(`✅ User ${username} logged out`);
    }

    updateLoginUI() {
        // Hide login screen
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.style.display = 'none';
        }
        
        // Show main app
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.classList.add('show');
        }
        
        // Update user info in navigation
        this.updateNavigationUserInfo();
    }

    updateLogoutUI() {
        // Show login screen
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.style.display = 'flex';
        }
        
        // Hide main app
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.classList.remove('show');
        }
        
        // Hide role-specific dashboards
        const gmDashboard = document.getElementById('gmDashboard');
        const playerDashboard = document.getElementById('playerDashboard');
        
        if (gmDashboard) gmDashboard.classList.remove('show');
        if (playerDashboard) playerDashboard.classList.remove('show');
    }

    updateNavigationUserInfo() {
        const currentUserElement = document.getElementById('currentUser');
        const userRoleElement = document.getElementById('userRole');
        
        if (currentUserElement && this.currentUser) {
            currentUserElement.textContent = this.currentUser.displayName;
        }
        
        if (userRoleElement && this.userRole) {
            userRoleElement.textContent = this.userRole.toUpperCase();
            userRoleElement.className = `role-badge role-${this.userRole}`;
        }
    }

    showLoginError(message) {
        // Remove existing error
        const existingError = document.querySelector('.login-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-error error-message';
        errorDiv.textContent = message;
        errorDiv.style.marginTop = 'var(--space-3)';
        errorDiv.style.textAlign = 'center';
        
        // Insert after login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.parentNode.insertBefore(errorDiv, loginForm.nextSibling);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 5000);
        }
        
        // Focus back to first invalid field
        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.focus();
        }
    }

    setLoginLoading(isLoading) {
        const loginBtn = document.querySelector('.login-btn');
        const loginForm = document.getElementById('loginForm');
        
        if (isLoading) {
            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            }
            if (loginForm) {
                loginForm.style.opacity = '0.7';
            }
        } else {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Enter The Bastion</span>';
            }
            if (loginForm) {
                loginForm.style.opacity = '1';
            }
        }
    }

    clearLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.reset();
            
            // Reset role selection to default (player)
            document.querySelectorAll('.role-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-checked', 'false');
            });
            
            const playerBtn = document.querySelector('.role-btn[data-role="player"]');
            if (playerBtn) {
                playerBtn.classList.add('active');
                playerBtn.setAttribute('aria-checked', 'true');
            }
        }
    }

    saveSession() {
        if (this.currentUser) {
            const sessionData = {
                user: this.currentUser,
                role: this.userRole,
                timestamp: Date.now()
            };
            
            localStorage.setItem('bastion-session', JSON.stringify(sessionData));
        }
    }

    loadSession() {
        try {
            const sessionData = localStorage.getItem('bastion-session');
            if (sessionData) {
                const parsed = JSON.parse(sessionData);
                
                // Check if session is still valid (e.g., not older than 24 hours)
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                if (Date.now() - parsed.timestamp < maxAge) {
                    this.currentUser = parsed.user;
                    this.userRole = parsed.role;
                    
                    // Auto-login if session is valid
                    setTimeout(() => {
                        this.updateLoginUI();
                        this.triggerLoginCallbacks(this.currentUser.username, this.userRole);
                    }, 100);
                    
                    return true;
                }
            }
        } catch (error) {
            console.warn('Failed to load session:', error);
        }
        
        return false;
    }

    clearSession() {
        localStorage.removeItem('bastion-session');
    }

    checkAutoLogin() {
        // For development - allow auto-login via URL params
        const urlParams = new URLSearchParams(window.location.search);
        const autoUser = urlParams.get('user');
        const autoRole = urlParams.get('role');
        
        if (autoUser && autoRole && this.users[autoUser]) {
            console.log('🔧 Auto-login detected for development');
            setTimeout(() => {
                this.login(autoUser, autoRole);
            }, 500);
        }
    }

    logSecurityEvent(event, data) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            data: data,
            userAgent: navigator.userAgent,
            ip: 'client-side' // In production, this would be logged server-side
        };
        
        // In production, this would be sent to a security logging service
        console.log('🔒 Security Event:', logEntry);
        
        // Store locally for debugging (limit to last 50 events)
        let securityLog = JSON.parse(localStorage.getItem('bastion-security-log') || '[]');
        securityLog.unshift(logEntry);
        securityLog = securityLog.slice(0, 50);
        localStorage.setItem('bastion-security-log', JSON.stringify(securityLog));
    }

    // Callback management
    onLogin(callback) {
        this.loginCallbacks.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.loginCallbacks.indexOf(callback);
            if (index > -1) {
                this.loginCallbacks.splice(index, 1);
            }
        };
    }

    onLogout(callback) {
        this.logoutCallbacks.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.logoutCallbacks.indexOf(callback);
            if (index > -1) {
                this.logoutCallbacks.splice(index, 1);
            }
        };
    }

    triggerLoginCallbacks(username, role) {
        this.loginCallbacks.forEach(callback => {
            try {
                callback(username, role);
            } catch (error) {
                console.error('Error in login callback:', error);
            }
        });
    }

    triggerLogoutCallbacks() {
        this.logoutCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in logout callback:', error);
            }
        });
    }

    // Utility methods
    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserRole() {
        return this.userRole;
    }

    hasRole(role) {
        return this.userRole === role;
    }

    isGM() {
        return this.userRole === 'gm';
    }

    isPlayer() {
        return this.userRole === 'player';
    }

    requireAuth() {
        if (!this.isLoggedIn()) {
            throw new Error('Authentication required');
        }
    }

    requireRole(role) {
        this.requireAuth();
        if (!this.hasRole(role)) {
            throw new Error(`Role '${role}' required`);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Development helpers
    getSecurityLog() {
        return JSON.parse(localStorage.getItem('bastion-security-log') || '[]');
    }

    clearSecurityLog() {
        localStorage.removeItem('bastion-security-log');
    }

    // User management (for GMs)
    addUser(username, password, role, displayName) {
        if (!this.isGM()) {
            throw new Error('Only GMs can add users');
        }
        
        this.users[username.toLowerCase()] = {
            password,
            role,
            displayName: displayName || username,
            lastLogin: null,
            preferences: {}
        };
        
        this.logSecurityEvent('user_added', { username, role, addedBy: this.currentUser.username });
    }

    removeUser(username) {
        if (!this.isGM()) {
            throw new Error('Only GMs can remove users');
        }
        
        if (username.toLowerCase() === this.currentUser.username) {
            throw new Error('Cannot remove current user');
        }
        
        delete this.users[username.toLowerCase()];
        this.logSecurityEvent('user_removed', { username, removedBy: this.currentUser.username });
    }

    listUsers() {
        if (!this.isGM()) {
            throw new Error('Only GMs can list users');
        }
        
        return Object.entries(this.users).map(([username, user]) => ({
            username,
            role: user.role,
            displayName: user.displayName,
            lastLogin: user.lastLogin
        }));
    }
}

export default AuthManager;
