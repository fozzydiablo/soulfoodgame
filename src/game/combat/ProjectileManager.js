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
            
            // Remove projectiles that are destroyed or too old
            if (projectile.isDestroyed || projectile.lifetime > 5) {
                this.projectiles.splice(i, 1);
                continue; // Skip updating destroyed projectiles
            }
            
            projectile.update(delta);
        }
    }
    
    cleanup() {
        // Remove all projectiles from the scene
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (projectile.mesh && projectile.mesh.parent) {
                projectile.mesh.parent.remove(projectile.mesh);
            }
        }
        
        // Clear the projectiles array
        this.projectiles = [];
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
        this.damage = 1; // Default damage
        this.areaEffect = false; // Default to no area effect
        this.areaRadius = 0; // Default radius for area effect
        
        // Create projectile mesh
        this.createMesh(position, color);
        
        // Add trail effect
        this.createTrail();
    }
    
    createMesh(position, color) {
        if (this.isPlayerProjectile) {
            // Create a detailed arrow projectile to match the hero's bow
            this.mesh = new THREE.Group();
            
            // Arrow shaft - thinner and longer
            const shaftGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.6, 8);
            const shaftMaterial = new THREE.MeshStandardMaterial({
                color: 0xB5A642,  // Light wooden color
                roughness: 0.5,
                metalness: 0.1
            });
            
            const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
            shaft.rotation.x = Math.PI / 2;
            this.mesh.add(shaft);
            
            // Arrow head - sharper and more defined
            const headGeometry = new THREE.ConeGeometry(0.02, 0.08, 8);
            const headMaterial = new THREE.MeshStandardMaterial({
                color: 0x666666,  // Steel gray for arrowhead
                metalness: 0.9,
                roughness: 0.2
            });
            
            const arrowHead = new THREE.Mesh(headGeometry, headMaterial);
            arrowHead.rotation.x = -Math.PI / 2;
            arrowHead.position.z = 0.33;
            this.mesh.add(arrowHead);
            
            // Arrow fletching (feathers) - more detailed
            // Create a custom shape for the feathers
            const featherShape = new THREE.Shape();
            featherShape.moveTo(0, 0);
            featherShape.lineTo(0.08, 0.005);
            featherShape.lineTo(0.12, 0.04);
            featherShape.lineTo(0.08, 0.08);
            featherShape.lineTo(0, 0.1);
            featherShape.lineTo(0, 0);
            
            const featherExtrudeSettings = {
                steps: 1,
                depth: 0.003,
                bevelEnabled: false
            };
            
            const featherGeometry = new THREE.ExtrudeGeometry(featherShape, featherExtrudeSettings);
            
            // Create three feathers spaced equally around the shaft
            const featherMaterial1 = new THREE.MeshStandardMaterial({ color: 0xDD2222 }); // Red
            const featherMaterial2 = new THREE.MeshStandardMaterial({ color: 0x2222DD }); // Blue
            const featherMaterial3 = new THREE.MeshStandardMaterial({ color: 0x22DD22 }); // Green
            
            // First feather (red) - top
            const feather1 = new THREE.Mesh(featherGeometry, featherMaterial1);
            feather1.position.set(0, 0.01, -0.25);
            feather1.rotation.x = -Math.PI / 2;
            this.mesh.add(feather1);
            
            // Second feather (blue) - right side
            const feather2 = new THREE.Mesh(featherGeometry, featherMaterial2);
            feather2.position.set(0.01, 0, -0.25);
            feather2.rotation.set(0, 0, Math.PI/2);
            this.mesh.add(feather2);
            
            // Third feather (green) - left side
            const feather3 = new THREE.Mesh(featherGeometry, featherMaterial3);
            feather3.position.set(-0.01, 0, -0.25);
            feather3.rotation.set(0, 0, -Math.PI/2);
            this.mesh.add(feather3);
            
            // Add a small nock at the end of the arrow
            const nockGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.02, 8);
            const nockMaterial = new THREE.MeshStandardMaterial({
                color: 0x222222,
                metalness: 0.5,
                roughness: 0.5
            });
            
            const nock = new THREE.Mesh(nockGeometry, nockMaterial);
            nock.rotation.x = Math.PI / 2;
            nock.position.z = -0.31;
            this.mesh.add(nock);
        } else {
            // For enemy projectiles, keep the original design or modify as needed
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
        }
        
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
        
        // Check if mesh exists before accessing its properties
        if (!this.mesh) {
            return;
        }
        
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
        
        // Check if mesh exists before accessing its properties
        if (!this.mesh) {
            return;
        }
        
        // Create new trail particle every 50ms
        if (now - this.lastTrailTime > 50) {
            this.lastTrailTime = now;
            
            if (this.isPlayerProjectile) {
                // Arrow trail - smaller, more subtle particles
                const geometry = new THREE.SphereGeometry(0.02, 8, 8);
                const material = new THREE.MeshBasicMaterial({
                    color: 0xFFFFFF, // White trail for arrows
                    transparent: true,
                    opacity: 0.5
                });
                
                const particle = new THREE.Mesh(geometry, material);
                particle.position.copy(this.mesh.position);
                particle.scale.set(1, 1, 1);
                particle.userData.creationTime = now;
                
                this.scene.add(particle);
                this.trailParticles.push(particle);
            } else {
                // Original enemy projectile trail
                const geometry = new THREE.SphereGeometry(0.05, 8, 8);
                const material = new THREE.MeshBasicMaterial({
                    color: 0xFF0000, // Red for enemy projectiles
                    transparent: true,
                    opacity: 0.7
                });
                
                // Customize trail for special projectiles
                if (this.areaEffect && this.isPlayerProjectile) {
                    material.color.set(0xff6600); // Fireball trail
                }
                
                const particle = new THREE.Mesh(geometry, material);
                particle.position.copy(this.mesh.position);
                particle.scale.set(1, 1, 1);
                particle.userData.creationTime = now;
                
                this.scene.add(particle);
                this.trailParticles.push(particle);
            }
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
        
        // If it's an area effect projectile, create explosion
        if (this.areaEffect && this.isPlayerProjectile) {
            this.createExplosionEffect();
        }
        
        // Clean up mesh
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
        
        // Clean up trail particles
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const particle = this.trailParticles[i];
            this.scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        }
        this.trailParticles = [];
    }
    
    createExplosionEffect() {
        // Store position before destroying the mesh
        // Safety check for null mesh
        if (!this.mesh) {
            console.warn("Attempted to create explosion effect with null mesh");
            return;
        }
        
        const position = this.mesh.position.clone();
        
        // Create explosion particles
        const particleCount = 30;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.2, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0xff6600, // Orange for fire
                transparent: true,
                opacity: 0.8
            });
            
            // Randomize colors slightly for variation
            const red = 0.9 + Math.random() * 0.1;
            const green = 0.3 + Math.random() * 0.3;
            const blue = 0;
            material.color.setRGB(red, green, blue);
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            // Random direction
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const speed = Math.random() * 5 + 3;
            
            particle.userData.velocity = new THREE.Vector3(
                speed * Math.sin(phi) * Math.cos(theta),
                speed * Math.sin(phi) * Math.sin(theta) + 2, // Add upward boost
                speed * Math.cos(phi)
            );
            
            particles.add(particle);
        }
        
        this.scene.add(particles);
        
        // Animate and remove after 1 second
        const startTime = Date.now();
        
        const animateExplosion = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            
            if (elapsed < 1) {
                // Update each particle
                particles.children.forEach(particle => {
                    // Move by velocity
                    particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.05));
                    
                    // Slow down velocity
                    particle.userData.velocity.multiplyScalar(0.92);
                    
                    // Gravity effect
                    particle.userData.velocity.y -= 0.1;
                    
                    // Fade out
                    particle.material.opacity = 0.8 * (1 - elapsed);
                    
                    // Grow initially then shrink
                    const scale = elapsed < 0.3 ? 
                                1 + elapsed * 3 : 
                                1 + 0.9 - (elapsed - 0.3) * 2;
                    particle.scale.set(scale, scale, scale);
                });
                
                requestAnimationFrame(animateExplosion);
            } else {
                // Remove particles when done
                this.scene.remove(particles);
                particles.children.forEach(particle => {
                    particle.geometry.dispose();
                    particle.material.dispose();
                });
            }
        };
        
        animateExplosion();
    }
    
    checkCollision(object) {
        // Safety checks for null objects or meshes
        if (this.isDestroyed || !this.mesh || !object || !object.mesh) return false;
        
        const distance = this.mesh.position.distanceTo(object.mesh.position);
        const hitboxSize = object.stats && object.stats.hitboxSize ? object.stats.hitboxSize : 1.2;
        
        return distance < hitboxSize;
    }
} 