import * as THREE from 'three';
import { TextSprite } from '../ui/TextSprite.js';

export class ShopItem {
    constructor(scene, position, type, price, gameManager) {
        this.scene = scene;
        this.position = position;
        this.type = type;
        this.price = price;
        this.gameManager = gameManager;
        
        // Create item mesh
        this.createMesh();
        
        // Create price and description text
        this.createText();
    }
    
    createMesh() {
        // Create a cube for the item
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 0.5);
        
        // Different colors for different item types
        let color;
        switch(this.type) {
            case 'health':
                color = 0xff0000; // Red
                break;
            case 'speed':
                color = 0x00ff00; // Green
                break;
            case 'ammo':
                color = 0x0000ff; // Blue
                break;
            case 'turretAmmo':
                color = 0xffff00; // Yellow
                break;
            case 'turretCooldown':
                color = 0xff00ff; // Purple
                break;
            case 'damage':
                color = 0xff5500; // Orange
                break;
            default:
                color = 0xffffff; // White
        }
        
        const material = new THREE.MeshBasicMaterial({ color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.userData.isShopItem = true;
        this.mesh.userData.itemType = this.type;
        
        this.scene.add(this.mesh);
    }
    
    createText() {
        // Item description text
        let description;
        switch(this.type) {
            case 'health':
                description = 'Health +1';
                break;
            case 'speed':
                description = 'Speed +20%';
                break;
            case 'ammo':
                description = 'Max Ammo +5';
                break;
            case 'turretAmmo':
                description = 'Turret Ammo +10';
                break;
            case 'turretCooldown':
                description = 'Turret Rate +25%';
                break;
            case 'damage':
                description = 'Damage +25%';
                break;
            default:
                description = 'Unknown Item';
        }
        
        // Create description text
        this.descriptionText = new TextSprite(description, { 
            size: 0.4, 
            color: 0xffffff 
        });
        this.descriptionText.position.set(
            this.position.x,
            this.position.y + 1,
            this.position.z
        );
        this.scene.add(this.descriptionText);
        
        // Create price text
        this.priceText = new TextSprite(`Price: ${this.price}`, { 
            size: 0.3, 
            color: 0xffff00 
        });
        this.priceText.position.set(
            this.position.x,
            this.position.y - 1,
            this.position.z
        );
        this.scene.add(this.priceText);
    }
    
    checkClick(raycaster) {
        const intersects = raycaster.intersectObject(this.mesh);
        
        if (intersects.length > 0) {
            this.tryPurchase();
        }
    }
    
    tryPurchase() {
        // Check if player has enough points/score
        if (this.gameManager.gameState.score >= this.price) {
            // Apply upgrade based on type
            const success = this.applyUpgrade();
            
            if (success) {
                // Deduct points/score
                this.gameManager.gameState.score -= this.price;
                
                // Update UI score display
                if (this.gameManager.ui) {
                    this.gameManager.ui.updateScore(this.gameManager.gameState.score);
                }
                
                // Play purchase sound
                // this.gameManager.soundManager.playSound('purchase');
                
                // Show success notification
                if (this.gameManager.ui) {
                    this.gameManager.ui.showNotification(`Purchased ${this.type} upgrade!`);
                }
                
                // Increase price for next time
                this.price = Math.floor(this.price * 1.5);
                this.updatePriceText();
            }
        } else {
            // Show not enough points notification
            if (this.gameManager.ui) {
                this.gameManager.ui.showNotification("Not enough points!");
            }
            
            // Play error sound
            // this.gameManager.soundManager.playSound('error');
        }
    }
    
    applyUpgrade() {
        // Apply upgrade based on type
        switch(this.type) {
            case 'health':
                // Add health to player
                if (this.gameManager.hero) {
                    this.gameManager.gameState.health++;
                    this.gameManager.gameState.maxHealth++;
                    this.gameManager.ui.updateHealth(
                        this.gameManager.gameState.health, 
                        this.gameManager.gameState.maxHealth
                    );
                    return true;
                }
                break;
                
            case 'speed':
                // Increase player speed
                if (this.gameManager.hero) {
                    this.gameManager.hero.movementSpeed *= 1.2;
                    return true;
                }
                break;
                
            case 'ammo':
                // Increase player max ammo
                if (this.gameManager.hero) {
                    this.gameManager.gameState.resources.ammo += 15;
                    this.gameManager.ui.updateAmmo(this.gameManager.gameState.resources.ammo);
                    return true;
                }
                break;
                
            case 'turretAmmo':
                // Increase turret ammo
                if (this.gameManager.turretManager) {
                    this.gameManager.turretManager.baseTurretAmmo += 10;
                    return true;
                }
                break;
                
            case 'turretCooldown':
                // Decrease turret cooldown
                if (this.gameManager.turretManager) {
                    const currentCooldown = this.gameManager.turretManager.turretCooldown || 20;
                    this.gameManager.turretManager.turretCooldown = currentCooldown * 0.75;
                    return true;
                }
                break;
                
            case 'damage':
                // Increase player damage
                if (this.gameManager.hero) {
                    this.gameManager.hero.damage = (this.gameManager.hero.damage || 1) * 1.25;
                    return true;
                }
                break;
                
            default:
                return false;
        }
        
        return false;
    }
    
    updatePriceText() {
        // Update price text after purchase
        if (this.priceText) {
            this.scene.remove(this.priceText);
        }
        
        this.priceText = new TextSprite(`Price: ${this.price}`, { 
            size: 0.3, 
            color: 0xffff00 
        });
        this.priceText.position.set(
            this.position.x,
            this.position.y - 1,
            this.position.z
        );
        this.scene.add(this.priceText);
    }
    
    cleanup() {
        // Remove from scene
        this.scene.remove(this.mesh);
        this.scene.remove(this.descriptionText);
        this.scene.remove(this.priceText);
        
        // Dispose geometries and materials
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
    
    update(camera, mouse) {
        // Implement hover effect here if needed in the future
        // For now, this is a placeholder to ensure the method exists
        
        // Make the item slowly rotate for better visibility
        if (this.mesh) {
            this.mesh.rotation.y += 0.01;
        }
    }
} 