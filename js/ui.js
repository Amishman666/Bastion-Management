/**
 * UI Management for The Bastion
 * Handles user interface updates and interactions
 */

export class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.notifications = [];
        this.notificationTimeout = null;
    }

    init() {
        this.updatePowerLevel();
        this.updateEfficiencyBonus();
        this.setupNotificationSystem();
        this.addResourceUpdateAnimations();
    }

    updatePowerLevel() {
        const totalPower = this.gameState.getResource('celestial-power');
        const powerPercent = Math.min(100, Math.max(0, (totalPower / 2000) * 100));
        
        const powerElement = document.getElementById('power-level');
        if (powerElement) {
            powerElement.textContent = Math.round(powerPercent) + '%';
            
            // Color coding based on power level
            if (powerPercent < 25) {
                powerElement.style.color = 'var(--red)';
            } else if (powerPercent < 50) {
                powerElement.style.color = 'var(--gold)';
            } else {
                powerElement.style.color = 'var(--green)';
            }
        }
    }

    updateEfficiencyBonus() {
        let bonus = 0;
        let sources = [];
        
        // Check for Pulse Harmonization upgrade
        if (this.gameState.hasUpgrade('luminarium', 'research', 0)) {
            bonus += 10;
            sources.push("Pulse Harmonization");
        }
        
        // Add other efficiency bonuses here as needed
        
        const displayElement = document.getElementById('efficiency-display');
        const sourceElement = document.getElementById('efficiency-source');
        
        if (displayElement) {
            displayElement.textContent = `+${bonus}%`;
        }
        
        if (sourceElement) {
            sourceElement.textContent = sources.length > 0 ? 
                `Active: ${sources.join(', ')}` : 
                'No active bonuses';
        }
    }

    setupNotificationSystem() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 300px;
            `;
            document.body.appendChild(container);
        }

        // Listen for game state events
        this.gameState.on('upgradePurchased', (data) => {
            this.showNotification(`Purchased: ${data.upgradeName || 'Upgrade'}`, 'success');
        });

        this.gameState.on('resourceUpdate', (data) => {
            if (data.oldValue !== undefined && data.value > data.oldValue) {
                const gained = data.value - data.oldValue;
                if (gained > 50) { // Only show for significant gains
                    this.showNotification(`+${gained} ${this.getResourceName(data.resource)}`, 'info');
                }
            }
        });
    }

    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: linear-gradient(135deg, var(--secondary-bg), var(--accent-bg));
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 10px;
            color: var(--text-primary);
            box-shadow: var(--glow);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            cursor: pointer;
        `;

        notification.textContent = message;
        container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Click to dismiss
        notification.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        return notification;
    }

    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    addResourceUpdateAnimations() {
        // Add CSS for resource update animations
        const style = document.createElement('style');
        style.textContent = `
            .resource-updated {
                color: var(--green) !important;
                text-shadow: 0 0 10px var(--green);
                transition: all 0.5s ease;
            }
            
            .resource-input.invalid {
                border-color: var(--red);
                box-shadow: 0 0 5px var(--red);
            }
            
            .notification-success {
                border-color: var(--green);
            }
            
            .notification-info {
                border-color: var(--cyan);
            }
            
            .notification-warning {
                border-color: var(--gold);
            }
            
            .notification-error {
                border-color: var(--red);
            }
        `;
        document.head.appendChild(style);
    }

    // Utility methods
    getResourceName(resourceId) {
        const names = {
            'celestial-power': 'Celestial Power',
            'celestial-silver': 'Celestial Silver',
            'runic-shards': 'Runic Shards',
            'divine-essence': 'Divine Essence',
            'technical-expertise': 'Tech Expertise'
        };
        return names[resourceId] || resourceId;
    }

    // Animation helpers
    animateElement(element, animation = 'pulse') {
        if (!element) return;
        
        element.classList.add(`animate-${animation}`);
        setTimeout(() => {
            element.classList.remove(`animate-${animation}`);
        }, 1000);
    }

    // Progress bar animations
    animateProgressBar(element, newWidth) {
        if (!element) return;
        
        const currentWidth = parseFloat(element.style.width) || 0;
        const increment = (newWidth - currentWidth) / 20;
        let current = currentWidth;
        
        const animate = () => {
            current += increment;
            if ((increment > 0 && current < newWidth) || (increment < 0 && current > newWidth)) {
                element.style.width = current + '%';
                requestAnimationFrame(animate);
            } else {
                element.style.width = newWidth + '%';
            }
        };
        
        animate();
    }

    // Modal/Dialog helpers
    showConfirmDialog(message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: linear-gradient(135deg, var(--secondary-bg), var(--accent-bg));
            border: 2px solid var(--border);
            border-radius: 12px;
            padding: 30px;
            max-width: 400px;
            text-align: center;
            color: var(--text-primary);
        `;

        dialog.innerHTML = `
            <p style="margin-bottom: 20px; line-height: 1.5;">${message}</p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="confirm-btn" style="background: var(--green); color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Confirm</button>
                <button id="cancel-btn" style="background: var(--red); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Cancel</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        document.getElementById('confirm-btn').onclick = () => {
            document.body.removeChild(overlay);
            if (onConfirm) onConfirm();
        };

        document.getElementById('cancel-btn').onclick = () => {
            document.body.removeChild(overlay);
            if (onCancel) onCancel();
        };

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                if (onCancel) onCancel();
            }
        };
    }

    // Export/Import UI helpers
    showExportDialog() {
        const data = this.gameState.exportData();
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: linear-gradient(135deg, var(--secondary-bg), var(--accent-bg));
            border: 2px solid var(--border);
            border-radius: 12px;
            padding: 30px;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            color: var(--text-primary);
        `;

        dialog.innerHTML = `
            <h3 style="margin-bottom: 20px; color: var(--gold);">Export Game Data</h3>
            <textarea readonly style="width: 100%; height: 300px; background: var(--primary-bg); color: var(--text-primary); border: 1px solid var(--border); border-radius: 6px; padding: 10px; font-family: monospace; font-size: 12px;">${data}</textarea>
            <div style="margin-top: 20px; text-align: center;">
                <button id="copy-btn" style="background: var(--gold); color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px;">Copy to Clipboard</button>
                <button id="close-btn" style="background: var(--secondary-bg); color: var(--text-primary); border: 1px solid var(--border); padding: 10px 20px; border-radius: 6px; cursor: pointer;">Close</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        document.getElementById('copy-btn').onclick = () => {
            navigator.clipboard.writeText(data).then(() => {
                this.showNotification('Data copied to clipboard!', 'success');
            });
        };

        document.getElementById('close-btn').onclick = () => {
            document.body.removeChild(overlay);
        };

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        };
    }
}
