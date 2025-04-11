import * as THREE from 'three';

export class Item {
    constructor(scene, position, itemData, gameManager) {
        this.scene = scene;
        this.position = position.clone();
        this.gameManager = gameManager;
        
        // Copy item data
        this.id = itemData.id;
        this.name = itemData.name;
        this.description = itemData.description;
        this.type = itemData.type || 'default';
        this.stats = itemData.stats || {};
        this.consumable = itemData.consumable || false;
        this.rarity = itemData.rarity || 'common';
        this.value = itemData.value || 10;
        this.icon = itemData.icon || null;
        
        // Item state
        this.isCollected = false;
        
        // Create 3D mesh representation for the world
        this.createMesh();
    }
    
    createMesh() {
        // Create a floating item in the world
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        
        // Color based on item rarity
        let color;
        switch (this.rarity) {
            case 'uncommon':
                color = 0x00cc00; // Green
                break;
            case 'rare':
                color = 0x0066ff; // Blue
                break;
            case 'epic':
                color = 0xaa00ff; // Purple
                break;
            case 'legendary':
                color = 0xff9900; // Orange
                break;
            default:
                color = 0xcccccc; // Common - Gray
        }
        
        // Create material with emissive properties
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            metalness: 0.7,
            roughness: 0.3
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.position.y += 0.5; // Raise it slightly above ground
        
        // Add a point light to make item glow
        this.light = new THREE.PointLight(color, 0.7, 2);
        this.light.position.copy(this.mesh.position);
        
        // Add reference to this item for collision detection
        this.mesh.userData.item = this;
        
        this.scene.add(this.mesh);
        this.scene.add(this.light);
    }
    
    update(delta) {
        if (this.isCollected) return;
        
        // Make the item rotate and hover
        if (this.mesh) {
            this.mesh.rotation.y += 1.5 * delta;
            
            // Hovering animation
            const hoverHeight = 0.5 + 0.1 * Math.sin(Date.now() * 0.003);
            this.mesh.position.y = this.position.y + hoverHeight;
            
            // Update light position
            if (this.light) {
                this.light.position.copy(this.mesh.position);
                this.light.intensity = 0.5 + 0.2 * Math.sin(Date.now() * 0.005);
            }
        }
        
        // Check if hero can collect this item
        if (this.gameManager && this.gameManager.hero) {
            const heroPosition = this.gameManager.hero.mesh.position;
            const distance = heroPosition.distanceTo(this.mesh.position);
            
            // Auto-collect if close enough
            if (distance < this.gameManager.hero.collectionRadius) {
                this.collect();
            }
        }
    }
    
    collect() {
        if (this.isCollected) return false;
        
        // Mark as collected
        this.isCollected = true;
        
        // Play collection effect
        this.createCollectionEffect();
        
        // Try to add to inventory if it's an equippable/usable item
        if (this.gameManager.inventory) {
            this.gameManager.inventory.addItem(this);
        }
        
        // Gold handling has been removed
        
        // Play sound
        // if (this.gameManager.soundManager) {
        //     this.gameManager.soundManager.playSound('itemCollect');
        // }
        
        // Show notification
        if (this.gameManager.ui) {
            this.gameManager.ui.showNotification(`Collected: ${this.name}`, 2000);
        }
        
        // Remove mesh from scene
        this.cleanup();
        
        return true;
    }
    
    createCollectionEffect() {
        // Create particles for collection effect
        const particleCount = 10;
        const particles = new THREE.Group();
        
        // Get item color
        const color = this.mesh.material.color.clone();
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(geometry, material);
            
            // Random offset from the collection point
            particle.position.copy(this.mesh.position);
            
            // Random velocity
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 2
            );
            
            // Add to group
            particles.add(particle);
        }
        
        this.scene.add(particles);
        
        // Animate and remove after 1 second
        const startTime = Date.now();
        
        const animateParticles = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            
            if (elapsed < 1) {
                // Update each particle
                particles.children.forEach(particle => {
                    // Move by velocity
                    particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.1));
                    
                    // Gravity effect
                    particle.userData.velocity.y -= 0.1;
                    
                    // Fade out
                    particle.material.opacity = 0.8 * (1 - elapsed);
                    
                    // Scale down
                    particle.scale.set(1 - elapsed, 1 - elapsed, 1 - elapsed);
                });
                
                requestAnimationFrame(animateParticles);
            } else {
                // Remove particles when done
                this.scene.remove(particles);
                particles.children.forEach(particle => {
                    particle.geometry.dispose();
                    particle.material.dispose();
                });
            }
        };
        
        animateParticles();
    }
    
    use(gameManager) {
        // Apply the item's effects to the hero
        if (!gameManager || !gameManager.hero) return false;
        
        const hero = gameManager.hero;
        
        // Apply stat changes
        if (this.stats) {
            // Apply stat boosts
            Object.entries(this.stats).forEach(([stat, value]) => {
                switch(stat) {
                    case 'health':
                        gameManager.gameState.health += value;
                        gameManager.gameState.maxHealth += value;
                        gameManager.ui.updateHealth(gameManager.gameState.health, gameManager.gameState.maxHealth);
                        break;
                    case 'healing':
                        gameManager.gameState.health = Math.min(
                            gameManager.gameState.health + value,
                            gameManager.gameState.maxHealth
                        );
                        gameManager.ui.updateHealth(gameManager.gameState.health, gameManager.gameState.maxHealth);
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
                    case 'mana':
                        hero.stats.maxMana += value;
                        hero.stats.mana += value;
                        break;
                    case 'manaRestore':
                        hero.stats.mana = Math.min(
                            hero.stats.mana + value,
                            hero.stats.maxMana
                        );
                        // Directly update mana display
                        if (gameManager.ui) {
                            gameManager.ui.updateMana(hero.stats.mana, hero.stats.maxMana);
                        }
                        break;
                    case 'healthRegen':
                        hero.stats.healthRegen += value;
                        break;
                    case 'manaRegen':
                        hero.stats.manaRegen += value;
                        break;
                    case 'attackSpeed':
                        hero.stats.attackSpeed += value;
                        break;
                    case 'collection':
                        hero.collectionRadius += value;
                        break;
                    case 'ammo':
                        gameManager.gameState.resources.ammo += value;
                        gameManager.ui.updateAmmo(gameManager.gameState.resources.ammo);
                        break;
                }
            });
        }
        
        // Update UI to reflect the changes
        if (gameManager.ui) {
            gameManager.ui.updatePlayerStats(hero);
            
            // Show notification
            gameManager.ui.showNotification(`Used: ${this.name}`, 2000);
        }
        
        // Play use sound
        // if (gameManager.soundManager) {
        //     gameManager.soundManager.playSound('itemUse');
        // }
        
        return true;
    }
    
    cleanup() {
        // Remove from scene
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
        
        if (this.light) {
            this.scene.remove(this.light);
            this.light = null;
        }
    }
} 