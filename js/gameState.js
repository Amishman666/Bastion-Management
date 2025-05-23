// gameState.js - Centralized game state management
export class GameState {
    constructor() {
        this.state = this.getDefaultState();
        this.listeners = [];
        this.changeCallbacks = [];
        
        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
    }

    getDefaultState() {
        return {
            resources: {
                'celestial-power': 1250,
                'celestial-silver': 85,
                'runic-shards': 12,
                'divine-essence': 3,
                'technical-expertise': 0
            },
            sectionStates: {
                luminarium: 'damaged',
                sanctum: 'damaged',
                wards: 'damaged',
                throne: 'cleaned',
                gateway: 'damaged',
                fountain: 'online'
            },
            cleaningTimers: {},
            missionAssignments: {},
            upgrades: {
                luminarium: { research: [], offensive: [], defensive: [] },
                sanctum: { research: [], offensive: [], defensive: [] },
                wards: { research: [], offensive: [], defensive: [] },
                throne: { research: [], offensive: [], defensive: [] },
                gateway: { research: [], offensive: [], defensive: [] },
                fountain: { research: [], offensive: [], defensive: [] }
            },
            npcs: [],
            items: [],
            missions: [],
            sectionRepairCosts: {},
            cleaningRewardRanges: {
                'celestial-silver': { min: 10, max: 25 },
                'runic-shards': { min: 1, max: 3 }
            },
            players: ['Jon'],
            activity: [],
            totalCelestialPowerCapacity: 2000,
            currentCelestialPowerDrain: 0,
            lastSaved: Date.now(),
            version: '1.0.0'
        };
    }

    // Initialize with data loaded from JSON files
    initializeData(data) {
        if (data.config) {
            this.state = { ...this.state, ...data.config };
        }
        
        if (data.npcs) {
            this.state.npcs = data.npcs;
        }
        
        if (data.items) {
            this.state.items = data.items;
        }
        
        if (data.missions) {
            this.state.missions = data.missions;
        }
        
        if (data.sections) {
            // Process sections data for repair costs, etc.
            this.processSectionsData(data.sections);
        }
        
        this.triggerChange(['initialization']);
    }

    // Fallback to hardcoded data
    initializeDefaultData() {
        console.log('⚠️ Using default hardcoded data');
        
        this.state.npcs = [
            {
                id: 1,
                name: "Kade Vex",
                title: "Ghost Operative",
                skill: 3,
                stealth: 4,
                combat: 1,
                tech: 2,
                social: 1,
                will: 3,
                loyalty: 85,
                injury: 0,
                stress: 0,
                rank: 1,
                trait: "Silent Entry — Stealth missions ignore first 2 points of required threshold",
                equipped_item: null,
                status: 'available'
            },
            {
                id: 2,
                name: "Elena Cross",
                title: "Tech Specialist",
                skill: 4,
                stealth: 2,
                combat: 2,
                tech: 5,
                social: 3,
                will: 4,
                loyalty: 92,
                injury: 0,
                stress: 1,
                rank: 2,
                trait: "Data Mining — Automatically gains +1 Intel on successful Tech missions",
                equipped_item: 1,
                status: 'available'
            }
        ];

        this.state.items = [
            {
                id: 1,
                name: "Advanced Scanner",
                type: "tech",
                bonus: { tech: 2 },
                description: "Grants +2 Tech for complex analysis missions",
                rarity: "uncommon"
            },
            {
                id: 2,
                name: "Stealth Cloak",
                type: "stealth",
                bonus: { stealth: 1, will: 1 },
                description: "Grants +1 Stealth and +1 Will, reduces detection chance",
                rarity: "rare"
            }
        ];

        this.state.missions = [
            {
                id: 1,
                title: "Seraphim Archives Infiltration",
                type: "Stealth",
                description: "Infiltrate the Seraphim Council archives to steal divine encryption keys.",
                rewards: {
                    'celestial-silver': 100,
                    'runic-shards': 2,
                    'divine-essence': 1
                },
                status: "available",
                duration: "3 days"
            },
            {
                id: 2,
                title: "Void Fragment Research",
                type: "Research",
                description: "Study corrupted void fragments to understand their energy patterns.",
                rewards: {
                    'celestial-power': 200,
                    'runic-shards': 4,
                    'divine-essence': 1
                },
                status: "available",
                duration: "2 days"
            }
        ];

        this.state.sectionRepairCosts = {
            luminarium: { 'celestial-power': 200, 'celestial-silver': 50, 'runic-shards': 5 },
            sanctum: { 'celestial-power': 150, 'celestial-silver': 40, 'divine-essence': 2 },
            wards: { 'celestial-power': 180, 'celestial-silver': 60, 'runic-shards': 3 },
            throne: { 'celestial-power': 120, 'celestial-silver': 30, 'technical-expertise': 3 },
            gateway: { 'celestial-power': 250, 'runic-shards': 8, 'divine-essence': 3 },
            fountain: { 'celestial-power': 100, 'celestial-silver': 80, 'divine-essence': 4 }
        };
        
        this.triggerChange(['initialization']);
    }

