import * as THREE from 'three';
import { ShopItem } from './ShopItem.js';
import { ShopUI } from './ShopUI.js';

export class ShopManager {
    constructor(scene, gameManager) {
        this.scene = scene;
        this.gameManager = gameManager;
        this.camera = gameManager.camera;
        this.isShopActive = false;
        this.interactionDistance = 5; // How close player needs to be to interact
        
        // Three shop buildings positions (in area B)
        this.shopPositions = [
            new THREE.Vector3(40, 0, -15),  // North area of area B (Items Shop)
            new THREE.Vector3(25, 0, -5),   // West area of area B (Consumables Shop)
            new THREE.Vector3(55, 0, -5)    // East area of area B (Abilities Shop)
        ];
        
        this.shopTypes = ['items', 'consumables', 'abilities'];
        this.currentShopType = null;
        this.shopBuildings = [];
        this.interactionZones = [];
        
        // Create shop buildings
        this.createShopBuildings();
        
        // Create shop UI (but don't show it yet)
        this.shopUI = new ShopUI(this.gameManager);
        
        // Define shop items by type
        this.shopInventory = {
            // Items Shop (permanent upgrades - add to inventory)
            items: [
                {
                    id: 'health_upgrade',
                    name: 'Health Amulet',
                    description: 'Increases max health by 1 when held in inventory',
                    price: 100,
                    icon: 'heart',
                    color: '#ff0000',
                    type: 'wearable', // Item type
                    rarity: 'uncommon', // Item rarity
                    consumable: false,
                    stats: { health: 1 }, // Stats to apply when held
                    addToInventory: true, // Flag to indicate this should be added to inventory
                    // No use function as stats are applied automatically when held
                },
                {
                    id: 'damage_upgrade',
                    name: 'Sharp Blade',
                    description: 'Increases weapon damage by 0.5 when held in inventory',
                    price: 150,
                    icon: 'sword',
                    color: '#ff6600',
                    type: 'wearable',
                    rarity: 'uncommon',
                    consumable: false,
                    stats: { damage: 0.5 },
                    addToInventory: true,
                    // No use function as stats are applied automatically when held
                },
                {
                    id: 'armor_upgrade',
                    name: 'Reinforced Plate',
                    description: 'Increases damage reduction by 5% when held in inventory',
                    price: 180,
                    icon: 'shield',
                    color: '#cccccc',
                    type: 'wearable',
                    rarity: 'uncommon',
                    consumable: false,
                    stats: { armor: 5 },
                    addToInventory: true,
                    // No use function as stats are applied automatically when held
                },
                {
                    id: 'speed_upgrade',
                    name: 'Swift Boots',
                    description: 'Increases movement speed by 0.5 when held in inventory',
                    price: 120,
                    icon: 'boots',
                    color: '#00ff00',
                    type: 'wearable',
                    rarity: 'uncommon',
                    consumable: false,
                    stats: { speed: 0.5 },
                    addToInventory: true,
                    // No use function as stats are applied automatically when held
                },
            ],
            
            // Consumables Shop
            consumables: [
                {
                    id: 'health_potion',
                    name: 'Health Potion',
                    description: 'Restores 2 health instantly',
                    price: 50,
                    icon: 'flask',
                    color: '#ff5555',
                    type: 'consumable',
                    rarity: 'common',
                    consumable: true,
                    addToInventory: true,
                    stats: { healing: 2 },
                    use: function(gameManager) {
                        const maxHealth = gameManager.gameState.maxHealth;
                        gameManager.gameState.health = Math.min(maxHealth, gameManager.gameState.health + 2);
                        gameManager.ui.updateHealth(gameManager.gameState.health, maxHealth);
                        gameManager.ui.showNotification("Used health potion!", 2000);
                        return true; // Item was used successfully
                    }
                },
                {
                    id: 'speed_boost',
                    name: 'Speed Elixir',
                    description: 'Temporarily increases speed by 1.0 for 30 seconds',
                    price: 80,
                    icon: 'bolt',
                    color: '#00ffff',
                    type: 'consumable',
                    rarity: 'uncommon',
                    consumable: true,
                    addToInventory: true,
                    use: function(gameManager) {
                        gameManager.hero.stats.speed += 1.0;
                        gameManager.ui.updatePlayerStats(gameManager.hero);
                        gameManager.ui.showNotification("Speed boosted for 30 seconds!", 2000);
                        
                        // Revert speed after 30 seconds
                        setTimeout(() => {
                            gameManager.hero.stats.speed -= 1.0;
                            gameManager.ui.updatePlayerStats(gameManager.hero);
                            gameManager.ui.showNotification("Speed boost worn off", 2000);
                        }, 30000);
                        return true;
                    }
                },
                {
                    id: 'strength_potion',
                    name: 'Strength Potion',
                    description: 'Temporarily increases damage by 1.0 for 30 seconds',
                    price: 100,
                    icon: 'fire',
                    color: '#ff9900',
                    type: 'consumable',
                    rarity: 'uncommon',
                    consumable: true,
                    addToInventory: true,
                    use: function(gameManager) {
                        gameManager.hero.stats.damage += 1.0;
                        gameManager.ui.updatePlayerStats(gameManager.hero);
                        gameManager.ui.showNotification("Strength boosted for 30 seconds!", 2000);
                        
                        // Revert strength after 30 seconds
                        setTimeout(() => {
                            gameManager.hero.stats.damage -= 1.0;
                            gameManager.ui.updatePlayerStats(gameManager.hero);
                            gameManager.ui.showNotification("Strength boost worn off", 2000);
                        }, 30000);
                        return true;
                    }
                },
                {
                    id: 'revival_token',
                    name: 'Revival Token',
                    description: 'Instantly revive once after death',
                    price: 200,
                    icon: 'star',
                    color: '#ffff00',
                    type: 'consumable',
                    rarity: 'rare',
                    consumable: true,
                    addToInventory: true,
                    use: function(gameManager) {
                        gameManager.gameState.hasRevivalToken = true;
                        gameManager.ui.showNotification("Revival token activated! Will revive you once after death.", 3000);
                        return true;
                    }
                }
            ],
            
            // Abilities Shop
            abilities: [
                {
                    id: 'attack_speed',
                    name: 'Attack Speed',
                    description: 'Increases attack speed by 0.5',
                    price: 140,
                    icon: 'bow',
                    color: '#ffff00',
                    type: 'ability',
                    rarity: 'uncommon',
                    consumable: false,
                    stats: { attackSpeed: 0.5 },
                    addToInventory: true
                },
                {
                    id: 'health_regen',
                    name: 'Health Regen',
                    description: 'Increases health regeneration by 0.05/s',
                    price: 130,
                    icon: 'heart-pulse',
                    color: '#ff9999',
                    type: 'ability',
                    rarity: 'uncommon',
                    consumable: false,
                    stats: { healthRegen: 0.05 },
                    addToInventory: true
                },
                {
                    id: 'deploy_turret',
                    name: 'Deploy Turret',
                    description: 'Place a turret at your location (Press T to use)',
                    price: 200,
                    icon: 'turret',
                    color: '#66cccc',
                    type: 'ability',
                    rarity: 'rare',
                    consumable: false,
                    addToInventory: true,
                    use: function(gameManager) {
                        // Check if player is in combat area (area A)
                        const playerPosition = gameManager.hero.mesh.position.clone();
                        
                        // Check if we're in a valid placement zone
                        if (gameManager.isBetweenWaves) {
                            gameManager.ui.showNotification("Can't deploy turret between waves!", 2000);
                            return false;
                        }
                        
                        // Deploy turret at player position
                        gameManager.turretManager.deployTurret(playerPosition.x, playerPosition.z);
                        gameManager.ui.showNotification("Turret deployed!", 2000);
                        return true;
                    }
                },
                {
                    id: 'dash',
                    name: 'Dash Ability',
                    description: 'Allows quick dash forward (Press Shift)',
                    price: 250,
                    icon: 'forward',
                    color: '#99ccff',
                    type: 'ability',
                    rarity: 'rare',
                    consumable: false,
                    addToInventory: true,
                    effect: () => {
                        this.gameManager.hero.abilities.dash = true;
                        this.gameManager.ui.showNotification("Dash ability unlocked! Press Shift to dash.", 3000);
                    }
                },
                {
                    id: 'area_attack',
                    name: 'Area Attack',
                    description: 'Enables area attack (Press Space)',
                    price: 300,
                    icon: 'burst',
                    color: '#ff66ff',
                    type: 'ability',
                    rarity: 'rare',
                    consumable: false,
                    addToInventory: true,
                    effect: () => {
                        this.gameManager.hero.abilities.areaAttack = true;
                        this.gameManager.ui.showNotification("Area attack unlocked! Press Space to attack all nearby enemies.", 3000);
                    }
                },
                {
                    id: 'fireball',
                    name: 'Fireball',
                    description: 'Launch a fireball that damages enemies in a small area',
                    price: 350,
                    icon: 'fire',
                    color: '#ff6600',
                    type: 'ability',
                    rarity: 'rare',
                    consumable: false,
                    addToInventory: true,
                    cooldown: 5, // 5 seconds cooldown
                    use: function(gameManager) {
                        // Check if ability is on cooldown
                        const now = Date.now();
                        if (this.lastUsed && now - this.lastUsed < this.cooldown * 1000) {
                            const remainingCooldown = Math.ceil((this.cooldown * 1000 - (now - this.lastUsed)) / 1000);
                            gameManager.ui.showNotification(`Fireball on cooldown: ${remainingCooldown}s remaining`, 1000);
                            return false;
                        }
                        
                        // Get player position and facing direction
                        const position = gameManager.hero.mesh.position.clone();
                        
                        // Create a forward vector in the direction the hero is looking
                        const direction = new THREE.Vector3(0, 0, 1);
                        direction.applyQuaternion(gameManager.hero.mesh.quaternion);
                        
                        // Create a special fireball projectile (red/orange)
                        const projectile = gameManager.projectileManager.firePlayerProjectile(position, direction);
                        
                        // Modify projectile properties for fireball effect
                        projectile.mesh.scale.set(1.5, 1.5, 2); // Larger projectile
                        projectile.mesh.material.color.set(0xff6600); // Orange color
                        projectile.mesh.material.emissive.set(0xff6600);
                        projectile.mesh.material.emissiveIntensity = 1;
                        projectile.damage = 3; // More damage than regular projectiles
                        projectile.speed = 15;
                        projectile.areaEffect = true; // Enable area damage
                        projectile.areaRadius = 3; // 3 unit radius explosion
                        
                        // Track last used time for cooldown
                        this.lastUsed = now;
                        gameManager.ui.showNotification("Fireball launched!", 1000);
                        return true;
                    }
                },
                {
                    id: 'frost_nova',
                    name: 'Frost Nova',
                    description: 'Freezes all nearby enemies temporarily',
                    price: 400,
                    icon: 'snowflake',
                    color: '#99ccff',
                    type: 'ability',
                    rarity: 'epic',
                    consumable: false,
                    addToInventory: true,
                    cooldown: 10, // 10 seconds cooldown
                    use: function(gameManager) {
                        // Check if ability is on cooldown
                        const now = Date.now();
                        if (this.lastUsed && now - this.lastUsed < this.cooldown * 1000) {
                            const remainingCooldown = Math.ceil((this.cooldown * 1000 - (now - this.lastUsed)) / 1000);
                            gameManager.ui.showNotification(`Frost Nova on cooldown: ${remainingCooldown}s remaining`, 1000);
                            return false;
                        }
                        
                        // Get player position
                        const position = gameManager.hero.mesh.position.clone();
                        
                        // Effect radius
                        const radius = 8;
                        
                        // Find all enemies in radius
                        const affectedEnemies = gameManager.enemyManager.enemies.filter(enemy => {
                            return enemy.mesh.position.distanceTo(position) < radius;
                        });
                        
                        // Apply freeze effect
                        affectedEnemies.forEach(enemy => {
                            enemy.freeze(3); // Freeze for 3 seconds
                        });
                        
                        // Create a frost nova visual effect
                        this.createFrostNovaEffect(gameManager, position, radius);
                        
                        // Track last used time for cooldown
                        this.lastUsed = now;
                        gameManager.ui.showNotification(`Froze ${affectedEnemies.length} enemies!`, 2000);
                        return true;
                    },
                    
                    createFrostNovaEffect(gameManager, position, radius) {
                        // Create a ring of particles for the frost nova effect
                        const particleCount = 40;
                        const particles = new THREE.Group();
                        
                        for (let i = 0; i < particleCount; i++) {
                            const angle = (i / particleCount) * Math.PI * 2;
                            const x = Math.cos(angle) * radius;
                            const z = Math.sin(angle) * radius;
                            
                            const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
                            const material = new THREE.MeshBasicMaterial({
                                color: 0x99ccff, // Light blue for frost
                                transparent: true,
                                opacity: 0.8
                            });
                            
                            const particle = new THREE.Mesh(geometry, material);
                            particle.position.set(
                                position.x + x,
                                position.y + 0.5,
                                position.z + z
                            );
                            
                            particles.add(particle);
                        }
                        
                        gameManager.scene.add(particles);
                        
                        // Animate and remove after 1 second
                        const startTime = Date.now();
                        
                        const animateParticles = () => {
                            const elapsed = (Date.now() - startTime) / 1000;
                            
                            if (elapsed < 1) {
                                // Update each particle
                                particles.children.forEach((particle, i) => {
                                    // Move up
                                    particle.position.y += 0.05;
                                    
                                    // Scale up and fade out
                                    const scale = 1 + elapsed;
                                    particle.scale.set(scale, scale, scale);
                                    particle.material.opacity = 0.8 * (1 - elapsed);
                                });
                                
                                requestAnimationFrame(animateParticles);
                            } else {
                                // Remove particles when done
                                gameManager.scene.remove(particles);
                                particles.children.forEach(particle => {
                                    particle.geometry.dispose();
                                    particle.material.dispose();
                                });
                            }
                        };
                        
                        animateParticles();
                    }
                },
                {
                    id: 'lightning_strike',
                    name: 'Lightning Strike',
                    description: 'Call down lightning to strike your target',
                    price: 450,
                    icon: 'bolt',
                    color: '#ffff00',
                    type: 'ability',
                    rarity: 'epic',
                    consumable: false,
                    addToInventory: true,
                    cooldown: 8, // 8 seconds cooldown
                    use: function(gameManager) {
                        // Check if ability is on cooldown
                        const now = Date.now();
                        if (this.lastUsed && now - this.lastUsed < this.cooldown * 1000) {
                            const remainingCooldown = Math.ceil((this.cooldown * 1000 - (now - this.lastUsed)) / 1000);
                            gameManager.ui.showNotification(`Lightning Strike on cooldown: ${remainingCooldown}s remaining`, 1000);
                            return false;
                        }
                        
                        // Get player mouse cursor position for targeting
                        const raycaster = new THREE.Raycaster();
                        raycaster.setFromCamera(gameManager.hero.mouse, gameManager.camera);
                        
                        // Find intersection with ground plane
                        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
                        const targetPoint = new THREE.Vector3();
                        raycaster.ray.intersectPlane(groundPlane, targetPoint);
                        
                        if (!targetPoint) {
                            gameManager.ui.showNotification("Invalid target!", 1000);
                            return false;
                        }
                        
                        // Find all enemies near the target point
                        const radius = 5;
                        const affectedEnemies = gameManager.enemyManager.enemies.filter(enemy => {
                            return enemy.mesh.position.distanceTo(targetPoint) < radius;
                        });
                        
                        // Create lightning effect
                        this.createLightningEffect(gameManager, targetPoint);
                        
                        // Deal damage to enemies in radius
                        affectedEnemies.forEach(enemy => {
                            enemy.takeDamage(5); // High damage
                        });
                        
                        // Track last used time for cooldown
                        this.lastUsed = now;
                        gameManager.ui.showNotification(`Lightning struck ${affectedEnemies.length} enemies!`, 2000);
                        return true;
                    },
                    
                    createLightningEffect(gameManager, position) {
                        // Create lightning bolt from sky to ground
                        const height = 20; // Height of the lightning
                        
                        // Create geometry for lightning beam
                        const points = [];
                        const segments = 10;
                        const amplitude = 0.5; // How jagged the lightning is
                        
                        for (let i = 0; i <= segments; i++) {
                            const y = height * (1 - i / segments);
                            const xOffset = i === 0 || i === segments ? 0 : (Math.random() - 0.5) * amplitude;
                            const zOffset = i === 0 || i === segments ? 0 : (Math.random() - 0.5) * amplitude;
                            
                            points.push(new THREE.Vector3(
                                position.x + xOffset,
                                position.y + y,
                                position.z + zOffset
                            ));
                        }
                        
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        const material = new THREE.LineBasicMaterial({
                            color: 0xffff00,
                            linewidth: 3,
                            opacity: 0.8,
                            transparent: true
                        });
                        
                        const lightning = new THREE.Line(geometry, material);
                        gameManager.scene.add(lightning);
                        
                        // Create impact particles
                        const particleCount = 20;
                        const particles = new THREE.Group();
                        
                        for (let i = 0; i < particleCount; i++) {
                            const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
                            const material = new THREE.MeshBasicMaterial({
                                color: 0xffff00, // Yellow for lightning
                                transparent: true,
                                opacity: 0.8
                            });
                            
                            const particle = new THREE.Mesh(geometry, material);
                            
                            // Random offset from the impact point
                            particle.position.set(
                                position.x + (Math.random() - 0.5) * 2,
                                position.y + 0.5,
                                position.z + (Math.random() - 0.5) * 2
                            );
                            
                            // Random velocity
                            particle.userData.velocity = new THREE.Vector3(
                                (Math.random() - 0.5) * 4,
                                Math.random() * 4 + 2,
                                (Math.random() - 0.5) * 4
                            );
                            
                            particles.add(particle);
                        }
                        
                        gameManager.scene.add(particles);
                        
                        // Animate and remove after 0.5 seconds
                        const startTime = Date.now();
                        
                        const animateEffect = () => {
                            const elapsed = (Date.now() - startTime) / 1000;
                            
                            if (elapsed < 0.5) {
                                // Lightning beam fades quickly
                                lightning.material.opacity = 0.8 * (1 - elapsed * 2);
                                
                                // Update particles
                                particles.children.forEach(particle => {
                                    // Move by velocity
                                    particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.1));
                                    
                                    // Gravity effect
                                    particle.userData.velocity.y -= 0.2;
                                    
                                    // Fade out
                                    particle.material.opacity = 0.8 * (1 - elapsed * 2);
                                });
                                
                                requestAnimationFrame(animateEffect);
                            } else {
                                // Remove everything when done
                                gameManager.scene.remove(lightning);
                                lightning.geometry.dispose();
                                lightning.material.dispose();
                                
                                gameManager.scene.remove(particles);
                                particles.children.forEach(particle => {
                                    particle.geometry.dispose();
                                    particle.material.dispose();
                                });
                            }
                        };
                        
                        animateEffect();
                    }
                },
                {
                    id: 'healing_circle',
                    name: 'Healing Circle',
                    description: 'Create a circle that regenerates health while standing in it',
                    price: 400,
                    icon: 'heart',
                    color: '#ff9999',
                    type: 'ability',
                    rarity: 'rare',
                    consumable: false,
                    addToInventory: true,
                    cooldown: 15, // 15 seconds cooldown
                    use: function(gameManager) {
                        // Check if ability is on cooldown
                        const now = Date.now();
                        if (this.lastUsed && now - this.lastUsed < this.cooldown * 1000) {
                            const remainingCooldown = Math.ceil((this.cooldown * 1000 - (now - this.lastUsed)) / 1000);
                            gameManager.ui.showNotification(`Healing Circle on cooldown: ${remainingCooldown}s remaining`, 1000);
                            return false;
                        }
                        
                        // Get player position
                        const position = gameManager.hero.mesh.position.clone();
                        
                        // Create healing circle effect that lasts for 8 seconds
                        this.createHealingCircle(gameManager, position, 8);
                        
                        // Track last used time for cooldown
                        this.lastUsed = now;
                        gameManager.ui.showNotification("Healing Circle created! Stand inside to heal.", 2000);
                        return true;
                    },
                    
                    createHealingCircle(gameManager, position, duration) {
                        // Create a visible circle on the ground
                        const radius = 5;
                        const segments = 32;
                        const geometry = new THREE.CircleGeometry(radius, segments);
                        const material = new THREE.MeshBasicMaterial({
                            color: 0xff9999,
                            transparent: true,
                            opacity: 0.3,
                            side: THREE.DoubleSide
                        });
                        
                        const circle = new THREE.Mesh(geometry, material);
                        circle.rotation.x = -Math.PI / 2; // Rotate to be flat on ground
                        circle.position.set(position.x, 0.1, position.z); // Just above ground
                        
                        gameManager.scene.add(circle);
                        
                        // Create particles that move upward from the circle
                        const particles = new THREE.Group();
                        const particleCount = 20;
                        
                        // Store the circle data for checking if player is inside
                        const healingCircle = {
                            position: new THREE.Vector2(position.x, position.z),
                            radius: radius,
                            endTime: Date.now() + (duration * 1000),
                            healRate: 1, // Health per second
                            lastHealTime: 0
                        };
                        
                        // Add to global healing circles array (needs to be created if it doesn't exist)
                        if (!gameManager.healingCircles) {
                            gameManager.healingCircles = [];
                        }
                        gameManager.healingCircles.push(healingCircle);
                        
                        // Add healing effect to update loop
                        const checkHealingCircle = (delta) => {
                            const now = Date.now();
                            
                            // Remove expired circles
                            gameManager.healingCircles = gameManager.healingCircles.filter(circle => {
                                return now < circle.endTime;
                            });
                            
                            // Check if player is in any healing circle
                            const heroPosition = new THREE.Vector2(
                                gameManager.hero.mesh.position.x,
                                gameManager.hero.mesh.position.z
                            );
                            
                            gameManager.healingCircles.forEach(circle => {
                                // If player is in circle, heal them every second
                                if (heroPosition.distanceTo(circle.position) < circle.radius) {
                                    if (now - circle.lastHealTime > 1000) { // Once per second
                                        // Heal player
                                        gameManager.gameState.health = Math.min(
                                            gameManager.gameState.health + circle.healRate,
                                            gameManager.gameState.maxHealth
                                        );
                                        gameManager.ui.updateHealth(gameManager.gameState.health, gameManager.gameState.maxHealth);
                                        circle.lastHealTime = now;
                                    }
                                }
                            });
                            
                            // Continue checking if there are still active circles
                            if (gameManager.healingCircles.length > 0) {
                                requestAnimationFrame(() => checkHealingCircle(1/60));
                            }
                        };
                        
                        // Start the healing check
                        if (gameManager.healingCircles.length === 1) {
                            checkHealingCircle(1/60);
                        }
                        
                        // Create the particle effect
                        const createParticles = () => {
                            for (let i = 0; i < 3; i++) {
                                const angle = Math.random() * Math.PI * 2;
                                const distance = Math.random() * radius;
                                
                                const x = position.x + Math.cos(angle) * distance;
                                const z = position.z + Math.sin(angle) * distance;
                                
                                const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
                                const material = new THREE.MeshBasicMaterial({
                                    color: 0xff9999,
                                    transparent: true,
                                    opacity: 0.6
                                });
                                
                                const particle = new THREE.Mesh(geometry, material);
                                particle.position.set(x, 0.1, z);
                                particle.userData = {
                                    startTime: Date.now(),
                                    lifespan: 1000 // 1 second per particle
                                };
                                
                                particles.add(particle);
                            }
                        };
                        
                        gameManager.scene.add(particles);
                        
                        // Animate the healing circle for the duration
                        const startTime = Date.now();
                        const endTime = startTime + (duration * 1000);
                        
                        const animateHealingCircle = () => {
                            const now = Date.now();
                            
                            // Continue while duration hasn't elapsed
                            if (now < endTime) {
                                // Create new particles every 100ms
                                if (now % 100 < 20) {
                                    createParticles();
                                }
                                
                                // Update existing particles
                                for (let i = particles.children.length - 1; i >= 0; i--) {
                                    const particle = particles.children[i];
                                    const age = now - particle.userData.startTime;
                                    
                                    if (age < particle.userData.lifespan) {
                                        // Move upward
                                        particle.position.y += 0.03;
                                        
                                        // Fade out over lifespan
                                        particle.material.opacity = 0.6 * (1 - age / particle.userData.lifespan);
                                    } else {
                                        // Remove expired particles
                                        particles.remove(particle);
                                        particle.geometry.dispose();
                                        particle.material.dispose();
                                    }
                                }
                                
                                // Make the circle pulse
                                const elapsed = (now - startTime) / 1000;
                                const pulseScale = 1 + 0.1 * Math.sin(elapsed * 2);
                                circle.scale.set(pulseScale, pulseScale, 1);
                                
                                // Fade out near the end
                                const remainingTime = (endTime - now) / 1000;
                                if (remainingTime < 1) {
                                    circle.material.opacity = 0.3 * remainingTime;
                                }
                                
                                requestAnimationFrame(animateHealingCircle);
                            } else {
                                // Remove everything when done
                                gameManager.scene.remove(circle);
                                circle.geometry.dispose();
                                circle.material.dispose();
                                
                                gameManager.scene.remove(particles);
                                particles.children.forEach(particle => {
                                    particle.geometry.dispose();
                                    particle.material.dispose();
                                });
                            }
                        };
                        
                        animateHealingCircle();
                    }
                },
                {
                    id: 'blink',
                    name: 'Blink',
                    description: 'Instantly teleport to cursor location',
                    price: 300,
                    icon: 'magic',
                    color: '#cc99ff',
                    type: 'ability',
                    rarity: 'rare',
                    consumable: false,
                    addToInventory: true,
                    cooldown: 6, // 6 seconds cooldown
                    use: function(gameManager) {
                        // Check if ability is on cooldown
                        const now = Date.now();
                        if (this.lastUsed && now - this.lastUsed < this.cooldown * 1000) {
                            const remainingCooldown = Math.ceil((this.cooldown * 1000 - (now - this.lastUsed)) / 1000);
                            gameManager.ui.showNotification(`Blink on cooldown: ${remainingCooldown}s remaining`, 1000);
                            return false;
                        }
                        
                        // Get player position
                        const startPosition = gameManager.hero.mesh.position.clone();
                        
                        // Get cursor position for teleport destination
                        const raycaster = new THREE.Raycaster();
                        raycaster.setFromCamera(gameManager.hero.mouse, gameManager.camera);
                        
                        // Find intersection with ground plane
                        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
                        const targetPoint = new THREE.Vector3();
                        raycaster.ray.intersectPlane(groundPlane, targetPoint);
                        
                        if (!targetPoint) {
                            gameManager.ui.showNotification("Invalid teleport destination!", 1000);
                            return false;
                        }
                        
                        // Limit teleport distance
                        const maxDistance = 15;
                        const teleportDirection = new THREE.Vector3()
                            .subVectors(targetPoint, startPosition)
                            .setY(0); // Don't change Y position
                        
                        const distance = teleportDirection.length();
                        if (distance > maxDistance) {
                            teleportDirection.normalize().multiplyScalar(maxDistance);
                            targetPoint.copy(startPosition).add(teleportDirection);
                        }
                        
                        // Teleport particle effect at start position
                        this.createBlinkEffect(gameManager, startPosition);
                        
                        // Move player to target
                        gameManager.hero.mesh.position.x = targetPoint.x;
                        gameManager.hero.mesh.position.z = targetPoint.z;
                        
                        // Teleport particle effect at end position
                        this.createBlinkEffect(gameManager, targetPoint);
                        
                        // Track last used time for cooldown
                        this.lastUsed = now;
                        gameManager.ui.showNotification("Blinked!", 1000);
                        return true;
                    },
                    
                    createBlinkEffect(gameManager, position) {
                        // Create particle effect for teleport
                        const particleCount = 20;
                        const particles = new THREE.Group();
                        
                        for (let i = 0; i < particleCount; i++) {
                            const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
                            const material = new THREE.MeshBasicMaterial({
                                color: 0xcc99ff, // Purple
                                transparent: true,
                                opacity: 0.8
                            });
                            
                            const particle = new THREE.Mesh(geometry, material);
                            
                            // Random position in a sphere around teleport point
                            const radius = 1;
                            const theta = Math.random() * Math.PI * 2;
                            const phi = Math.acos(2 * Math.random() - 1);
                            
                            particle.position.set(
                                position.x + radius * Math.sin(phi) * Math.cos(theta),
                                position.y + radius * Math.sin(phi) * Math.sin(theta),
                                position.z + radius * Math.cos(phi)
                            );
                            
                            // Random velocity outward
                            particle.userData.velocity = new THREE.Vector3()
                                .subVectors(particle.position, position)
                                .normalize()
                                .multiplyScalar(Math.random() * 2 + 1);
                            
                            particles.add(particle);
                        }
                        
                        gameManager.scene.add(particles);
                        
                        // Animate and remove after 0.5 seconds
                        const startTime = Date.now();
                        
                        const animateParticles = () => {
                            const elapsed = (Date.now() - startTime) / 1000;
                            
                            if (elapsed < 0.5) {
                                // Update each particle
                                particles.children.forEach(particle => {
                                    // Move by velocity
                                    particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.1));
                                    
                                    // Fade out
                                    particle.material.opacity = 0.8 * (1 - elapsed * 2);
                                });
                                
                                requestAnimationFrame(animateParticles);
                            } else {
                                // Remove particles when done
                                gameManager.scene.remove(particles);
                                particles.children.forEach(particle => {
                                    particle.geometry.dispose();
                                    particle.material.dispose();
                                });
                            }
                        };
                        
                        animateParticles();
                    }
                }
            ]
        };
        
        // Current shop items (will be set when entering a specific shop)
        this.shopItems = [];
        
        // Bind methods
        this.update = this.update.bind(this);
        this.toggleShop = this.toggleShop.bind(this);
        
        // Add E key listener for shop interaction
        window.addEventListener('keydown', (e) => {
            if (e.key === 'e' || e.key === 'E') {
                this.onEKeyPressed();
            }
        });
        
        // Create shop signs
        this.createShopSigns();
        
        // Create "Start Next Wave" button
        this.createNextWaveButton();
    }
    
    createShopBuildings() {
        // For each shop position, create a shop building
        this.shopPositions.forEach((position, index) => {
            // Shop building dimensions
            const width = 10;
            const height = 6;
            const depth = 8;
            
            // Foundation height to adjust other elements
            const baseHeight = 0.5;
            const baseExtension = 1;
            const foundationOffset = baseHeight + 0.05; // Base height plus z-fighting prevention offset
            
            // Create shop building materials
            const wallMaterial = this.createWallMaterial();
            const roofMaterial = new THREE.MeshStandardMaterial({ 
                color: this.getShopColor(index),
                roughness: 0.8,
                metalness: 0.2
            });
            
            // Create main building structure as a solid building (no interior)
            const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
            const shopBuilding = new THREE.Mesh(buildingGeometry, wallMaterial);
            // Adjust building position to sit on top of foundation
            shopBuilding.position.set(position.x, height / 2 + foundationOffset, position.z);
            shopBuilding.castShadow = true;
            shopBuilding.receiveShadow = true;
            
            // Add collision to prevent player from entering
            if (!this.gameManager.colliders) {
                this.gameManager.colliders = [];
            }
            shopBuilding.userData.isCollidable = true;
            this.gameManager.colliders.push(shopBuilding);
            
            this.scene.add(shopBuilding);
            this.shopBuildings.push(shopBuilding);
            
            // Create foundation/base platform
            const baseGeometry = new THREE.BoxGeometry(
                width + baseExtension * 2, 
                baseHeight, 
                depth + baseExtension * 2
            );
            const baseMaterial = new THREE.MeshStandardMaterial({
                color: 0x555555,
                roughness: 0.9,
                metalness: 0.1
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            // Raise the base slightly above the ground to prevent z-fighting
            base.position.set(position.x, baseHeight/2 + 0.05, position.z);
            base.receiveShadow = true;
            this.scene.add(base);
            
            // Create steps to the entrance
            const stepsWidth = 4;
            const stepDepth = 0.8;
            const stepHeight = 0.25;
            const numSteps = 2;
            
            for (let i = 0; i < numSteps; i++) {
                const stepGeometry = new THREE.BoxGeometry(stepsWidth, stepHeight, stepDepth);
                const step = new THREE.Mesh(stepGeometry, baseMaterial);
                step.position.set(
                    position.x,
                    stepHeight * i + stepHeight/2 + 0.05, // Raise steps slightly to prevent z-fighting
                    position.z + depth/2 + baseExtension + stepDepth * (numSteps - i - 0.5)
                );
                step.castShadow = true;
                step.receiveShadow = true;
                this.scene.add(step);
            }
            
            // Create roof (pointed/triangular)
            const roofHeight = 3;
            const roofGeometry = new THREE.CylinderGeometry(0, width / 2, roofHeight, 4, 1);
            roofGeometry.rotateY(Math.PI / 4); // Rotate to align with building
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            // Adjust roof position to account for foundation
            roof.position.set(position.x, height + roofHeight / 2 + foundationOffset, position.z);
            roof.castShadow = true;
            this.scene.add(roof);
            
            // Create roof edge trim
            const roofTrimGeometry = new THREE.BoxGeometry(width + 0.5, 0.3, depth + 0.5);
            const roofTrimMaterial = new THREE.MeshStandardMaterial({
                color: this.getShopColor(index),
                roughness: 0.7,
                metalness: 0.3
            });
            const roofTrim = new THREE.Mesh(roofTrimGeometry, roofTrimMaterial);
            // Adjust trim position to account for foundation
            roofTrim.position.set(position.x, height + 0.15 + foundationOffset, position.z);
            roofTrim.castShadow = true;
            this.scene.add(roofTrim);
            
            // Create door (just a visual door that can't be opened)
            const doorWidth = 2;
            const doorHeight = 3;
            const doorGeometry = new THREE.PlaneGeometry(doorWidth, doorHeight);
            const doorMaterial = this.createDoorMaterial();
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(
                position.x, 
                doorHeight / 2 + foundationOffset, // Adjust door height for foundation
                position.z + depth / 2 + 0.05
            );
            door.castShadow = true;
            this.scene.add(door);
            
            // Create door frame
            this.createDoorFrame(
                position.x, 
                doorHeight / 2 + foundationOffset, // Adjust door frame height for foundation
                position.z + depth / 2 + 0.03,
                doorWidth,
                doorHeight
            );
            
            // Create windows
            this.createWindow(
                position.x - width / 2 - 0.05, 
                2 + foundationOffset, // Adjust window height for foundation
                position.z, 
                'left'
            );
            this.createWindow(
                position.x + width / 2 + 0.05, 
                2 + foundationOffset, // Adjust window height for foundation
                position.z, 
                'right'
            );
            
            // Add interaction trigger zone (outside the shop)
            const interactionZone = new THREE.Mesh(
                new THREE.SphereGeometry(this.interactionDistance),
                new THREE.MeshBasicMaterial({ 
                    color: 0x00ff00, 
                    transparent: true, 
                    opacity: 0.0 // Invisible
                })
            );
            interactionZone.position.set(
                position.x,
                this.interactionDistance / 2,
                position.z + depth / 2 + 2 // Outside the door
            );
            interactionZone.userData = { shopIndex: index, shopType: this.shopTypes[index] };
            this.scene.add(interactionZone);
            this.interactionZones.push(interactionZone);
        });
    }
    
    // Get color for each shop type
    getShopColor(shopIndex) {
        const colors = [
            0x884400,  // Brown for Items shop
            0x008844,  // Green for Consumables shop
            0x000088   // Blue for Abilities shop
        ];
        return colors[shopIndex];
    }
    
    createWallMaterial() {
        // Create a canvas for the wall texture
        const textureSize = 512; // Increase from 256 to 512 for more detail
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const ctx = canvas.getContext('2d');
        
        // Base color for shop (different than walls)
        ctx.fillStyle = '#B08040'; // Tan/wood color
        ctx.fillRect(0, 0, textureSize, textureSize);
        
        // Add wood grain pattern
        ctx.fillStyle = '#805030';
        
        // Create wood plank pattern
        const plankHeight = 64; // Larger planks for more detail
        
        for (let y = 0; y < textureSize; y += plankHeight) {
            // Add horizontal plank dividers with more detail
            ctx.fillStyle = '#552200';
            ctx.fillRect(0, y, textureSize, 3);
            
            // Add some color variation to planks
            const r = Math.floor(Math.random() * 30) + 96;
            const g = Math.floor(Math.random() * 20) + 64;
            const b = Math.floor(Math.random() * 20) + 40;
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            
            // Create subtle rectangular background for each plank
            ctx.fillRect(0, y + 3, textureSize, plankHeight - 6);
            
            // Add wood knots randomly
            if (Math.random() > 0.6) {
                for (let i = 0; i < 2; i++) {
                    const knotX = Math.random() * textureSize;
                    const knotY = y + 10 + Math.random() * (plankHeight - 20);
                    const knotSize = 5 + Math.random() * 15;
                    
                    // Create dark circle for wood knot
                    const gradient = ctx.createRadialGradient(
                        knotX, knotY, 0,
                        knotX, knotY, knotSize
                    );
                    gradient.addColorStop(0, '#3A2512');
                    gradient.addColorStop(0.5, '#4A3522');
                    gradient.addColorStop(1, `rgb(${r}, ${g}, ${b})`);
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(knotX, knotY, knotSize, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Add circular rings around knot
                    ctx.strokeStyle = '#4A3522';
                    ctx.lineWidth = 1;
                    for (let ring = 0; ring < 3; ring++) {
                        ctx.beginPath();
                        ctx.arc(knotX, knotY, knotSize * (0.7 + ring * 0.2), 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            }
            
            // Add wood grain lines with more variation and detail
            for (let i = 0; i < 12; i++) {
                const grainY = y + Math.random() * plankHeight;
                ctx.beginPath();
                ctx.moveTo(0, grainY);
                
                // Create more natural looking curves for the grain
                let prevX = 0;
                let prevY = grainY;
                
                for (let x = 0; x < textureSize; x += textureSize / 8) {
                    const nextY = grainY + (Math.random() * 14 - 7);
                    ctx.quadraticCurveTo(
                        prevX + (x - prevX) / 2, 
                        prevY, 
                        x, 
                        nextY
                    );
                    prevX = x;
                    prevY = nextY;
                }
                
                ctx.strokeStyle = (Math.random() > 0.5) ? '#6B4522' : '#915F38';
                ctx.lineWidth = 0.5 + Math.random() * 1.5;
                ctx.stroke();
            }
        }
        
        // Create the texture from the canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        
        // Create bump map for added detail
        const bumpMapCanvas = document.createElement('canvas');
        bumpMapCanvas.width = textureSize;
        bumpMapCanvas.height = textureSize;
        const bumpCtx = bumpMapCanvas.getContext('2d');
        
        // Copy the original texture to the bump map with slight modifications
        bumpCtx.drawImage(canvas, 0, 0);
        bumpCtx.fillStyle = '#000000';
        
        // Enhance plank dividers in bump map
        for (let y = 0; y < textureSize; y += plankHeight) {
            bumpCtx.fillRect(0, y, textureSize, 3);
        }
        
        const bumpTexture = new THREE.CanvasTexture(bumpMapCanvas);
        bumpTexture.wrapS = THREE.RepeatWrapping;
        bumpTexture.wrapT = THREE.RepeatWrapping;
        bumpTexture.repeat.set(1, 1);
        
        // Create the material with the texture
        return new THREE.MeshStandardMaterial({
            map: texture,
            bumpMap: bumpTexture,
            bumpScale: 0.05,
            roughness: 0.8,
            metalness: 0.2
        });
    }
    
    createDoorMaterial() {
        const textureSize = 512; // Increase from 256 to 512 for more detail
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const ctx = canvas.getContext('2d');
        
        // Door base color with gradient for depth
        const gradient = ctx.createLinearGradient(0, 0, textureSize, 0);
        gradient.addColorStop(0, '#5D3D1E');
        gradient.addColorStop(0.5, '#7D5D3E');
        gradient.addColorStop(1, '#5D3D1E');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, textureSize, textureSize);
        
        // Door frame with more detail
        ctx.strokeStyle = '#442200';
        ctx.lineWidth = 20;
        ctx.strokeRect(20, 20, textureSize - 40, textureSize - 40);
        
        // Add panel detail
        const panelBorder = 60;
        const panelWidth = textureSize - panelBorder * 2;
        const panelHeight = (textureSize - panelBorder * 3) / 2;
        
        // Function to draw a decorative panel
        const drawPanel = (x, y, width, height) => {
            // Panel background
            ctx.fillStyle = '#553311';
            ctx.fillRect(x, y, width, height);
            
            // Panel inner border
            ctx.strokeStyle = '#3A2209';
            ctx.lineWidth = 8;
            ctx.strokeRect(x + 10, y + 10, width - 20, height - 20);
            
            // Panel decorative carving
            const centerX = x + width/2;
            const centerY = y + height/2;
            
            // Create diamond/decorative pattern
            ctx.fillStyle = '#3A2209';
            ctx.beginPath();
            ctx.moveTo(centerX, y + 30);
            ctx.lineTo(x + width - 30, centerY);
            ctx.lineTo(centerX, y + height - 30);
            ctx.lineTo(x + 30, centerY);
            ctx.closePath();
            ctx.fill();
            
            // Highlight edges
            ctx.strokeStyle = '#6B4522';
            ctx.lineWidth = 2;
            ctx.stroke();
        };
        
        // Upper panel
        drawPanel(panelBorder, panelBorder, panelWidth, panelHeight);
        
        // Lower panel
        drawPanel(panelBorder, panelBorder * 2 + panelHeight, panelWidth, panelHeight);
        
        // Door handle with more detail
        const handleX = textureSize - panelBorder - 20;
        const handleY = textureSize / 2;
        
        // Handle backplate
        ctx.fillStyle = '#DDAA00';
        ctx.beginPath();
        ctx.rect(handleX - 20, handleY - 30, 40, 60);
        ctx.fill();
        
        // Handle knob
        const knobGradient = ctx.createRadialGradient(
            handleX, handleY, 0,
            handleX, handleY, 15
        );
        knobGradient.addColorStop(0, '#FFDD22');
        knobGradient.addColorStop(1, '#AA8800');
        
        ctx.fillStyle = knobGradient;
        ctx.beginPath();
        ctx.arc(handleX, handleY, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Handle shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(handleX - 5, handleY - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Add wood grain texture over the entire door
        ctx.globalCompositeOperation = 'overlay';
        
        // Add fine wood grain lines
        for (let i = 0; i < 100; i++) {
            const y = Math.random() * textureSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(
                textureSize/3, y + (Math.random() * 30 - 15),
                textureSize*2/3, y + (Math.random() * 30 - 15),
                textureSize, y + (Math.random() * 30 - 15)
            );
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.stroke();
        }
        
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
        
        // Add metal hinges
        ctx.fillStyle = '#888888';
        
        // Top hinge
        ctx.fillRect(40, 80, 30, 70);
        ctx.fillRect(30, 100, 50, 30);
        
        // Middle hinge
        ctx.fillRect(40, textureSize/2 - 35, 30, 70);
        ctx.fillRect(30, textureSize/2 - 15, 50, 30);
        
        // Bottom hinge
        ctx.fillRect(40, textureSize - 150, 30, 70);
        ctx.fillRect(30, textureSize - 130, 50, 30);
        
        // Hinge details
        ctx.fillStyle = '#555555';
        ctx.beginPath();
        ctx.arc(55, 100, 8, 0, Math.PI * 2);
        ctx.arc(55, textureSize/2 - 15, 8, 0, Math.PI * 2);
        ctx.arc(55, textureSize - 130, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Create the texture from the canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create bump map for door
        const bumpCanvas = document.createElement('canvas');
        bumpCanvas.width = textureSize;
        bumpCanvas.height = textureSize;
        const bumpCtx = bumpCanvas.getContext('2d');
        
        // Copy original to bump map
        bumpCtx.drawImage(canvas, 0, 0);
        
        // Enhance frame and panels in bump map
        bumpCtx.strokeStyle = '#FFFFFF';
        bumpCtx.lineWidth = 20;
        bumpCtx.strokeRect(20, 20, textureSize - 40, textureSize - 40);
        
        const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
        
        // Create the material with the texture
        return new THREE.MeshStandardMaterial({
            map: texture,
            bumpMap: bumpTexture,
            bumpScale: 0.05,
            roughness: 0.6,
            metalness: 0.3
        });
    }
    
    createWindowMaterial() {
        const textureSize = 256; // Increase from 128 to 256 for more detail
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const ctx = canvas.getContext('2d');
        
        // Window base (glass) with gradient for depth
        const glassGradient = ctx.createLinearGradient(0, 0, textureSize, textureSize);
        glassGradient.addColorStop(0, '#AADDFF');
        glassGradient.addColorStop(0.5, '#88CCFF');
        glassGradient.addColorStop(1, '#AADDFF');
        
        ctx.fillStyle = glassGradient;
        ctx.fillRect(0, 0, textureSize, textureSize);
        
        // Window frame with more detail
        ctx.strokeStyle = '#442200';
        ctx.lineWidth = 15;
        ctx.strokeRect(8, 8, textureSize - 16, textureSize - 16);
        
        // Window panes with more detail
        ctx.strokeStyle = '#331100';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(textureSize / 2, 0);
        ctx.lineTo(textureSize / 2, textureSize);
        ctx.moveTo(0, textureSize / 2);
        ctx.lineTo(textureSize, textureSize / 2);
        ctx.stroke();
        
        // Add wooden texture to frame
        ctx.strokeStyle = '#553311';
        ctx.lineWidth = 1;
        
        // Horizontal wood grain in frame
        for (let y = 5; y < textureSize; y += 3) {
            if (y > 15 && y < textureSize - 15 && 
                (y < textureSize/2 - 5 || y > textureSize/2 + 5)) {
                    
                ctx.beginPath();
                ctx.moveTo(5, y);
                for (let x = 15; x < textureSize - 5; x += 5) {
                    const variance = Math.random() * 2 - 1;
                    ctx.lineTo(x, y + variance);
                }
                ctx.lineTo(textureSize - 5, y);
                ctx.stroke();
            }
        }
        
        // Add detailed window glass effects
        
        // Light reflections
        ctx.globalCompositeOperation = 'lighter';
        
        // Main reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(textureSize / 4, textureSize / 4, 30, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Secondary reflections
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(textureSize * 3/4, textureSize * 3/4, 20, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Small sparkle reflections
        for (let i = 0; i < 10; i++) {
            const sparkleX = Math.random() * textureSize;
            const sparkleY = Math.random() * textureSize;
            const size = 2 + Math.random() * 4;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
        
        // Add custom detail to each window pane
        const paneWidth = textureSize / 2 - 10;
        const paneHeight = textureSize / 2 - 10;
        
        // Top-left pane
        ctx.fillStyle = 'rgba(120, 200, 255, 0.3)';
        ctx.fillRect(10, 10, paneWidth, paneHeight);
        
        // Top-right pane
        ctx.fillStyle = 'rgba(100, 180, 255, 0.3)';
        ctx.fillRect(textureSize / 2 + 5, 10, paneWidth, paneHeight);
        
        // Bottom-left pane
        ctx.fillStyle = 'rgba(140, 190, 255, 0.3)';
        ctx.fillRect(10, textureSize / 2 + 5, paneWidth, paneHeight);
        
        // Bottom-right pane
        ctx.fillStyle = 'rgba(160, 210, 255, 0.3)';
        ctx.fillRect(textureSize / 2 + 5, textureSize / 2 + 5, paneWidth, paneHeight);
        
        // Create the texture from the canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create the material with the texture
        return new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9,
            roughness: 0.1,
            metalness: 0.1,
            envMapIntensity: 1.5 // Enhance reflections
        });
    }
    
    createWindow(x, y, z, side) {
        // Window dimensions
        const windowWidth = 1.5;
        const windowHeight = 2;
        
        // Create window geometry
        const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
        const windowMaterial = this.createWindowMaterial();
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        
        // Position window based on side
        if (side === 'left') {
            window.position.set(x, y, z);
            window.rotation.y = Math.PI / 2;
        } else if (side === 'right') {
            window.position.set(x, y, z);
            window.rotation.y = -Math.PI / 2;
        }
        
        window.castShadow = true;
        this.scene.add(window);
        
        // Add window frame
        const frameThickness = 0.1;
        const frameWidth = 0.15;
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x442200,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Create window frame
        // Top frame
        const topFrameGeometry = new THREE.BoxGeometry(windowWidth + frameWidth * 2, frameWidth, frameThickness);
        const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
        
        // Bottom frame
        const bottomFrameGeometry = new THREE.BoxGeometry(windowWidth + frameWidth * 2, frameWidth, frameThickness);
        const bottomFrame = new THREE.Mesh(bottomFrameGeometry, frameMaterial);
        
        // Left frame
        const leftFrameGeometry = new THREE.BoxGeometry(frameWidth, windowHeight, frameThickness);
        const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
        
        // Right frame
        const rightFrameGeometry = new THREE.BoxGeometry(frameWidth, windowHeight, frameThickness);
        const rightFrame = new THREE.Mesh(rightFrameGeometry, frameMaterial);
        
        // Position frames based on side
        if (side === 'left') {
            topFrame.position.set(x, y + windowHeight/2 + frameWidth/2, z);
            topFrame.rotation.y = Math.PI / 2;
            
            bottomFrame.position.set(x, y - windowHeight/2 - frameWidth/2, z);
            bottomFrame.rotation.y = Math.PI / 2;
            
            leftFrame.position.set(x, y, z + windowWidth/2 + frameWidth/2);
            leftFrame.rotation.y = Math.PI / 2;
            
            rightFrame.position.set(x, y, z - windowWidth/2 - frameWidth/2);
            rightFrame.rotation.y = Math.PI / 2;
        } else if (side === 'right') {
            topFrame.position.set(x, y + windowHeight/2 + frameWidth/2, z);
            topFrame.rotation.y = -Math.PI / 2;
            
            bottomFrame.position.set(x, y - windowHeight/2 - frameWidth/2, z);
            bottomFrame.rotation.y = -Math.PI / 2;
            
            leftFrame.position.set(x, y, z - windowWidth/2 - frameWidth/2);
            leftFrame.rotation.y = -Math.PI / 2;
            
            rightFrame.position.set(x, y, z + windowWidth/2 + frameWidth/2);
            rightFrame.rotation.y = -Math.PI / 2;
        }
        
        // Add frames to scene
        this.scene.add(topFrame);
        this.scene.add(bottomFrame);
        this.scene.add(leftFrame);
        this.scene.add(rightFrame);
        
        // Add windowsill
        const sillWidth = windowWidth + frameWidth * 2;
        const sillDepth = 0.3;
        const sillHeight = 0.1;
        
        const sillGeometry = new THREE.BoxGeometry(sillWidth, sillHeight, sillDepth);
        const sillMaterial = new THREE.MeshStandardMaterial({
            color: 0x442200,
            roughness: 0.7,
            metalness: 0.3
        });
        
        const sill = new THREE.Mesh(sillGeometry, sillMaterial);
        
        // Position sill based on side
        if (side === 'left') {
            sill.position.set(x, y - windowHeight/2 - frameWidth - sillHeight/2, z);
            sill.rotation.y = Math.PI / 2;
        } else if (side === 'right') {
            sill.position.set(x, y - windowHeight/2 - frameWidth - sillHeight/2, z);
            sill.rotation.y = -Math.PI / 2;
        }
        
        this.scene.add(sill);
    }
    
    createDoorFrame(x, y, z, width, height) {
        const frameThickness = 0.2;
        const frameWidth = 0.3;
        
        // Door frame material
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x442200,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Top frame
        const topFrameGeometry = new THREE.BoxGeometry(width + frameWidth * 2, frameWidth, frameThickness);
        const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
        topFrame.position.set(x, y + height/2 + frameWidth/2, z);
        topFrame.castShadow = true;
        this.scene.add(topFrame);
        
        // Bottom frame
        const bottomFrameGeometry = new THREE.BoxGeometry(width + frameWidth * 2, frameWidth, frameThickness);
        const bottomFrame = new THREE.Mesh(bottomFrameGeometry, frameMaterial);
        bottomFrame.position.set(x, y - height/2 - frameWidth/2, z);
        bottomFrame.castShadow = true;
        this.scene.add(bottomFrame);
        
        // Left frame
        const leftFrameGeometry = new THREE.BoxGeometry(frameWidth, height + frameWidth * 2, frameThickness);
        const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
        leftFrame.position.set(x - width/2 - frameWidth/2, y, z);
        leftFrame.castShadow = true;
        this.scene.add(leftFrame);
        
        // Right frame
        const rightFrameGeometry = new THREE.BoxGeometry(frameWidth, height + frameWidth * 2, frameThickness);
        const rightFrame = new THREE.Mesh(rightFrameGeometry, frameMaterial);
        rightFrame.position.set(x + width/2 + frameWidth/2, y, z);
        rightFrame.castShadow = true;
        this.scene.add(rightFrame);
    }
    
    createWeaponRack(x, y, z) {
        // Create rack structure
        const rackWidth = 3;
        const rackHeight = 3;
        const rackDepth = 0.5;
        
        // Rack frame
        const rackMaterial = new THREE.MeshStandardMaterial({
            color: 0x554433,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Create back panel
        const backPanelGeometry = new THREE.BoxGeometry(rackWidth, rackHeight, 0.1);
        const backPanel = new THREE.Mesh(backPanelGeometry, rackMaterial);
        backPanel.position.set(x, y, z);
        backPanel.castShadow = true;
        this.scene.add(backPanel);
        
        // Create shelf supports
        const supportHeight = 0.1;
        const supportDepth = rackDepth;
        
        // Top support
        const topSupportGeometry = new THREE.BoxGeometry(rackWidth, supportHeight, supportDepth);
        const topSupport = new THREE.Mesh(topSupportGeometry, rackMaterial);
        topSupport.position.set(x, y + rackHeight/2 - supportHeight/2, z + supportDepth/2);
        topSupport.castShadow = true;
        this.scene.add(topSupport);
        
        // Middle support
        const middleSupportGeometry = new THREE.BoxGeometry(rackWidth, supportHeight, supportDepth);
        const middleSupport = new THREE.Mesh(middleSupportGeometry, rackMaterial);
        middleSupport.position.set(x, y, z + supportDepth/2);
        middleSupport.castShadow = true;
        this.scene.add(middleSupport);
        
        // Bottom support
        const bottomSupportGeometry = new THREE.BoxGeometry(rackWidth, supportHeight, supportDepth);
        const bottomSupport = new THREE.Mesh(bottomSupportGeometry, rackMaterial);
        bottomSupport.position.set(x, y - rackHeight/2 + supportHeight/2, z + supportDepth/2);
        bottomSupport.castShadow = true;
        this.scene.add(bottomSupport);
        
        // Add weapon models on the rack
        this.addWeaponToRack(x - 0.8, y + 0.8, z + 0.2, 'sword');
        this.addWeaponToRack(x + 0.8, y + 0.8, z + 0.2, 'axe');
        this.addWeaponToRack(x, y - 0.8, z + 0.2, 'shield');
    }
    
    addWeaponToRack(x, y, z, type) {
        let geometry, material;
        
        if (type === 'sword') {
            // Create simple sword shape
            const swordMaterial = new THREE.MeshStandardMaterial({
                color: 0xCCCCCC,
                roughness: 0.3,
                metalness: 0.8
            });
            
            const handleMaterial = new THREE.MeshStandardMaterial({
                color: 0x441100,
                roughness: 0.8,
                metalness: 0.2
            });
            
            // Sword blade
            const bladeGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.05);
            const blade = new THREE.Mesh(bladeGeometry, swordMaterial);
            blade.position.set(x, y, z);
            blade.castShadow = true;
            this.scene.add(blade);
            
            // Sword handle
            const handleGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.08);
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.position.set(x, y - 0.95, z);
            handle.castShadow = true;
            this.scene.add(handle);
            
            // Sword guard
            const guardGeometry = new THREE.BoxGeometry(0.4, 0.08, 0.1);
            const guard = new THREE.Mesh(guardGeometry, swordMaterial);
            guard.position.set(x, y - 0.75, z);
            guard.castShadow = true;
            this.scene.add(guard);
            
        } else if (type === 'axe') {
            // Create simple axe shape
            const axeHeadMaterial = new THREE.MeshStandardMaterial({
                color: 0xCCCCCC,
                roughness: 0.3,
                metalness: 0.8
            });
            
            const handleMaterial = new THREE.MeshStandardMaterial({
                color: 0x441100,
                roughness: 0.8,
                metalness: 0.2
            });
            
            // Axe handle
            const handleGeometry = new THREE.BoxGeometry(0.1, 1.4, 0.1);
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.position.set(x, y - 0.1, z);
            handle.castShadow = true;
            this.scene.add(handle);
            
            // Axe head
            const headGeometry = new THREE.ConeGeometry(0.4, 0.8, 4);
            headGeometry.rotateZ(Math.PI / 2);
            const head = new THREE.Mesh(headGeometry, axeHeadMaterial);
            head.position.set(x + 0.4, y + 0.5, z);
            head.castShadow = true;
            this.scene.add(head);
            
        } else if (type === 'shield') {
            // Create simple shield shape
            const shieldGeometry = new THREE.CylinderGeometry(0.6, 0.5, 1.2, 6, 1, false, 0, Math.PI);
            const shieldMaterial = new THREE.MeshStandardMaterial({
                color: 0x994400,
                roughness: 0.6,
                metalness: 0.4
            });
            
            const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
            shield.rotation.y = Math.PI;
            shield.position.set(x, y, z);
            shield.castShadow = true;
            this.scene.add(shield);
            
            // Shield emblem
            const emblemGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const emblemMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                roughness: 0.3,
                metalness: 0.8
            });
            
            const emblem = new THREE.Mesh(emblemGeometry, emblemMaterial);
            emblem.position.set(x, y, z + 0.15);
            emblem.scale.set(1, 1, 0.3);
            emblem.castShadow = true;
            this.scene.add(emblem);
        }
    }
    
    createPotionShelf(x, y, z) {
        // Create shelf structure
        const shelfWidth = 3;
        const shelfHeight = 2.5;
        const shelfDepth = 0.6;
        
        // Shelf material
        const shelfMaterial = new THREE.MeshStandardMaterial({
            color: 0x664422,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Back panel
        const backPanelGeometry = new THREE.BoxGeometry(shelfWidth, shelfHeight, 0.1);
        const backPanel = new THREE.Mesh(backPanelGeometry, shelfMaterial);
        backPanel.position.set(x, y, z);
        backPanel.castShadow = true;
        this.scene.add(backPanel);
        
        // Create 3 horizontal shelves
        for (let i = 0; i < 3; i++) {
            const shelfY = y - shelfHeight/2 + 0.1 + i * (shelfHeight/3);
            
            const shelfGeometry = new THREE.BoxGeometry(shelfWidth, 0.1, shelfDepth);
            const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
            shelf.position.set(x, shelfY, z + shelfDepth/2);
            shelf.castShadow = true;
            this.scene.add(shelf);
            
            // Add potion bottles to each shelf
            const potionColors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0xffff00];
            
            for (let j = 0; j < 3; j++) {
                const potionX = x - shelfWidth/2 + 0.4 + j * (shelfWidth/3);
                this.createPotionBottle(
                    potionX, 
                    shelfY + 0.3, 
                    z + shelfDepth/2, 
                    potionColors[(i + j) % potionColors.length]
                );
            }
        }
    }
    
    createPotionBottle(x, y, z, color) {
        // Create potion bottle
        const bottleGroup = new THREE.Group();
        
        // Bottle base
        const baseGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.3, 8);
        const bottleMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            transparent: true,
            opacity: 0.6,
            roughness: 0.1,
            metalness: 0.3
        });
        
        const bottleBase = new THREE.Mesh(baseGeometry, bottleMaterial);
        bottleBase.position.y = -0.1;
        bottleGroup.add(bottleBase);
        
        // Potion liquid
        const liquidGeometry = new THREE.CylinderGeometry(0.08, 0.13, 0.2, 8);
        const liquidMaterial = new THREE.MeshStandardMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            roughness: 0.2,
            metalness: 0.5
        });
        
        const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquid.position.y = -0.12;
        bottleGroup.add(liquid);
        
        // Bottle neck
        const neckGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.15, 8);
        const neck = new THREE.Mesh(neckGeometry, bottleMaterial);
        neck.position.y = 0.125;
        bottleGroup.add(neck);
        
        // Bottle cork
        const corkGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8);
        const corkMaterial = new THREE.MeshStandardMaterial({
            color: 0xbb8844,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const cork = new THREE.Mesh(corkGeometry, corkMaterial);
        cork.position.y = 0.225;
        bottleGroup.add(cork);
        
        bottleGroup.position.set(x, y, z);
        bottleGroup.children.forEach(child => {
            child.castShadow = true;
        });
        
        this.scene.add(bottleGroup);
    }
    
    createMagicOrb(x, y, z) {
        // Create a floating orb with particle effects
        const orbGroup = new THREE.Group();
        
        // Create base/pedestal
        const baseGeometry = new THREE.CylinderGeometry(0.5, 0.7, 0.3, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.7,
            metalness: 0.4
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(x, 0.15, z);
        base.castShadow = true;
        base.receiveShadow = true;
        orbGroup.add(base);
        
        // Create orb stand
        const standGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
        const standMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.5,
            metalness: 0.6
        });
        
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(x, 1, z);
        stand.castShadow = true;
        orbGroup.add(stand);
        
        // Create the orb
        const orbGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const orbMaterial = new THREE.MeshStandardMaterial({
            color: 0x0088ff,
            emissive: 0x0044aa,
            transparent: true,
            opacity: 0.8,
            roughness: 0.2,
            metalness: 0.9
        });
        
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(x, 1.8, z);
        orb.castShadow = true;
        orbGroup.add(orb);
        
        // Add the orb group to the scene
        this.scene.add(orbGroup);
        
        // Add a point light inside the orb
        const orbLight = new THREE.PointLight(0x0088ff, 1, 5);
        orbLight.position.set(x, 1.8, z);
        this.scene.add(orbLight);
        
        // Store reference to update in animation loop
        if (!this.animatedElements) {
            this.animatedElements = [];
        }
        
        this.animatedElements.push({
            type: 'orb',
            mesh: orb,
            light: orbLight,
            initialY: 1.8,
            time: Math.random() * Math.PI * 2 // Random starting phase
        });
    }
    
    createLantern(x, y, z) {
        const lanternGroup = new THREE.Group();
        
        // Create pole
        const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.7,
            metalness: 0.5
        });
        
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 1.25;
        lanternGroup.add(pole);
        
        // Create lantern housing
        const housingGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const housingMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.8,
            metalness: 0.6
        });
        
        const housing = new THREE.Mesh(housingGeometry, housingMaterial);
        housing.position.y = 2.3;
        lanternGroup.add(housing);
        
        // Create lantern glass
        const glassGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
        const glassMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff99,
            emissive: 0xffff00,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });
        
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.y = 2.3;
        lanternGroup.add(glass);
        
        // Add a point light inside the lantern
        const lanternLight = new THREE.PointLight(0xffff99, 1, 10);
        lanternLight.position.y = 2.3;
        lanternGroup.add(lanternLight);
        
        // Position the lantern
        lanternGroup.position.set(x, y, z);
        lanternGroup.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        this.scene.add(lanternGroup);
        
        // Store reference to update in animation loop for flickering effect
        if (!this.animatedElements) {
            this.animatedElements = [];
        }
        
        this.animatedElements.push({
            type: 'lantern',
            light: lanternLight,
            glass: glass,
            time: Math.random() * Math.PI * 2 // Random starting phase
        });
    }
    
    createShopSigns() {
        // For each shop position, create a shop sign
        this.shopPositions.forEach((position, index) => {
            // Create sign board
            const signWidth = 4;
            const signHeight = 1.5;
            const signGeometry = new THREE.BoxGeometry(signWidth, signHeight, 0.2);
            const signMaterial = this.createSignMaterial(index);
            const shopSign = new THREE.Mesh(signGeometry, signMaterial);
            
            // Position sign above the door
            shopSign.position.set(
                position.x,
                8, // Above the building
                position.z + 4 + 0.2 // Slightly in front of building
            );
            
            shopSign.castShadow = true;
            this.scene.add(shopSign);
            
            // Store reference to shop sign
            if (!this.shopSigns) {
                this.shopSigns = [];
            }
            this.shopSigns.push(shopSign);
        });
    }
    
    createSignMaterial(shopIndex) {
        const textureSize = 512;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize / 2; // Match the sign proportions
        const ctx = canvas.getContext('2d');
        
        // Sign background color varies by shop type
        const bgColors = ['#884400', '#008844', '#000088'];
        ctx.fillStyle = bgColors[shopIndex];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add border
        ctx.strokeStyle = '#DDAA00';
        ctx.lineWidth = 20;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Add text based on shop type
        const shopNames = ['ITEMS', 'CONSUMABLES', 'ABILITIES'];
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(shopNames[shopIndex], canvas.width / 2, canvas.height / 2);
        
        // Create the texture from the canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create the material with the texture
        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.6,
            metalness: 0.4
        });
    }
    
    createNextWaveButton() {
        // Create a flat text on the ground for "Start Next Wave"
        const textSize = 15; // Triple the size (from 5 to 15)
        
        // Create a canvas for the text texture - make it wider to fit text
        const canvas = document.createElement('canvas');
        canvas.width = 1600; // Double width for higher resolution
        canvas.height = 256; // Double height for higher resolution
        const ctx = canvas.getContext('2d');
        
        // Make canvas transparent (no background)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Add red text with appropriate spacing - triple font size
        ctx.fillStyle = '#FF0000'; // Red text
        ctx.font = 'bold 168px Arial'; // Tripled from 56px
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('START NEXT WAVE', canvas.width / 2, canvas.height / 2);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create plane geometry for the ground text - make it wider to match canvas aspect ratio
        const aspectRatio = canvas.width / canvas.height;
        const geometry = new THREE.PlaneGeometry(textSize, textSize / aspectRatio);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        // Create mesh and position on the ground
        this.nextWaveButton = new THREE.Mesh(geometry, material);
        this.nextWaveButton.position.set(40, 0.05, 10); // Position on the ground in area B
        this.nextWaveButton.rotation.x = -Math.PI / 2; // Rotate to lay flat on the ground
        
        // Add the text to the scene
        this.scene.add(this.nextWaveButton);
        
        // Update trigger zone to match new text dimensions
        this.nextWaveTriggerZone = new THREE.Mesh(
            new THREE.BoxGeometry(textSize, 2, textSize / aspectRatio), // Match the aspect ratio
            new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0.0 // Invisible
            })
        );
        this.nextWaveTriggerZone.position.set(40, 1, 10); // Above the text
        this.scene.add(this.nextWaveTriggerZone);
    }
    
    createNextWaveButtonMaterial() {
        // Not needed with the new implementation, but kept for compatibility
        return new THREE.MeshBasicMaterial({ visible: false });
    }
    
    update(delta) {
        // Check for player proximity to shop interaction zones
        if (this.gameManager.hero && !this.isShopActive) {
            // Get player position
            const playerPosition = this.gameManager.hero.mesh.position.clone();
            
            // Check each interaction zone
            let nearShop = false;
            let nearestShopIndex = -1;
            let nearestDistance = Infinity;
            
            this.interactionZones.forEach((zone, index) => {
                const distance = playerPosition.distanceTo(zone.position);
                
                if (distance < this.interactionDistance) {
                    nearShop = true;
                    
                    // Keep track of nearest shop
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestShopIndex = index;
                    }
                }
            });
            
            // Update UI prompt based on proximity
            if (nearShop && nearestShopIndex !== -1) {
                if (!this.promptVisible || this.currentNearShopIndex !== nearestShopIndex) {
                    this.gameManager.ui.showNotification(`Press E to enter ${this.shopTypes[nearestShopIndex].toUpperCase()} shop`, 99999);
                    this.promptVisible = true;
                    this.currentNearShopIndex = nearestShopIndex;
                    // Store current shop type for interaction
                    this.currentShopType = this.shopTypes[nearestShopIndex];
                }
            } else if (this.promptVisible) {
                // Hide any permanent notifications
                document.querySelectorAll('.game-notification').forEach(el => {
                    if (el.textContent.includes("Press E to")) {
                        document.body.removeChild(el);
                    }
                });
                this.promptVisible = false;
                this.currentNearShopIndex = -1;
                this.currentShopType = null;
            }
            
            // Check if player is near the "Next Wave" button
            if (this.nextWaveTriggerZone) {
                const distanceToButton = playerPosition.distanceTo(this.nextWaveTriggerZone.position);
                
                if (distanceToButton < 4) { // Use a slightly larger distance for the button
                    if (!this.nearNextWaveButton) {
                        this.gameManager.ui.showNotification('Press E to start next wave', 99999);
                        this.nearNextWaveButton = true;
                    }
                } else if (this.nearNextWaveButton) {
                    this.nearNextWaveButton = false;
                    // Hide if not near a shop and was previously near button
                    if (!nearShop) {
                        document.querySelectorAll('.game-notification').forEach(el => {
                            if (el.textContent.includes("Press E to")) {
                                document.body.removeChild(el);
                            }
                        });
                    }
                }
            }
        }
        
        // Animate decorative elements
        if (this.animatedElements) {
            this.animatedElements.forEach(element => {
                element.time += delta * 2;
                
                if (element.type === 'orb') {
                    // Float the orb up and down
                    const floatAmount = Math.sin(element.time) * 0.1;
                    element.mesh.position.y = element.initialY + floatAmount;
                    
                    // Pulse the light intensity
                    const lightIntensity = 1 + Math.sin(element.time * 2) * 0.3;
                    element.light.intensity = lightIntensity;
                    
                    // Subtle color shifts
                    const hue = (Math.sin(element.time * 0.5) * 0.1) + 0.6; // Blue to purple range
                    const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
                    element.mesh.material.emissive.set(color);
                    element.light.color.set(color);
                }
                else if (element.type === 'lantern') {
                    // Add flickering effect to lantern
                    const flickerIntensity = 0.8 + Math.random() * 0.4; // Random flicker
                    element.light.intensity = flickerIntensity;
                    
                    // Subtle color variation
                    const warmth = 0.12 + Math.random() * 0.02; // Subtle variation in warmth
                    const color = new THREE.Color().setHSL(warmth, 0.7, 0.5);
                    element.light.color.set(color);
                    element.glass.material.emissive.set(color);
                }
            });
        }
        
        // Animate shop signs
        if (this.shopSigns) {
            this.shopSigns.forEach(sign => {
                // Make signs always face the camera
                sign.lookAt(this.camera.position);
            });
        }
        
        // Handle visibility for the next wave button
        if (this.gameManager.isBetweenWaves) {
            // Make text visible between waves
            if (this.nextWaveButton && !this.nextWaveButton.visible) {
                this.nextWaveButton.visible = true;
                this.nextWaveTriggerZone.visible = true;
            }
        } else {
            // Hide text when not between waves
            if (this.nextWaveButton) {
                this.nextWaveButton.visible = false;
                this.nextWaveTriggerZone.visible = false;
            }
        }
        
        // Check if player has walked over the text
        if (this.gameManager.isBetweenWaves && this.nextWaveTriggerZone && this.nextWaveTriggerZone.visible) {
            const playerPosition = this.gameManager.hero.mesh.position;
            const triggerBox = new THREE.Box3().setFromObject(this.nextWaveTriggerZone);
            
            // Create a tiny box around the player's feet
            const playerBox = new THREE.Box3();
            playerBox.min.set(
                playerPosition.x - 0.5,
                playerPosition.y - 1.2, // Lower to catch the feet
                playerPosition.z - 0.5
            );
            playerBox.max.set(
                playerPosition.x + 0.5,
                playerPosition.y - 0.8,
                playerPosition.z + 0.5
            );
            
            // Check for intersection
            if (triggerBox.intersectsBox(playerBox)) {
                // Player walked over the text - start next wave
                console.log("Player walked over next wave text!");
                
                // Start the next wave
                this.startNextWave();
            }
        }
        
        // Auto-close shop if player moves too far away from all shops
        if (this.isShopActive) {
            let stillInRange = false;
            const playerPosition = this.gameManager.hero.mesh.position;
            
            this.interactionZones.forEach(zone => {
                const distanceToShop = playerPosition.distanceTo(zone.position);
                if (distanceToShop <= this.interactionDistance * 1.5) {
                    stillInRange = true;
                }
            });
            
            if (!stillInRange) {
                this.toggleShop(false);
            }
        }
    }
    
    checkNextWaveButtonClick() {
        // This function is no longer needed as we're now using collision detection
        // The functionality has been moved to update()
    }
    
    startNextWave() {
        // Start the next wave
        this.gameManager.startNextWave();
        
        // Show notification
        this.gameManager.ui.showNotification("Starting next wave! Returning to combat area.");
    }
    
    onEKeyPressed() {
        // Only respond if player is near any of the interaction zones
        const playerPosition = this.gameManager.hero.mesh.position;
        let nearestShopIndex = -1;
        let nearestShopDistance = Infinity;
        
        // Find the closest shop the player is near enough to interact with
        this.interactionZones.forEach((zone, index) => {
            const distanceToShop = playerPosition.distanceTo(zone.position);
            
            if (distanceToShop <= this.interactionDistance && distanceToShop < nearestShopDistance) {
                nearestShopDistance = distanceToShop;
                nearestShopIndex = index;
            }
        });
        
        if (nearestShopIndex !== -1) {
            // Set the current shop type and items
            this.currentShopType = this.shopTypes[nearestShopIndex];
            this.shopItems = this.shopInventory[this.currentShopType];
            
            // Toggle shop UI
            this.toggleShop(!this.isShopActive);
        }
    }
    
    toggleShop(active) {
        this.isShopActive = active;
        
        if (active && this.currentShopType) {
            // Display shop UI with appropriate title and items
            this.shopUI.show(this.shopItems, this.currentShopType.toUpperCase());
            
            // Pause game while shopping (optional)
            // this.gameManager.pauseGame();
        } else {
            // Hide shop UI
            this.shopUI.hide();
            
            // Resume game after shopping (optional)
            // this.gameManager.resumeGame();
        }
    }
    
    purchaseItem(itemId) {
        // Find the item
        const item = this.shopItems.find(item => item.id === itemId);
        
        if (!item) {
            console.error(`Item ${itemId} not found in shop inventory`);
            return false;
        }
        
        // Check if player has enough gold
        if (this.gameManager.gameState.resources.gold >= item.price) {
            // Deduct gold
            this.gameManager.gameState.resources.gold -= item.price;
            
            // Update UI
            this.gameManager.ui.updateGold(this.gameManager.gameState.resources.gold);
            
            // For items that should be added to inventory
            if (item.addToInventory) {
                // Item is ready to be added to inventory directly
                if (this.gameManager.inventory.addItem(item)) {
                    // Show purchase notification
                    this.gameManager.ui.showNotification(`Purchased: ${item.name} (Added to inventory)`, 2000);
                    return true;
                } else {
                    // Inventory is full, refund gold
                    this.gameManager.gameState.resources.gold += item.price;
                    this.gameManager.ui.updateGold(this.gameManager.gameState.resources.gold);
                    return false;
                }
            } else {
                // Apply the item effect directly (for items without addToInventory flag)
                item.effect();
                
                // Show purchase notification
                this.gameManager.ui.showNotification(`Purchased: ${item.name}`, 2000);
                return true;
            }
        } else {
            // Show not enough gold notification
            this.gameManager.ui.showNotification("Not enough gold!", 2000);
            return false;
        }
    }
    
    cleanup() {
        // Hide the shop UI
        this.toggleShop(false);
        
        // Remove any shop UI elements from the DOM
        if (this.shopUI) {
            this.shopUI.cleanup();
        }
        
        // Remove shop buildings from the scene
        this.shopBuildings.forEach(building => {
            if (building) {
                // Remove all child meshes and objects
                building.traverse(child => {
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => mat.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
                
                this.scene.remove(building);
            }
        });
        
        // Clean up interaction zones
        this.interactionZones.forEach(zone => {
            if (zone && zone.geometry) zone.geometry.dispose();
            if (zone && zone.material) zone.material.dispose();
            if (zone) this.scene.remove(zone);
        });
        
        // Remove shop signs
        if (this.shopSigns) {
            this.shopSigns.forEach(sign => {
                if (sign) {
                    if (sign.geometry) sign.geometry.dispose();
                    if (sign.material) sign.material.dispose();
                    this.scene.remove(sign);
                }
            });
        }
        
        // Remove next wave button
        if (this.nextWaveButton) {
            if (this.nextWaveButton.geometry) this.nextWaveButton.geometry.dispose();
            if (this.nextWaveButton.material) this.nextWaveButton.material.dispose();
            this.scene.remove(this.nextWaveButton);
        }
        
        // Remove any DOM elements that might have been created
        const shopContainer = document.getElementById('shop-container');
        if (shopContainer && shopContainer.parentNode) {
            shopContainer.parentNode.removeChild(shopContainer);
        }
        
        // Remove any shop interaction prompts
        const interactionPrompts = document.querySelectorAll('.interaction-prompt');
        interactionPrompts.forEach(prompt => {
            if (prompt && prompt.parentNode) {
                prompt.parentNode.removeChild(prompt);
            }
        });
        
        // Clear any timeouts or intervals
        if (this.shopAnimationInterval) {
            clearInterval(this.shopAnimationInterval);
        }
        
        // Reset state
        this.isShopActive = false;
        this.currentShopType = null;
        this.shopBuildings = [];
        this.interactionZones = [];
    }
} 