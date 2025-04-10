import * as THREE from 'three';
import { Enemy } from './Enemy.js';
import { FastEnemy, TankEnemy, RangedEnemy, BossEnemy } from './EnemyTypes.js';

export class EnemyManager {
    constructor(scene, gameManager) {
        this.scene = scene;
        this.gameManager = gameManager;
        this.enemies = [];
        this.wave = 0;
        this.enemiesPerWave = 3;
        this.waveInterval = 30; // seconds between waves
        this.lastWaveTime = 0;
        this.difficulty = 1.0; // Difficulty multiplier that increases with waves
    }
    
    update(delta, playerPosition) {
        // Update all enemies
        this.enemies.forEach(enemy => enemy.update(delta, playerPosition));
        
        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => !enemy.isDead);
    }
    
    spawnWave(waveNumber) {
        this.wave = waveNumber;
        this.difficulty = 1.0 + (waveNumber - 1) * 0.2; // Increase difficulty with each wave
        const enemyCount = this.enemiesPerWave + (waveNumber - 1) * 2;
        
        // Determine if this is a boss wave
        const isBossWave = waveNumber > 0 && waveNumber % 5 === 0;
        
        if (isBossWave) {
            this.spawnBossWave(enemyCount);
        } else {
            this.spawnRegularWave(enemyCount, waveNumber);
        }
        
        console.log(`Wave ${waveNumber} started with ${enemyCount} enemies at difficulty ${this.difficulty.toFixed(1)}`);
    }
    
    spawnRegularWave(enemyCount, waveNumber) {
        // Calculate the mix of enemy types based on the wave number
        let fastEnemyChance = 0.1 + Math.min(0.4, waveNumber * 0.05);
        let tankEnemyChance = Math.max(0, 0.05 * (waveNumber - 2));
        let rangedEnemyChance = Math.max(0, 0.05 * (waveNumber - 3));
        
        for (let i = 0; i < enemyCount; i++) {
            const random = Math.random();
            
            if (random < fastEnemyChance) {
                this.spawnEnemyOfType('fast');
            } else if (random < fastEnemyChance + tankEnemyChance) {
                this.spawnEnemyOfType('tank');
            } else if (random < fastEnemyChance + tankEnemyChance + rangedEnemyChance) {
                this.spawnEnemyOfType('ranged');
            } else {
                this.spawnEnemyOfType('basic');
            }
        }
    }
    
    spawnBossWave(enemyCount) {
        // Spawn the boss
        this.spawnEnemyOfType('boss');
        
        // Spawn some minions with the boss
        for (let i = 0; i < enemyCount - 1; i++) {
            if (Math.random() < 0.7) {
                this.spawnEnemyOfType('fast');
            } else {
                this.spawnEnemyOfType('basic');
            }
        }
    }
    
    spawnEnemyOfType(type) {
        // Random position around the map, but not too close to player
        const angle = Math.random() * Math.PI * 2;
        const radius = 15 + Math.random() * 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        let enemy;
        
        switch (type) {
            case 'fast':
                enemy = new FastEnemy(this.scene, x, z, this.gameManager);
                break;
            case 'tank':
                enemy = new TankEnemy(this.scene, x, z, this.gameManager);
                break;
            case 'ranged':
                enemy = new RangedEnemy(this.scene, x, z, this.gameManager);
                break;
            case 'boss':
                enemy = new BossEnemy(this.scene, x, z, this.gameManager);
                break;
            default:
                enemy = new Enemy(this.scene, x, z, this.gameManager);
                break;
        }
        
        // Apply difficulty multiplier to enemy stats
        this.applyDifficultyToEnemy(enemy);
        
        this.enemies.push(enemy);
    }
    
    applyDifficultyToEnemy(enemy) {
        // Don't apply extra difficulty to bosses, they're already tough
        if (enemy.enemyType === 'boss') return;
        
        // Scale enemy stats with difficulty
        enemy.stats.health = Math.ceil(enemy.stats.health * this.difficulty);
        enemy.stats.maxHealth = enemy.stats.health;
        enemy.stats.damage = Math.ceil(enemy.stats.damage * this.difficulty);
    }
    
    spawnEnemy() {
        // For backward compatibility
        this.spawnEnemyOfType('basic');
    }
    
    isWaveComplete() {
        return this.enemies.length === 0 && this.wave > 0;
    }
    
    handleEnemyDeath(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            // Store enemy position and type for later use since cleanup might remove the mesh
            const enemyPosition = enemy.mesh ? enemy.mesh.position.clone() : null;
            const enemyType = enemy.enemyType;
            
            // Create a death effect at the enemy position if available
            if (enemyPosition) {
                this.createDeathEffect(enemyPosition);
            }
            
            // Clean up the enemy
            enemy.cleanup();
            
            // Remove from enemies array
            this.enemies.splice(index, 1);
            
            // Award score for killing enemy
            if (this.gameManager) {
                this.gameManager.awardScoreForEnemy(enemy);
            }
            
            // Let the itemManager handle drops (gold rewards have been removed)
            // Create a clean enemy info object with just the data needed for item drop
            if (this.gameManager && this.gameManager.itemManager && enemyPosition) {
                const enemyInfo = {
                    enemyType: enemyType,
                    mesh: {
                        position: enemyPosition
                    }
                };
                this.gameManager.itemManager.spawnItemDrop(enemyInfo);
            }
            
            // Check for wave completion
            if (this.enemies.length === 0 && !this.canSpawnMore) {
                this.waveComplete = true;
            }
        }
    }
    
    createDeathEffect(position) {
        // Create particles for death effect
        const particleCount = 20;
        const particles = new THREE.Group();
        
        // Use a dark red color for enemy death
        const color = new THREE.Color(0xAA0000);
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(geometry, material);
            
            // Random offset from the death point
            particle.position.copy(position);
            particle.position.y += 0.5;
            
            // Random velocity
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                Math.random() * 4 + 2,
                (Math.random() - 0.5) * 4
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
                    particle.userData.velocity.y -= 0.2;
                    
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
} 