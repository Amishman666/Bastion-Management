/**
 * Section and Upgrade Management for The Bastion
 * Handles all section-related functionality and upgrade trees
 */

export class SectionManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.sections = this.initializeSections();
        this.resourceIcons = {
            'celestial-power': '⚡',
            'celestial-silver': '🥈',
            'runic-shards': '💎',
            'divine-essence': '✨',
            'technical-expertise': '🔬'
        };
    }

    init() {
        this.renderAllSections();
        this.updateAllSections();
    }

    initializeSections() {
        return {
            luminarium: {
                title: "🏛️ Luminarium",
                description: "Main Power Generator",
                paths: {
                    research: [
                        { name: "Pulse Harmonization", description: "Increases efficiency of all other sections by 10% when fully operational. Also improves astral propulsion control.", cost: { 'celestial-power': 100, 'technical-expertise': 2 } },
                        { name: "Celestial Mapping", description: "Tracks divine energy sources throughout the cosmos, identifying potential grace reservoirs and anomalies.", cost: { 'celestial-power': 150, 'runic-shards': 3 } },
                        { name: "Grace Recycling", description: "Recovers spent grace for reuse in critical systems, increasing operational duration between refueling.", cost: { 'celestial-power': 200, 'divine-essence': 1 } }
                    ],
                    offensive: [
                        { name: "Radiant Overcharge", description: "Once per day, release a radiant pulse that deals light damage to all enemies within the Bastion.", cost: { 'celestial-power': 120, 'celestial-silver': 50 } },
                        { name: "Focused Beam", description: "Channel concentrated energy into a devastating attack against a single target, effective against heavily shielded foes.", cost: { 'celestial-power': 180, 'runic-shards': 4 } },
                        { name: "Grace Storm", description: "Create a field of wild grace energy that disrupts magical effects and damages corrupt entities.", cost: { 'celestial-power': 250, 'divine-essence': 2 } }
                    ],
                    defensive: [
                        { name: "Failsafe Core", description: "Prevents total Bastion failure once per major event, triggering a temporary energy field protecting all sections.", cost: { 'celestial-power': 200, 'technical-expertise': 3 } },
                        { name: "Adaptive Shielding", description: "Automatically adjusts defenses based on the nature of incoming threats, offering optimal protection.", cost: { 'celestial-power': 300, 'runic-shards': 5 } },
                        { name: "Dimensional Anchor", description: "Prevents forced translocation of the Bastion by hostile entities, ensuring strategic position control.", cost: { 'celestial-power': 400, 'divine-essence': 3 } }
                    ]
                }
            },
            sanctum: {
                title: "⛪ Sanctum",
                description: "Purification & Spiritual Focus",
                paths: {
                    research: [
                        { name: "Soul Resonance Mapping", description: "Grants insight into corrupted items or beings, enabling better exorcism or artifact cleansing.", cost: { 'celestial-power': 80, 'divine-essence': 1 } },
                        { name: "Divine Communion", description: "Establish temporary communication with higher divine powers for guidance on critical matters.", cost: { 'celestial-power': 150, 'divine-essence': 2 } },
                        { name: "Ethereal Perception", description: "Detect spiritual anomalies across dimensional boundaries, providing early warning of threats.", cost: { 'celestial-power': 200, 'runic-shards': 3 } }
                    ],
                    offensive: [
                        { name: "Judgment Flare", description: "Empower allies to deal radiant damage when fighting corrupted foes. Can also blind nearby threats.", cost: { 'celestial-power': 100, 'celestial-silver': 40 } },
                        { name: "Banishment Wave", description: "Force extraplanar entities back to their native dimensions, effective against invading forces.", cost: { 'celestial-power': 180, 'divine-essence': 2 } },
                        { name: "Purifying Flame", description: "Create weapons of pure spiritual energy that bypass physical defenses.", cost: { 'celestial-power': 250, 'divine-essence': 3 } }
                    ],
                    defensive: [
                        { name: "Sacred Veil", description: "Aura around the Sanctum slowly purifies corruption in adjacent areas.", cost: { 'celestial-power': 120, 'runic-shards': 2 } },
                        { name: "Spiritual Barrier", description: "Block attempts at spiritual invasion or possession, protecting inhabitants from psychic attacks.", cost: { 'celestial-power': 200, 'divine-essence': 2 } },
                        { name: "Blessing of Protection", description: "Grant allies temporary immunity to specific types of corruption or negative energy.", cost: { 'celestial-power': 300, 'divine-essence': 4 } }
                    ]
                }
            },
            wards: {
                title: "🛡️ Wards",
                description: "Defensive Matrix",
                paths: {
                    research: [
                        { name: "Sigil Scripting", description: "Inscribe temporary protective runes before dangerous missions, adding protection to allies.", cost: { 'celestial-power': 90, 'technical-expertise': 2 } },
                        { name: "Breach Analysis", description: "When wards are compromised, gain perfect understanding of the method used, preventing future breaches.", cost: { 'celestial-power': 160, 'runic-shards': 3 } },
                        { name: "Reactive Mathematics", description: "Defensive formulas that adapt to new threats, gradually becoming more effective against recurring enemies.", cost: { 'celestial-power': 220, 'technical-expertise': 4 } }
                    ],
                    offensive: [
                        { name: "Heaven's Volley", description: "Install celestial cannon arrays on the Bastion. Can be fired once per day to target incoming threats.", cost: { 'celestial-power': 150, 'celestial-silver': 60 } },
                        { name: "Counter-Sigils", description: "When defensive wards are struck, they reflect a portion of the attack back at the source.", cost: { 'celestial-power': 200, 'runic-shards': 4 } },
                        { name: "Binding Protocols", description: "Create temporary fields that restrict movement and abilities of hostile entities within range.", cost: { 'celestial-power': 280, 'divine-essence': 2 } }
                    ],
                    defensive: [
                        { name: "Layered Shielding", description: "Enhances physical and magical ward structures, increasing durability against siege effects.", cost: { 'celestial-power': 140, 'technical-expertise': 3 } },
                        { name: "Phasing Barriers", description: "Defenses exist partially out of phase, making them harder to target and destroy.", cost: { 'celestial-power': 220, 'runic-shards': 5 } },
                        { name: "Bastion Memory", description: "The structure 'remembers' previous attacks, automatically reinforcing against similar future threats.", cost: { 'celestial-power': 350, 'divine-essence': 3 } }
                    ]
                }
            },
            throne: {
                title: "👑 Throne Room",
                description: "Command Center",
                paths: {
                    research: [
                        { name: "Battle Archives", description: "Gain tactical insights post-battle. Ask one additional question from any information-gathering source.", cost: { 'celestial-power': 100, 'technical-expertise': 2 } },
                        { name: "Strategic Modeling", description: "Create magical simulations to test tactics before implementation, improving success rates.", cost: { 'celestial-power': 180, 'runic-shards': 3 } },
                        { name: "Command Linguistics", description: "Enhanced communication with allies across vast distances, regardless of language barriers.", cost: { 'celestial-power': 240, 'divine-essence': 2 } }
                    ],
                    offensive: [
                        { name: "Battle Synchrony", description: "Designate one mission per week as 'coordinated,' giving a +1 bonus to all rolls due to superior planning.", cost: { 'celestial-power': 120, 'celestial-silver': 50 } },
                        { name: "Command Authority", description: "Voice carries supernatural weight, causing lesser enemies to hesitate or flee.", cost: { 'celestial-power': 200, 'divine-essence': 2 } },
                        { name: "Tactical Inspiration", description: "During critical moments, can grant allies an unexpected second wind or insight.", cost: { 'celestial-power': 300, 'divine-essence': 3 } }
                    ],
                    defensive: [
                        { name: "Iron Mandate", description: "Enemies attempting to sabotage command face higher resistance or misdirection.", cost: { 'celestial-power': 110, 'technical-expertise': 2 } },
                        { name: "Protected Awareness", description: "Command staff cannot be magically scried upon or have thoughts read without their knowledge.", cost: { 'celestial-power': 190, 'runic-shards': 4 } },
                        { name: "Contingency Protocols", description: "If command is compromised, automated systems maintain basic functions until control is restored.", cost: { 'celestial-power': 280, 'technical-expertise': 5 } }
                    ]
                }
            },
            gateway: {
                title: "🌀 Gateway",
                description: "Teleportation Hub",
                paths: {
                    research: [
                        { name: "Harmonic Coordinates", description: "Unlock hidden realms or rare mission sites with unique rewards.", cost: { 'celestial-power': 130, 'runic-shards': 3 } },
                        { name: "Sympathetic Mapping", description: "After visiting a location once, can return with perfect accuracy regardless of wards or barriers.", cost: { 'celestial-power': 200, 'technical-expertise': 3 } },
                        { name: "Beacon Understanding", description: "Ability to analyze and potentially replicate transportation methods of other beings.", cost: { 'celestial-power': 270, 'divine-essence': 2 } }
                    ],
                    offensive: [
                        { name: "Tactical Insertion", description: "Once per session, deploy a team directly into a known hostile location bypassing travel.", cost: { 'celestial-power': 160, 'celestial-silver': 70 } },
                        { name: "Portal Strike", description: "Open momentary gateways to launch attacks from unexpected angles.", cost: { 'celestial-power': 230, 'runic-shards': 4 } },
                        { name: "Dimensional Shear", description: "Create unstable planar intersections that damage creatures caught between worlds.", cost: { 'celestial-power': 320, 'divine-essence': 3 } }
                    ],
                    defensive: [
                        { name: "Interdiction Array", description: "Nullifies teleportation-based infiltration attempts into the Bastion.", cost: { 'celestial-power': 150, 'technical-expertise': 3 } },
                        { name: "Escape Protocols", description: "In dire emergencies, automatically evacuates critical personnel to predetermined safe locations.", cost: { 'celestial-power': 220, 'runic-shards': 5 } },
                        { name: "Planar Anchoring", description: "Stabilizes local reality, preventing dimensional manipulation within the Bastion's influence.", cost: { 'celestial-power': 350, 'divine-essence': 4 } }
                    ]
                }
            },
            fountain: {
                title: "⛲ Fountain of Grace",
                description: "Healing Center",
                paths: {
                    research: [
                        { name: "Graceflow Optimization", description: "Increases passive generation of celestial silver and healing effectiveness.", cost: { 'celestial-power': 110, 'technical-expertise': 2 } },
                        { name: "Essence Analysis", description: "Identify the nature and source of injuries or afflictions with perfect accuracy.", cost: { 'celestial-power': 170, 'divine-essence': 1 } },
                        { name: "Resurrection Protocols", description: "Establish foundation for potential revival of fatally wounded allies under specific conditions.", cost: { 'celestial-power': 300, 'divine-essence': 4 } }
                    ],
                    offensive: [
                        { name: "Blessing Surge", description: "Store divine interventions for use in dire situations.", cost: { 'celestial-power': 140, 'celestial-silver': 60 } },
                        { name: "Purifying Cascade", description: "Transform fountain energies into damaging wave against unholy entities.", cost: { 'celestial-power': 210, 'divine-essence': 2 } },
                        { name: "Lifeforce Manipulation", description: "Temporarily enhance allies' physical capabilities beyond normal limits.", cost: { 'celestial-power': 290, 'divine-essence': 3 } }
                    ],
                    defensive: [
                        { name: "Aegis Misting", description: "Emergency regenerative mist healing allies in adjacent sections.", cost: { 'celestial-power': 120, 'runic-shards': 3 } },
                        { name: "Stasis Field", description: "Preserve critically wounded in suspended animation until proper healing is available.", cost: { 'celestial-power': 200, 'technical-expertise': 4 } },
                        { name: "Vitality Shield", description: "Convert incoming damage to healing energy with diminishing returns.", cost: { 'celestial-power': 320, 'divine-essence': 4 } }
                    ]
                }
            }
        };
    }

    renderAllSections() {
        const container = document.getElementById('sections-container');
        if (!container) return;

        container.innerHTML = '';
        
        Object.keys(this.sections).forEach(sectionId => {
            const sectionHtml = this.renderSection(sectionId);
            container.innerHTML += sectionHtml;
        });
    }

    renderSection(sectionId) {
        const section = this.sections[sectionId];
        const totalUpgrades = Object.values(section.paths).reduce((sum, path) => sum + path.length, 0);
        const progress = this.gameState.getSectionProgress(sectionId, totalUpgrades);
        
        return `
            <div class="section-card" id="${sectionId}">
                <div class="section-header">
                    <div class="section-title">${section.title}</div>
                    <div class="section-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                        </div>
                        <span class="progress-text">${progress.completed}/${progress.total}</span>
                    </div>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 0.9rem;">${section.description}</p>
                <div class="paths-container">
                    ${Object.keys(section.paths).map(pathType => this.renderPath(sectionId, pathType)).join('')}
                </div>
            </div>
        `;
    }

    renderPath(sectionId, pathType) {
        const section = this.sections[sectionId];
        const path = section.paths[pathType];
        
        return `
            <div class="path ${pathType}" id="${sectionId}-${pathType}">
                <div class="path-header" onclick="togglePath('${sectionId}', '${pathType}')">
                    <div class="path-name">
                        <i class="fas fa-${pathType === 'research' ? 'microscope' : pathType === 'offensive' ? 'sword' : 'shield-alt'}"></i>
                        ${pathType.charAt(0).toUpperCase() + pathType.slice(1)} Path
                    </div>
                    <span class="path-toggle">▼</span>
                </div>
                <div class="upgrades-list">
                    ${path.map((upgrade, index) => this.renderUpgrade(sectionId, pathType, upgrade, index)).join('')}
                </div>
            </div>
        `;
    }

    renderUpgrade(sectionId, pathType, upgrade, index) {
        return `
            <div class="upgrade-item" id="${sectionId}-${pathType}-${index}">
                <div class="upgrade-header">
                    <div class="upgrade-name">${upgrade.name}</div>
                    <span class="upgrade-status status-locked">Locked</span>
                </div>
                <div class="upgrade-description">${upgrade.description}</div>
                <div class="upgrade-footer">
                    <div class="upgrade-cost">
                        ${Object.entries(upgrade.cost).map(([resource, amount]) => `
                            <span class="cost-item">
                                ${this.resourceIcons[resource]} ${amount}
                            </span>
                        `).join('')}
                    </div>
                    <button class="purchase-btn" onclick="purchaseUpgrade('${sectionId}', '${pathType}', ${index})" disabled>
                        Purchase
                    </button>
                </div>
            </div>
        `;
    }

    purchaseUpgrade(sectionId, pathType, upgradeIndex) {
        const upgrade = this.sections[sectionId].paths[pathType][upgradeIndex];
        
        if (this.gameState.purchaseUpgrade(sectionId, pathType, upgradeIndex, upgrade.cost)) {
            this.updateUpgradeStates();
            this.updateSectionProgress(sectionId);
            return true;
        }
        return false;
    }

    updateAllSections() {
        Object.keys(this.sections).forEach(sectionId => {
            this.updateSectionProgress(sectionId);
        });
        this.updateUpgradeStates();
    }

    updateSectionProgress(sectionId) {
        const section = this.sections[sectionId];
        const totalUpgrades = Object.values(section.paths).reduce((sum, path) => sum + path.length, 0);
        const progress = this.gameState.getSectionProgress(sectionId, totalUpgrades);
        
        const progressFill = document.querySelector(`#${sectionId} .progress-fill`);
        const progressText = document.querySelector(`#${sectionId} .progress-text`);
        
        if (progressFill && progressText) {
            progressFill.style.width = progress.percentage + '%';
            progressText.textContent = `${progress.completed}/${progress.total}`;
        }
    }

    updateUpgradeStates() {
        Object.keys(this.sections).forEach(sectionId => {
            Object.keys(this.sections[sectionId].paths).forEach(pathType => {
                this.sections[sectionId].paths[pathType].forEach((upgrade, index) => {
                    this.updateUpgradeState(sectionId, pathType, index, upgrade);
                });
            });
        });
    }

    updateUpgradeState(sectionId, pathType, index, upgrade) {
        const upgradeElement = document.getElementById(`${sectionId}-${pathType}-${index}`);
        if (!upgradeElement) return;

        const isCompleted = this.gameState.hasUpgrade(sectionId, pathType, index);
        const canAfford = this.gameState.canAfford(upgrade.cost);
        
        const statusElement = upgradeElement.querySelector('.upgrade-status');
        const buttonElement = upgradeElement.querySelector('.purchase-btn');
        
        if (isCompleted) {
            statusElement.textContent = 'Completed';
            statusElement.className = 'upgrade-status status-completed';
            buttonElement.style.display = 'none';
        } else if (canAfford) {
            statusElement.textContent = 'Available';
            statusElement.className = 'upgrade-status status-available';
            buttonElement.disabled = false;
            buttonElement.style.display = 'inline-block';
        } else {
            statusElement.textContent = 'Locked';
            statusElement.className = 'upgrade-status status-locked';
            buttonElement.disabled = true;
            buttonElement.style.display = 'inline-block';
        }
    }

    togglePath(sectionId, pathType) {
        const path = document.getElementById(`${sectionId}-${pathType}`);
        if (path) {
            path.classList.toggle('expanded');
        }
    }

    // Utility methods
    getSectionInfo(sectionId) {
        return this.sections[sectionId];
    }

    getUpgradesBySection(sectionId) {
        return this.gameState.data.upgrades[sectionId] || { research: [], offensive: [], defensive: [] };
    }

    getTotalUpgrades() {
        return Object.values(this.gameState.data.upgrades).reduce((total, section) => {
            return total + Object.values(section).reduce((sectionTotal, path) => {
                return sectionTotal + path.length;
            }, 0);
        }, 0);
    }
}
