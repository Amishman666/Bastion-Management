/**
 * Resource Management for The Bastion
 * Handles all resource-related operations and display updates
 */

export class ResourceManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.resources = {
            'celestial-power': {
                name: 'Celestial Power',
                icon: '⚡',
                description: 'Primary energy source for the Bastion'
            },
            'celestial-silver': {
                name: 'Celestial Silver',
                icon: '🥈',
                description: 'Rare metal for advanced construction'
            },
            'runic-shards': {
                name: 'Runic Shards',
                icon: '💎',
                description: 'Crystallized magical energy'
            },
            'divine-essence': {
                name: 'Divine Essence',
                icon: '✨',
                description: 'Pure divine power'
            },
            'technical-expertise': {
                name: 'Tech Expertise',
                icon: '🔬',
                description: 'Knowledge and skill points'
            }
        };
    }

    init() {
        this.updateAllDisplays();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for manual resource input changes
        Object.keys(this.resources).forEach(resourceId => {
            const input = document.getElementById(`${resourceId}-input`);
            if (input) {
                input.addEventListener('change', (e) => {
                    this.updateResource(resourceId, e.target.value);
                });

                input.addEventListener('input', (e) => {
                    // Real-time validation
                    const value = parseInt(e.target.value);
                    if (isNaN(value) || value < 0) {
                        e.target.classList.add('invalid');
                    } else {
                        e.target.classList.remove('invalid');
                    }
                });
            }
        });
    }

    updateResource(resourceId, value) {
        const numValue = Math.max(0, parseInt(value) || 0);
        this.gameState.setResource(resourceId, numValue);
        this.updateDisplay(resourceId, numValue);
    }

    updateDisplay(resourceId, value) {
        // Update display value
        const displayElement = document.getElementById(resourceId);
        if (displayElement) {
            displayElement.textContent = value;
        }

        // Update input value
        const inputElement = document.getElementById(`${resourceId}-input`);
        if (inputElement) {
            inputElement.value = value;
        }

        // Add visual feedback for changes
        this.animateResourceChange(resourceId);
    }

    updateAllDisplays() {
        Object.keys(this.resources).forEach(resourceId => {
            const value = this.gameState.getResource(resourceId);
            this.updateDisplay(resourceId, value);
        });
    }

    animateResourceChange(resourceId) {
        const displayElement = document.getElementById(resourceId);
        if (displayElement) {
            displayElement.classList.add('resource-updated');
            setTimeout(() => {
                displayElement.classList.remove('resource-updated');
            }, 500);
        }
    }

    // Resource manipulation methods
    addResource(resourceId, amount) {
        const currentValue = this.gameState.getResource(resourceId);
        this.updateResource(resourceId, currentValue + amount);
    }

    subtractResource(resourceId, amount) {
        const currentValue = this.gameState.getResource(resourceId);
        this.updateResource(resourceId, Math.max(0, currentValue - amount));
    }

    // Utility methods
    getResourceInfo(resourceId) {
        return this.resources[resourceId];
    }

    getAllResources() {
        const result = {};
        Object.keys(this.resources).forEach(resourceId => {
            result[resourceId] = {
                ...this.resources[resourceId],
                value: this.gameState.getResource(resourceId)
            };
        });
        return result;
    }

    getTotalValue() {
        return Object.keys(this.resources).reduce((total, resourceId) => {
            return total + this.gameState.getResource(resourceId);
        }, 0);
    }

    // Cost checking utilities
    canAfford(costs) {
        return this.gameState.canAfford(costs);
    }

    formatCosts(costs) {
        return Object.entries(costs).map(([resourceId, amount]) => {
            const resource = this.resources[resourceId];
            return `${resource.icon} ${amount}`;
        }).join(' ');
    }

    // Resource generation/income simulation
    simulateIncome(baseAmount = 10) {
        // This could be called periodically to simulate resource generation
        const powerIncome = Math.floor(baseAmount * (1 + Math.random() * 0.5));
        this.addResource('celestial-power', powerIncome);
        
        // Chance for bonus resources
        if (Math.random() < 0.1) { // 10% chance
            const bonusResource = Object.keys(this.resources)[Math.floor(Math.random() * Object.keys(this.resources).length)];
            this.addResource(bonusResource, 1);
        }
    }

    // Export/Import helpers
    exportResources() {
        return this.getAllResources();
    }

    importResources(resourceData) {
        Object.entries(resourceData).forEach(([resourceId, data]) => {
            if (this.resources[resourceId] && typeof data.value === 'number') {
                this.updateResource(resourceId, data.value);
            }
        });
    }

    // Debug methods
    maxAllResources() {
        Object.keys(this.resources).forEach(resourceId => {
            this.updateResource(resourceId, 9999);
        });
    }

    resetAllResources() {
        Object.keys(this.resources).forEach(resourceId => {
            this.updateResource(resourceId, 0);
        });
    }
}
