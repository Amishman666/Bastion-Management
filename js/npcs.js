// js/npcs.js - NPC Management Module

import { ValidationUtils, StringUtils, ArrayUtils, MathUtils } from './utils.js';

export class NPCManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.statNames = ['skill', 'stealth', 'combat', 'tech', 'social', 'will'];
        this.statusTypes = ['available', 'deployed', 'injured', 'dead'];
        this.rarityLevels = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        
        // Random name pools for NPC generation
        this.firstNames = [
            'Kade', 'Elena', 'Marcus', 'Zara', 'Ajax', 'Luna', 'Nyx', 'Rex',
            'Vera', 'Kai', 'Thane', 'Lyra', 'Orion', 'Nova', 'Sage', 'Raven',
            'Dex', 'Iris', 'Zephyr', 'Astrid', 'Cyrus', 'Vex', 'Echo', 'Phoenix'
        ];
        
        this.lastNames = [
            'Voss', 'Cross', 'Reid', 'Shadow', 'Storm', 'Ember', 'Steel', 'Nova',
            'Stark', 'Vale', 'Frost', 'Blaze', 'Stone', 'Gray', 'Swift', 'Void',
            'Sharp', 'Wolf', 'Drake', 'Fox', 'Knight', 'Sage', 'Crow', 'Hunter'
        ];
        
        this.titles = [
            'Ghost Operative', 'Tech Specialist', 'Combat Veteran', 'Social Engineer',
            'Research Analyst', 'Field Medic', 'Infiltrator', 'Guardian',
            'Saboteur', 'Negotiator', 'Scout', 'Engineer', 'Hacker', 'Pilot',
            'Sniper', 'Demolitions Expert', 'Psychic', 'Mystic', 'Artificer'
        ];
        
        this.traits = [
            'Silent Entry — Stealth missions ignore first 2 points of required threshold',
            'Data Mining — Automatically gains +1 Intel on successful Tech missions',
            'Quick Reflexes — +1 to first action each mission',
            'Tech Savvy — +2 Tech when working with equipment',
            'Stealthy — Can avoid detection on failed stealth rolls',
            'Combat Veteran — +1 Combat, reduces stress from violence',
            'Social Network — Has contacts in various organizations',
            'Iron Will — Immune to fear and intimidation effects',
            'Lucky — Can reroll one failed die per mission',
            'Inspiring — Nearby allies gain +1 to Will rolls',
            'Medic — Can treat injuries in the field',
            'Linguist — Speaks multiple languages fluently',
            'Marksman — +2 accuracy with ranged weapons',
            'Acrobat — Can navigate difficult terrain easily',
            'Charming — +2 Social when dealing with NPCs'
        ];
        
        this.init();
    }

    init() {
        // Set up NPC state change listeners
        this.gameState.onChange((changes) => {
            if (changes.includes('npcs')) {
                this.updateNPCDisplays();
                this.recalculateTechExpertise();
            }
        });
        
        // Clean up dead NPCs and heal injured ones periodically
        setInterval(() => this.processNPCHealing(), 300000); // Every 5 minutes
    }

    /**
     * Create a new NPC
     */
    createNPC(npcData = {}) {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can create NPCs');
        }
        
        const npc = {
            id: Date.now() + Math.random(),
            name: npcData.name || this.generateRandomName(),
            title: npcData.title || ArrayUtils.random(this.titles),
            ...this.generateOrUseStats(npcData),
            loyalty: npcData.loyalty || MathUtils.randomInt(70, 95),
            injury: npcData.injury || 0,
            stress: npcData.stress || 0,
            rank: npcData.rank || 1,
            trait: npcData.trait || ArrayUtils.random(this.traits),
            equipped_item: npcData.equipped_item || null,
            status: npcData.status || 'available',
            createdAt: Date.now(),
            experience: npcData.experience || 0,
            missions_completed: 0,
            kills: 0,
            saves: 0
        };
        
        // Validate NPC data
        this.validateNPCData(npc);
        
        // Add to NPCs array
        this.gameState.push('npcs', npc);
        
        this.gameState.logActivity(`New NPC recruited: ${npc.name} (${npc.title})`);
        
        return npc;
    }

    /**
     * Create NPC with manual stats input
     */
    createNPCWithDialog() {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can create NPCs');
        }
        
        const name = prompt('NPC Name:');
        if (!name) return null;
        
        const title = prompt('NPC Title/Role:', ArrayUtils.random(this.titles));
        if (!title) return null;
        
        const useCustom = confirm('Use custom stats? (Cancel for random generation)');
        let stats = {};
        
        if (useCustom) {
            stats = {
                skill: this.promptForStat('Skill', 3),
                stealth: this.promptForStat('Stealth', 3),
                combat: this.promptForStat('Combat', 3),
                tech: this.promptForStat('Tech', 3),
                social: this.promptForStat('Social', 3),
                will: this.promptForStat('Will', 3)
            };
        }
        
        const trait = prompt('Special Trait:', ArrayUtils.random(this.traits));
        
        return this.createNPC({
            name: name.trim(),
            title: title.trim(),
            trait: trait || ArrayUtils.random(this.traits),
            ...stats
        });
    }

    /**
     * Quick create random NPC
     */
    quickCreateNPC() {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can create NPCs');
        }
        
        return this.createNPC(); // Uses all random data
    }

    /**
     * Edit existing NPC
     */
    editNPC(npcId) {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can edit NPCs');
        }
        
        const npc = this.getNPC(npcId);
        if (!npc) {
            throw new Error('NPC not found');
        }
        
        // Simple editing through prompts (in a real app, this would be a proper form)
        const newName = prompt('Name:', npc.name);
        const newTitle = prompt('Title:', npc.title);
        const newTrait = prompt('Trait:', npc.trait);
        
        if (newName !== null) npc.name = newName.trim();
        if (newTitle !== null) npc.title = newTitle.trim();
        if (newTrait !== null) npc.trait = newTrait.trim();
        
        // Update stats
        this.statNames.forEach(stat => {
            const newValue = prompt(`${StringUtils.capitalize(stat)} (${npc[stat]}):`, npc[stat]);
            if (newValue !== null) {
                const value = parseInt(newValue);
                if (value >= 1 && value <= 6) {
                    npc[stat] = value;
                }
            }
        });
        
        this.updateNPC(npc);
        this.gameState.logActivity(`NPC edited: ${npc.name}`);
        
        return npc;
    }

    /**
     * Remove NPC
     */
    removeNPC(npcId) {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can remove NPCs');
        }
        
        const npc = this.getNPC(npcId);
        if (!npc) {
            throw new Error('NPC not found');
        }
        
        // Free up any equipment
        if (npc.equipped_item) {
            this.unequipItem(npcId);
        }
        
        // Remove from any missions
        this.removeNPCFromAllMissions(npcId);
        
        // Remove from NPCs array
        const npcs = this.gameState.get('npcs') || [];
        const updatedNPCs = npcs.filter(n => n.id !== npcId);
        this.gameState.set('npcs', updatedNPCs);
        
        this.gameState.logActivity(`NPC removed: ${npc.name}`);
        
        return npc;
    }

    /**
     * Remove selected NPCs
     */
    removeSelectedNPCs() {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can remove NPCs');
        }
        
        const selectedCheckboxes = document.querySelectorAll('.npc-select:checked');
        if (selectedCheckboxes.length === 0) {
            throw new Error('No NPCs selected for removal');
        }
        
        const removedNames = [];
        selectedCheckboxes.forEach(checkbox => {
            const npcId = parseInt(checkbox.dataset.npcId);
            const npc = this.getNPC(npcId);
            if (npc) {
                this.removeNPC(npcId);
                removedNames.push(npc.name);
            }
        });
        
        return removedNames;
    }

    /**
     * Get NPC by ID
     */
    getNPC(npcId) {
        const npcs = this.gameState.get('npcs') || [];
        return npcs.find(npc => npc.id === npcId);
    }

    /**
     * Update NPC data
     */
    updateNPC(updatedNPC) {
        const npcs = this.gameState.get('npcs') || [];
        const npcIndex = npcs.findIndex(npc => npc.id === updatedNPC.id);
        
        if (npcIndex !== -1) {
            npcs[npcIndex] = { ...npcs[npcIndex], ...updatedNPC };
            this.gameState.set('npcs', npcs);
        }
    }

    /**
     * Get NPCs by status
     */
    getNPCsByStatus(status) {
        const npcs = this.gameState.get('npcs') || [];
        return npcs.filter(npc => npc.status === status);
    }

    /**
     * Get available NPCs
     */
    getAvailableNPCs() {
        return this.getNPCsByStatus('available');
    }

    /**
     * Get deployed NPCs
     */
    getDeployedNPCs() {
        return this.getNPCsByStatus('deployed');
    }

    /**
     * Equip item to NPC
     */
    equipItem(npcId, itemId) {
        const npc = this.getNPC(npcId);
        const items = this.gameState.get('items') || [];
        const item = items.find(i => i.id === itemId);
        
        if (!npc) throw new Error('NPC not found');
        if (!item) throw new Error('Item not found');
        
        // Unequip current item if any
        if (npc.equipped_item) {
            this.unequipItem(npcId);
        }
        
        // Equip new item
        npc.equipped_item = itemId;
        this.updateNPC(npc);
        
        this.gameState.logActivity(`${npc.name} equipped ${item.name}`);
        
        return npc;
    }

    /**
     * Unequip item from NPC
     */
    unequipItem(npcId) {
        const npc = this.getNPC(npcId);
        if (!npc) throw new Error('NPC not found');
        
        if (npc.equipped_item) {
            const items = this.gameState.get('items') || [];
            const item = items.find(i => i.id === npc.equipped_item);
            
            npc.equipped_item = null;
            this.updateNPC(npc);
            
            if (item) {
                this.gameState.logActivity(`${npc.name} unequipped ${item.name}`);
            }
        }
        
        return npc;
    }

    /**
     * Calculate NPC's effective stats (including equipment bonuses)
     */
    getEffectiveStats(npcId) {
        const npc = this.getNPC(npcId);
        if (!npc) return null;
        
        const stats = { ...npc };
        
        // Apply equipment bonuses
        if (npc.equipped_item) {
            const items = this.gameState.get('items') || [];
            const item = items.find(i => i.id === npc.equipped_item);
            
            if (item && item.bonus) {
                Object.entries(item.bonus).forEach(([stat, bonus]) => {
                    if (stats[stat] !== undefined) {
                        stats[stat] += bonus;
                    }
                });
            }
        }
        
        return stats;
    }

    /**
     * Calculate total tech expertise from all NPCs
     */
    calculateTotalTechExpertise() {
        const npcs = this.gameState.get('npcs') || [];
        let totalTech = 0;
        
        npcs.forEach(npc => {
            if (npc.status === 'available' || npc.status === 'deployed') {
                const effectiveStats = this.getEffectiveStats(npc.id);
                totalTech += effectiveStats.tech;
            }
        });
        
        return totalTech;
    }

    /**
     * Recalculate technical expertise and update game state
     */
    recalculateTechExpertise() {
        const totalTech = this.calculateTotalTechExpertise();
        this.gameState.set('resources.technical-expertise', totalTech);
    }

    /**
     * Injure NPC
     */
    injureNPC(npcId, injuryAmount = 1) {
        const npc = this.getNPC(npcId);
        if (!npc) return;
        
        npc.injury = Math.min((npc.injury || 0) + injuryAmount, 5);
        
        // Injured NPCs become unavailable
        if (npc.injury >= 3 && npc.status === 'available') {
            npc.status = 'injured';
        }
        
        this.updateNPC(npc);
        this.gameState.logActivity(`${npc.name} injured (injury level: ${npc.injury})`);
    }

    /**
     * Heal NPC
     */
    healNPC(npcId, healAmount = 1) {
        const npc = this.getNPC(npcId);
        if (!npc) return;
        
        npc.injury = Math.max((npc.injury || 0) - healAmount, 0);
        npc.stress = Math.max((npc.stress || 0) - healAmount, 0);
        
        // Healed NPCs become available again
        if (npc.injury < 3 && npc.status === 'injured') {
            npc.status = 'available';
        }
        
        this.updateNPC(npc);
        this.gameState.logActivity(`${npc.name} healed (injury: ${npc.injury}, stress: ${npc.stress})`);
    }

    /**
     * Process automatic NPC healing over time
     */
    processNPCHealing() {
        const npcs = this.gameState.get('npcs') || [];
        
        npcs.forEach(npc => {
            if (npc.injury > 0 || npc.stress > 0) {
                // 10% chance to heal 1 point of injury or stress per cycle
                if (Math.random() < 0.1) {
                    if (npc.injury > 0) {
                        this.healNPC(npc.id, 1);
                    } else if (npc.stress > 0) {
                        npc.stress = Math.max(npc.stress - 1, 0);
                        this.updateNPC(npc);
                    }
                }
            }
        });
    }

    /**
     * Remove NPC from all mission assignments
     */
    removeNPCFromAllMissions(npcId) {
        const assignments = this.gameState.get('missionAssignments') || {};
        
        Object.entries(assignments).forEach(([missionId, assignment]) => {
            if (assignment.assignedNPCs.includes(npcId)) {
                assignment.assignedNPCs = assignment.assignedNPCs.filter(id => id !== npcId);
                
                if (assignment.assignedNPCs.length === 0 && !assignment.playerDoing) {
                    // Mission has no one assigned, make it available again
                    const missions = this.gameState.get('missions') || [];
                    const mission = missions.find(m => m.id == missionId);
                    if (mission) {
                        mission.status = 'available';
                        this.gameState.set('missions', missions);
                    }
                    
                    // Remove the assignment
                    delete assignments[missionId];
                } else {
                    // Update the assignment
                    assignments[missionId] = assignment;
                }
            }
        });
        
        this.gameState.set('missionAssignments', assignments);
    }

    /**
     * Update NPC displays
     */
    updateNPCDisplays() {
        this.updateNPCList();
        this.updatePlayerNPCList();
        this.updateNPCStats();
    }

    /**
     * Update GM NPC list
     */
    updateNPCList() {
        const container = document.getElementById('npcList');
        if (!container) return;
        
        const npcs = this.gameState.get('npcs') || [];
        
        if (npcs.length === 0) {
            container.innerHTML = '<div class="no-npcs">No NPCs recruited yet</div>';
            return;
        }
        
        container.innerHTML = npcs.map(npc => {
            const effectiveStats = this.getEffectiveStats(npc.id);
            const totalStats = this.statNames.reduce((sum, stat) => sum + effectiveStats[stat], 0);
            const statusColor = this.getStatusColor(npc.status);
            
            const equippedItem = npc.equipped_item ? 
                this.getItemName(npc.equipped_item) : null;
            
            return `
                <div class="npc-item" data-npc-id="${npc.id}">
                    <div class="npc-header">
                        <div class="npc-info">
                            <h5 class="npc-name">${npc.name}</h5>
                            <div class="npc-title">${npc.title}</div>
                        </div>
                        <div class="npc-status-info">
                            <span class="npc-status ${npc.status}" style="color: ${statusColor};">${StringUtils.capitalize(npc.status)}</span>
                            <div class="npc-loyalty">Loyalty: ${npc.loyalty}%</div>
                        </div>
                    </div>
                    
                    <div class="npc-stats">
                        <div class="stat-row">
                            <span>SKL: ${effectiveStats.skill}</span>
                            <span>STL: ${effectiveStats.stealth}</span>
                            <span>CMB: ${effectiveStats.combat}</span>
                        </div>
                        <div class="stat-row">
                            <span>TCH: ${effectiveStats.tech}</span>
                            <span>SOC: ${effectiveStats.social}</span>
                            <span>WIL: ${effectiveStats.will}</span>
                        </div>
                        <div class="stat-total">Total: ${totalStats}</div>
                    </div>
                    
                    <div class="npc-trait">${npc.trait}</div>
                    
                    ${equippedItem ? `<div class="npc-equipment">📦 ${equippedItem}</div>` : ''}
                    
                    ${npc.injury > 0 || npc.stress > 0 ? `
                        <div class="npc-condition">
                            ${npc.injury > 0 ? `❤️ Injury: ${npc.injury}` : ''}
                            ${npc.stress > 0 ? `🧠 Stress: ${npc.stress}` : ''}
                        </div>
                    ` : ''}
                    
                    <div class="npc-actions">
                        <input type="checkbox" class="npc-select" data-npc-id="${npc.id}">
                        <button class="quick-btn" onclick="editNPC(${npc.id})">Edit</button>
                        <button class="quick-btn secondary" onclick="manageNPCEquipment(${npc.id})">Equipment</button>
                        ${npc.injury > 0 ? `<button class="quick-btn" onclick="healNPC(${npc.id})">Heal</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update player NPC list
     */
    updatePlayerNPCList() {
        const container = document.getElementById('playerNPCList');
        if (!container) return;
        
        const availableNPCs = this.getAvailableNPCs();
        
        if (availableNPCs.length === 0) {
            container.innerHTML = '<div class="no-npcs">No NPCs available</div>';
            return;
        }
        
        container.innerHTML = availableNPCs.map(npc => {
            const effectiveStats = this.getEffectiveStats(npc.id);
            
            return `
                <div class="npc-item">
                    <div class="npc-header">
                        <div class="npc-info">
                            <h5 class="npc-name">${npc.name}</h5>
                            <div class="npc-title">${npc.title}</div>
                        </div>
                        <div class="npc-loyalty">Loyalty: ${npc.loyalty}%</div>
                    </div>
                    
                    <div class="npc-stats">
                        <div>Tech: ${effectiveStats.tech} | Stealth: ${effectiveStats.stealth}</div>
                        <div>Combat: ${effectiveStats.combat} | Social: ${effectiveStats.social}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update NPC statistics
     */
    updateNPCStats() {
        const activeElement = document.getElementById('activeNPCCount');
        const techElement = document.getElementById('totalTechFromNPCs');
        const loyaltyElement = document.getElementById('avgLoyalty');
        
        if (!activeElement || !techElement || !loyaltyElement) return;
        
        const npcs = this.gameState.get('npcs') || [];
        const activeNPCs = npcs.filter(npc => npc.status === 'available' || npc.status === 'deployed');
        const totalTech = this.calculateTotalTechExpertise();
        const avgLoyalty = npcs.length > 0 ? 
            Math.round(npcs.reduce((sum, npc) => sum + npc.loyalty, 0) / npcs.length) : 0;
        
        activeElement.textContent = activeNPCs.length;
        techElement.textContent = totalTech;
        loyaltyElement.textContent = avgLoyalty + '%';
    }

    /**
     * Generate random name
     */
    generateRandomName() {
        const firstName = ArrayUtils.random(this.firstNames);
        const lastName = ArrayUtils.random(this.lastNames);
        return `${firstName} ${lastName}`;
    }

    /**
     * Generate or use provided stats
     */
    generateOrUseStats(data) {
        const stats = {};
        
        this.statNames.forEach(stat => {
            if (data[stat] !== undefined) {
                stats[stat] = Math.max(1, Math.min(6, parseInt(data[stat])));
            } else {
                stats[stat] = MathUtils.randomInt(2, 5); // Random 2-5
            }
        });
        
        return stats;
    }

    /**
     * Prompt for stat value
     */
    promptForStat(statName, defaultValue) {
        const value = prompt(`${statName} (1-6):`, defaultValue);
        const parsed = parseInt(value);
        return (parsed >= 1 && parsed <= 6) ? parsed : defaultValue;
    }

    /**
     * Get status color
     */
    getStatusColor(status) {
        const colors = {
            'available': 'var(--green)',
            'deployed': 'var(--gold)',
            'injured': 'var(--red)',
            'dead': 'var(--text-muted)'
        };
        return colors[status] || 'var(--text-secondary)';
    }

    /**
     * Get item name by ID
     */
    getItemName(itemId) {
        const items = this.gameState.get('items') || [];
        const item = items.find(i => i.id === itemId);
        return item ? item.name : 'Unknown Item';
    }

    /**
     * Validate NPC data
     */
    validateNPCData(npc) {
        if (!npc.name || npc.name.trim().length < 2) {
            throw new Error('Invalid NPC name');
        }
        
        this.statNames.forEach(stat => {
            if (!ValidationUtils.isInRange(npc[stat], 1, 6)) {
                throw new Error(`Invalid ${stat} value: must be 1-6`);
            }
        });
        
        if (!ValidationUtils.isInRange(npc.loyalty, 0, 100)) {
            throw new Error('Invalid loyalty value: must be 0-100');
        }
        
        if (!this.statusTypes.includes(npc.status)) {
            throw new Error('Invalid status type');
        }
    }

    /**
     * Get NPC statistics for reporting
     */
    getNPCStatistics() {
        const npcs = this.gameState.get('npcs') || [];
        
        return {
            total: npcs.length,
            byStatus: ArrayUtils.groupBy(npcs, 'status'),
            averageStats: this.calculateAverageStats(npcs),
            totalTechExpertise: this.calculateTotalTechExpertise(),
            averageLoyalty: npcs.length > 0 ? 
                Math.round(npcs.reduce((sum, npc) => sum + npc.loyalty, 0) / npcs.length) : 0,
            injured: npcs.filter(npc => npc.injury > 0).length,
            stressed: npcs.filter(npc => npc.stress > 0).length
        };
    }

    /**
     * Calculate average stats across all NPCs
     */
    calculateAverageStats(npcs) {
        if (npcs.length === 0) return {};
        
        const averages = {};
        
        this.statNames.forEach(stat => {
            const total = npcs.reduce((sum, npc) => sum + (npc[stat] || 0), 0);
            averages[stat] = Math.round((total / npcs.length) * 100) / 100;
        });
        
        return averages;
    }

    /**
     * Export NPCs for backup
     */
    exportNPCs() {
        return {
            npcs: this.gameState.get('npcs') || [],
            items: this.gameState.get('items') || [],
            timestamp: Date.now()
        };
    }

    /**
     * Import NPCs from backup
     */
    importNPCs(data) {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can import NPCs');
        }
        
        if (data.npcs) {
            // Validate each NPC before importing
            data.npcs.forEach(npc => this.validateNPCData(npc));
            this.gameState.set('npcs', data.npcs);
        }
        
        if (data.items) {
            this.gameState.set('items', data.items);
        }
        
        this.gameState.logActivity('NPCs imported from backup');
    }
}

export default NPCManager;
