import * as THREE from 'three';

export class Inventory {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.slots = new Array(8).fill(null); // 8 inventory slots
        this.activeSlot = 0; // Currently selected slot
        
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
        this.container.style.top = '10px';
        this.container.style.right = '10px';
        this.container.style.width = '400px';
        this.container.style.padding = '10px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        this.container.style.borderRadius = '5px';
        this.container.style.zIndex = '100';
        this.container.style.display = 'flex';
        this.container.style.flexWrap = 'wrap';
        this.container.style.justifyContent = 'center';
        this.container.style.gap = '5px';
        
        // Create inventory slots
        this.slotElements = [];
        
        for (let i = 0; i < 8; i++) {
            const slot = document.createElement('div');
            slot.style.width = '85px';
            slot.style.height = '85px';
            slot.style.backgroundColor = 'rgba(50, 50, 70, 0.6)';
            slot.style.border = '2px solid #444';
            slot.style.borderRadius = '5px';
            slot.style.display = 'flex';
            slot.style.alignItems = 'center';
            slot.style.justifyContent = 'center';
            slot.style.flexDirection = 'column';
            slot.style.position = 'relative';
            slot.style.cursor = 'pointer';
            slot.dataset.index = i;
            
            // Add keybind indicator (1-8)
            const keybind = document.createElement('div');
            keybind.style.position = 'absolute';
            keybind.style.top = '3px';
            keybind.style.right = '5px';
            keybind.style.color = '#aaa';
            keybind.style.fontSize = '16px';
            keybind.style.fontWeight = 'bold';
            keybind.textContent = `${i+1}`;
            slot.appendChild(keybind);
            
            // Content will be added dynamically when items are added
            
            // Add click event
            slot.addEventListener('click', () => this.selectSlot(i));
            
            this.container.appendChild(slot);
            this.slotElements.push(slot);
        }
        
        // Add to document
        document.body.appendChild(this.container);
        
        // Highlight active slot
        this.updateActiveSlot();
    }
    
    updateActiveSlot() {
        // Reset all slots
        this.slotElements.forEach((slot, index) => {
            if (index === this.activeSlot) {
                slot.style.border = '2px solid #ffcc00';
                slot.style.boxShadow = '0 0 10px #ffcc00';
            } else {
                slot.style.border = '2px solid #444';
                slot.style.boxShadow = 'none';
            }
        });
    }
    
    handleKeyPress(event) {
        // Check for number keys 1-8 to select inventory slots
        const key = parseInt(event.key);
        if (!isNaN(key) && key >= 1 && key <= 8) {
            this.selectSlot(key - 1);
        }
    }
    
    selectSlot(index) {
        if (index >= 0 && index < 8) {
            this.activeSlot = index;
            this.updateActiveSlot();
            this.useActiveItem();
        }
    }
    
    addItem(item) {
        // Find first empty slot
        const emptySlot = this.slots.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            this.slots[emptySlot] = item;
            this.updateSlotUI(emptySlot);
            return true;
        }
        
        // No empty slots
        if (this.gameManager.ui) {
            this.gameManager.ui.showNotification("Inventory full!", 2000);
        }
        return false;
    }
    
    removeItem(index) {
        if (index >= 0 && index < 8 && this.slots[index] !== null) {
            const item = this.slots[index];
            this.slots[index] = null;
            this.updateSlotUI(index);
            return item;
        }
        return null;
    }
    
    updateSlotUI(index) {
        const slot = this.slotElements[index];
        const item = this.slots[index];
        
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
            'default': '#ffffff'
        };
        
        return colors[type] || colors.default;
    }
    
    useActiveItem() {
        const item = this.slots[this.activeSlot];
        if (item) {
            if (item.use(this.gameManager)) {
                // If item is consumed, remove it
                if (item.consumable) {
                    this.removeItem(this.activeSlot);
                }
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
                const statLine = document.createElement('div');
                statLine.textContent = `${key}: ${value > 0 ? '+' : ''}${value}`;
                stats.appendChild(statLine);
            });
            
            tooltip.appendChild(stats);
        }
        
        // Add consumable indicator if applicable
        if (item.consumable) {
            const consumable = document.createElement('div');
            consumable.style.fontSize = '13px';
            consumable.style.color = '#ff7777';
            consumable.style.marginTop = '5px';
            consumable.textContent = 'Consumable';
            tooltip.appendChild(consumable);
        }
        
        // Position the tooltip
        const rect = slotElement.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top}px`;
        
        // Add to document
        document.body.appendChild(tooltip);
        
        // Store reference
        this.activeTooltip = tooltip;
    }
    
    hideTooltip() {
        // Remove existing tooltip
        if (this.activeTooltip) {
            document.body.removeChild(this.activeTooltip);
            this.activeTooltip = null;
        }
    }
    
    cleanup() {
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyPress);
        
        // Remove UI
        if (this.container) {
            document.body.removeChild(this.container);
        }
        
        // Remove tooltip if any
        this.hideTooltip();
    }
} 