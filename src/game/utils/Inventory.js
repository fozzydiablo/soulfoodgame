import * as THREE from 'three';

export class Inventory {
    constructor(gameManager) {
        this.gameManager = gameManager;
        
        // Create three separate inventories with their limits
        this.itemSlots = new Array(6).fill(null);     // Items from item shop - max 6 slots
        this.consumableSlots = new Array(2).fill(null); // Consumables - max 2 slots
        this.abilitySlots = new Array(4).fill(null);   // Abilities - max 4 slots
        
        // Track active slot for each inventory
        this.activeItemSlot = 0;
        this.activeConsumableSlot = 0;
        this.activeAbilitySlot = 0;
        
        // Create UI
        this.createUI();
        
        // Bind methods
        this.handleKeyPress = this.handleKeyPress.bind(this);
        
        // Setup event listeners
        window.addEventListener('keydown', this.handleKeyPress);
    }
    
    createUI() {
        // Create container for inventory UI
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.bottom = '10px';
        this.container.style.left = '50%';
        this.container.style.transform = 'translateX(-50%)';
        this.container.style.width = '450px'; // Reduced width after removing items section
        this.container.style.padding = '10px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        this.container.style.borderRadius = '5px';
        this.container.style.zIndex = '100';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.gap = '5px';
        
        // Create header labels for each inventory type
        const headerContainer = document.createElement('div');
        headerContainer.style.display = 'flex';
        headerContainer.style.justifyContent = 'center';
        headerContainer.style.gap = '10px';
        headerContainer.style.width = '100%';
        
        // Create labels for each inventory type
        const inventoryTypes = [
            { id: 'consumables', label: 'CONSUMABLES', width: '140px' },
            { id: 'abilities', label: 'ABILITIES', width: '280px' }
        ];
        
        this.sectionLabels = {};
        
        inventoryTypes.forEach(type => {
            const label = document.createElement('div');
            label.style.padding = '8px 15px';
            label.style.backgroundColor = 'rgba(40, 40, 50, 0.9)';
            label.style.borderRadius = '5px 5px 0 0';
            label.style.color = '#fff';
            label.style.fontWeight = 'bold';
            label.style.fontSize = '14px';
            label.style.width = type.width;
            label.style.textAlign = 'center';
            label.textContent = type.label;
            label.dataset.type = type.id;
            
            headerContainer.appendChild(label);
            this.sectionLabels[type.id] = label;
        });
        
        // Create slots container that holds all inventory types side by side
        this.slotsContainer = document.createElement('div');
        this.slotsContainer.style.display = 'flex';
        this.slotsContainer.style.justifyContent = 'center';
        this.slotsContainer.style.gap = '10px';
        this.slotsContainer.style.width = '100%';
        
        // Create containers for each inventory type
        this.itemSlotsContainer = document.createElement('div');
        this.itemSlotsContainer.style.display = 'flex';
        this.itemSlotsContainer.style.gap = '5px';
        this.itemSlotsContainer.style.justifyContent = 'center';
        this.itemSlotsContainer.style.width = '360px';
        this.itemSlotsContainer.style.backgroundColor = 'rgba(20, 20, 30, 0.8)';
        this.itemSlotsContainer.style.borderRadius = '0 0 5px 5px';
        this.itemSlotsContainer.style.padding = '10px';
        
        this.consumableSlotsContainer = document.createElement('div');
        this.consumableSlotsContainer.style.display = 'flex';
        this.consumableSlotsContainer.style.gap = '5px';
        this.consumableSlotsContainer.style.justifyContent = 'center';
        this.consumableSlotsContainer.style.width = '140px';
        this.consumableSlotsContainer.style.backgroundColor = 'rgba(20, 20, 30, 0.8)';
        this.consumableSlotsContainer.style.borderRadius = '0 0 5px 5px';
        this.consumableSlotsContainer.style.padding = '10px';
        
        this.abilitySlotsContainer = document.createElement('div');
        this.abilitySlotsContainer.style.display = 'flex';
        this.abilitySlotsContainer.style.gap = '5px';
        this.abilitySlotsContainer.style.justifyContent = 'center';
        this.abilitySlotsContainer.style.width = '280px';
        this.abilitySlotsContainer.style.backgroundColor = 'rgba(20, 20, 30, 0.8)';
        this.abilitySlotsContainer.style.borderRadius = '0 0 5px 5px';
        this.abilitySlotsContainer.style.padding = '10px';
        
        // Create inventory slots for each type
        this.itemSlotElements = this.createSlots(this.itemSlotsContainer, this.itemSlots.length, 'item');
        this.consumableSlotElements = this.createSlots(this.consumableSlotsContainer, this.consumableSlots.length, 'consumable');
        this.abilitySlotElements = this.createSlots(this.abilitySlotsContainer, this.abilitySlots.length, 'ability');
        
        // Add slot containers to the main slots container (excluding items)
        this.slotsContainer.appendChild(this.consumableSlotsContainer);
        this.slotsContainer.appendChild(this.abilitySlotsContainer);
        
        // Add components to main container
        this.container.appendChild(headerContainer);
        this.container.appendChild(this.slotsContainer);
        
        // Add to document
        document.body.appendChild(this.container);
        
        // Highlight active slots
        this.updateActiveSlot('item');
        this.updateActiveSlot('consumable');
        this.updateActiveSlot('ability');
    }
    
