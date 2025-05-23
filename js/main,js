/**
 * Main Entry Point for The Bastion
 * Initializes all modules and sets up the application
 */

import { GameState } from './gameState.js';
import { ResourceManager } from './resources.js';
import { SectionManager } from './sections.js';
import { UIManager } from './ui.js';

class BastionApp {
    constructor() {
        this.gameState = new GameState();
        this.resourceManager = new ResourceManager(this.gameState);
        this.sectionManager = new SectionManager(this.gameState);
        this.uiManager = new UIManager(this.gameState);
    }

    async init() {
        try {
            // Load saved game state
            await this.gameState.load();
            
            // Initialize managers
            this.resourceManager.init();
            this.sectionManager.init();
            this.uiManager.init();
            
            // Set up cross-module communication
            this.setupEventListeners();
            
            // Initial UI update
            this.updateAllDisplays();
            
            console.log('🏰 The Bastion initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize The Bastion:', error);
        }
    }

    setupEventListeners() {
        // Listen for resource updates
        this.gameState.on('resourceUpdate', (data) => {
            this.resourceManager.updateDisplay(data.resource, data.value);
            this.sectionManager.updateUpgradeStates();
            this.uiManager.updatePowerLevel();
        });

        // Listen for upgrade purchases
        this.gameState.on('upgradePurchased', (data) => {
            this.resourceManager.updateAllDisplays();
            this.sectionManager.updateUpgradeStates();
            this.sectionManager.updateSectionProgress(data.sectionId);
            this.uiManager.updateEfficiencyBonus();
        });

        // Auto-save every 30 seconds
        setInterval(() => {
            this.gameState.save();
        }, 30000);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.gameState.save();
        });
    }

    updateAllDisplays() {
        this.resourceManager.updateAllDisplays();
        this.sectionManager.updateAllSections();
        this.uiManager.updatePowerLevel();
        this.uiManager.updateEfficiencyBonus();
    }
}

// Global functions for backward compatibility with inline event handlers
window.updateResource = function(resourceId, value) {
    if (window.bastionApp) {
        window.bastionApp.resourceManager.updateResource(resourceId, value);
    }
};

window.purchaseUpgrade = function(sectionId, pathType, upgradeIndex) {
    if (window.bastionApp) {
        window.bastionApp.sectionManager.purchaseUpgrade(sectionId, pathType, upgradeIndex);
    }
};

window.togglePath = function(sectionId, pathType) {
    if (window.bastionApp) {
        window.bastionApp.sectionManager.togglePath(sectionId, pathType);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.bastionApp = new BastionApp();
    await window.bastionApp.init();
});
