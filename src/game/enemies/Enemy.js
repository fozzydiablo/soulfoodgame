import * as THREE from 'three';

export class Enemy {
    constructor(scene, x, z, gameManager) {
        this.scene = scene;
        this.gameManager = gameManager;
        this.isDead = false;
        this.isAttacking = false;
        this.lastAttackTime = 0;
        this.attackCooldown = 2; // seconds
        this.enemyType = 'basic'; // Default enemy type
        
        // Create a random offset for this enemy's movement target
        // This makes enemies approach from different angles instead of bunching together
        this.positionOffset = new THREE.Vector3(
            (Math.random() - 0.5) * 5,  // Random X offset
            0,                          // No Y offset (stay on ground)
            (Math.random() - 0.5) * 5   // Random Z offset
        );
        
        this.stats = {
            health: 3,
            maxHealth: 3,
            damage: 1,
            speed: 2,
            attackRange: 1.5,
            detectionRange: 10,
            attackSpeed: 1.0,    // Attacks per second
            hitboxSize: 2.0      // Collision radius
        };
        
        // Create enemy model
        this.createModel(x, z);
        
        // Create spear
        this.createSpear();
        
        // Freeze status
        this.isFrozen = false;
        this.frozenUntil = 0;
        this.originalMaterial = null;
    }
    
    createModel(x, z) {
        // Create a group for the enemy
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B0000, // Dark red
            roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.5);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xA52A2A // Brown
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        this.mesh.add(head);
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
        
        this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.leftArm.position.set(-0.55, 0.9, 0);
        this.mesh.add(this.leftArm);
        
