import * as THREE from 'three';
import { Item } from './Item.js';
import { itemDatabase } from './itemDatabase.js';

export class ItemManager {
    constructor(scene, gameManager) {
        this.scene = scene;
        this.gameManager = gameManager;
        this.items = [];
        
        // For debugging/testing
        // this.spawnRandomItems(5);
    }
    
    update(delta) {
        // Update all active items
        this.items.forEach(item => {
            if (item && !item.isCollected) {
                item.update(delta);
            }
        });
        
        // Remove collected items from the array
        this.items = this.items.filter(item => !item.isCollected);
    }
    
    spawnItem(position, itemId) {
        // Find item data in the database
        const itemData = itemId ? this.getItemById(itemId) : this.getRandomItem();
        
        if (!itemData) {
            console.error(`Item with ID ${itemId} not found`);
            return null;
        }
        
        // Create the item
        const item = new Item(this.scene, position, itemData, this.gameManager);
        this.items.push(item);
        return item;
    }
    
    spawnRandomItems(count, centerPosition = new THREE.Vector3(0, 0, 0), radius = 10) {
        for (let i = 0; i < count; i++) {
            // Random position within radius
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const x = centerPosition.x + Math.cos(angle) * distance;
            const z = centerPosition.z + Math.sin(angle) * distance;
            
            const position = new THREE.Vector3(x, 0, z);
            
            // Spawn random item
            this.spawnItem(position);
        }
    }
    
    spawnItemDrop(enemy) {
        if (!enemy || !enemy.mesh) return;
        
        const position = enemy.mesh.position.clone();
        
        // Directly award gold to the player instead of dropping it
        const goldAmount = this.calculateGoldDrop(enemy);
        this.gameManager.addGold(goldAmount);
        
        // Show gold notification
        this.gameManager.ui.showNotification(`+${goldAmount} Gold`, 1000);
        
        // Chance to drop an item based on enemy type
        const dropChance = this.getDropChance(enemy);
        if (Math.random() < dropChance) {
            // Offset slightly from the enemy position
            const itemPosition = position.clone();
            itemPosition.x += (Math.random() - 0.5) * 2;
            itemPosition.z += (Math.random() - 0.5) * 2;
            
            // Higher rarity for stronger enemies
            let rarityPool = ['common'];
            
            if (enemy.enemyType === 'tank' || enemy.enemyType === 'ranged') {
                rarityPool.push('uncommon');
            }
            
            if (enemy.enemyType === 'boss') {
                rarityPool.push('uncommon', 'rare', 'epic');
            }
            
            const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
            
            // Get random item of appropriate rarity
            const item = this.getRandomItemByRarity(rarity);
            if (item) {
                this.spawnItem(itemPosition, item.id);
            }
        }
    }
    
    spawnGold(position, amount) {
        // Create a gold pile item
        const goldData = {
            id: 'gold_pile',
            name: `${amount} Gold`,
            description: `${amount} gold pieces that can be used to purchase items.`,
            type: 'gold',
            rarity: 'common',
            value: amount,
            consumable: true,
            icon: 'gold_pile'
        };
        
        const goldItem = new Item(this.scene, position, goldData, this.gameManager);
        this.items.push(goldItem);
        return goldItem;
    }
    
    calculateGoldDrop(enemy) {
        // Base gold value by enemy type
        let baseGold = 5;
        
        switch (enemy.enemyType) {
            case 'fast':
                baseGold = 8;
                break;
            case 'tank': 
                baseGold = 12;
                break;
            case 'ranged':
                baseGold = 10;
                break;
            case 'boss':
                baseGold = 50;
                break;
        }
        
        // Add random variance (+/- 20%)
        const variance = baseGold * 0.4 * (Math.random() - 0.5);
        
        // Scale with wave number
        const waveMultiplier = Math.max(1, this.gameManager.gameState.wave * 0.2);
        
        return Math.floor((baseGold + variance) * waveMultiplier);
    }
    
    getDropChance(enemy) {
        // Base drop chance by enemy type
        switch (enemy.enemyType) {
            case 'fast':
                return 0.05; // 5% chance
            case 'tank':
                return 0.15; // 15% chance
            case 'ranged':
                return 0.1; // 10% chance
            case 'boss':
                return 1.0; // 100% chance
            default:
                return 0.03; // 3% chance
        }
    }
    
    getItemById(id) {
        return itemDatabase.find(item => item.id === id);
    }
    
    getRandomItem() {
        // Get random item from database
        const randomIndex = Math.floor(Math.random() * itemDatabase.length);
        return itemDatabase[randomIndex];
    }
    
    getRandomItemByRarity(rarity) {
        // Filter items by rarity
        const rarityItems = itemDatabase.filter(item => item.rarity === rarity);
        
        if (rarityItems.length === 0) {
            return null;
        }
        
        // Get random item from filtered list
        const randomIndex = Math.floor(Math.random() * rarityItems.length);
        return rarityItems[randomIndex];
    }
    
    cleanup() {
        // Remove all items from scene
        this.items.forEach(item => {
            if (item) {
                item.cleanup();
            }
        });
        
        this.items = [];
    }
} 