    createSlots(container, count, type) {
        const slots = [];
        
        for (let i = 0; i < count; i++) {
            const slot = document.createElement('div');
            
            // Adjust size based on type
            if (type === 'item') {
                slot.style.width = '55px';
                slot.style.height = '55px';
            } else if (type === 'consumable') {
                slot.style.width = '50px';
                slot.style.height = '50px';
            } else if (type === 'ability') {
                slot.style.width = '55px';
                slot.style.height = '55px';
            }
            
            slot.style.backgroundColor = 'rgba(50, 50, 70, 0.6)';
            slot.style.border = '2px solid #444';
            slot.style.borderRadius = '5px';
            slot.style.display = 'flex';
            slot.style.alignItems = 'center';
            slot.style.justifyContent = 'center';
            slot.style.flexDirection = 'column';
            slot.style.position = 'relative';
            slot.style.cursor = 'pointer';
            slot.style.transition = 'all 0.2s ease';
            slot.dataset.index = i;
            slot.dataset.type = type;
            
            // Add hover effect
            slot.addEventListener('mouseenter', () => {
                slot.style.border = '2px solid #ffcc00';
                slot.style.backgroundColor = 'rgba(255, 204, 0, 0.2)';
                slot.style.transform = 'scale(1.05)';
            });
            
            slot.addEventListener('mouseleave', () => {
                slot.style.border = '2px solid #444';
                slot.style.backgroundColor = 'rgba(50, 50, 70, 0.6)';
                slot.style.transform = 'scale(1)';
            });
            
            // Add keybind indicator
            const keybind = document.createElement('div');
            keybind.style.position = 'absolute';
            keybind.style.top = '2px';
            keybind.style.right = '4px';
            keybind.style.color = '#aaa';
            keybind.style.fontSize = '12px';
            keybind.style.fontWeight = 'bold';
            
            // Set appropriate keybind text based on type
            if (type === 'consumable') {
                keybind.textContent = i === 0 ? 'Q' : 'E';
            } else if (type === 'ability') {
                keybind.textContent = i === 0 ? 'Z' : i === 1 ? 'X' : i === 2 ? 'C' : 'V';
            } else {
                keybind.textContent = `${i+1}`;
            }
            
            keybind.dataset.isKeybind = 'true';
            slot.appendChild(keybind);
            
            // Add click event based on slot type
            slot.addEventListener('click', () => {
                if (type === 'item') {
                    this.selectSlot(i, 'item');
                } else if (type === 'consumable') {
                    this.selectSlot(i, 'consumable');
                } else if (type === 'ability') {
                    this.selectSlot(i, 'ability');
                }
            });
            
            container.appendChild(slot);
            slots.push(slot);
        }
        
        return slots;
    }
    
    updateActiveSlot(type) {
        let slotElements, activeSlotIndex;
        
        if (type === 'item') {
            slotElements = this.itemSlotElements;
            activeSlotIndex = this.activeItemSlot;
        } else if (type === 'consumable') {
            slotElements = this.consumableSlotElements;
            activeSlotIndex = this.activeConsumableSlot;
        } else if (type === 'ability') {
            slotElements = this.abilitySlotElements;
            activeSlotIndex = this.activeAbilitySlot;
        } else {
            return;
        }
        
        // Update section label only
        if (this.sectionLabels && this.sectionLabels[type]) {
            // Highlight the section label for the active type
            this.sectionLabels[type].style.backgroundColor = 'rgba(80, 80, 100, 0.9)';
        }
        
        // We no longer visually highlight the slots themselves
        // The game state still tracks which slots are active, but we won't show it visually
    }
    
