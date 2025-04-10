import * as THREE from 'three';
import { Hero } from './characters/Hero.js';
import { EnemyManager } from './enemies/EnemyManager.js';
import { ResourceManager } from './resources/ResourceManager.js';
import { BuildingManager } from './buildings/BuildingManager.js';
import { ProjectileManager } from './combat/ProjectileManager.js';
import { TurretManager } from './turrets/TurretManager.js';
import { ShopManager } from './shop/ShopManager.js';
import { UI } from './utils/UI.js';
import { Inventory } from './utils/Inventory.js';
import { ItemManager } from './items/ItemManager.js';

export class GameManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.clock = new THREE.Clock();
        
        // Define area centers
        this.areaACenterPosition = new THREE.Vector3(0, 1, 0); // Center of area A (combat area)
        this.areaBCenterPosition = new THREE.Vector3(40, 1, 0); // Center of area B (shop area)
        
        // Track if we're between waves
        this.isBetweenWaves = false;
        
        // Track mouse position for button interactions
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Initialize game systems in the correct order
        this.resourceManager = new ResourceManager(scene);
        this.projectileManager = new ProjectileManager(scene);
        this.enemyManager = new EnemyManager(scene, this);
        this.buildingManager = new BuildingManager(scene);
        
        // Hero needs access to other managers via the game manager
        this.hero = new Hero(scene, this, camera);
        
        // UI needs to be initialized before TurretManager 
        this.ui = new UI();
        
        // Initialize turret manager after UI
        this.turretManager = new TurretManager(scene, this);
        
        // Game state
        this.gameState = {
            wave: 0,
            enemiesRemaining: 0,
            health: 10,
            maxHealth: 10,
            score: 0,
            resources: {
                gold: 500,  // Starting gold
                ammo: 100   // Starting ammo
            },
            hasRevivalToken: false,
            isAlive: true
        };
        
        // Initialize inventory system
        this.inventory = new Inventory(this);
        
        // Initialize item manager
        this.itemManager = new ItemManager(scene, this);
        
        // Initialize shop manager (must be after UI and other systems)
        this.shopManager = new ShopManager(scene, this);
        
        // Update UI with initial state
        this.ui.updateAmmo(this.gameState.resources.ammo);
        this.ui.updateHealth(this.gameState.health, this.gameState.maxHealth);
        this.ui.updateWave(this.gameState.wave);
        this.ui.updateScore(this.gameState.score);
        this.ui.updateGold(this.gameState.resources.gold);
        this.ui.createTurretIndicator();
        
        // Add player stats to UI
        this.ui.updatePlayerStats(this.hero);
        
        // Set base turret ammo
        this.turretManager.baseTurretAmmo = 30;
        
        // Bind methods
        this.update = this.update.bind(this);
        
        // Spawn first wave of enemies
        this.enemyManager.spawnWave(1);
        
        // For tracking the last key pressed
        this.lastKeyPressed = '';
        this.setupKeyListeners();
        this.setupMouseListeners();
        
        // Apply any stats from wearable items in inventory
        if (this.inventory && typeof this.inventory.updateWearableItemStats === 'function') {
            this.inventory.updateWearableItemStats();
        }
    }
    
    setupKeyListeners() {
        document.addEventListener('keydown', (event) => {
            this.lastKeyPressed = event.key;
            
            // Process menu keys
            switch (event.key) {
                case 'p':
                case 'P':
                    this.togglePause();
                    break;
                case 't':
                case 'T':
                    // Deploy turret when the T key is pressed (if ability is in inventory)
                    this.tryDeployTurret();
                    break;
            }
        });
        
        window.addEventListener('keyup', (event) => {
            // Clear the last key pressed if it's the one that was released
            if (this.lastKeyPressed === event.key) {
                this.lastKeyPressed = '';
            }
        });
    }
    
    setupMouseListeners() {
        // Track mouse position
        window.addEventListener('mousemove', (event) => {
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        });
        
        // Track mouse clicks
        window.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left click
                this.lastKeyPressed = 'mouse1';
            }
        });
        
        window.addEventListener('mouseup', (event) => {
            if (event.button === 0 && this.lastKeyPressed === 'mouse1') {
                this.lastKeyPressed = '';
            }
        });
    }
    
    update() {
        // Check for game over state first
        if (this.gameState.isGameOver) return;
        
        const delta = this.clock.getDelta();
        
        // If game is paused, don't update anything
        if (this.gameState.isPaused) return;
        
        // Always update hero for movement
        this.hero.update(delta);
        
        // Always update game systems
        this.enemyManager.update(delta, this.hero.mesh.position);
        this.resourceManager.update(delta);
        this.buildingManager.update(delta);
        this.projectileManager.update(delta);
        this.turretManager.update(delta);
        
        // Update shop manager
        this.shopManager.update(delta);
        
        // Update item manager
        this.itemManager.update(delta);
        
        // Update player stats in UI
        this.ui.updatePlayerStats(this.hero);
        
        // Check for collisions and interactions
        this.checkCollisions();
        
        // Check for wave completion - only if not already between waves
        if (!this.isBetweenWaves && this.enemyManager.isWaveComplete()) {
            this.waveComplete();
        }
    }
    
    pauseGame() {
        this.gameState.isPaused = true;
        console.log('Game paused');
    }
    
    resumeGame() {
        this.gameState.isPaused = false;
        console.log('Game resumed');
    }
    
    checkCollisions() {
        // Check projectile-enemy collisions
        const projectiles = this.projectileManager.projectiles;
        const enemies = this.enemyManager.enemies;
        
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            if (projectile.isPlayerProjectile) {
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const enemy = enemies[j];
                    if (projectile.checkCollision(enemy)) {
                        // Use hero's damage stat instead of hardcoded value
                        const heroDamage = this.hero.stats.damage;
                        enemy.takeDamage(heroDamage);
                        
                        // Award score if enemy dies
                        if (enemy.stats.health <= 0) {
                            this.awardScoreForEnemy(enemy);
                        }
                        
                        projectile.destroy();
                        break; // Projectile can only hit one enemy
                    }
                }
            } else {
                // Enemy projectile hitting player
                if (projectile.checkCollision(this.hero)) {
                    this.takeDamage(1); // Enemy projectiles do 1 damage
                    projectile.destroy();
                }
            }
        }
    }
    
    awardScoreForEnemy(enemy) {
        let scoreValue = 10; // Base score for basic enemy
        
        // Different enemy types give different scores
        switch (enemy.enemyType) {
            case 'fast':
                scoreValue = 15;
                break;
            case 'tank':
                scoreValue = 25;
                break;
            case 'ranged':
                scoreValue = 20;
                break;
            case 'boss':
                scoreValue = 100;
                break;
        }
        
        // Add score
        this.gameState.score += scoreValue;
        
        // Update UI
        this.ui.updateScore(this.gameState.score);
        
        // Ammo drops have been removed - unlimited ammo enabled
    }
    
    waveComplete() {
        console.log(`Wave ${this.gameState.wave} completed!`);
        
        // Set the between waves flag
        this.isBetweenWaves = true;
        
        // Increment wave count
        this.gameState.wave++;
        
        // Update wave display
        this.ui.updateWave(this.gameState.wave);
        
        // Award gold for completing a wave
        const goldReward = 50 * this.gameState.wave;
        this.addGold(goldReward);
        
        // Transport player to center of area B (shop area)
        this.hero.mesh.position.copy(this.areaBCenterPosition);
        
        // Show wave completed notification
        this.ui.showWaveCompletedNotification();
        
        // Show the next wave button hint after a short delay
        setTimeout(() => {
            this.ui.showNextWaveButtonHint();
        }, 5000);
    }
    
    startNextWave() {
        // Clear the between waves flag
        this.isBetweenWaves = false;
        
        // Remove the next wave button hint
        this.ui.removeNextWaveButtonHint();
        
        // Transport player back to area A (combat area)
        this.hero.mesh.position.copy(this.areaACenterPosition);
        
        // Start the next wave
        this.enemyManager.spawnWave(this.gameState.wave);
        
        // Show wave notification
        this.ui.showWaveNotification(this.gameState.wave);
        
        console.log(`Starting wave ${this.gameState.wave}`);
    }
    
    addAmmo(amount) {
        this.gameState.resources.ammo += amount;
        this.ui.updateAmmo(this.gameState.resources.ammo);
    }
    
    useAmmo() {
        // Unlimited ammo - always return true without decreasing ammo
        return true;
    }
    
    takeDamage(amount) {
        // Check for evasion (dodge chance)
        if (this.hero && this.hero.stats.evasion > 0) {
            // Calculate if attack is evaded based on evasion percentage
            const evasionRoll = Math.random() * 100;
            if (evasionRoll < this.hero.stats.evasion) {
                // Attack evaded!
                this.ui.showNotification("Attack Dodged!", 1000);
                return; // No damage taken
            }
        }
        
        // Apply armor damage reduction if available
        let finalDamage = amount;
        if (this.hero && this.hero.stats.armor > 0) {
            // Reduce damage by armor percentage (capped at 75% reduction)
            const damageReduction = Math.min(this.hero.stats.armor / 100, 0.75);
            finalDamage = amount * (1 - damageReduction);
        }
        
        // Apply the final damage
        this.gameState.health -= finalDamage;
        this.ui.updateHealth(this.gameState.health, this.gameState.maxHealth);
        
        if (this.gameState.health <= 0) {
            this.gameOver();
        }
    }
    
    addResources(type, amount) {
        // Ammo is now unlimited, so we don't need to add it
        // No other resource types currently defined
    }
    
    gameOver() {
        this.gameState.isGameOver = true;
        this.ui.showGameOver();
        console.log('Game Over!');
    }
    
    // Add gold method - disabled since gold rewards are removed
    addGold(amount) {
        // Enable gold rewards
        if (!this.gameState.resources.gold) {
            this.gameState.resources.gold = 0;
        }
        
        this.gameState.resources.gold += amount;
        
        // Update UI
        if (this.ui) {
            this.ui.updateGold(this.gameState.resources.gold);
            this.ui.showNotification(`+${amount} Gold`, 1500);
        }
    }
    
    // Add a method to try deploying a turret
    tryDeployTurret() {
        // Skip if not initialized or game is paused
        if (!this.inventory || this.gameState.isPaused) return;
        
        // Look for the deploy_turret ability in the ability slots
        const abilityIndex = this.inventory.abilitySlots.findIndex(item => 
            item !== null && item.id === 'deploy_turret'
        );
        
        if (abilityIndex >= 0) {
            // Select and use the turret ability
            this.inventory.selectSlot(abilityIndex, 'ability');
        } else {
            // Notify player they don't have the ability
            this.ui.showNotification("You don't have the Deploy Turret ability!", 2000);
        }
    }
} 