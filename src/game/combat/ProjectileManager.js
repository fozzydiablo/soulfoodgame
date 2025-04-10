import * as THREE from 'three';

export class ProjectileManager {
    constructor(scene) {
        this.scene = scene;
        this.projectiles = [];
    }
    
    firePlayerProjectile(position, direction) {
        const projectile = new Projectile(
            this.scene,
            position,
            direction,
            0x3333FF, // Blue color for player projectiles
            true
        );
        this.projectiles.push(projectile);
        return projectile;
    }
    
    fireEnemyProjectile(position, direction) {
        const projectile = new Projectile(
            this.scene,
            position,
            direction,
            0xFF0000, // Red color for enemy projectiles
            false
        );
        this.projectiles.push(projectile);
        return projectile;
    }
    
    update(delta) {
        // Update all projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(delta);
            
            // Remove projectiles that are too old or out of bounds
            if (projectile.isDestroyed || projectile.lifetime > 5) {
                this.projectiles.splice(i, 1);
            }
        }
    }
}

class Projectile {
    constructor(scene, position, direction, color, isPlayerProjectile) {
        this.scene = scene;
        this.speed = isPlayerProjectile ? 20 : 10; // Player projectiles are faster
        this.direction = direction.clone().normalize();
        this.isPlayerProjectile = isPlayerProjectile;
        this.isDestroyed = false;
        this.lifetime = 0;
        
        // Create projectile mesh
        this.createMesh(position, color);
        
        // Add trail effect
        this.createTrail();
    }
    
    createMesh(position, color) {
        // Create bullet shape
        const geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
        geometry.rotateX(Math.PI / 2); // Align with z-axis
        
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            metalness: 0.7,
            roughness: 0.3
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        
        // Rotate to face direction
        this.mesh.lookAt(position.clone().add(this.direction));
        
        this.scene.add(this.mesh);
    }
    
    createTrail() {
        // Trail particles
        this.trailParticles = [];
        this.lastTrailTime = 0;
    }
    
    update(delta) {
        // Update lifetime
        this.lifetime += delta;
        
        // Move projectile
        const movement = this.direction.clone().multiplyScalar(this.speed * delta);
        this.mesh.position.add(movement);
        
        // Update trail
        this.updateTrail(delta);
        
        // Check if out of bounds
        if (Math.abs(this.mesh.position.x) > 30 || 
            Math.abs(this.mesh.position.z) > 30 ||
            this.mesh.position.y < 0 || 
            this.mesh.position.y > 20) {
            this.destroy();
        }
    }
    
    updateTrail(delta) {
        const now = Date.now();
        
        // Create new trail particle every 50ms
        if (now - this.lastTrailTime > 50) {
            this.lastTrailTime = now;
            
            const geometry = new THREE.SphereGeometry(0.05, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: this.isPlayerProjectile ? 0x0000FF : 0xFF0000,
                transparent: true,
                opacity: 0.7
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(this.mesh.position);
            particle.scale.set(1, 1, 1);
            particle.userData.creationTime = now;
            
            this.scene.add(particle);
            this.trailParticles.push(particle);
        }
        
        // Update existing trail particles
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const particle = this.trailParticles[i];
            const age = (now - particle.userData.creationTime) / 1000;
            
            // Fade out and shrink
            particle.material.opacity = Math.max(0, 0.7 - age * 2);
            const scale = Math.max(0, 1 - age * 2);
            particle.scale.set(scale, scale, scale);
            
            // Remove old particles
            if (age > 0.5) {
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
                this.trailParticles.splice(i, 1);
            }
        }
    }
    
    destroy() {
        if (this.isDestroyed) return;
        
        this.isDestroyed = true;
        this.scene.remove(this.mesh);
        
        // Clean up trail particles
        this.trailParticles.forEach(particle => {
            this.scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        });
        this.trailParticles = [];
    }
    
    checkCollision(object) {
        if (this.isDestroyed || !object.mesh) return false;
        
        const distance = this.mesh.position.distanceTo(object.mesh.position);
        const hitboxSize = object.stats && object.stats.hitboxSize ? object.stats.hitboxSize : 1.2;
        
        return distance < hitboxSize;
    }
} 