    handleKeyPress(event) {
        // Item selection (1-6)
        // Note: Items are still tracked internally even though they're not displayed in the bottom UI
        // They are only shown in the player info menu
        if (event.key >= '1' && event.key <= '6') {
            const slotIndex = parseInt(event.key) - 1;
            if (slotIndex < this.itemSlots.length) {
                this.selectSlot(slotIndex, 'item');
            }
        }
        
        // Consumable selection (Q-E)
        if (event.key === 'q' || event.key === 'Q') {
            this.selectSlot(0, 'consumable');
        } else if (event.key === 'e' || event.key === 'E') {
            this.selectSlot(1, 'consumable');
        }
        
        // Ability selection (keys Z,X,C,V)
        if (event.key === 'z' || event.key === 'Z') {
            this.selectSlot(0, 'ability');
        } else if (event.key === 'x' || event.key === 'X') {
            this.selectSlot(1, 'ability');
        } else if (event.key === 'c' || event.key === 'C') {
            this.selectSlot(2, 'ability');
        } else if (event.key === 'v' || event.key === 'V') {
            this.selectSlot(3, 'ability');
        }
        
        // Use consumable with F
        if (event.key === 'f' || event.key === 'F') {
            this.useActiveItem('consumable', true);
        }
        
        // Use ability with R
        if (event.key === 'r' || event.key === 'R') {
            this.useActiveItem('ability', true);
        }
    }
    
    selectSlot(index, type) {
        if (type === 'item' && index >= 0 && index < this.itemSlots.length) {
            this.activeItemSlot = index;
            this.updateActiveSlot('item');
            this.useActiveItem('item');
        } else if (type === 'consumable' && index >= 0 && index < this.consumableSlots.length) {
            this.activeConsumableSlot = index;
            this.updateActiveSlot('consumable');
            this.useActiveItem('consumable');
        } else if (type === 'ability' && index >= 0 && index < this.abilitySlots.length) {
            this.activeAbilitySlot = index;
            this.updateActiveSlot('ability');
            this.useActiveItem('ability');
        }
    }
    
    addItem(item) {
        // Determine the inventory type based on item properties
        let targetSlots, slotElements, inventoryType;
        
        if (item.type === 'ability') {
            targetSlots = this.abilitySlots;
            slotElements = this.abilitySlotElements;
            inventoryType = 'ability';
        } else if (item.consumable) {
            targetSlots = this.consumableSlots;
            slotElements = this.consumableSlotElements;
            inventoryType = 'consumable';
        } else {
            targetSlots = this.itemSlots;
            slotElements = this.itemSlotElements;
            inventoryType = 'item';
        }
        
        // Find first empty slot
        const emptySlot = targetSlots.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            targetSlots[emptySlot] = item;
            this.updateSlotUI(emptySlot, inventoryType);
            
            // If the item is a wearable, update player stats
            if (item.type === 'wearable') {
                this.updateWearableItemStats();
            }
            
            return true;
        }
        
