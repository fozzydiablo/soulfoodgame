import * as THREE from 'three';
import { Enemy } from './Enemy.js';

// Fast enemy with low health but high speed
export class FastEnemy extends Enemy {
    constructor(scene, x, z, gameManager) {
        super(scene, x, z, gameManager);
        
        // Override stats for fast enemy
        this.stats.health = 1;
        this.stats.maxHealth = 1;
        this.stats.speed = 4; // Twice as fast
        this.stats.attackSpeed = 1.5; // Higher attack rate
        this.stats.damage = 1;
        
        this.enemyType = 'fast';
        
        // Update appearance
        this.updateAppearance();
    }
    
    updateAppearance() {
        // Make the enemy blue to indicate it's a fast type
        this.mesh.traverse((object) => {
            if (object instanceof THREE.Mesh && object.material) {
                // Skip spear parts
                if (object.parent === this.spear) return;
                
                // Set color to blue
                object.material.color.set(0x0000AA);
            }
        });
        
        // Make the enemy smaller and leaner
        this.mesh.scale.set(0.8, 1.1, 0.8);
    }
}

// Tank enemy with high health but slow speed
export class TankEnemy extends Enemy {
    constructor(scene, x, z, gameManager) {
        super(scene, x, z, gameManager);
        
        // Override stats for tank enemy
        this.stats.health = 5;
        this.stats.maxHealth = 5;
        this.stats.speed = 1; // Half as fast
        this.stats.attackSpeed = 0.7; // Slower attack rate
        this.stats.damage = 2; // More damage
        this.stats.hitboxSize = 2.5; // Larger hitbox
        
        this.enemyType = 'tank';
        
        // Update appearance
        this.updateAppearance();
    }
    
    updateAppearance() {
        // Make the enemy green to indicate it's a tank type
        this.mesh.traverse((object) => {
            if (object instanceof THREE.Mesh && object.material) {
                // Skip spear parts
                if (object.parent === this.spear) return;
                
                // Set color to green
                object.material.color.set(0x006400);
                
                // Make material look more metallic
                if (object.material.metalness !== undefined) {
                    object.material.metalness = 0.5;
                    object.material.roughness = 0.3;
                }
            }
        });
        
        // Make the enemy larger
        this.mesh.scale.set(1.4, 1.2, 1.4);
    }
}

// Ranged enemy with long attack range
export class RangedEnemy extends Enemy {
    constructor(scene, x, z, gameManager) {
        super(scene, x, z, gameManager);
        
        // Override stats for ranged enemy
        this.stats.health = 2;
        this.stats.maxHealth = 2;
        this.stats.speed = 1.5;
        this.stats.attackRange = 15; // Much longer attack range
        this.stats.attackSpeed = 0.8;
        
        this.enemyType = 'ranged';
        
        // Update appearance
        this.updateAppearance();
    }
    
    updateAppearance() {
        // Make the enemy purple to indicate it's a ranged type
        this.mesh.traverse((object) => {
            if (object instanceof THREE.Mesh && object.material) {
                // Skip spear parts
                if (object.parent === this.spear) return;
                
                // Set color to purple
                object.material.color.set(0x800080);
            }
        });
        
        // Create a longer spear/bow
        if (this.spear) {
            this.spear.children.forEach(child => {
                if (child.geometry.type === "CylinderGeometry") {
                    child.scale.z = 1.5;
                }
            });
        }
    }
    
    // Override attack method to stay further away
    moveTowardsPlayer(delta, playerPosition) {
        const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
        
        // If within ideal range, stop moving
        if (distanceToPlayer < this.stats.attackRange && distanceToPlayer > this.stats.attackRange - 3) {
            // Just face the player but don't move
            this.mesh.lookAt(new THREE.Vector3(
                playerPosition.x,
                this.mesh.position.y,
                playerPosition.z
            ));
            return;
        }
        
        // Otherwise, use standard movement
        super.moveTowardsPlayer(delta, playerPosition);
    }
}

// Boss enemy for every 5th wave
export class BossEnemy extends Enemy {
    constructor(scene, x, z, gameManager) {
        super(scene, x, z, gameManager);
        
        // Override stats for boss enemy
        this.stats.health = 10;
        this.stats.maxHealth = 10;
        this.stats.speed = 1.8;
        this.stats.attackRange = 10;
        this.stats.attackSpeed = 1.2;
        this.stats.damage = 3;
        this.stats.hitboxSize = 3.0;
        
        this.enemyType = 'boss';
        
        // Update appearance
        this.updateAppearance();
    }
    
    updateAppearance() {
        // Make the enemy red and black to indicate it's a boss
        this.mesh.traverse((object) => {
            if (object instanceof THREE.Mesh && object.material) {
                // Skip spear parts
                if (object.parent === this.spear) return;
                
                // Set color to dark red
                object.material.color.set(0x880000);
                
                // Make material look more impressive
                if (object.material.metalness !== undefined) {
                    object.material.metalness = 0.7;
                    object.material.roughness = 0.2;
                    object.material.emissive = new THREE.Color(0x330000);
                    object.material.emissiveIntensity = 0.3;
                }
            }
        });
        
        // Make the boss much larger
        this.mesh.scale.set(2.0, 2.0, 2.0);
        
        // Add a crown or special head element
        const crownGeometry = new THREE.ConeGeometry(0.4, 0.6, 4);
        const crownMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            metalness: 0.8,
            roughness: 0.2
        });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.y = 2.3;
        crown.rotation.y = Math.PI / 4;
        this.mesh.add(crown);
    }
    
    // Special attack pattern for boss
    attackPlayer(playerPosition) {
        // Call standard attack
        super.attackPlayer(playerPosition);
        
        // Burst fire for boss (throw multiple projectiles if enough health)
        if (this.stats.health > this.stats.maxHealth / 2) {
            setTimeout(() => {
                if (!this.isDead) super.attackPlayer(playerPosition);
            }, 300);
            
            setTimeout(() => {
                if (!this.isDead) super.attackPlayer(playerPosition);
            }, 600);
        }
    }
} 