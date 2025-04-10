export class ShopItem {
    /**
     * ShopItem class - represents an item that can be purchased in the shop
     * 
     * @param {Object} options - The item configuration options
     * @param {string} options.id - Unique identifier for the item
     * @param {string} options.name - Display name for the item
     * @param {string} options.description - Description of what the item does
     * @param {number} options.price - Cost in gold to purchase the item
     * @param {string} options.icon - Icon identifier (e.g., 'heart', 'sword', etc.)
     * @param {string} options.color - Color for the icon background (hex code)
     * @param {Function} options.effect - Function to execute when item is purchased
     */
    constructor(options) {
        this.id = options.id;
        this.name = options.name;
        this.description = options.description;
        this.price = options.price;
        this.icon = options.icon;
        this.color = options.color;
        this.effect = options.effect;
    }
    
    /**
     * Apply the effect of this item
     * @param {Object} gameManager - Reference to the game manager
     */
    applyEffect(gameManager) {
        if (typeof this.effect === 'function') {
            this.effect(gameManager);
        }
    }
} 