        this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        this.rightArm.position.set(0.55, 0.9, 0);
        this.mesh.add(this.rightArm);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x800000 });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.25, 0.2, 0);
        this.mesh.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.25, 0.2, 0);
        this.mesh.add(rightLeg);
        
        // Set position
        this.mesh.position.set(x, 0, z);
        
        // Add shadow casting
        this.mesh.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        // Store reference for raycasting
        this.mesh.userData = { enemy: this };
        
        this.scene.add(this.mesh);
    }
    
    createSpear() {
        // Spear group
        this.spear = new THREE.Group();
        
        // Spear shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);
        const shaftMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, // Brown
            roughness: 0.6
        });
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.rotation.x = Math.PI / 2;
        shaft.position.z = 0.6;
        this.spear.add(shaft);
        
        // Spear tip
        const tipGeometry = new THREE.ConeGeometry(0.08, 0.3, 8);
        const tipMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xA9A9A9, // Grey
            metalness: 0.7,
            roughness: 0.3
        });
        const tip = new THREE.Mesh(tipGeometry, tipMaterial);
        tip.rotation.x = Math.PI / 2;
        tip.position.z = 1.3;
        this.spear.add(tip);
        
        // Add spear to right arm
        this.rightArm.add(this.spear);
        
        // Initially, position the spear in hand
        this.spear.position.set(0, -0.3, 0);
        this.spear.rotation.y = Math.PI / 2;
    }
    
    update(delta, playerPosition) {
        if (this.isDead) return;
        
        // Check if still frozen
        if (this.isFrozen) {
            const now = Date.now();
            if (now < this.frozenUntil) {
                // Still frozen, don't move or attack
                return;
            } else {
                // Unfreeze
                this.unfreeze();
            }
        }
        
        const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
        
        // Move towards player if not in attack range
        if (distanceToPlayer > this.stats.attackRange) {
            this.moveTowardsPlayer(delta, playerPosition);
        } else {
            // Attack if in range
            if (this.canAttack()) {
                this.attackPlayer(playerPosition);
            }
        }
    }
    
    moveTowardsPlayer(delta, playerPosition) {
        // Create a target position that's offset from the actual player position
        const targetPosition = new THREE.Vector3().copy(playerPosition).add(this.positionOffset);
        
        // Only use offset when we're far from the player
        const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
        
        // If we're getting close to the player, gradually reduce the offset effect
        if (distanceToPlayer < 8) {
            // Linearly reduce offset as we get closer
            const offsetScale = distanceToPlayer / 8;
            targetPosition.copy(playerPosition).add(this.positionOffset.clone().multiplyScalar(offsetScale));
        }
        
        // Direction to target position (which includes offset)
        const direction = new THREE.Vector3()
            .subVectors(targetPosition, this.mesh.position)
            .normalize();
        
        // Calculate velocity
        const velocity = direction.multiplyScalar(this.stats.speed * delta);
        
        // Store current position before moving
        const currentPosition = this.mesh.position.clone();
        
        // Calculate target position after movement
        const newPosition = currentPosition.clone().add(velocity);
        
        // Check for wall collisions using the building manager
        const buildingManager = this.gameManager.buildingManager;
        const enemyRadius = this.stats.hitboxSize || 0.8; // Use hitboxSize or default if not set
        
        // Track if the enemy has been stuck for too long
        if (!this.stuckTimer) {
            this.stuckTimer = 0;
            this.lastPosition = currentPosition.clone();
            this.stuckThreshold = 2.0; // Seconds before considering an enemy "stuck"
        }
        
        // Check if we're stuck by seeing if we've moved significantly in the last check
        if (this.lastPosition.distanceTo(currentPosition) < 0.1) {
            this.stuckTimer += delta;
        } else {
            this.stuckTimer = 0;
            this.lastPosition = currentPosition.clone();
        }
        
        if (buildingManager && buildingManager.checkWallCollision(newPosition, enemyRadius)) {
            // Try to slide along the wall by trying X and Z movement separately
            const xOnlyMove = currentPosition.clone();
            xOnlyMove.x = newPosition.x;
            
            const zOnlyMove = currentPosition.clone();
            zOnlyMove.z = newPosition.z;
            
            // Check if we can move in just the X direction
            if (!buildingManager.checkWallCollision(xOnlyMove, enemyRadius)) {
                // X movement is valid
                this.mesh.position.x = xOnlyMove.x;
            }
            // Check if we can move in just the Z direction
            else if (!buildingManager.checkWallCollision(zOnlyMove, enemyRadius)) {
                // Z movement is valid
                this.mesh.position.z = zOnlyMove.z;
            }
            // If both directions cause collisions and we've been stuck for a while, try a more drastic approach
            else if (this.stuckTimer > this.stuckThreshold) {
                // Generate a completely new random offset to try to find a new path
                const randomAngle = Math.random() * Math.PI * 2;
                const escapeDirection = new THREE.Vector3(
                    Math.cos(randomAngle),
                    0,
                    Math.sin(randomAngle)
                );
                
                // Try to move in this escape direction
                const escapePosition = currentPosition.clone().add(
                    escapeDirection.multiplyScalar(this.stats.speed * delta * 2)
                );
                
                if (!buildingManager.checkWallCollision(escapePosition, enemyRadius)) {
                    // Move to escape position
                    this.mesh.position.copy(escapePosition);
                    console.log("Enemy unstuck with random direction");
                } else {
                    // If still stuck, generate a new offset for future attempts
                    this.positionOffset = new THREE.Vector3(
                        (Math.random() - 0.5) * 10, // Use a larger range to find more varied paths
                        0,
                        (Math.random() - 0.5) * 10
                    );
                    console.log("Enemy stuck - generated new path offset");
                }
                
                // Reset stuck timer
                this.stuckTimer = 0;
            }
        } else {
            // No collision, apply the full movement
            this.mesh.position.copy(newPosition);
        }
        
        // Face player (not the offset target, so enemies still look at player)
        this.mesh.lookAt(new THREE.Vector3(
            playerPosition.x,
            this.mesh.position.y,
            playerPosition.z
        ));
    }
    
    canAttack() {
        const now = Date.now();
        
        // Make sure we have attackSpeed defined with a default if not present
        const attackSpeed = this.stats.attackSpeed || 1; 
        
        // Calculate attack interval in milliseconds
        const attackInterval = 1000 / attackSpeed;
        
        return now - this.lastAttackTime >= attackInterval;
    }
    
    attackPlayer(playerPosition) {
        // Set last attack time
        this.lastAttackTime = Date.now();
        
        // Play attack animation
        this.playAttackAnimation();
        
        // Create projectile after a small delay to match animation
        setTimeout(() => {
            if (this.isDead) return;
            
            // Direction to player - this calculates a vector pointing from the enemy to the player
            const direction = new THREE.Vector3()
                .subVectors(playerPosition, this.mesh.position)
                .normalize();
            
            // Get spear throw position (from hand)
            const spearPosition = new THREE.Vector3();
            this.rightArm.getWorldPosition(spearPosition);
            
            // Fire spear projectile
            this.gameManager.projectileManager.fireEnemyProjectile(spearPosition, direction);
        }, 300);
    }
    
    playAttackAnimation() {
        // Initial position
        this.rightArm.rotation.x = 0;
        this.rightArm.rotation.z = 0;
        
        // Wind up
        const windUpAnimation = () => {
            this.rightArm.rotation.x = -Math.PI / 3;
            this.rightArm.rotation.z = -Math.PI / 6;
            
            // Throw animation after wind up
            setTimeout(throwAnimation, 200);
        };
        
        // Throw
        const throwAnimation = () => {
            this.rightArm.rotation.x = Math.PI / 2;
            this.rightArm.rotation.z = 0;
            
            // Reset after throw
            setTimeout(resetAnimation, 300);
        };
        
        // Reset to idle
        const resetAnimation = () => {
            this.rightArm.rotation.x = 0;
            this.rightArm.rotation.z = 0;
        };
        
        // Start animation sequence
        windUpAnimation();
    }
    
    takeDamage(amount) {
        if (this.isDead) return;
        
        this.stats.health -= amount;
        
        // Visual feedback - flash red
        this.mesh.traverse((object) => {
            if (object instanceof THREE.Mesh && object.material) {
                object.material.emissive = new THREE.Color(1, 0, 0);
                
                // Reset after a short time
                setTimeout(() => {
                    if (object.material) {
                        object.material.emissive = new THREE.Color(0, 0, 0);
                    }
                }, 100);
            }
        });
        
        if (this.stats.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.isDead = true;
        console.log("Enemy died:", this.enemyType);
        
        // Add death animation
        this.playDeathAnimation();
        
        // Notify EnemyManager about death for item drops, gold, and score
        if (this.gameManager && this.gameManager.enemyManager) {
            console.log("Calling handleEnemyDeath...");
            this.gameManager.enemyManager.handleEnemyDeath(this);
            
            // Award score is now called inside handleEnemyDeath
            // No need to call it separately to avoid duplicate processing
        } else {
            console.error("No gameManager or enemyManager found!");
        }
        
        // No need to remove from scene here as EnemyManager will handle that
    }
    
    playDeathAnimation() {
        // Fall over animation
        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.position.y = 0.5;
        
        // Fade out
        const startTime = Date.now();
        const animateFade = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            
            if (elapsed < 1 && this.mesh) {
                // Gradually fade out
                this.mesh.traverse((object) => {
                    if (object instanceof THREE.Mesh && object.material) {
                        object.material.opacity = 1 - elapsed;
                        object.material.transparent = true;
                    }
                });
                
                requestAnimationFrame(animateFade);
            }
        };
        
        animateFade();
    }
    
    cleanup() {
        // Remove from scene
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh = null;
        }
    }
    
    freeze(duration) {
        // Store current time to track freeze duration
        this.isFrozen = true;
        this.frozenUntil = Date.now() + (duration * 1000);
        
        // Save original materials
        if (!this.originalMaterial) {
            this.originalMaterial = [];
            this.mesh.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                    // Store original material
                    this.originalMaterial.push({
                        mesh: child,
                        material: child.material.clone()
                    });
                    
                    // Apply frozen effect - blue tint and shiny
                    const frozenMaterial = new THREE.MeshStandardMaterial({
                        color: 0x99ccff,
                        metalness: 0.9,
                        roughness: 0.2,
                        emissive: 0x3366cc,
                        emissiveIntensity: 0.2
                    });
                    
                    child.material = frozenMaterial;
                }
            });
        }
        
        // Create frost particles
        this.createFrostParticles();
    }
    
    unfreeze() {
        if (!this.isFrozen) return;
        
        this.isFrozen = false;
        
        // Restore original materials
        if (this.originalMaterial) {
            this.originalMaterial.forEach(item => {
                item.mesh.material = item.material;
            });
            this.originalMaterial = null;
        }
    }
    
    createFrostParticles() {
        // Create frost particles around the frozen enemy
        const particleCount = 10;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const material = new THREE.MeshBasicMaterial({
                color: 0xaaddff,
                transparent: true,
                opacity: 0.7
            });
            
            const particle = new THREE.Mesh(geometry, material);
            
            // Random position around enemy
            const angle = Math.random() * Math.PI * 2;
            const radius = 1.0;
            const height = Math.random() * 2;
            
            particle.position.set(
                this.mesh.position.x + Math.cos(angle) * radius,
                this.mesh.position.y + height,
                this.mesh.position.z + Math.sin(angle) * radius
            );
            
            // Random upward velocity
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                Math.random() * 0.3 + 0.1,
                (Math.random() - 0.5) * 0.2
            );
            
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
                    particle.position.add(particle.userData.velocity);
                    
                    // Fade out
                    particle.material.opacity = 0.7 * (1 - elapsed);
                    
                    // Scale down
                    const scale = 1 - elapsed * 0.5;
                    particle.scale.set(scale, scale, scale);
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