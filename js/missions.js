// js/missions.js - Mission Management Module

import { ValidationUtils, StringUtils, ArrayUtils } from './utils.js';

export class MissionManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.missionTypes = ['Stealth', 'Combat', 'Tech', 'Social', 'Research', 'Mixed'];
        this.missionStatuses = ['available', 'in-progress', 'completed', 'failed'];
        this.difficultyLevels = ['Easy', 'Medium', 'Hard', 'Extreme'];
        
        this.init();
    }

    init() {
        // Set up mission state change listeners
        this.gameState.onChange((changes) => {
            if (changes.includes('missions') || changes.includes('missionAssignments')) {
                this.updateMissionDisplays();
            }
        });
        
        // Clean up expired missions periodically
        setInterval(() => this.cleanupExpiredMissions(), 300000); // Every 5 minutes
    }

    /**
     * Create a new mission
     */
    createMission(missionData) {
        // Validate mission data
        this.validateMissionData(missionData);
        
        const mission = {
            id: Date.now() + Math.random(), // Ensure uniqueness
            title: StringUtils.truncate(missionData.title.trim(), 100),
            type: missionData.type || 'Mixed',
            description: StringUtils.truncate(missionData.description.trim(), 1000),
            difficulty: missionData.difficulty || 'Medium',
            duration: missionData.duration || '2-3 days',
            status: 'available',
            createdAt: Date.now(),
            createdBy: this.gameState.auth?.getCurrentUser()?.username || 'system',
            requirements: missionData.requirements || {},
            rewards: missionData.rewards || {},
            consequences: missionData.consequences || {},
            tags: missionData.tags || [],
            priority: missionData.priority || 'normal'
        };
        
        // Add to missions array
        this.gameState.push('missions', mission);
        
        // Log activity
        this.gameState.logActivity(`New mission created: ${mission.title}`);
        
        return mission;
    }

    /**
     * Create enhanced mission from form data
     */
    createEnhancedMission() {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can create missions');
        }
        
        const title = document.getElementById('mission-title')?.value?.trim();
        const type = document.getElementById('mission-type')?.value;
        const description = document.getElementById('mission-description')?.value?.trim();
        
        // Get reward values
        const rewards = {};
        const celestialSilver = parseInt(document.getElementById('reward-celestial-silver')?.value) || 0;
        const runicShards = parseInt(document.getElementById('reward-runic-shards')?.value) || 0;
        const divineEssence = parseInt(document.getElementById('reward-divine-essence')?.value) || 0;
        
        if (celestialSilver > 0) rewards['celestial-silver'] = celestialSilver;
        if (runicShards > 0) rewards['runic-shards'] = runicShards;
        if (divineEssence > 0) rewards['divine-essence'] = divineEssence;
        
        if (!title || !description) {
            throw new Error('Please fill in title and description');
        }
        
        const mission = this.createMission({
            title,
            type,
            description,
            rewards
        });
        
        // Clear form
        this.clearMissionForm();
        
        return mission;
    }

    /**
     * Assign mission to player or NPCs
     */
    assignMission(missionId, assignmentData) {
        const mission = this.getMission(missionId);
        if (!mission) {
            throw new Error('Mission not found');
        }
        
        if (mission.status !== 'available') {
            throw new Error('Mission is not available for assignment');
        }
        
        // Validate assignment
        this.validateMissionAssignment(assignmentData);
        
        const assignment = {
            missionId: missionId,
            assignedNPCs: assignmentData.assignedNPCs || [],
            playerDoing: assignmentData.playerDoing || false,
            startTime: Date.now(),
            assignedBy: this.gameState.auth?.getCurrentUser()?.username || 'system',
            estimatedCompletion: this.calculateEstimatedCompletion(mission, assignmentData)
        };
        
        // Update mission status
        this.updateMissionStatus(missionId, 'in-progress');
        
        // Store assignment
        this.gameState.set(`missionAssignments.${missionId}`, assignment);
        
        // Update NPC statuses
        if (assignment.assignedNPCs.length > 0) {
            assignment.assignedNPCs.forEach(npcId => {
                this.updateNPCStatus(npcId, 'deployed');
            });
        }
        
        this.gameState.logActivity(`Mission assigned: ${mission.title} ${assignment.playerDoing ? '(by player)' : `(NPCs: ${assignment.assignedNPCs.length})`}`);
        
        return assignment;
    }

    /**
     * Resolve mission with outcome
     */
    resolveMission(missionId, outcome, notes = '') {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can resolve missions');
        }
        
        const mission = this.getMission(missionId);
        if (!mission) {
            throw new Error('Mission not found');
        }
        
        const assignment = this.getMissionAssignment(missionId);
        if (!assignment) {
            throw new Error('Mission assignment not found');
        }
        
        // Validate outcome
        const validOutcomes = ['failure', 'partial', 'success', 'perfect'];
        if (!validOutcomes.includes(outcome)) {
            throw new Error(`Invalid outcome: ${outcome}`);
        }
        
        // Calculate rewards based on outcome
        const rewardMultipliers = {
            failure: 0,
            partial: 0.5,
            success: 1.0,
            perfect: 1.5
        };
        
        const multiplier = rewardMultipliers[outcome];
        const appliedRewards = this.calculateMissionRewards(mission, multiplier);
        
        // Apply rewards
        if (Object.keys(appliedRewards).length > 0) {
            this.gameState.resources?.awardResources(appliedRewards, `Mission: ${mission.title}`);
        }
        
        // Handle consequences and NPC effects
        this.applyMissionConsequences(mission, assignment, outcome);
        
        // Update mission status
        this.updateMissionStatus(missionId, outcome === 'failure' ? 'failed' : 'completed');
        
        // Free up NPCs
        this.freeMissionNPCs(assignment);
        
        // Remove assignment
        this.gameState.remove('missionAssignments', (_, key) => key === missionId.toString());
        
        // Add completion data
        mission.completedAt = Date.now();
        mission.outcome = outcome;
        mission.notes = notes;
        mission.appliedRewards = appliedRewards;
        
        this.gameState.logActivity(`Mission resolved: ${mission.title} - ${StringUtils.capitalize(outcome)} (${this.formatRewards(appliedRewards)})`);
        
        return {
            mission,
            outcome,
            rewards: appliedRewards
        };
    }

    /**
     * Get mission by ID
     */
    getMission(missionId) {
        const missions = this.gameState.get('missions') || [];
        return missions.find(m => m.id == missionId);
    }

    /**
     * Get mission assignment
     */
    getMissionAssignment(missionId) {
        return this.gameState.get(`missionAssignments.${missionId}`);
    }

    /**
     * Update mission status
     */
    updateMissionStatus(missionId, status) {
        const missions = this.gameState.get('missions') || [];
        const missionIndex = missions.findIndex(m => m.id == missionId);
        
        if (missionIndex !== -1) {
            missions[missionIndex].status = status;
            this.gameState.set('missions', missions);
        }
    }

    /**
     * Filter missions
     */
    filterMissions(typeFilter = 'all', statusFilter = 'all') {
        const missions = this.gameState.get('missions') || [];
        
        return missions.filter(mission => {
            const typeMatch = typeFilter === 'all' || mission.type === typeFilter;
            const statusMatch = statusFilter === 'all' || mission.status === statusFilter;
            return typeMatch && statusMatch;
        });
    }

    /**
     * Get available missions for player
     */
    getAvailableMissions() {
        return this.filterMissions('all', 'available');
    }

    /**
     * Get active missions
     */
    getActiveMissions() {
        return this.filterMissions('all', 'in-progress');
    }

    /**
     * Get completed missions
     */
    getCompletedMissions() {
        const completed = this.filterMissions('all', 'completed');
        const failed = this.filterMissions('all', 'failed');
        return [...completed, ...failed];
    }

    /**
     * Calculate mission rewards based on outcome
     */
    calculateMissionRewards(mission, multiplier) {
        const rewards = {};
        
        if (mission.rewards && multiplier > 0) {
            Object.entries(mission.rewards).forEach(([resource, amount]) => {
                rewards[resource] = Math.floor(amount * multiplier);
            });
        }
        
        return rewards;
    }

    /**
     * Apply mission consequences
     */
    applyMissionConsequences(mission, assignment, outcome) {
        // Apply consequences to assigned NPCs
        if (assignment.assignedNPCs.length > 0) {
            assignment.assignedNPCs.forEach(npcId => {
                this.applyNPCConsequences(npcId, mission, outcome);
            });
        }
        
        // Apply consequences to player if they participated
        if (assignment.playerDoing) {
            this.applyPlayerConsequences(mission, outcome);
        }
    }

    /**
     * Apply consequences to NPC
     */
    applyNPCConsequences(npcId, mission, outcome) {
        const npcs = this.gameState.get('npcs') || [];
        const npcIndex = npcs.findIndex(npc => npc.id === npcId);
        
        if (npcIndex === -1) return;
        
        const npc = npcs[npcIndex];
        
        // Apply stress and injury based on outcome
        if (outcome === 'failure') {
            npc.stress = Math.min((npc.stress || 0) + 2, 10);
            if (Math.random() < 0.3) {
                npc.injury = Math.min((npc.injury || 0) + 1, 5);
            }
        } else if (outcome === 'partial') {
            npc.stress = Math.min((npc.stress || 0) + 1, 10);
        }
        
        // Successful missions might improve loyalty slightly
        if (outcome === 'success' || outcome === 'perfect') {
            if (Math.random() < 0.2) {
                npc.loyalty = Math.min((npc.loyalty || 80) + 1, 100);
            }
        }
        
        // Update NPC in game state
        this.gameState.set('npcs', npcs);
    }

    /**
     * Apply consequences to player
     */
    applyPlayerConsequences(mission, outcome) {
        // Player consequences could include stress, reputation, etc.
        // For now, just log the participation
        this.gameState.logActivity(`Player participated in mission: ${mission.title} (${outcome})`);
    }

    /**
     * Free NPCs from mission assignment
     */
    freeMissionNPCs(assignment) {
        if (assignment.assignedNPCs.length > 0) {
            assignment.assignedNPCs.forEach(npcId => {
                this.updateNPCStatus(npcId, 'available');
            });
        }
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
     * Calculate estimated completion time
     */
    calculateEstimatedCompletion(mission, assignment) {
        // Base time in hours based on mission type and difficulty
        const baseTimes = {
            'Stealth': { Easy: 24, Medium: 48, Hard: 72, Extreme: 96 },
            'Combat': { Easy: 12, Medium: 24, Hard: 48, Extreme: 72 },
            'Tech': { Easy: 36, Medium: 72, Hard: 120, Extreme: 168 },
            'Social': { Easy: 18, Medium: 36, Hard: 72, Extreme: 120 },
            'Research': { Easy: 48, Medium: 96, Hard: 168, Extreme: 240 },
            'Mixed': { Easy: 24, Medium: 48, Hard: 96, Extreme: 144 }
        };
        
        const baseTime = baseTimes[mission.type]?.[mission.difficulty] || 48;
        
        // Modify based on assignment
        let modifier = 1.0;
        
        if (assignment.playerDoing) {
            modifier *= 0.8; // Player is more efficient
        }
        
        if (assignment.assignedNPCs.length > 0) {
            // More NPCs can reduce time, but with diminishing returns
            const npcBonus = Math.min(assignment.assignedNPCs.length * 0.1, 0.5);
            modifier *= (1 - npcBonus);
        }
        
        const estimatedHours = Math.max(baseTime * modifier, 1);
        return Date.now() + (estimatedHours * 60 * 60 * 1000);
    }

    /**
     * Clear completed missions
     */
    clearCompletedMissions() {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can clear completed missions');
        }
        
        const missions = this.gameState.get('missions') || [];
        const completedCount = missions.filter(m => m.status === 'completed' || m.status === 'failed').length;
        
        if (completedCount === 0) {
            throw new Error('No completed missions to clear');
        }
        
        const activeMissions = missions.filter(m => m.status !== 'completed' && m.status !== 'failed');
        this.gameState.set('missions', activeMissions);
        
        this.gameState.logActivity(`${completedCount} completed missions cleared`);
        return completedCount;
    }

    /**
     * Remove mission
     */
    removeMission(missionId) {
        if (!this.gameState.auth?.isGM()) {
            throw new Error('Only GMs can remove missions');
        }
        
        const mission = this.getMission(missionId);
        if (!mission) {
            throw new Error('Mission not found');
        }
        
        // Free up any assigned NPCs
        const assignment = this.getMissionAssignment(missionId);
        if (assignment) {
            this.freeMissionNPCs(assignment);
            this.gameState.remove('missionAssignments', (_, key) => key === missionId.toString());
        }
        
        // Remove mission
        const missions = this.gameState.get('missions') || [];
        const updatedMissions = missions.filter(m => m.id != missionId);
        this.gameState.set('missions', updatedMissions);
        
        this.gameState.logActivity(`Mission removed: ${mission.title}`);
    }

    /**
     * Clean up expired missions
     */
    cleanupExpiredMissions() {
        const assignments = this.gameState.get('missionAssignments') || {};
        const now = Date.now();
        
        Object.entries(assignments).forEach(([missionId, assignment]) => {
            // Auto-resolve missions that have been running too long (7 days)
            const maxDuration = 7 * 24 * 60 * 60 * 1000;
            if (now - assignment.startTime > maxDuration) {
                console.warn(`Auto-resolving expired mission: ${missionId}`);
                try {
                    this.resolveMission(parseInt(missionId), 'partial', 'Auto-resolved due to time limit');
                } catch (error) {
                    console.error('Failed to auto-resolve mission:', error);
                }
            }
        });
    }

    /**
     * Update mission displays
     */
    updateMissionDisplays() {
        this.updateActiveMissionsList();
        this.updatePlayerMissionOptions();
        this.updateMissionBoard();
        this.updateMissionStats();
    }

    /**
     * Update active missions list (for GM)
     */
    updateActiveMissionsList() {
        const container = document.getElementById('activeMissionsList');
        if (!container) return;
        
        const activeMissions = this.getActiveMissions();
        
        if (activeMissions.length === 0) {
            container.innerHTML = '<div class="no-missions">No active missions</div>';
            return;
        }
        
        container.innerHTML = activeMissions.map(mission => {
            const assignment = this.getMissionAssignment(mission.id);
            const assignmentInfo = assignment ? 
                (assignment.playerDoing ? 'Player assigned' : `${assignment.assignedNPCs.length} NPCs assigned`) : 
                'Unassigned';
            
            const rewardText = this.formatRewards(mission.rewards);
            
            return `
                <div class="mission-item active-mission" data-mission-id="${mission.id}">
                    <div class="mission-content">
                        <div class="mission-header">
                            <input type="checkbox" class="mission-select" data-mission-id="${mission.id}">
                            <div class="mission-info">
                                <h5 class="mission-title">${mission.title}</h5>
                                <div class="mission-meta">
                                    ${mission.type} | ${mission.status} | ${assignmentInfo}
                                </div>
                            </div>
                        </div>
                        <p class="mission-description">${StringUtils.truncate(mission.description, 100)}</p>
                        ${rewardText ? `<div class="mission-rewards">Rewards: ${rewardText}</div>` : ''}
                    </div>
                    <div class="mission-actions">
                        <button class="quick-btn" onclick="resolveSingleMission(${mission.id})">
                            <i class="fas fa-check"></i> Resolve
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update player mission options
     */
    updatePlayerMissionOptions() {
        const container = document.getElementById('playerMissionOptions');
        if (!container) return;
        
        const availableMissions = this.getAvailableMissions();
        
        if (availableMissions.length === 0) {
            container.innerHTML = '<div class="no-missions">No missions available</div>';
            return;
        }
        
        container.innerHTML = availableMissions.map(mission => `
            <div class="action-option">
                <div class="action-option-header">
                    <div class="action-option-title">${mission.title}</div>
                    <div class="action-option-status">${mission.type}</div>
                </div>
                <div class="action-option-description">${StringUtils.truncate(mission.description, 80)}</div>
                <div class="action-option-buttons">
                    <button class="quick-btn" onclick="playerTakeMission(${mission.id}, true)">Do Myself</button>
                    <button class="quick-btn secondary" onclick="showMissionNPCAssignment(${mission.id})">Assign NPCs</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update mission board
     */
    updateMissionBoard() {
        const container = document.getElementById('missionList');
        if (!container) return;
        
        const typeFilter = document.getElementById('missionTypeFilter')?.value || 'all';
        const statusFilter = document.getElementById('missionStatusFilter')?.value || 'available';
        
        const missions = this.filterMissions(typeFilter, statusFilter);
        
        container.innerHTML = missions.map(mission => `
            <div class="mission-item" data-mission-id="${mission.id}">
                <div class="mission-header">
                    <div class="mission-info">
                        <h4 class="mission-title">${mission.title}</h4>
                        <div class="mission-type">${mission.type}</div>
                    </div>
                    <span class="mission-status status-${mission.status}">${StringUtils.capitalize(mission.status)}</span>
                </div>
                <p class="mission-description">${mission.description}</p>
                <div class="mission-rewards">${this.formatRewards(mission.rewards)}</div>
            </div>
        `).join('');
    }

    /**
     * Update mission statistics
     */
    updateMissionStats() {
        const availableElement = document.getElementById('availableMissions');
        const completedElement = document.getElementById('completedMissions');
        const successElement = document.getElementById('successRate');
        
        if (!availableElement || !completedElement || !successElement) return;
        
        const missions = this.gameState.get('missions') || [];
        const available = missions.filter(m => m.status === 'available').length;
        const completed = missions.filter(m => m.status === 'completed').length;
        const failed = missions.filter(m => m.status === 'failed').length;
        const total = completed + failed;
        const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        availableElement.textContent = available;
        completedElement.textContent = completed;
        successElement.textContent = successRate + '%';
    }

    /**
     * Clear mission creation form
     */
    clearMissionForm() {
        const titleInput = document.getElementById('mission-title');
        const descInput = document.getElementById('mission-description');
        const typeSelect = document.getElementById('mission-type');
        const rewardInputs = [
            'reward-celestial-silver',
            'reward-runic-shards',
            'reward-divine-essence'
        ];
        
        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';
        if (typeSelect) typeSelect.value = 'Stealth';
        
        rewardInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        // Clear draft from localStorage
        localStorage.removeItem('bastion-mission-draft');
    }

    /**
     * Format rewards for display
     */
    formatRewards(rewards) {
        if (!rewards || Object.keys(rewards).length === 0) {
            return '';
        }
        
        return Object.entries(rewards).map(([resource, amount]) => {
            const icons = {
                'celestial-silver': '🥈',
                'runic-shards': '💎',
                'divine-essence': '✨',
                'celestial-power': '⚡'
            };
            return `${icons[resource] || ''}${amount}`;
        }).join(' ');
    }

    /**
     * Validate mission data
     */
    validateMissionData(data) {
        if (!ValidationUtils.validateMissionTitle(data.title)) {
            throw new Error('Invalid mission title');
        }
        
        if (!ValidationUtils.validateMissionDescription(data.description)) {
            throw new Error('Invalid mission description');
        }
        
        if (!this.missionTypes.includes(data.type)) {
            throw new Error('Invalid mission type');
        }
    }

    /**
     * Validate mission assignment
     */
    validateMissionAssignment(data) {
        if (!data.playerDoing && (!data.assignedNPCs || data.assignedNPCs.length === 0)) {
            throw new Error('Mission must be assigned to player or NPCs');
        }
        
        if (data.assignedNPCs && data.assignedNPCs.length > 0) {
            // Validate that NPCs exist and are available
            const npcs = this.gameState.get('npcs') || [];
            data.assignedNPCs.forEach(npcId => {
                const npc = npcs.find(n => n.id === npcId);
                if (!npc) {
                    throw new Error(`NPC with ID ${npcId} not found`);
                }
                if (npc.status !== 'available') {
                    throw new Error(`NPC ${npc.name} is not available`);
                }
            });
        }
    }

    /**
     * Get mission statistics for reporting
     */
    getMissionStatistics() {
        const missions = this.gameState.get('missions') || [];
        
        return {
            total: missions.length,
            available: missions.filter(m => m.status === 'available').length,
            inProgress: missions.filter(m => m.status === 'in-progress').length,
            completed: missions.filter(m => m.status === 'completed').length,
            failed: missions.filter(m => m.status === 'failed').length,
            byType: ArrayUtils.groupBy(missions, 'type'),
            byDifficulty: ArrayUtils.groupBy(missions, 'difficulty'),
            successRate: this.calculateOverallSuccessRate()
        };
    }

    /**
     * Calculate overall success rate
     */
    calculateOverallSuccessRate() {
        const missions = this.gameState.get('missions') || [];
        const completed = missions.filter(m => m.status === 'completed').length;
        const failed = missions.filter(m => m.status === 'failed').length;
        const total = completed + failed;
        
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    }
}

export default MissionManager;
