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
} 