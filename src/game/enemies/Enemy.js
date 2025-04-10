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
        
        // Move towards target
        const velocity = direction.multiplyScalar(this.stats.speed * delta);
        this.mesh.position.add(velocity);
        
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
        
        // Add death animation
        this.playDeathAnimation();
        
        // Remove from scene after animation
        setTimeout(() => {
            if (this.mesh) {
                this.scene.remove(this.mesh);
                this.mesh = null;
            }
        }, 1000);
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
} 