        // No empty slots in the appropriate inventory
        if (this.gameManager.ui) {
            this.gameManager.ui.showNotification(`${inventoryType.charAt(0).toUpperCase() + inventoryType.slice(1)} inventory full!`, 2000);
        }
        return false;
    }
    
    removeItem(slotIndex, inventoryType) {
        // Get appropriate inventory based on type
        let targetSlots;
        
        if (inventoryType === 'consumable') {
            targetSlots = this.consumableSlots;
        } else if (inventoryType === 'ability') {
            targetSlots = this.abilitySlots;
        } else {
            targetSlots = this.itemSlots;
        }
        
        // Check if there's an item in the slot
        if (targetSlots[slotIndex]) {
            const removedItem = targetSlots[slotIndex];
            targetSlots[slotIndex] = null;
            
            // Update UI for the slot
            this.updateSlotUI(slotIndex, inventoryType);
            
            // If the removed item was a wearable, update player stats
            if (removedItem.type === 'wearable') {
                this.updateWearableItemStats();
            }
            
            return removedItem;
        }
        
        return null;
    }
    
    updateSlotUI(index, type) {
        // Get the relevant slot elements and item slots
        let slotElements, itemSlots;
        
        if (type === 'item') {
            slotElements = this.itemSlotElements;
            itemSlots = this.itemSlots;
        } else if (type === 'consumable') {
            slotElements = this.consumableSlotElements;
            itemSlots = this.consumableSlots;
        } else if (type === 'ability') {
            slotElements = this.abilitySlotElements;
            itemSlots = this.abilitySlots;
        } else {
            return;
        }
        
        const slot = slotElements[index];
        const item = itemSlots[index];
        
        // Remove existing content
        Array.from(slot.children).forEach(child => {
            if (!child.dataset || !child.dataset.isKeybind) {
                slot.removeChild(child);
            }
        });
        
        if (item) {
            // Create item icon
            const icon = document.createElement('div');
            icon.style.width = '60px';
            icon.style.height = '60px';
            icon.style.backgroundColor = this.getItemColor(item.type);
            icon.style.borderRadius = '5px';
            icon.style.marginTop = '5px';
            icon.style.display = 'flex';
            icon.style.alignItems = 'center';
            icon.style.justifyContent = 'center';
            
            // Add special icons for certain item types
            if (item.icon === 'turret') {
                // Create a turret icon
                const turretIcon = document.createElement('div');
                turretIcon.style.width = '40px';
                turretIcon.style.height = '40px';
                turretIcon.style.position = 'relative';
                
                // Turret base
                const base = document.createElement('div');
                base.style.width = '24px';
                base.style.height = '18px';
                base.style.backgroundColor = '#444444';
                base.style.borderRadius = '3px';
                base.style.position = 'absolute';
                base.style.bottom = '0';
                base.style.left = '8px';
                
                // Turret barrel
                const barrel = document.createElement('div');
                barrel.style.width = '8px';
                barrel.style.height = '22px';
                barrel.style.backgroundColor = '#222222';
                barrel.style.position = 'absolute';
                barrel.style.bottom = '10px';
                barrel.style.left = '16px';
                
                turretIcon.appendChild(base);
                turretIcon.appendChild(barrel);
                icon.appendChild(turretIcon);
            }
            
            // Add item name
            const name = document.createElement('div');
            name.style.fontSize = '12px';
            name.style.color = 'white';
            name.style.textAlign = 'center';
            name.style.overflow = 'hidden';
            name.style.whiteSpace = 'nowrap';
            name.style.textOverflow = 'ellipsis';
            name.style.width = '100%';
            name.textContent = item.name;
            
            slot.appendChild(icon);
            slot.appendChild(name);
            
            // Add tooltip
            slot.addEventListener('mouseenter', () => this.showTooltip(item, slot));
            slot.addEventListener('mouseleave', () => this.hideTooltip());
        }
    }
    
    getItemColor(type) {
        // Return color based on item type
        const colors = {
            'ability': '#5555ff',
            'accessory': '#ffaa00',
            'armor': '#00aaaa',
            'weapon': '#aa5500',
            'consumable': '#55aa55',
            'health': '#ff0000',
            'damage': '#ff5500',
            'speed': '#00ff00',
            'armor': '#ddcc77',
            'evasion': '#77dd77',
            'mana': '#3366ff',
            'healthRegen': '#ff7777',
            'manaRegen': '#7777ff',
            'ammo': '#0000ff',
            'attackSpeed': '#ff00ff',
            'jumpHeight': '#cc99ff',
            'collection': '#66ff66',
            'turret': '#66cccc',
            'default': '#ffffff'
        };
        
        return colors[type] || colors.default;
    }
    
    useActiveItem(type) {
        let item, slots;
        
        if (type === 'consumable') {
            slots = this.consumableSlots;
            item = slots[this.activeConsumableSlot];
        } else if (type === 'ability') {
            slots = this.abilitySlots;
            item = slots[this.activeAbilitySlot];
        } else {
            return false;
        }
        
        if (!item) return false;
        
        // Use the item by calling its use function if it exists
        if (typeof item.use === 'function') {
            const success = item.use(this.gameManager);
            
            // If the item is used successfully and is a consumable
            if (success && item.consumable) {
                // Remove from inventory
                this.removeItem(this.activeConsumableSlot, 'consumable');
            }
            
            // If this is an ability with cooldown, update the cooldown UI
            if (success && type === 'ability' && item.cooldown) {
                // Store the last used time for cooldown tracking
                item.lastUsed = Date.now();
                
                // Get the slot element to update
                const slotElement = this.abilitySlotElements[this.activeAbilitySlot];
                
                // Start cooldown tracking
                this.startAbilityCooldownTracking(this.activeAbilitySlot, item.cooldown);
            }
            
            return success;
        }
        
        return false;
    }
    
    // Track and update ability cooldowns
    startAbilityCooldownTracking(slotIndex, cooldownDuration) {
        if (!this.gameManager || !this.gameManager.ui) return;
        
        const item = this.abilitySlots[slotIndex];
        const slotElement = this.abilitySlotElements[slotIndex];
        
        if (!item || !slotElement) return;
        
        // Set initial cooldown state
        this.gameManager.ui.updateAbilityCooldown(slotElement, cooldownDuration, cooldownDuration);
        
        // Start cooldown animation using requestAnimationFrame for smoother updates
        const startTime = Date.now();
        const endTime = startTime + (cooldownDuration * 1000);
        
        const updateCooldown = () => {
            const now = Date.now();
            const remaining = (endTime - now) / 1000; // Convert to seconds
            
            if (remaining <= 0) {
                // Cooldown complete
                this.gameManager.ui.completeAbilityCooldown(slotElement);
            } else {
                // Update the cooldown display
                this.gameManager.ui.updateAbilityCooldown(slotElement, remaining, cooldownDuration);
                
                // Continue the animation
                requestAnimationFrame(updateCooldown);
            }
        };
        
        // Start the animation
        requestAnimationFrame(updateCooldown);
    }
    
    // New function to check and update all ability cooldowns
    updateAbilityCooldowns() {
        if (!this.gameManager || !this.gameManager.ui) return;
        
        const now = Date.now();
        
        // Go through all ability slots
        for (let i = 0; i < this.abilitySlots.length; i++) {
            const ability = this.abilitySlots[i];
            const slotElement = this.abilitySlotElements[i];
            
            if (!ability || !ability.cooldown || !ability.lastUsed) continue;
            
            // Calculate remaining cooldown
            const elapsedTime = now - ability.lastUsed;
            const cooldownTime = ability.cooldown * 1000;
            const remainingTime = cooldownTime - elapsedTime;
            
            // If cooldown is still active, update the UI
            if (remainingTime > 0) {
                this.gameManager.ui.updateAbilityCooldown(
                    slotElement, 
                    remainingTime / 1000, // Convert to seconds
                    ability.cooldown
                );
            } else if (remainingTime <= 0 && remainingTime > -1000) { 
                // Only complete the cooldown if it just finished (prevent multiple flashes)
                this.gameManager.ui.completeAbilityCooldown(slotElement);
            }
        }
    }
    
    showTooltip(item, slotElement) {
        // Remove existing tooltip if any
        this.hideTooltip();
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'item-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '10px';
        tooltip.style.borderRadius = '5px';
        tooltip.style.width = '200px';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        tooltip.style.border = '1px solid #555';
        
        // Position tooltip above the slot
        const slotRect = slotElement.getBoundingClientRect();
        tooltip.style.bottom = `${window.innerHeight - slotRect.top + 5}px`;
        tooltip.style.left = `${slotRect.left + slotRect.width / 2 - 100}px`;
        
        // Item name
        const name = document.createElement('div');
        name.style.fontSize = '16px';
        name.style.fontWeight = 'bold';
        name.style.color = '#ffcc00';
        name.style.marginBottom = '5px';
        name.textContent = item.name;
        tooltip.appendChild(name);
        
        // Item description
        const desc = document.createElement('div');
        desc.style.fontSize = '14px';
        desc.style.color = '#cccccc';
        desc.style.marginBottom = '5px';
        desc.textContent = item.description;
        tooltip.appendChild(desc);
        
        // Item stats
        if (item.stats) {
            const stats = document.createElement('div');
            stats.style.fontSize = '13px';
            stats.style.color = '#aaffaa';
            stats.style.marginTop = '5px';
            
            Object.entries(item.stats).forEach(([key, value]) => {
                const statText = document.createElement('div');
                statText.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)}: +${value}`;
                stats.appendChild(statText);
            });
            
            tooltip.appendChild(stats);
        }
        
        // Rarity
        if (item.rarity) {
            const rarity = document.createElement('div');
            rarity.style.fontSize = '12px';
            rarity.style.marginTop = '5px';
            
            // Set color based on rarity
            switch(item.rarity) {
                case 'uncommon':
                    rarity.style.color = '#00cc00';
                    break;
                case 'rare':
                    rarity.style.color = '#0066ff';
                    break;
                case 'epic':
                    rarity.style.color = '#aa00ff';
                    break;
                case 'legendary':
                    rarity.style.color = '#ff9900';
                    break;
                default:
                    rarity.style.color = '#aaaaaa';
            }
            
            rarity.textContent = `${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}`;
            tooltip.appendChild(rarity);
        }
        
        // Type
        if (item.type) {
            const typeElem = document.createElement('div');
            typeElem.style.fontSize = '12px';
            typeElem.style.color = '#aaaaaa';
            typeElem.style.marginTop = '3px';
            typeElem.textContent = `Type: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`;
            tooltip.appendChild(typeElem);
        }
        
        // Consumable indicator
        if (item.consumable) {
            const consumable = document.createElement('div');
            consumable.style.fontSize = '12px';
            consumable.style.color = '#ff5555';
            consumable.style.marginTop = '3px';
            consumable.textContent = 'Consumable - used once';
            tooltip.appendChild(consumable);
        }
        
        document.body.appendChild(tooltip);
        this.activeTooltip = tooltip;
    }
    
    hideTooltip() {
        if (this.activeTooltip) {
            document.body.removeChild(this.activeTooltip);
            this.activeTooltip = null;
        }
    }
    
    cleanup() {
        // Remove UI
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        // Remove item slot elements references
        this.itemSlotElements = null;
        this.consumableSlotElements = null;
        this.abilitySlotElements = null;
        
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyPress);
    }
    
    // Update method called by the game loop
    update() {
        // Update ability cooldowns
        this.updateAbilityCooldowns();
    }
    
    // New method to update player stats based on wearable items in inventory
    updateWearableItemStats() {
        if (!this.gameManager || !this.gameManager.hero) return;
        
        const hero = this.gameManager.hero;
        
        // Reset any previously applied stat bonuses from wearable items
        // This ensures we're not stacking the same bonuses multiple times
        this.resetWearableStatBonuses();
        
        // Apply stats from all wearable items in the item slots
        this.itemSlots.forEach(item => {
            if (item && item.type === 'wearable' && item.stats) {
                // Apply stat boosts from this wearable item
                Object.entries(item.stats).forEach(([stat, value]) => {
                    switch(stat) {
                        case 'health':
                            this.gameManager.gameState.maxHealth += value;
                            // Don't change current health to avoid healing on equip/unequip
                            break;
                        case 'damage':
                            hero.stats.damage += value;
                            break;
                        case 'speed':
                            hero.stats.speed += value;
                            break;
                        case 'armor':
                            hero.stats.armor += value;
                            break;
                        case 'evasion':
                            hero.stats.evasion += value;
                            break;
                        case 'healthRegen':
                            hero.stats.healthRegen += value;
                            break;
                        case 'attackSpeed':
                            hero.stats.attackSpeed += value;
                            break;
                        case 'collection':
                            hero.collectionRadius += value;
                            break;
                    }
                });
            }
        });
        
        // Update UI to reflect the changes
        if (this.gameManager.ui) {
            this.gameManager.ui.updatePlayerStats(hero);
            this.gameManager.ui.updateHealth(this.gameManager.gameState.health, this.gameManager.gameState.maxHealth);
        }
    }
    
    // Reset all wearable item stat bonuses
    resetWearableStatBonuses() {
        if (!this.gameManager || !this.gameManager.hero) return;
        
        const hero = this.gameManager.hero;
        
        // Reset hero stats to base values defined in Hero.js constructor
        // This makes sure we don't apply wearable bonuses multiple times
        hero.stats = {
            ...hero.stats,
            // Reset to base values from Hero.js
            health: 10,
            maxHealth: 10,
            healthRegen: 0.1,
            damage: 1,
            speed: 5,
            attackRange: 20,
            attackSpeed: 10,
            jumpHeight: 4,
            jumpSpeed: 10,
            armor: 0,
            evasion: 0,
            mana: 100,
            maxMana: 100,
            manaRegen: 1.0
        };
        
        // Reset collection radius
        hero.collectionRadius = 2; // Base value from Hero.js
        
        // Update gameState maxHealth for consistency
        this.gameManager.gameState.maxHealth = hero.stats.maxHealth;
        
        // Update UI after resetting
        if (this.gameManager.ui) {
            this.gameManager.ui.updatePlayerStats(hero);
            this.gameManager.ui.updateHealth(this.gameManager.gameState.health, this.gameManager.gameState.maxHealth);
        }
    }
} 