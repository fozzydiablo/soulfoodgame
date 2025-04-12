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
        this.ui = new UI(this);
        
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
        
        // Create menu button
        this.createMenuButton();
    }
    
    // Add a button to return to the main menu
    createMenuButton() {
        const menuButton = document.createElement('div');
        menuButton.style.position = 'absolute';
        menuButton.style.top = '10px';
        menuButton.style.right = '10px';
        menuButton.style.padding = '5px 10px';
        menuButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        menuButton.style.color = 'white';
        menuButton.style.borderRadius = '5px';
        menuButton.style.cursor = 'pointer';
        menuButton.style.fontFamily = 'Arial, sans-serif';
        menuButton.style.fontSize = '14px';
        menuButton.innerHTML = 'Menu';
        menuButton.style.zIndex = '1000';
        
        // Add hover effect
        menuButton.addEventListener('mouseover', () => {
            menuButton.style.backgroundColor = 'rgba(50, 50, 50, 0.9)';
        });
        
        menuButton.addEventListener('mouseout', () => {
            menuButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        });
        
        // Add click event to open menu modal
        menuButton.addEventListener('click', () => {
            this.openMenuModal();
        });
        
        document.body.appendChild(menuButton);
        this.menuButton = menuButton;
    }
    
    openMenuModal() {
        // Check if a menu is already open
        if (document.querySelector('div[style*="z-index: 2000"]')) {
            return; // Don't open another menu if one already exists
        }
        
        // Pause the game
        this.pauseGame();
        
        // Create menu modal
        const menuModal = document.createElement('div');
        menuModal.id = 'game-menu-modal';
        menuModal.style.position = 'absolute';
        menuModal.style.top = '50%';
        menuModal.style.left = '50%';
        menuModal.style.transform = 'translate(-50%, -50%)';
        menuModal.style.width = '300px';
        menuModal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        menuModal.style.color = 'white';
        menuModal.style.padding = '20px';
        menuModal.style.borderRadius = '10px';
        menuModal.style.fontFamily = 'Arial, sans-serif';
        menuModal.style.textAlign = 'center';
        menuModal.style.zIndex = '2000';
        
        menuModal.innerHTML = `
            <h2 style="color: #FFD700; margin-bottom: 20px;">Game Menu</h2>
            <div id="resume-game" style="margin: 10px 0; padding: 10px; background-color: #444; border-radius: 5px; cursor: pointer;">Resume Game</div>
            <div id="return-to-menu" style="margin: 10px 0; padding: 10px; background-color: #444; border-radius: 5px; cursor: pointer;">Return to Main Menu</div>
        `;
        
        document.body.appendChild(menuModal);
        
        // Add event listeners
        document.getElementById('resume-game').addEventListener('click', () => {
            this.closeMenuModal();
        });
        
        document.getElementById('return-to-menu').addEventListener('click', () => {
            this.closeMenuModal();
            this.returnToMenu();
        });
        
        // Add hover effects
        const buttons = menuModal.querySelectorAll('div[id]');
        buttons.forEach(button => {
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = '#666';
            });
            
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = '#444';
            });
        });
    }
    
    closeMenuModal() {
        const menuModal = document.getElementById('game-menu-modal');
        if (menuModal && menuModal.parentNode) {
            menuModal.parentNode.removeChild(menuModal);
        }
        this.resumeGame();
    }
    
    returnToMenu() {
        // Clean up game elements
        this.cleanupGameElements();
        
        // Remove menu button
        if (this.menuButton && this.menuButton.parentNode) {
            this.menuButton.parentNode.removeChild(this.menuButton);
        }
        
        // Trigger the onReturnToMenu callback if it exists
        if (typeof this.onReturnToMenu === 'function') {
            this.onReturnToMenu();
        }
    }
    
    cleanupGameElements() {
        // Remove UI elements
        this.ui.cleanup();
        
        // Remove all enemies
        this.enemyManager.cleanup();
        
        // Remove all projectiles
        this.projectileManager.cleanup();
        
        // Remove all turrets
        this.turretManager.cleanup();
        
        // Remove all items
        this.itemManager.cleanup();
        
        // Remove the shop UI if it exists
        if (this.shopManager) {
            this.shopManager.cleanup();
        }
        
        // Remove hero
        if (this.hero && this.hero.mesh) {
            this.scene.remove(this.hero.mesh);
        }
        
        // Remove menu button
        if (this.menuButton && this.menuButton.parentNode) {
            this.menuButton.parentNode.removeChild(this.menuButton);
        }
        
        // Check for any remaining DOM elements that might have been missed
        this.cleanupRemainingUIElements();
    }
    
    cleanupRemainingUIElements() {
        // Remove any DOM UI elements that might have been missed
        const commonUISelectors = [
            // Game UI elements
            '.wave-notification',
            '.notification',
            '#next-wave-button',
            // Controls and instructions
            'div[style*="Controls:"]',
            // Game over screen
            '#game-over-screen',
            // Shop UI elements
            '#shop-container',
            '#shop-close-button',
            // Tooltips
            '.tooltip',
            // Any modal dialogs
            'div[style*="modal"]',
            'div[style*="Menu"]',
            'div[style*="menu"]'
        ];
        
        commonUISelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
        });
        
        // Remove all divs positioned absolutely (likely UI elements)
        const absoluteDivs = document.querySelectorAll('div[style*="position: absolute"]');
        absoluteDivs.forEach(div => {
            // Only remove UI-like elements, not critical page elements
            if (div.id !== 'app' && !div.classList.contains('essential') && 
                div.parentNode && div.parentNode === document.body) {
                div.parentNode.removeChild(div);
            }
        });
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
                case 'Escape':
                    // For Escape key, we want to first check if there are menus open
                    // and close them if there are
                    const menuClosed = this.closeAnyOpenMenu();
                    
                    // If no menu was closed, we can open the game menu
                    if (!menuClosed) {
                        // Make sure the shop UI is not visible before opening menu
                        const shopUI = document.getElementById('shop-ui');
                        const shopVisible = shopUI && (shopUI.style.display !== 'none');
                        
                        if (!shopVisible) {
                            this.openMenuModal();
                        }
                    }
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
    
    closeAnyOpenMenu() {
        // Check for game menu
        const gameMenu = document.getElementById('game-menu-modal');
        if (gameMenu) {
            this.closeMenuModal();
            return true;
        }
        
        // Check for any shop UI by looking for containers with certain IDs or classes
        const shopUI = document.getElementById('shop-ui');
        if (shopUI && shopUI.style.display !== 'none') {
            // Try to close the shop through the shop manager
            if (this.shopManager && this.shopManager.ui && 
                typeof this.shopManager.ui.hide === 'function') {
                this.shopManager.ui.hide();
                // Set isShopActive to false when shop is closed using Escape key
                this.shopManager.isShopActive = false;
            } else if (shopUI.parentNode) {
                // Direct removal if needed
                shopUI.parentNode.removeChild(shopUI);
                if (this.shopManager) {
                    this.shopManager.isShopActive = false;
                }
            }
            return true;
        }
        
        // Check for player info modal
        const playerInfoModal = document.querySelector('div[style*="z-index: 2000"]');
        if (playerInfoModal && playerInfoModal.id !== 'game-menu-modal') {
            playerInfoModal.parentNode.removeChild(playerInfoModal);
            this.resumeGame();
            return true;
        }
        
        // No menus were found open
        return false;
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
            
            // Skip invalid projectiles
            if (!projectile) {
                continue;
            }
            
            if (projectile.isPlayerProjectile) {
                // Handle area effect projectiles (like Fireball)
                if (projectile.areaEffect && projectile.isDestroyed) {
                    // Skip already processed area projectiles
                    continue;
                }
                
                let hitEnemy = false;
                
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const enemy = enemies[j];
                    if (projectile.checkCollision(enemy)) {
                        // Use projectile's damage or hero's damage stat
                        const damageAmount = projectile.damage || this.hero.stats.damage;
                        enemy.takeDamage(damageAmount);
                        
                        // Award score if enemy dies
                        if (enemy.stats.health <= 0) {
                            this.awardScoreForEnemy(enemy);
                        }
                        
                        // If it's an area effect projectile, destroy it but don't break
                        // This will trigger the explosion effect in the projectile's destroy method
                        if (projectile.areaEffect) {
                            projectile.destroy();
                            
                            // Apply area damage to nearby enemies
                            const radius = projectile.areaRadius || 3;
                            const position = projectile.mesh ? projectile.mesh.position.clone() : enemy.mesh.position.clone();
                            
                            // Apply area damage to all enemies in radius
                            enemies.forEach(nearbyEnemy => {
                                if (nearbyEnemy !== enemy) { // Skip the directly hit enemy
                                    const distance = nearbyEnemy.mesh.position.distanceTo(position);
                                    if (distance <= radius) {
                                        // Damage falls off with distance
                                        const falloff = 1 - (distance / radius);
                                        const areaDamage = Math.ceil(projectile.damage * falloff);
                                        
                                        nearbyEnemy.takeDamage(areaDamage);
                                        
                                        // Award score if enemy dies
                                        if (nearbyEnemy.stats.health <= 0) {
                                            this.awardScoreForEnemy(nearbyEnemy);
                                        }
                                    }
                                }
                            });
                            
                            hitEnemy = true;
                            break;
                        } else {
                            // Regular projectile - destroy and break loop
                            projectile.destroy();
                            hitEnemy = true;
                            break;
                        }
                    }
                }
                
                // If projectile hit an obstacle or went out of bounds
                if (!hitEnemy && !projectile.isDestroyed) {
                    // Check if we should detonate area effect projectiles on obstacles too
                    if (projectile.areaEffect && projectile.mesh) {
                        // Check if the projectile hit the ground or walls
                        // This is a simplified check - ideally you'd check against actual
                        // collision geometry in your scene
                        if (Math.abs(projectile.mesh.position.x) > 29 || 
                            Math.abs(projectile.mesh.position.z) > 29 ||
                            projectile.mesh.position.y < 0.5) {
                            projectile.destroy();
                        }
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
    
    togglePause() {
        if (this.gameState.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }
} 