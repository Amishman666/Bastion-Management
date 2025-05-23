// js/sections.js - Section Management Module

import { MathUtils, TimeUtils, ArrayUtils } from './utils.js';

export class SectionManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.sectionStates = ['damaged', 'cleaning', 'cleaned', 'online'];
        this.pathTypes = ['research', 'offensive', 'defensive'];
        
        // Section data will be loaded from external file or default
        this.sectionsData = null;
        
        this.init();
    }

    async init() {
        // Load sections data
        await this.loadSectionsData();
        
        // Set up state change listeners
        this.gameState.onChange((changes) => {
            if (changes.includes('sectionStates') || changes.includes('upgrades') || changes.includes('cleaningTimers')) {
                this.updateSectionDisplays();
            }
        });
    }

    /**
     * Load sections data from external source or use default
     */
    async loadSectionsData() {
        try {
            const response = await fetch('data/sections.json');
            if (response.ok) {
                this.sectionsData = await response.json();
            } else {
                throw new Error('Failed to load sections data');
            }
        } catch (error) {
            console.warn('Loading default sections data:', error);
            this.sectionsData = this.getDefaultSectionsData();
        }
    }

    /**
     * Get default sections data (fallback)
     */
    getDefaultSectionsData() {
        return {
            luminarium: {
                title: "🏛️ Luminarium",
                description: "Main Power Generator",
                paths: {
                    research: [
                        { name: "Pulse Harmonization", description: "Increases efficiency of all other sections by 10% when fully operational.", cost: { 'celestial-power': 100, 'technical-expertise': 2 } },
                        { name: "Celestial Mapping", description: "Tracks divine energy sources throughout the cosmos.", cost: { 'celestial-power': 150, 'runic-shards': 3 } },
                        { name: "Grace Recycling", description: "Recovers spent grace for reuse in critical systems.", cost: { 'celestial-power': 200, 'divine-essence': 1 } }
                    ],
                    offensive: [
                        { name: "Radiant Overcharge", description: "Once per day, release a radiant pulse that deals light damage to all enemies.", cost: { 'celestial-power': 120, 'celestial-silver': 50 } },
                        { name: "Focused Beam", description: "Channel concentrated energy into a devastating attack against a single target.", cost: { 'celestial-power': 180, 'runic-shards': 4 } },
                        { name: "Grace Storm", description: "Create a field of wild grace energy that disrupts magical effects.", cost: { 'celestial-power': 250, 'divine-essence': 2 } }
                    ],
                    defensive: [
                        { name: "Failsafe Core", description: "Prevents total Bastion failure once per major event.", cost: { 'celestial-power': 200, 'technical-expertise': 3 } },
                        { name: "Adaptive Shielding", description: "Automatically adjusts defenses based on incoming threats.", cost: { 'celestial-power': 300, 'runic-shards': 5 } },
                        { name: "Dimensional Anchor", description: "Prevents forced translocation of the Bastion.", cost: { 'celestial-power': 400, 'divine-essence': 3 } }
                    ]
                }
            },
            sanctum: {
                title: "⛪ Sanctum",
                description: "Purification & Spiritual Focus",
                paths: {
                    research: [
                        { name: "Soul Resonance Mapping", description: "Grants insight into corrupted items or beings.", cost: { 'celestial-power': 80, 'divine-essence': 1 } },
                        { name: "Divine Communion", description: "Establish temporary communication with higher divine powers.", cost: { 'celestial-power': 150, 'divine-essence': 2 } },
                        { name: "Ethereal Perception", description: "Detect spiritual anomalies across dimensional boundaries.", cost: { 'celestial-power': 200, 'runic-shards': 3 } }
                    ],
                    offensive: [
                        { name: "Judgment Flare", description: "Empower allies to deal radiant damage when fighting corrupted foes.", cost: { 'celestial-power': 100, 'celestial-silver': 40 } },
                        { name: "Banishment Wave", description: "Force extraplanar entities back to their native dimensions.", cost: { 'celestial-power': 180, 'divine-essence': 2 } },
                        { name: "Purifying Flame", description: "Create weapons of pure spiritual energy.", cost: { 'celestial-power': 250, 'divine-essence': 3 } }
                    ],
                    defensive: [
                        { name: "Sacred Veil", description: "Aura around the Sanctum slowly purifies corruption in adjacent areas.", cost: { 'celestial-power': 120, 'runic-shards': 2 } },
                        { name: "Spiritual Barrier", description: "Block attempts at spiritual invasion or possession.", cost: { 'celestial-power': 200, 'divine-essence': 2 } },
                        { name: "Blessing of Protection", description: "Grant allies temporary immunity to corruption.", cost: { 'celestial-power': 300, 'divine-essence': 4 } }
                    ]
                }
            },
            wards: {
                title: "🛡️ Wards",
                description: "Defensive Matrix",
                paths: {
                    research: [
                        { name: "Sigil Scripting", description: "Inscribe temporary protective runes before dangerous missions.", cost: { 'celestial-power': 90, 'technical-expertise': 2 } },
                        { name: "Breach Analysis", description: "When wards are compromised, gain perfect understanding of the method used.", cost: { 'celestial-power': 160, 'runic-shards': 3 } },
                        { name: "Reactive Mathematics", description: "Defensive formulas that adapt to new threats.", cost: { 'celestial-power': 220, 'technical-expertise': 4 } }
                    ],
                    offensive: [
                        { name: "Heaven's Volley", description: "Install celestial cannon arrays on the Bastion.", cost: { 'celestial-power': 150, 'celestial-silver': 60 } },
                        { name: "Counter-Sigils", description: "When defensive wards are struck, they reflect a portion of the attack.", cost: { 'celestial-power': 200, 'runic-shards': 4 } },
                        { name: "Binding Protocols", description: "Create temporary fields that restrict movement and abilities.", cost: { 'celestial-power': 280, 'divine-essence': 2 } }
                    ],
                    defensive: [
                        { name: "Layered Shielding", description: "Enhances physical and magical ward structures.", cost: { 'celestial-power': 140, 'technical-expertise': 3 } },
                        { name: "Phasing Barriers", description: "Defenses exist partially out of phase.", cost: { 'celestial-power': 220, 'runic-shards': 5 } },
                        { name: "Bastion Memory", description: "The structure 'remembers' previous attacks.", cost: { 'celestial-power': 350, 'divine-essence': 3 } }
                    ]
                }
            },
            throne: {
                title: "👑 Throne Room",
                description: "Command Center",
                paths: {
                    research: [
                        { name: "Battle Archives", description: "Gain tactical insights post-battle.", cost: { 'celestial-power': 100, 'technical-expertise': 2 } },
                        { name: "Strategic Modeling", description: "Create magical simulations to test tactics.", cost: { 'celestial-power': 180, 'runic-shards': 3 } },
                        { name: "Command Linguistics", description: "Enhanced communication with allies across vast distances.", cost: { 'celestial-power': 240, 'divine-essence': 2 } }
                    ],
                    offensive: [
                        { name: "Battle Synchrony", description: "Designate one mission per week as 'coordinated'.", cost: { 'celestial-power': 120, 'celestial-silver': 50 } },
                        { name: "Command Authority", description: "Voice carries supernatural weight.", cost: { 'celestial-power': 200, 'divine-essence': 2 } },
                        { name: "Tactical Inspiration", description: "Grant allies an unexpected second wind.", cost: { 'celestial-power': 300, 'divine-essence': 3 } }
                    ],
                    defensive: [
                        { name: "Iron Mandate", description: "Enemies attempting to sabotage command face higher resistance.", cost: { 'celestial-power': 110, 'technical-expertise': 2 } },
                        { name: "Protected Awareness", description: "Command staff cannot be magically scried upon.", cost: { 'celestial-power': 190, 'runic-shards': 4 } },
                        { name: "Contingency Protocols", description: "If command is compromised, automated systems maintain basic functions.", cost: { 'celestial-power': 280, 'technical-expertise': 5 } }
                    ]
                }
            },
            gateway: {
                title: "🌀 Gateway",
                description: "Teleportation Hub",
                paths: {
                    research: [
                        { name: "Harmonic Coordinates", description: "Unlock hidden realms or rare mission sites.", cost: { 'celestial-power': 130, 'runic-shards': 3 } },
                        { name: "Sympathetic Mapping", description: "After visiting a location once, can return with perfect accuracy.", cost: { 'celestial-power': 200, 'technical-expertise': 3 } },
                        { name: "Beacon Understanding", description: "Ability to analyze and potentially replicate transportation methods.", cost: { 'celestial-power': 270, 'divine-essence': 2 } }
                    ],
                    offensive: [
                        { name: "Tactical Insertion", description: "Once per session, deploy a team directly into a known hostile location.", cost: { 'celestial-power': 160, 'celestial-silver': 70 } },
                        { name: "Portal Strike", description: "Open momentary gateways to launch attacks from unexpected angles.", cost: { 'celestial-power': 230, 'runic-shards': 4 } },
                        { name: "Dimensional Shear", description: "Create unstable planar intersections that damage creatures.", cost: { 'celestial-power': 320, 'divine-essence': 3 } }
                    ],
                    defensive: [
                        { name: "Interdiction Array", description: "Nullifies teleportation-based infiltration attempts.", cost: { 'celestial-power': 150, 'technical-expertise': 3 } },
                        { name: "Escape Protocols", description: "In dire emergencies, automatically evacuates critical personnel.", cost: { 'celestial-power': 220, 'runic-shards': 5 } },
                        { name: "Planar Anchoring", description: "Stabilizes local reality, preventing dimensional manipulation.", cost: { 'celestial-power': 350, 'divine-essence': 4 } }
                    ]
                }
            },
            fountain: {
                title: "⛲ Fountain of Grace",
                description: "Healing Center",
                paths: {
                    research: [
                        { name: "Graceflow Optimization", description: "Increases passive generation of celestial silver and healing effectiveness.", cost: { 'celestial-power': 110, 'technical-expertise': 2 } },
                        { name: "Essence Analysis", description: "Identify the nature and source of injuries or afflictions.", cost: { 'celestial-power': 170, 'divine-essence': 1 } },
                        { name: "Resurrection Protocols", description: "Establish foundation for potential revival of fatally wounded allies.", cost: { 'celestial-power': 300, 'divine-essence': 4 } }
                    ],
                    offensive: [
                        { name: "Blessing Surge", description: "Store divine interventions for use in dire situations.", cost: { 'celestial-power': 140, 'celestial-silver': 60 } },
                        { name: "Purifying Cascade", description: "Transform fountain energies into damaging wave against unholy entities.", cost: { 'celestial-power': 210, 'divine-essence': 2 } },
                        { name: "Lifeforce Manipulation", description: "Temporarily enhance allies' physical capabilities beyond normal limits.", cost: { 'celestial-power': 290, 'divine-essence': 3 } }
                    ],
                    defensive: [
                        { name: "Aegis Misting", description: "Emergency regenerative mist healing allies in adjacent sections.", cost: { 'celestial-power': 120, 'runic-shards': 3 } },
                        { name: "Stasis Field", description: "Preserve critically wounded in suspended animation.", cost: { 'celestial-power': 200, 'technical-expertise': 4 } },
                        { name: "Vitality Shield", description: "Convert incoming damage to healing energy with diminishing returns.", cost: { 'celestial-power': 320, 'divine-essence': 4 } }
                    ]
                }
            }
        };
    }

    /**
     * Get section data
     */
    getSection(sectionId) {
        return this.sectionsData?.[sectionId] || null;
    }

    /**
     * Get section state
     */
    getSectionState(sectionId) {
        return this.gameState.get(`sectionStates.${sectionId}`) || 'damaged';
    }

    /**
     * Set section state
     */
    setSectionState(sectionId, state) {
        if (!this.sectionStates.includes(state)) {
            throw new Error(`Invalid section state: ${state}`);
        }
        
        this.gameState.set(`sectionStates.${sectionId}`, state);
        this.gameState.logActivity(`Section ${sectionId} state changed to ${state}`);
    }

    /**
     * Get completed upgrades for a section
     */
    getCompletedUpgrades(sectionId, pathType = null) {
        if (pathType) {
            return this.gameState.get(`upgrades.${sectionId}.${pathType}`) || [];
        } else {
            return this.gameState.get(`upgrades.${sectionId}`) || {
                research: [],
                offensive: [],
                defensive: []
            };
        }
    }

    /**
     * Purchase upgrade
     */
    purchaseUpgrade(sectionId, pathType, upgradeIndex) {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can purchase upgrades');
        }
        
        // Check if section is online
        if (this.getSectionState(sectionId) !== 'online') {
            throw new Error(`${sectionId} must be online before upgrades can be purchased`);
        }
        
        const section = this.getSection(sectionId);
        if (!section) {
            throw new Error(`Section ${sectionId} not found`);
        }
        
        const upgrade = section.paths[pathType]?.[upgradeIndex];
        if (!upgrade) {
            throw new Error('Upgrade not found');
        }
        
        // Check if already completed
        const completedUpgrades = this.getCompletedUpgrades(sectionId, pathType);
        if (completedUpgrades.includes(upgradeIndex)) {
            throw new Error('Upgrade already completed');
        }
        
        // Check if can afford
        if (!this.gameState.resources?.canAfford(upgrade.cost)) {
            const missing = this.gameState.resources?.getMissingResources(upgrade.cost);
            throw new Error(`Insufficient resources. Missing: ${this.formatResources(missing)}`);
        }
        
        // Spend resources
        this.gameState.resources?.spendResources(upgrade.cost, `Upgrade: ${upgrade.name}`);
        
        // Add upgrade to completed list
        const updatedUpgrades = [...completedUpgrades, upgradeIndex];
        this.gameState.set(`upgrades.${sectionId}.${pathType}`, updatedUpgrades);
        
        this.gameState.logActivity(`Upgrade purchased: ${upgrade.name} (${sectionId} ${pathType})`);
        
        return upgrade;
    }

    /**
     * Request upgrade (for players)
     */
    requestUpgrade(sectionId, pathType, upgradeIndex) {
        const section = this.getSection(sectionId);
        const upgrade = section?.paths[pathType]?.[upgradeIndex];
        
        if (!upgrade) {
            throw new Error('Upgrade not found');
        }
        
        this.gameState.logActivity(`${this.gameState.auth?.getCurrentUser()?.username} requested upgrade: ${upgrade.name} (${sectionId} ${pathType})`);
        
        // In a real implementation, this would notify the GM
        return upgrade;
    }

    /**
     * Start cleaning a section
     */
    startCleaning(sectionId, assignedNPCs = [], playerDoing = false) {
        const currentState = this.getSectionState(sectionId);
        
        if (currentState !== 'damaged') {
            throw new Error('Section is not damaged and does not need cleaning');
        }
        
        // Check if player can only clean one section at a time
        if (playerDoing && this.gameState.auth?.getUserRole() === 'player') {
            const activeCleaning = Object.keys(this.gameState.get('cleaningTimers') || {}).length;
            if (activeCleaning >= 1) {
                throw new Error('You can only clean one section at a time');
            }
        }
        
        // Validate assigned NPCs
        if (assignedNPCs.length > 0) {
            const npcs = this.gameState.get('npcs') || [];
            assignedNPCs.forEach(npcId => {
                const npc = npcs.find(n => n.id === npcId);
                if (!npc || npc.status !== 'available') {
                    throw new Error(`NPC ${npcId} is not available for cleaning assignment`);
                }
            });
        }
        
        // Update section state
        this.setSectionState(sectionId, 'cleaning');
        
        // Create cleaning timer
        const cleaningTimer = {
            startTime: Date.now(),
            assignedNPCs: assignedNPCs,
            playerDoing: playerDoing,
            estimatedCompletion: Date.now() + (72 * 60 * 60 * 1000) // 72 hours
        };
        
        this.gameState.set(`cleaningTimers.${sectionId}`, cleaningTimer);
        
        // Update NPC statuses
        if (assignedNPCs.length > 0) {
            assignedNPCs.forEach(npcId => {
                this.updateNPCStatus(npcId, 'deployed');
            });
        }
        
        this.gameState.logActivity(`Cleaning started on ${sectionId} ${playerDoing ? 'by player' : `by ${assignedNPCs.length} NPCs`}`);
        
        return cleaningTimer;
    }

    /**
     * Complete cleaning (automatic or forced)
     */
    completeCleaning(sectionId) {
        const timer = this.gameState.get(`cleaningTimers.${sectionId}`);
        if (!timer) {
            throw new Error('No cleaning timer found for this section');
        }
        
        // Generate and award random rewards
        const rewards = this.generateCleaningRewards();
        if (Object.keys(rewards).length > 0) {
            this.gameState.resources?.awardResources(rewards, `Cleaning: ${sectionId}`);
        }
        
        // Update section state
        this.setSectionState(sectionId, 'cleaned');
        
        // Free up assigned NPCs
        if (timer.assignedNPCs.length > 0) {
            timer.assignedNPCs.forEach(npcId => {
                this.updateNPCStatus(npcId, 'available');
            });
        }
        
        // Remove timer
        this.gameState.remove('cleaningTimers', (_, key) => key === sectionId);
        
        const rewardText = this.formatResources(rewards);
        this.gameState.logActivity(`${sectionId} cleaning completed - rewards: ${rewardText}`);
        
        return rewards;
    }

    /**
     * Force complete cleaning (GM only)
     */
    forceCompleteCleaning(sectionId) {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can force complete cleaning');
        }
        
        return this.completeCleaning(sectionId);
    }

    /**
     * Repair section
     */
    repairSection(sectionId) {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can repair sections');
        }
        
        const currentState = this.getSectionState(sectionId);
        if (currentState !== 'cleaned') {
            throw new Error('Section must be cleaned before it can be repaired');
        }
        
        const repairCosts = this.gameState.get(`sectionRepairCosts.${sectionId}`);
        if (!repairCosts) {
            throw new Error(`No repair costs defined for section ${sectionId}`);
        }
        
        // Check if can afford repair
        if (!this.gameState.resources?.canAfford(repairCosts)) {
            const missing = this.gameState.resources?.getMissingResources(repairCosts);
            throw new Error(`Insufficient resources for repair. Missing: ${this.formatResources(missing)}`);
        }
        
        // Spend resources
        this.gameState.resources?.spendResources(repairCosts, `Repair: ${sectionId}`);
        
        // Add permanent celestial power drain
        const powerCost = repairCosts['celestial-power'] || 0;
        const powerDrain = powerCost * 0.1; // 10% of power cost becomes permanent drain
        const currentDrain = this.gameState.get('currentCelestialPowerDrain') || 0;
        this.gameState.set('currentCelestialPowerDrain', currentDrain + powerDrain);
        
        // Update section state
        this.setSectionState(sectionId, 'online');
        
        this.gameState.logActivity(`Section ${sectionId} repaired and brought online`);
        
        return repairCosts;
    }

    /**
     * Damage section (GM event)
     */
    damageSection(sectionId) {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can damage sections');
        }
        
        const currentState = this.getSectionState(sectionId);
        if (currentState === 'damaged') {
            throw new Error('Section is already damaged');
        }
        
        // If section is being cleaned, cancel the cleaning
        if (currentState === 'cleaning') {
            const timer = this.gameState.get(`cleaningTimers.${sectionId}`);
            if (timer && timer.assignedNPCs.length > 0) {
                timer.assignedNPCs.forEach(npcId => {
                    this.updateNPCStatus(npcId, 'available');
                });
            }
            this.gameState.remove('cleaningTimers', (_, key) => key === sectionId);
        }
        
        this.setSectionState(sectionId, 'damaged');
        this.gameState.logActivity(`Section ${sectionId} damaged by GM event`);
    }

    /**
     * Emergency repair all sections
     */
    repairAllSections() {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can perform emergency repairs');
        }
        
        const sectionIds = Object.keys(this.sectionsData || {});
        const cleanedSections = sectionIds.filter(id => this.getSectionState(id) === 'cleaned');
        
        if (cleanedSections.length === 0) {
            throw new Error('No sections are ready for repair');
        }
        
        // Calculate total cost
        let totalCost = {};
        cleanedSections.forEach(sectionId => {
            const costs = this.gameState.get(`sectionRepairCosts.${sectionId}`) || {};
            Object.entries(costs).forEach(([resource, amount]) => {
                totalCost[resource] = (totalCost[resource] || 0) + amount;
            });
        });
        
        // Check if can afford total cost
        if (!this.gameState.resources?.canAfford(totalCost)) {
            const missing = this.gameState.resources?.getMissingResources(totalCost);
            throw new Error(`Insufficient resources for emergency repairs. Missing: ${this.formatResources(missing)}`);
        }
        
        // Repair all sections
        const repairedSections = [];
        cleanedSections.forEach(sectionId => {
            try {
                this.repairSection(sectionId);
                repairedSections.push(sectionId);
            } catch (error) {
                console.error(`Failed to repair ${sectionId}:`, error);
            }
        });
        
        this.gameState.logActivity(`Emergency repairs completed on ${repairedSections.length} sections`);
        
        return repairedSections;
    }

    /**
     * Damage random section (GM event)
     */
    damageRandomSection() {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can damage sections');
        }
        
        const sectionIds = Object.keys(this.sectionsData || {});
        const onlineSections = sectionIds.filter(id => this.getSectionState(id) === 'online');
        
        if (onlineSections.length === 0) {
            throw new Error('No online sections to damage');
        }
        
        const randomSection = ArrayUtils.random(onlineSections);
        this.damageSection(randomSection);
        
        return randomSection;
    }

    /**
     * Generate cleaning rewards
     */
    generateCleaningRewards() {
        const rewardRanges = this.gameState.get('cleaningRewardRanges') || {
            'celestial-silver': { min: 10, max: 25 },
            'runic-shards': { min: 1, max: 3 }
        };
        
        const rewards = {};
        Object.entries(rewardRanges).forEach(([resource, range]) => {
            const amount = MathUtils.randomInt(range.min, range.max);
            rewards[resource] = amount;
        });
        
        return rewards;
    }

    /**
     * Check for completed cleaning operations
     */
    checkCleaningCompletion() {
        const cleaningTimers = this.gameState.get('cleaningTimers') || {};
        
        Object.keys(cleaningTimers).forEach(sectionId => {
            const timer = cleaningTimers[sectionId];
            const timeRemaining = TimeUtils.getTimeRemaining(timer.startTime, 72);
            
            if (timeRemaining === 0) {
                this.completeCleaning(sectionId);
            }
        });
    }

    /**
     * Initialize sections display
     */
    initializeSections() {
        if (window.sectionCardManager && this.sectionsData) {
            const container = document.getElementById('sectionsContainer');
            const userRole = this.gameState.auth?.getUserRole();
            
            window.sectionCardManager.initialize(this.sectionsData, container, userRole);
        }
    }

    /**
     * Update section displays
     */
    updateSectionDisplays() {
        this.updateSectionManagement();
        this.updatePlayerCleaningOptions();
        
        // Update section cards if manager is available
        if (window.sectionCardManager) {
            window.sectionCardManager.refreshAllSections();
        }
    }

    /**
     * Update GM section management display
     */
    updateSectionManagement() {
        const container = document.getElementById('sectionManagement');
        if (!container || !this.sectionsData) return;
        
        const sectionIds = Object.keys(this.sectionsData);
        
        container.innerHTML = sectionIds.map(sectionId => {
            const state = this.getSectionState(sectionId);
            const stateColor = this.getStateColor(state);
            const stateText = this.getStateText(state);
            
            let actionButton = '';
            let timerDisplay = '';
            
            const cleaningTimer = this.gameState.get(`cleaningTimers.${sectionId}`);
            if (cleaningTimer) {
                const remaining = TimeUtils.getTimeRemaining(cleaningTimer.startTime, 72);
                timerDisplay = `<div class="section-timer">Time: ${TimeUtils.formatDuration(remaining)}</div>`;
                
                if (this.gameState.auth?.isGM()) {
                    actionButton = `<button class="quick-btn" onclick="forceCompleteCleaning('${sectionId}')">Force Complete</button>`;
                }
            } else {
                if (state === 'damaged' && this.gameState.auth?.isGM()) {
                    actionButton = `<button class="quick-btn" onclick="startCleaning('${sectionId}', [], false)">Start Cleaning</button>`;
                } else if (state === 'cleaned' && this.gameState.auth?.isGM()) {
                    const costs = this.gameState.get(`sectionRepairCosts.${sectionId}`) || {};
                    const costText = this.formatResources(costs);
                    actionButton = `
                        <div class="repair-cost">Cost: ${costText}</div>
                        <button class="quick-btn" onclick="repairSection('${sectionId}')">Repair</button>
                    `;
                }
            }
            
            return `
                <div class="section-item">
                    <div class="section-info">
                        <div class="section-name">${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}</div>
                        <div class="section-state" style="color: ${stateColor};">${stateText}</div>
                        ${timerDisplay}
                    </div>
                    <div class="section-actions">
                        ${actionButton}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update player cleaning options
     */
    updatePlayerCleaningOptions() {
        const container = document.getElementById('playerCleaningOptions');
        if (!container || !this.sectionsData || this.gameState.auth?.getUserRole() !== 'player') return;
        
        const damagedSections = Object.keys(this.sectionsData).filter(id => this.getSectionState(id) === 'damaged');
        const activeCleaning = Object.keys(this.gameState.get('cleaningTimers') || {}).length;
        
        if (activeCleaning >= 1) {
            container.innerHTML = '<div class="no-actions">You can only clean one section at a time</div>';
            return;
        }
        
        if (damagedSections.length === 0) {
            container.innerHTML = '<div class="no-actions">All sections are clean!</div>';
            return;
        }
        
        container.innerHTML = damagedSections.map(sectionId => `
            <div class="action-option">
                <div class="action-option-header">
                    <div class="action-option-title">${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}</div>
                    <div class="action-option-status">Cleaning duration: 72 hours</div>
                </div>
                <div class="action-option-buttons">
                    <button class="quick-btn" onclick="playerStartCleaning('${sectionId}', true)">Do Myself</button>
                    <button class="quick-btn secondary" onclick="showNPCAssignmentModal('${sectionId}')">Assign NPCs</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update NPC status
     */
    updateNPCStatus(npcId, status) {
        const npcs = this.gameState.get('npcs') || [];
        const npcIndex = npcs.findIndex(npc => npc.id === npcId);
        
        if (npcIndex !== -1) {
            npcs[npcIndex].status = status;
            this.gameState.set('npcs', npcs);
        }
    }

    /**
     * Get state color
     */
    getStateColor(state) {
        const colors = {
            'damaged': 'var(--red)',
            'cleaning': 'var(--gold)',
            'cleaned': 'var(--cyan)',
            'online': 'var(--green)'
        };
        return colors[state] || 'var(--text-secondary)';
    }

    /**
     * Get state text
     */
    getStateText(state) {
        const texts = {
            'damaged': 'DAMAGED - Needs Cleaning',
            'cleaning': 'CLEANING - In Progress',
            'cleaned': 'CLEANED - Needs Repair',
            'online': 'ONLINE - Ready for Upgrades'
        };
        return texts[state] || 'UNKNOWN';
    }

    /**
     * Format resources for display
     */
    formatResources(resources) {
        if (!resources || Object.keys(resources).length === 0) {
            return 'None';
        }
        
        const resourceIcons = {
            'celestial-power': '⚡',
            'celestial-silver': '🥈',
            'runic-shards': '💎',
            'divine-essence': '✨',
            'technical-expertise': '🔬'
        };
        
        return Object.entries(resources)
            .filter(([_, amount]) => amount > 0)
            .map(([resource, amount]) => {
                const icon = resourceIcons[resource] || '';
                return `${icon}${amount}`;
            })
            .join(', ');
    }

    /**
     * Get section statistics
     */
    getSectionStatistics() {
        if (!this.sectionsData) return {};
        
        const sectionIds = Object.keys(this.sectionsData);
        const stateCount = {};
        
        this.sectionStates.forEach(state => {
            stateCount[state] = sectionIds.filter(id => this.getSectionState(id) === state).length;
        });
        
        // Calculate total upgrades
        let totalUpgrades = 0;
        let completedUpgrades = 0;
        
        sectionIds.forEach(sectionId => {
            const section = this.sectionsData[sectionId];
            const sectionUpgrades = Object.values(section.paths).reduce((sum, path) => sum + path.length, 0);
            totalUpgrades += sectionUpgrades;
            
            const completed = Object.values(this.getCompletedUpgrades(sectionId)).reduce((sum, upgrades) => sum + upgrades.length, 0);
            completedUpgrades += completed;
        });
        
        return {
            totalSections: sectionIds.length,
            stateCount,
            totalUpgrades,
            completedUpgrades,
            upgradeProgress: totalUpgrades > 0 ? MathUtils.percentage(completedUpgrades, totalUpgrades) : 0,
            powerEfficiency: this.gameState.resources?.getPowerEfficiency() || 0
        };
    }
}

export default SectionManager;
