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
        const geometry = new THREE.BoxGeometry(2, 2, 0.5);
        
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
        
        // Create material with emissive properties for better visibility
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.7,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.userData.isShopItem = true;
        this.mesh.userData.itemType = this.type;
        
        // Add a glowing pedestal beneath the item
        const pedestalGeometry = new THREE.CylinderGeometry(1.2, 1.5, 0.5, 16);
        const pedestalMaterial = new THREE.MeshStandardMaterial({
            color: 0x444455,
            emissive: 0x222233,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });
        this.pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
        this.pedestal.position.copy(this.position);
        this.pedestal.position.y -= 1.25; // Position below the item
        
        // Add a glow effect (point light) for each item
        this.itemLight = new THREE.PointLight(color, 1, 3);
        this.itemLight.position.copy(this.position);
        
        this.scene.add(this.mesh);
        this.scene.add(this.pedestal);
        this.scene.add(this.itemLight);
    }
    
    createText() {
        // Item description text with type name
        let description;
        let title;
        let priceText;
        
        switch(this.type) {
            case 'health':
                title = 'HEALTH';
                description = '+1 MAX HEALTH';
                break;
            case 'speed':
                title = 'SPEED';
                description = '+20% MOVE SPEED';
                break;
            case 'ammo':
                title = 'AMMO';
                description = '+15 AMMUNITION';
                break;
            case 'turretAmmo':
                title = 'TURRET AMMO';
                description = '+10 TURRET AMMO';
                break;
            case 'turretCooldown':
                title = 'FIRE RATE';
                description = '+25% TURRET SPEED';
                break;
            case 'damage':
                title = 'DAMAGE';
                description = '+25% DAMAGE';
                break;
            default:
                title = 'UNKNOWN';
                description = 'Unknown Item';
        }
        
        priceText = `${this.price} POINTS`;
        
        // Create title text (larger and more visible)
        this.titleText = new TextSprite(title, { 
            size: 1.0, 
            color: 0xffffff,
            fontSize: 48,
            backgroundColor: 0x111122,
            backgroundOpacity: 0.9,
            padding: 15,
            outline: true,
            outlineColor: 0x000000,
            outlineWidth: 6
        });
        this.titleText.position.set(
            this.position.x,
            this.position.y + 2.0,
            this.position.z
        );
        this.scene.add(this.titleText);
        
        // Create description text with improved visibility
        this.descriptionText = new TextSprite(description, { 
            size: 0.7, 
            color: 0xffff00,
            fontSize: 32,
            backgroundColor: 0x222222,
            backgroundOpacity: 0.85,
            padding: 12,
            outline: true,
            outlineColor: 0x000000,
            outlineWidth: 4
        });
        this.descriptionText.position.set(
            this.position.x,
            this.position.y + 1.2,
            this.position.z
        );
        this.scene.add(this.descriptionText);
        
        // Create price text with distinct styling
        this.priceText = new TextSprite(priceText, { 
            size: 0.6, 
            color: 0x00ffff,
            fontSize: 28,
            backgroundColor: 0x000066,
            backgroundOpacity: 0.9,
            padding: 10,
            outline: true,
            outlineColor: 0x000000,
            outlineWidth: 3
        });
        this.priceText.position.set(
            this.position.x,
            this.position.y - 1.3,
            this.position.z
        );
        this.scene.add(this.priceText);
        
        // Add info text
        this.infoText = new TextSprite("Press E to Purchase", { 
            size: 0.5, 
            color: 0xffaa00,
            fontSize: 24,
            backgroundColor: 0x330000,
            backgroundOpacity: 0.8,
            padding: 8,
            outline: true,
            outlineColor: 0x000000,
            outlineWidth: 3
        });
        this.infoText.position.set(
            this.position.x,
            this.position.y - 1.8,
            this.position.z
        );
        this.infoText.visible = false; // Only show when player is close
        this.scene.add(this.infoText);
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
        
        this.priceText = new TextSprite(`${this.price} POINTS`, { 
            size: 0.6, 
            color: 0x00ffff,
            fontSize: 28,
            backgroundColor: 0x000066,
            backgroundOpacity: 0.9,
            padding: 10,
            outline: true,
            outlineColor: 0x000000,
            outlineWidth: 3
        });
        this.priceText.position.set(
            this.position.x,
            this.position.y - 1.3,
            this.position.z
        );
        this.scene.add(this.priceText);
    }
    
    cleanup() {
        // Remove from scene
        this.scene.remove(this.mesh);
        this.scene.remove(this.descriptionText);
        this.scene.remove(this.priceText);
        this.scene.remove(this.titleText);
        this.scene.remove(this.infoText);
        this.scene.remove(this.pedestal);
        this.scene.remove(this.itemLight);
        
        // Dispose geometries and materials
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        
        if (this.pedestal) {
            this.pedestal.geometry.dispose();
            this.pedestal.material.dispose();
        }
    }
    
    update(camera, mouse) {
        // Make items slowly rotate and hover with more pronounced animation
        if (this.mesh) {
            this.mesh.rotation.y += 0.01;
            
            // Add hovering effect with more amplitude
            const timeNow = Date.now() * 0.001;
            const hoverOffset = Math.sin(timeNow * 2) * 0.15;
            this.mesh.position.y = this.position.y + hoverOffset;
            
            // Add subtle X/Z drift to make it seem more alive
            const xDrift = Math.sin(timeNow * 1.1) * 0.05;
            const zDrift = Math.cos(timeNow * 0.9) * 0.05;
            this.mesh.position.x = this.position.x + xDrift;
            this.mesh.position.z = this.position.z + zDrift;
            
            // Update light position to follow item
            if (this.itemLight) {
                this.itemLight.position.copy(this.mesh.position);
            }
        }
        
        // Make text labels face the camera
        const textLabels = [this.titleText, this.descriptionText, this.priceText, this.infoText];
        textLabels.forEach(label => {
            if (label) {
                label.lookAt(camera.position);
            }
        });
        
        // Check for hover using raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera); // Center of screen
        
        // Get distance from camera to this item
        const distanceToItem = camera.position.distanceTo(this.mesh.position);
        
        // If player is close to the item, highlight it
        if (distanceToItem < 4) { // Increased detection range
            // Highlight the item
            if (this.mesh.material) {
                // Add pulsing effect to make it more noticeable
                const pulseIntensity = 1.0 + Math.sin(Date.now() * 0.008) * 0.5;
                this.mesh.material.emissiveIntensity = pulseIntensity;
                
                // Scale up slightly when close
                const scale = 1.0 + Math.sin(Date.now() * 0.01) * 0.1;
                this.mesh.scale.set(scale, scale, scale);
            }
            
            // Make the light more intense when player is close
            if (this.itemLight) {
                this.itemLight.intensity = 1.5 + Math.sin(Date.now() * 0.008) * 0.5;
            }
            
            // Show purchase info
            if (this.infoText) {
                this.infoText.visible = true;
            }
            
            // Show interaction prompt
            if (distanceToItem < 3) {
                this.gameManager.ui.showNotification(`Press E to buy ${this.type} upgrade for ${this.price} points`, 100);
                
                // Check for keypress
                if (this.gameManager.lastKeyPressed === 'e' || this.gameManager.lastKeyPressed === 'E') {
                    this.tryPurchase();
                    this.gameManager.lastKeyPressed = ''; // Reset to prevent multiple purchases
                }
            }
        } else {
            // Reset highlight
            if (this.mesh.material) {
                this.mesh.material.emissiveIntensity = 0.7;
                this.mesh.scale.set(1, 1, 1);
            }
            
            // Reset light intensity
            if (this.itemLight) {
                this.itemLight.intensity = 1.0;
            }
            
            // Hide purchase info
            if (this.infoText) {
                this.infoText.visible = false;
            }
        }
    }
} 