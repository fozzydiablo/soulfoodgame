import * as THREE from 'three';

export class Hero {
    constructor(scene, gameManager, camera) {
        this.scene = scene;
        this.gameManager = gameManager;
        this.camera = camera;
        this.stats = {
            health: 10,
            maxHealth: 10,
            healthRegen: 0.1, // Health regenerated per second
            damage: 1,
            speed: 5,
            attackRange: 20,
            attackSpeed: 10, // Increased to 10 shots per second for rapid firing
            jumpHeight: 4,
            jumpSpeed: 10,
            armor: 0,         // Damage reduction percentage
            evasion: 0,       // Chance to dodge attacks
            mana: 100,        // Mana pool for special abilities
            maxMana: 100,
            manaRegen: 1.0    // Mana regenerated per second
        };
        
        // Create hero model
        this.createModel();
        
        // Movement
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.isMoving = false;
        
        // Jumping physics
        this.isJumping = false;
        this.isFalling = false;
        this.jumpVelocity = 0;
        this.gravity = 20; // Gravity strength
        this.groundY = 1.2; // Normal ground position
        
        // Animation
        this.animationState = 'idle';
        this.walkTime = 0;
        this.animSpeed = 5;
        
        // Combat
        this.lastAttackTime = 0;
        
        // Collection radius for resources
        this.collectionRadius = 2;
        
        // Setup controls
        this.setupControls();
        
        // Mouse controls
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Setup mouse events
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
        document.addEventListener('mousedown', (event) => this.onMouseDown(event));
        document.addEventListener('click', (event) => this.onMouseClick(event));
    }
    