    processSectionsData(sectionsData) {
        // Process sections data and extract repair costs, etc.
        // This would parse the sections.json file
        console.log('Processing sections data:', sectionsData);
    }

    // State getters
    get(path) {
        const keys = path.split('.');
        let current = this.state;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return undefined;
            }
        }
        
        return current;
    }

    // State setters with change detection
    set(path, value, triggerChange = true) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = this.state;
        
        // Navigate to the parent object
        for (const key of keys) {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        // Set the value
        const oldValue = current[lastKey];
        current[lastKey] = value;
        
        // Trigger change event if value actually changed
        if (triggerChange && oldValue !== value) {
            this.triggerChange([keys.length > 0 ? keys[0] : lastKey]);
        }
        
        return this;
    }

    // Update nested objects
    update(path, updates, triggerChange = true) {
        const current = this.get(path);
        if (current && typeof current === 'object') {
            Object.assign(current, updates);
            if (triggerChange) {
                this.triggerChange([path.split('.')[0]]);
            }
        }
        return this;
    }

    // Array operations
    push(path, item, triggerChange = true) {
        const array = this.get(path);
        if (Array.isArray(array)) {
            array.push(item);
            if (triggerChange) {
                this.triggerChange([path.split('.')[0]]);
            }
        }
        return this;
    }

    remove(path, predicate, triggerChange = true) {
        const array = this.get(path);
        if (Array.isArray(array)) {
            const index = array.findIndex(predicate);
            if (index !== -1) {
                array.splice(index, 1);
                if (triggerChange) {
                    this.triggerChange([path.split('.')[0]]);
                }
            }
        }
        return this;
    }

    // Change detection and callbacks
    triggerChange(changedPaths) {
        this.changeCallbacks.forEach(callback => {
            try {
                callback(changedPaths);
            } catch (error) {
                console.error('Error in change callback:', error);
            }
        });
    }

    onChange(callback) {
        this.changeCallbacks.push(callback);
        return () => {
            const index = this.changeCallbacks.indexOf(callback);
            if (index > -1) {
                this.changeCallbacks.splice(index, 1);
            }
        };
    }

    // Activity logging
    logActivity(message) {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        this.state.activity.unshift({ time, message });
        
        // Keep only last 50 activities
        if (this.state.activity.length > 50) {
            this.state.activity = this.state.activity.slice(0, 50);
        }
        
        this.triggerChange(['activity']);
    }

    // Persistence
    save() {
        try {
            this.state.lastSaved = Date.now();
            localStorage.setItem('bastion-game-state', JSON.stringify(this.state));
            localStorage.setItem('bastion-backup', JSON.stringify(this.state));
            return true;
        } catch (error) {
            console.error('Failed to save game state:', error);
            return false;
        }
    }

    load() {
        try {
            const saved = localStorage.getItem('bastion-game-state');
            if (saved) {
                const loadedState = JSON.parse(saved);
                
                // Merge with default state to handle version updates
                this.state = { ...this.getDefaultState(), ...loadedState };
                this.triggerChange(['all']);
                return true;
            }
        } catch (error) {
            console.error('Failed to load game state:', error);
        }
        return false;
    }

    autoSave() {
        if (this.hasUnsavedChanges()) {
            this.save();
        }
    }

    hasUnsavedChanges() {
        return Date.now() - this.state.lastSaved > 30000; // 30 seconds
    }

    export() {
        const dataStr = JSON.stringify(this.state, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bastion-campaign-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedState = JSON.parse(e.target.result);
                    this.state = { ...this.getDefaultState(), ...importedState };
                    this.triggerChange(['all']);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    // Reset functionality
    reset() {
        this.state = this.getDefaultState();
        this.triggerChange(['all']);
        this.save();
    }

    // Debug helpers
    debug() {
        console.log('Current Game State:', this.state);
        console.log('Active Change Callbacks:', this.changeCallbacks.length);
    }
}

export default GameState;
