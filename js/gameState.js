/**
 * Game State Management for The Bastion
 * Handles all persistent data and state changes
 */

export class GameState {
    constructor() {
        this.data = {
            resources: {
                'celestial-power': 1250,
                'celestial-silver': 85,
                'runic-shards': 12,
                'divine-essence': 3,
                'technical-expertise': 5
            },
            upgrades: {
                luminarium: { research: [], offensive: [], defensive: [] },
                sanctum: { research: [], offensive: [], defensive: [] },
                wards: { research: [], offensive: [], defensive: [] },
                throne: { research: [], offensive: [], defensive: [] },
                gateway: { research: [], offensive: [], defensive: [] },
                fountain: { research: [], offensive: [], defensive: [] }
            },
            settings: {
                autoSave: true,
                soundEnabled: true,
                theme: 'dark'
            },
            lastSaved: Date.now()
        };

        this.eventListeners = {};
    }

    // Event system for cross-module communication
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    emit(event, data = {}) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }

    // Resource management
    getResource(resourceId) {
        return this.data.resources[resourceId] || 0;
    }

    setResource(resourceId, value) {
        const oldValue = this.data.resources[resourceId];
        this.data.resources[resourceId] = Math.max(0, parseInt(value) || 0);
        
        if (oldValue !== this.data.resources[resourceId]) {
            this.emit('resourceUpdate', { 
                resource: resourceId, 
                value: this.data.resources[resourceId],
                oldValue: oldValue
            });
        }
    }

    canAfford(costs) {
        for (let resource in costs) {
            if (this.getResource(resource) < costs[resource]) {
                return false;
            }
        }
        return true;
    }

    spendResources(costs) {
        if (!this.canAfford(costs)) {
            return false;
        }

        for (let resource in costs) {
            this.setResource(resource, this.getResource(resource) - costs[resource]);
        }
        return true;
    }

    // Upgrade management
    hasUpgrade(sectionId, pathType, upgradeIndex) {
        return this.data.upgrades[sectionId] && 
               this.data.upgrades[sectionId][pathType] && 
               this.data.upgrades[sectionId][pathType].includes(upgradeIndex);
    }

    purchaseUpgrade(sectionId, pathType, upgradeIndex, cost) {
        if (this.hasUpgrade(sectionId, pathType, upgradeIndex)) {
            return false; // Already purchased
        }

        if (!this.spendResources(cost)) {
            return false; // Can't afford
        }

        if (!this.data.upgrades[sectionId]) {
            this.data.upgrades[sectionId] = { research: [], offensive: [], defensive: [] };
        }

        if (!this.data.upgrades[sectionId][pathType]) {
            this.data.upgrades[sectionId][pathType] = [];
        }

        this.data.upgrades[sectionId][pathType].push(upgradeIndex);
        
        this.emit('upgradePurchased', {
            sectionId,
            pathType,
            upgradeIndex,
            cost
        });

        return true;
    }

    getSectionProgress(sectionId, totalUpgrades) {
        if (!this.data.upgrades[sectionId]) return { completed: 0, total: totalUpgrades, percentage: 0 };
        
        const completed = Object.values(this.data.upgrades[sectionId])
            .reduce((sum, upgrades) => sum + upgrades.length, 0);
        
        return {
            completed,
            total: totalUpgrades,
            percentage: (completed / totalUpgrades) * 100
        };
    }

    // Persistence
    async save() {
        try {
            this.data.lastSaved = Date.now();
            localStorage.setItem('bastion-game-state', JSON.stringify(this.data));
            console.log('Game state saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game state:', error);
            return false;
        }
    }

    async load() {
        try {
            const saved = localStorage.getItem('bastion-game-state');
            if (saved) {
                const parsedData = JSON.parse(saved);
                
                // Merge with defaults to handle new properties
                this.data = this.mergeDefaults(parsedData, this.data);
                
                console.log('Game state loaded successfully');
                this.emit('stateLoaded', this.data);
                return true;
            }
        } catch (error) {
            console.error('Failed to load game state:', error);
        }
        return false;
    }

    // Export/Import functionality
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    importData(jsonData) {
        try {
            const parsedData = JSON.parse(jsonData);
            this.data = this.mergeDefaults(parsedData, this.data);
            this.emit('stateLoaded', this.data);
            this.save();
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    // Reset functionality
    reset() {
        const defaultData = {
            resources: {
                'celestial-power': 1250,
                'celestial-silver': 85,
                'runic-shards': 12,
                'divine-essence': 3,
                'technical-expertise': 5
            },
            upgrades: {
                luminarium: { research: [], offensive: [], defensive: [] },
                sanctum: { research: [], offensive: [], defensive: [] },
                wards: { research: [], offensive: [], defensive: [] },
                throne: { research: [], offensive: [], defensive: [] },
                gateway: { research: [], offensive: [], defensive: [] },
                fountain: { research: [], offensive: [], defensive: [] }
            },
            settings: this.data.settings, // Keep settings
            lastSaved: Date.now()
        };

        this.data = defaultData;
        this.emit('stateReset', this.data);
        this.save();
    }

    // Utility function to merge defaults with loaded data
    mergeDefaults(loaded, defaults) {
        const result = { ...defaults };
        
        for (let key in loaded) {
            if (typeof loaded[key] === 'object' && loaded[key] !== null && !Array.isArray(loaded[key])) {
                result[key] = this.mergeDefaults(loaded[key], defaults[key] || {});
            } else {
                result[key] = loaded[key];
            }
        }
        
        return result;
    }

    // Debug helpers
    getAllData() {
        return { ...this.data };
    }

    getStats() {
        const totalUpgrades = Object.values(this.data.upgrades)
            .reduce((total, section) => {
                return total + Object.values(section).reduce((sectionTotal, path) => {
                    return sectionTotal + path.length;
                }, 0);
            }, 0);

        const totalResources = Object.values(this.data.resources)
            .reduce((sum, value) => sum + value, 0);

        return {
            totalUpgrades,
            totalResources,
            lastSaved: new Date(this.data.lastSaved).toLocaleString()
        };
    }
}