    createModel() {
        // Create a Minecraft-like character model
        const group = new THREE.Group();
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xE0AC69 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.6;
        group.add(head);
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(1, 1.2, 0.6);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3333FF }); // Blue shirt
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        group.add(body);
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0xE0AC69 }); // Skin color
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.7, 0.6, 0);
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.7, 0.6, 0);
        group.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x0000AA }); // Blue pants
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.3, -0.6, 0);
        group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.3, -0.6, 0);
        group.add(rightLeg);
        
        // Add a gun model attached to the right arm
        this.createGunModel(rightArm);
        
        // Add shadow casting to all parts
        group.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        // Set the mesh reference to the group
        this.mesh = group;
        
        // Position the character
        this.mesh.position.y = 1.2; // Raise it up so it's on the ground
        this.scene.add(this.mesh);
    }
    
    createGunModel(armMesh) {
        // Gun body
        const gunBody = new THREE.BoxGeometry(0.2, 0.15, 0.6);
        const gunMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2
        });
        
        this.gun = new THREE.Mesh(gunBody, gunMaterial);
        this.gun.position.set(0, -0.3, 0.3);
        this.gun.rotation.x = Math.PI / 2;
        
        // Gun barrel
        const barrelGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
        const barrelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            metalness: 0.9,
            roughness: 0.1
        });
        
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0, 0.4);
        this.gun.add(barrel);
        
        armMesh.add(this.gun);
    }
    
    setupControls() {
        // Keyboard controls
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            ' ': false // Space for jumping
        };
        
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
    }
    
    onKeyDown(event) {
        // Convert key to lowercase to handle both uppercase and lowercase
        const key = event.key.toLowerCase();
        
        // Check if the key is one we're tracking
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = true;
            
            // Start jumping when space is pressed and not already jumping
            if (key === ' ' && !this.isJumping && !this.isFalling) {
                this.startJump();
            }
        }
    }
    
    onKeyUp(event) {
        // Convert key to lowercase to handle both uppercase and lowercase
        const key = event.key.toLowerCase();
        
        // Check if the key is one we're tracking
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
        }
    }
    
    onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Make character face the direction of the mouse
        this.updateFacing();
    }
    
    updateFacing() {
        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Calculate the point on the ground that the mouse is pointing at
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const targetPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(groundPlane, targetPoint);
        
        // Make hero look at that point (only rotate y axis)
        if (targetPoint) {
            // Look directly at the target point
            const lookPosition = new THREE.Vector3(
                targetPoint.x,
                this.mesh.position.y,
                targetPoint.z
            );
            
            // Make the character face the target point
            this.mesh.lookAt(lookPosition);
        }
    }
    
    onMouseDown(event) {
        // Only respond to left mouse button (0)
        if (event.button === 0) {
            this.shoot();
        }
    }
    
    onMouseClick(event) {
        console.log('Mouse clicked', this.mouse);
        
        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // We now use mousedown for shooting instead of click
    }
    
    shoot() {
        if (!this.canShoot()) return;
        
        if (this.gameManager.useAmmo()) {
            console.log('Shooting!');
            
            // Get the gun barrel position
            const position = new THREE.Vector3();
            const rightArm = this.mesh.children[3];
            this.gun.getWorldPosition(position);
            
            // Get direction where the character is facing
            // Create a forward vector in the direction the character is looking
            const direction = new THREE.Vector3(0, 0, 1);
            direction.applyQuaternion(this.mesh.quaternion);
            
            // Create the projectile
            const projectile = this.gameManager.projectileManager.firePlayerProjectile(position, direction);
            
            // Set last attack time
            this.lastAttackTime = Date.now();
            
            // Play shoot animation
            this.playShootAnimation();
        } else {
            console.log('Out of ammo!');
            // Could play a "click" sound here
        }
    }
    
    playShootAnimation() {
        // Simple recoil animation for the gun
        const rightArm = this.mesh.children[3];
        
        // Reset previous animations
        rightArm.rotation.x = 0;
        
        // Apply recoil
        rightArm.rotation.x = -0.3;
        
        // Return to original position after a short delay
        setTimeout(() => {
            rightArm.rotation.x = 0;
        }, 150);
    }
    
    canShoot() {
        const now = Date.now();
        return now - this.lastAttackTime >= 1000 / this.stats.attackSpeed;
    }
    
    startJump() {
        this.isJumping = true;
        this.jumpVelocity = this.stats.jumpSpeed;
        this.animationState = 'jumping';
    }
    
    update(delta) {
        this.updateMovement(delta);
        this.updateJumping(delta);
        this.updateAnimation(delta);
        this.updateStats(delta);
        
        // Check for resource collection automatically
        this.checkResourceCollection();
    }
    
    updateJumping(delta) {
        // Apply gravity when jumping or falling
        if (this.isJumping || this.isFalling) {
            // Update vertical position based on jump velocity
            this.mesh.position.y += this.jumpVelocity * delta;
            
            // Apply gravity to jump velocity
            this.jumpVelocity -= this.gravity * delta;
            
            // Check if we've reached the peak of the jump
            if (this.isJumping && this.jumpVelocity <= 0) {
                this.isJumping = false;
                this.isFalling = true;
            }
            
            // Check if we've landed
            if (this.isFalling && this.mesh.position.y <= this.groundY) {
                this.mesh.position.y = this.groundY;
                this.isFalling = false;
                this.jumpVelocity = 0;
                this.animationState = this.isMoving ? 'walking' : 'idle';
            }
        }
    }
    
    updateAnimation(delta) {
        // Update animation time
        this.walkTime += delta * this.animSpeed * (this.isMoving ? 1 : 0);
        
        // Get limb parts
        const leftArm = this.mesh.children[2];
        const rightArm = this.mesh.children[3];
        const leftLeg = this.mesh.children[4];
        const rightLeg = this.mesh.children[5];
        
        if (this.animationState === 'idle') {
            // Reset limbs to normal position
            leftArm.rotation.x = 0;
            rightArm.rotation.x = 0;
            leftLeg.rotation.x = 0;
            rightLeg.rotation.x = 0;
            
            // Subtle idle breathing animation
            this.mesh.position.y = this.groundY + Math.sin(Date.now() * 0.001) * 0.05;
        }
        else if (this.animationState === 'walking') {
            // Walking animation - swing arms and legs
            leftArm.rotation.x = Math.sin(this.walkTime) * 0.5;
            rightArm.rotation.x = Math.sin(this.walkTime + Math.PI) * 0.5;
            leftLeg.rotation.x = Math.sin(this.walkTime + Math.PI) * 0.5;
            rightLeg.rotation.x = Math.sin(this.walkTime) * 0.5;
        }
        else if (this.animationState === 'jumping') {
            // Jumping animation - arms up and legs bent
            leftArm.rotation.x = -0.5;
            rightArm.rotation.x = -0.5;
            leftLeg.rotation.x = 0.5;
            rightLeg.rotation.x = 0.5;
        }
    }
    
    updateMovement(delta) {
        // Calculate movement direction relative to the camera (screen space)
        
        // Apply camera rotation to get world directions
        // Get only the horizontal rotation of the camera (y-axis)
        const cameraDirection = new THREE.Vector3(0, 0, -1);
        cameraDirection.applyQuaternion(this.camera.quaternion);
        cameraDirection.y = 0; // Zero out vertical component
        cameraDirection.normalize();
        
        // Calculate right vector perpendicular to forward direction
        // Use the correct cross product order for right-handed coordinate system
        const cameraHorizontalRight = new THREE.Vector3();
        cameraHorizontalRight.crossVectors(new THREE.Vector3(0, 1, 0), cameraDirection);
        cameraHorizontalRight.normalize();
        
        // Reset movement direction
        this.direction.set(0, 0, 0);
        
        // Add camera-relative movement based on key presses
        if (this.keys.w) this.direction.add(cameraDirection);
        if (this.keys.s) this.direction.sub(cameraDirection); 
        // Fix left/right direction by inverting the direction for a and d
        if (this.keys.a) this.direction.add(cameraHorizontalRight);
        if (this.keys.d) this.direction.sub(cameraHorizontalRight);
        
        if (this.direction.length() > 0) {
            this.direction.normalize();
            this.isMoving = true;
            if (!this.isJumping && !this.isFalling) {
                this.animationState = 'walking';
            }
            
            // Move the character
            this.velocity.copy(this.direction).multiplyScalar(this.stats.speed * delta);
            this.mesh.position.add(this.velocity);
        } else {
            this.isMoving = false;
            if (!this.isJumping && !this.isFalling) {
                this.animationState = 'idle';
            }
        }
        
        // Always update facing based on mouse
        this.updateFacing();
    }
    
    takeDamage(amount) {
        // Damage is handled by the game manager now
        console.log('Hero took damage:', amount);
    }
    
    die() {
        // Death is handled by the game manager now
        console.log('Hero died!');
    }
    
    checkCollision(object) {
        const distance = this.mesh.position.distanceTo(object.mesh.position);
        return distance < 1.5; // Simple collision check
    }
    
    // Check for resources to collect
    checkResourceCollection() {
        if (!this.gameManager || !this.gameManager.resourceManager) return;
        
        const resources = this.gameManager.resourceManager.resources;
        for (let i = resources.length - 1; i >= 0; i--) {
            const resource = resources[i];
            if (resource && resource.mesh && !resource.isCollected) {
                const distance = this.mesh.position.distanceTo(resource.mesh.position);
                if (distance <= this.collectionRadius) {
                    console.log(`Auto-collecting ${resource.type}`);
                    const amount = resource.collect();
                    this.gameManager.addResources(resource.type, amount);
                    
                    // Visual effect for collection
                    this.createCollectionEffect(resource.mesh.position.clone());
                }
            }
        }
    }
    
    // Visual effect for collection
    createCollectionEffect(position) {
        // Create particles for collection effect
        const particleCount = 10;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00FF00, // Green for ammo
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(geometry, material);
            
            // Random offset from the collection point
            particle.position.copy(position);
            particle.position.y += 0.5;
            
            // Random velocity
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 2
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
                    particle.userData.velocity.y -= 0.1;
                    
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
    
    // Regenerate health and mana over time
    updateStats(delta) {
        // Health regeneration
        if (this.stats.health < this.stats.maxHealth && this.stats.healthRegen > 0) {
            // Calculate regen amount based on delta time
            const regenAmount = this.stats.healthRegen * delta;
            
            // Update health in the game state
            this.gameManager.gameState.health = Math.min(
                this.gameManager.gameState.health + regenAmount,
                this.gameManager.gameState.maxHealth
            );
            
            // Only update UI if regeneration is significant (avoid constant UI updates)
            if (Math.floor(this.gameManager.gameState.health) > Math.floor(this.gameManager.gameState.health - regenAmount)) {
                this.gameManager.ui.updateHealth(
                    this.gameManager.gameState.health, 
                    this.gameManager.gameState.maxHealth
                );
            }
        }
        
        // Mana regeneration
        if (this.stats.mana < this.stats.maxMana && this.stats.manaRegen > 0) {
            // Calculate regen amount based on delta time
            const regenAmount = this.stats.manaRegen * delta;
            
            // Update mana
            this.stats.mana = Math.min(this.stats.mana + regenAmount, this.stats.maxMana);
            
            // Only update UI if regeneration is significant
            if (Math.floor(this.stats.mana) > Math.floor(this.stats.mana - regenAmount)) {
                // The UI update will happen in gameManager.update() which calls updatePlayerStats
            }
        }
    }
} 