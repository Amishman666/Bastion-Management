// js/resources.js - Resource Management Module

import { ValidationUtils, MathUtils } from './utils.js';

export class ResourceManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.resourceIcons = {
            'celestial-power': '⚡',
            'celestial-silver': '🥈',
            'runic-shards': '💎',
            'divine-essence': '✨',
            'technical-expertise': '🔬'
        };
        
        this.resourceNames = {
            'celestial-power': 'Celestial Power',
            'celestial-silver': 'Celestial Silver',
            'runic-shards': 'Runic Shards',
            'divine-essence': 'Divine Essence',
            'technical-expertise': 'Technical Expertise'
        };
        
        this.resourceLimits = {
            'celestial-power': 999999,
            'celestial-silver': 999999,
            'runic-shards': 99999,
            'divine-essence': 9999,
            'technical-expertise': 999
        };
        
        this.dailyGenerationRates = {
            'celestial-power': 50,
            'celestial-silver': 10,
            'runic-shards': 0,
            'divine-essence': 0,
            'technical-expertise': 0 // Calculated from NPCs
        };
        
        this.init();
    }

    init() {
        // Calculate technical expertise from NPCs
        this.calculateTechExpertise();
        
        // Set up auto-save for resource changes
        this.gameState.onChange((changes) => {
            if (changes.includes('resources') || changes.includes('npcs')) {
                this.updateAllResourceDisplays();
            }
        });
        
        // Set up daily generation timer (for demo purposes, run every minute)
        if (this.gameState.get('settings.autoGeneration') !== false) {
            setInterval(() => this.checkDailyGeneration(), 60000);
        }
    }

    /**
     * Get current resource amount
     */
    getResource(resourceType) {
        return this.gameState.get(`resources.${resourceType}`) || 0;
    }

    /**
     * Set resource amount (with validation)
     */
    setResource(resourceType, amount, skipValidation = false) {
        if (!skipValidation) {
            if (!this.isValidResourceType(resourceType)) {
                throw new Error(`Invalid resource type: ${resourceType}`);
            }
            
            if (!ValidationUtils.validateResourceAmount(amount)) {
                throw new Error(`Invalid resource amount: ${amount}`);
            }
            
            amount = Math.min(amount, this.resourceLimits[resourceType]);
            amount = Math.max(amount, 0);
        }
        
        const oldAmount = this.getResource(resourceType);
        this.gameState.set(`resources.${resourceType}`, amount);
        
        this.logResourceChange(resourceType, oldAmount, amount);
        return amount;
    }

    /**
     * Add resources (with overflow protection)
     */
    addResource(resourceType, amount) {
        const current = this.getResource(resourceType);
        const newAmount = current + amount;
        return this.setResource(resourceType, newAmount);
    }

    /**
     * Subtract resources (with underflow protection)
     */
    subtractResource(resourceType, amount) {
        const current = this.getResource(resourceType);
        const newAmount = Math.max(0, current - amount);
        return this.setResource(resourceType, newAmount);
    }

    /**
     * Check if player can afford a cost
     */
    canAfford(costs) {
        for (const [resourceType, amount] of Object.entries(costs)) {
            if (this.getResource(resourceType) < amount) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get missing resources for a cost
     */
    getMissingResources(costs) {
        const missing = {};
        
        for (const [resourceType, amount] of Object.entries(costs)) {
            const current = this.getResource(resourceType);
            if (current < amount) {
                missing[resourceType] = amount - current;
            }
        }
        
        return missing;
    }

    /**
     * Spend resources if possible
     */
    spendResources(costs, description = 'Unknown') {
        if (!this.canAfford(costs)) {
            const missing = this.getMissingResources(costs);
            throw new Error(`Insufficient resources. Missing: ${this.formatResourceList(missing)}`);
        }
        
        const spentResources = {};
        
        for (const [resourceType, amount] of Object.entries(costs)) {
            const oldAmount = this.getResource(resourceType);
            const newAmount = this.subtractResource(resourceType, amount);
            spentResources[resourceType] = oldAmount - newAmount;
        }
        
        this.gameState.logActivity(`Spent resources for ${description}: ${this.formatResourceList(spentResources)}`);
        return spentResources;
    }

    /**
     * Award resources
     */
    awardResources(rewards, description = 'Unknown') {
        const awardedResources = {};
        
        for (const [resourceType, amount] of Object.entries(rewards)) {
            if (amount > 0) {
                const oldAmount = this.getResource(resourceType);
                const newAmount = this.addResource(resourceType, amount);
                awardedResources[resourceType] = newAmount - oldAmount;
            }
        }
        
        if (Object.keys(awardedResources).length > 0) {
            this.gameState.logActivity(`Awarded resources for ${description}: ${this.formatResourceList(awardedResources)}`);
        }
        
        return awardedResources;
    }

    /**
     * Calculate technical expertise from NPCs
     */
    calculateTechExpertise() {
        const npcs = this.gameState.get('npcs') || [];
        let totalTech = 0;
        
        npcs.forEach(npc => {
            if (npc.status === 'available' || npc.status === 'deployed') {
                totalTech += npc.tech || 0;
                
                // Add equipment bonuses
                if (npc.equipped_item) {
                    const items = this.gameState.get('items') || [];
                    const item = items.find(i => i.id === npc.equipped_item);
                    if (item && item.bonus && item.bonus.tech) {
                        totalTech += item.bonus.tech;
                    }
                }
            }
        });
        
        this.setResource('technical-expertise', totalTech, true);
        return totalTech;
    }

    /**
     * Daily resource generation
     */
    addDailyResources() {
        const generated = {};
        
        for (const [resourceType, amount] of Object.entries(this.dailyGenerationRates)) {
            if (amount > 0) {
                const oldAmount = this.getResource(resourceType);
                const newAmount = this.addResource(resourceType, amount);
                generated[resourceType] = newAmount - oldAmount;
            }
        }
        
        if (Object.keys(generated).length > 0) {
            this.gameState.logActivity(`Daily resource generation: ${this.formatResourceList(generated)}`);
        }
        
        return generated;
    }

    /**
     * Check for automatic daily generation
     */
    checkDailyGeneration() {
        const lastGeneration = this.gameState.get('lastDailyGeneration');
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000;
        
        // For demo purposes, generate every 5 minutes instead of daily
        const generationInterval = 5 * 60 * 1000;
        
        if (!lastGeneration || (now - lastGeneration) >= generationInterval) {
            this.addDailyResources();
            this.gameState.set('lastDailyGeneration', now);
        }
    }

    /**
     * Reset all resources
     */
    resetResources() {
        const resourceTypes = Object.keys(this.resourceNames);
        
        resourceTypes.forEach(resourceType => {
            this.setResource(resourceType, 0, true);
        });
        
        this.gameState.logActivity('All resources reset to 0');
    }

    /**
     * Get resource efficiency based on capacity and drain
     */
    getPowerEfficiency() {
        const totalCapacity = this.gameState.get('totalCelestialPowerCapacity') || 2000;
        const currentDrain = this.gameState.get('currentCelestialPowerDrain') || 0;
        
        return MathUtils.percentage(totalCapacity - currentDrain, totalCapacity);
    }

    /**
     * Get effective celestial power capacity
     */
    getEffectivePowerCapacity() {
        const totalCapacity = this.gameState.get('totalCelestialPowerCapacity') || 2000;
        const currentDrain = this.gameState.get('currentCelestialPowerDrain') || 0;
        
        return totalCapacity - currentDrain;
    }

    /**
     * Update GM resource input fields
     */
    updateGMResourceInputs() {
        Object.keys(this.resourceNames).forEach(resourceType => {
            if (resourceType !== 'technical-expertise') { // Skip calculated resources
                const element = document.getElementById(`gm-${resourceType}`);
                if (element) {
                    element.value = this.getResource(resourceType);
                }
            }
        });
        
        // Update power capacity display
        this.updatePowerCapacity();
    }

    /**
     * Update player resource displays
     */
    updatePlayerResourceDisplays() {
        Object.keys(this.resourceNames).forEach(resourceType => {
            const element = document.getElementById(`player-${resourceType}`);
            if (element) {
                element.textContent = this.formatResourceAmount(this.getResource(resourceType));
            }
        });
    }

    /**
     * Update all resource displays
     */
    updateAllResourceDisplays() {
        // Calculate tech expertise first
        this.calculateTechExpertise();
        
        // Update player displays
        this.updatePlayerResourceDisplays();
        
        // Update GM inputs
        this.updateGMResourceInputs();
        
        // Update calculated tech expertise display
        const techElement = document.getElementById('calculated-tech-expertise');
        if (techElement) {
            const npcs = this.gameState.get('npcs') || [];
            const activeNPCs = npcs.filter(npc => npc.status === 'available' || npc.status === 'deployed').length;
            techElement.textContent = `${this.getResource('technical-expertise')} (from ${activeNPCs} NPCs)`;
        }
    }

    /**
     * Update power capacity display
     */
    updatePowerCapacity() {
        const powerDisplay = document.getElementById('power-capacity');
        if (powerDisplay) {
            const effectiveCapacity = this.getEffectivePowerCapacity();
            const currentDrain = this.gameState.get('currentCelestialPowerDrain') || 0;
            
            if (currentDrain > 0) {
                powerDisplay.textContent = `/ ${effectiveCapacity} (drain: ${Math.round(currentDrain)})`;
            } else {
                powerDisplay.textContent = `/ ${effectiveCapacity}`;
            }
            
            // Color code based on efficiency
            const efficiency = this.getPowerEfficiency();
            if (efficiency < 50) {
                powerDisplay.style.color = 'var(--red)';
            } else if (efficiency < 75) {
                powerDisplay.style.color = 'var(--gold)';
            } else {
                powerDisplay.style.color = 'var(--green)';
            }
        }
    }

    /**
     * Handle global resource updates from GM
     */
    updateGlobalResource(resourceType, value) {
        if (!this.gameState.gameState.auth?.isGM()) {
            throw new Error('Only GMs can update global resources');
        }
        
        const amount = parseInt(value) || 0;
        this.setResource(resourceType, amount);
        
        this.gameState.logActivity(`GM updated ${this.resourceNames[resourceType]} to ${amount}`);
    }

    /**
     * Format resource amount for display
     */
    formatResourceAmount(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(1) + 'K';
        }
        return amount.toString();
    }

    /**
     * Format resource list for display
     */
    formatResourceList(resources) {
        return Object.entries(resources)
            .filter(([_, amount]) => amount > 0)
            .map(([resourceType, amount]) => {
                const icon = this.resourceIcons[resourceType] || '';
                return `${icon}${amount}`;
            })
            .join(', ');
    }

    /**
     * Get resource icon
     */
    getResourceIcon(resourceType) {
        return this.resourceIcons[resourceType] || '❓';
    }

    /**
     * Get resource name
     */
    getResourceName(resourceType) {
        return this.resourceNames[resourceType] || resourceType;
    }

    /**
     * Validation helpers
     */
    isValidResourceType(resourceType) {
        return Object.keys(this.resourceNames).includes(resourceType);
    }

    /**
     * Get all resources as object
     */
    getAllResources() {
        const resources = {};
        Object.keys(this.resourceNames).forEach(resourceType => {
            resources[resourceType] = this.getResource(resourceType);
        });
        return resources;
    }

    /**
     * Set multiple resources at once
     */
    setMultipleResources(resources) {
        const changes = {};
        
        for (const [resourceType, amount] of Object.entries(resources)) {
            if (this.isValidResourceType(resourceType)) {
                const oldAmount = this.getResource(resourceType);
                const newAmount = this.setResource(resourceType, amount);
                changes[resourceType] = { old: oldAmount, new: newAmount };
            }
        }
        
        return changes;
    }

    /**
     * Get resource statistics
     */
    getResourceStats() {
        const resources = this.getAllResources();
        const stats = {
            total: Object.values(resources).reduce((sum, amount) => sum + amount, 0),
            types: Object.keys(resources).length,
            powerEfficiency: this.getPowerEfficiency(),
            effectiveCapacity: this.getEffectivePowerCapacity(),
            canAffordBasicUpgrade: this.canAfford({
                'celestial-power': 100,
                'celestial-silver': 50
            })
        };
        
        return stats;
    }

    /**
     * Export resources for backup
     */
    exportResources() {
        return {
            resources: this.getAllResources(),
            powerCapacity: this.gameState.get('totalCelestialPowerCapacity'),
            powerDrain: this.gameState.get('currentCelestialPowerDrain'),
            lastGeneration: this.gameState.get('lastDailyGeneration'),
            timestamp: Date.now()
        };
    }

    /**
     * Import resources from backup
     */
    importResources(data) {
        if (!this.gameState.gameState.auth?.isGM()) {
            throw new Error('Only GMs can import resources');
        }
        
        if (data.resources) {
            this.setMultipleResources(data.resources);
        }
        
        if (data.powerCapacity) {
            this.gameState.set('totalCelestialPowerCapacity', data.powerCapacity);
        }
        
        if (data.powerDrain) {
            this.gameState.set('currentCelestialPowerDrain', data.powerDrain);
        }
        
        if (data.lastGeneration) {
            this.gameState.set('lastDailyGeneration', data.lastGeneration);
        }
        
        this.gameState.logActivity('Resources imported from backup');
    }

    /**
     * Log resource changes
     */
    logResourceChange(resourceType, oldAmount, newAmount) {
        if (oldAmount !== newAmount) {
            const change = newAmount - oldAmount;
            const changeText = change > 0 ? `+${change}` : change.toString();
            
            console.log(`💰 ${this.getResourceName(resourceType)}: ${oldAmount} → ${newAmount} (${changeText})`);
        }
    }

    /**
     * Debug helper to add test resources
     */
    addTestResources() {
        if (process.env.NODE_ENV !== 'development') {
            console.warn('Test resources only available in development');
            return;
        }
        
        this.addResource('celestial-power', 1000);
        this.addResource('celestial-silver', 500);
        this.addResource('runic-shards', 50);
        this.addResource('divine-essence', 10);
        
        this.gameState.logActivity('Test resources added (development mode)');
    }
}

export default ResourceManager;
