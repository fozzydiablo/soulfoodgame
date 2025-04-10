import * as THREE from 'three';
import { Hero } from './characters/Hero.js';
import { EnemyManager } from './enemies/EnemyManager.js';
import { ResourceManager } from './resources/ResourceManager.js';
import { BuildingManager } from './buildings/BuildingManager.js';
import { ProjectileManager } from './combat/ProjectileManager.js';
import { TurretManager } from './turrets/TurretManager.js';
import { ShopManager } from './shop/ShopManager.js';
import { UI } from './utils/UI.js';

export class GameManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.clock = new THREE.Clock();
        
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
        
        // Initialize shop manager
        this.shopManager = new ShopManager(scene, this);
        
        // Game state
        this.gameState = {
            wave: 1,
            score: 0,
            resources: {
                ammo: 10, // Start with 10 ammo
            },
            health: 10,   // Player has 10 health
            maxHealth: 10,
            isGameOver: false,
            isPaused: false
        };
        
        // Update UI with initial state
        this.ui.updateAmmo(this.gameState.resources.ammo);
        this.ui.updateHealth(this.gameState.health, this.gameState.maxHealth);
        this.ui.updateWave(this.gameState.wave);
        this.ui.updateScore(this.gameState.score);
        this.ui.createTurretIndicator();
        
        // Set base turret ammo
        this.turretManager.baseTurretAmmo = 30;
        
        // Bind methods
        this.update = this.update.bind(this);
        
        // Spawn first wave of enemies
        this.enemyManager.spawnWave(this.gameState.wave);
    }
    
    update() {
        // Check for game over or pause state first
        if (this.gameState.isGameOver) return;
        
        const delta = this.clock.getDelta();
        
        // If shop is active, only update shop-related systems
        if (this.shopManager.isShopActive) {
            this.shopManager.update(delta);
            return;
        }
        
        // If game is paused but not in shop, don't update anything
        if (this.gameState.isPaused) return;
        
        // Update game systems
        this.hero.update(delta);
        this.enemyManager.update(delta, this.hero.mesh.position);
        this.resourceManager.update(delta);
        this.buildingManager.update(delta);
        this.projectileManager.update(delta);
        this.turretManager.update(delta);
        
        // Check for collisions and interactions
        this.checkCollisions();
        
        // Check for wave completion
        if (this.enemyManager.isWaveComplete()) {
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
                        enemy.takeDamage(1); // Player projectiles do 1 damage
                        
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
        
        // Award ammo for killing enemies
        if (Math.random() < 0.3 || enemy.enemyType === 'boss') {
            // 30% chance to get ammo, guaranteed for bosses
            const ammoAmount = enemy.enemyType === 'boss' ? 15 : 3;
            this.addAmmo(ammoAmount);
        }
    }
    
    waveComplete() {
        console.log(`Wave ${this.gameState.wave} completed!`);
        
        // Increment wave count
        this.gameState.wave++;
        
        // Update wave display
        this.ui.updateWave(this.gameState.wave);
        
        // Open shop between waves
        this.shopManager.openShop();
    }
    
    startNextWave() {
        // Start the next wave after shop visit
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
        if (this.gameState.resources.ammo > 0) {
            this.gameState.resources.ammo--;
            this.ui.updateAmmo(this.gameState.resources.ammo);
            return true;
        }
        return false;
    }
    
    takeDamage(amount) {
        this.gameState.health -= amount;
        this.ui.updateHealth(this.gameState.health, this.gameState.maxHealth);
        
        if (this.gameState.health <= 0) {
            this.gameOver();
        }
    }
    
    addResources(type, amount) {
        if (type === 'ammo') {
            this.addAmmo(amount);
        }
    }
    
    gameOver() {
        this.gameState.isGameOver = true;
        this.ui.showGameOver();
        console.log('Game Over!');
    }
} 