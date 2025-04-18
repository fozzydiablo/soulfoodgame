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
        
        // Add a bow model attached to the right arm
        this.createBowModel(rightArm);
        
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
    
    createBowModel(armMesh) {
        // Create a more elegant recurve bow as shown in the reference image
        const bowGroup = new THREE.Group();
        
        // Main bow body curve
        const bowCurve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, -0.3, 0),        // Bottom tip
            new THREE.Vector3(-0.2, -0.1, 0),     // Bottom control point
            new THREE.Vector3(-0.2, 0.1, 0),      // Top control point
            new THREE.Vector3(0, 0.3, 0)          // Top tip
        );
        
        // Create the bow body using extruded shape
        const bowPoints = bowCurve.getPoints(20);
        
        // Create a path for extrusion
        const bowShape = new THREE.Shape();
        bowShape.moveTo(0, -0.02);
        bowShape.lineTo(0.03, 0);
        bowShape.lineTo(0, 0.02);
        bowShape.lineTo(-0.03, 0);
        bowShape.lineTo(0, -0.02);
        
        // Create path for the bow's curve
        const bowPath = new THREE.CatmullRomCurve3(bowPoints);
        
        // Extrude settings for a more detailed bow
        const extrudeSettings = {
            steps: 20,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelSegments: 5,
            extrudePath: bowPath
        };
        
        const bowGeometry = new THREE.ExtrudeGeometry(bowShape, extrudeSettings);
        
        // Dark wood material for the bow body
        const bowMaterial = new THREE.MeshStandardMaterial({
            color: 0x4A2511,  // Darker brown for wooden bow
            roughness: 0.7,
            metalness: 0.1
        });
        
        // Create the main bow body
        const bowBody = new THREE.Mesh(bowGeometry, bowMaterial);
        bowGroup.add(bowBody);
        
        // Add recurve tips at the ends (the curved parts at the ends of the bow)
        const tipGeometry = new THREE.TorusGeometry(0.05, 0.01, 8, 8, Math.PI);
        const upperTip = new THREE.Mesh(tipGeometry, bowMaterial);
        upperTip.position.set(0, 0.3, 0);
        upperTip.rotation.x = Math.PI / 2;
        bowGroup.add(upperTip);
        
        const lowerTip = new THREE.Mesh(tipGeometry, bowMaterial);
        lowerTip.position.set(0, -0.3, 0);
        lowerTip.rotation.x = -Math.PI / 2;
        bowGroup.add(lowerTip);
        
        // Bowstring - thinner and taut
        const stringGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.62, 4);
        const stringMaterial = new THREE.MeshStandardMaterial({
            color: 0xF0F0F0,
            roughness: 0.3,
            metalness: 0.2
        });
        
        const bowstring = new THREE.Mesh(stringGeometry, stringMaterial);
        bowstring.position.z = 0.03;
        bowGroup.add(bowstring);
        
        // Add bow grip wrapping in the middle
        const gripGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.1, 8);
        const gripMaterial = new THREE.MeshStandardMaterial({
            color: 0x1E1E1E,  // Dark leather color
            roughness: 0.9,
            metalness: 0.1
        });
        
        const grip = new THREE.Mesh(gripGeometry, gripMaterial);
        grip.rotation.x = Math.PI / 2;
        grip.position.z = -0.02;
        bowGroup.add(grip);
        
        // Rotate and position the entire bow
        bowGroup.rotation.y = Math.PI / 2;
        bowGroup.rotation.z = -Math.PI / 10; // Slightly angled
        bowGroup.position.set(0, -0.1, 0.3);
        
        // Create and add arrow model
        this.createArrowModel();
        this.arrow.position.z = 0.02;
        bowGroup.add(this.arrow);
        
        // Set the bow reference and add to arm
        this.bow = bowGroup;
        armMesh.add(this.bow);
    }
    
    createArrowModel() {
        const arrowGroup = new THREE.Group();
        
        // Arrow shaft - thinner and longer
        const shaftGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.6, 8);
        const shaftMaterial = new THREE.MeshStandardMaterial({
            color: 0xB5A642,  // Light wooden color for shaft
            roughness: 0.5,
            metalness: 0.1
        });
        
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.rotation.z = Math.PI / 2;
        arrowGroup.add(shaft);
        
        // Arrow head - sharper and more defined
        const headGeometry = new THREE.ConeGeometry(0.02, 0.08, 8);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,  // Steel gray for arrowhead
            metalness: 0.9,
            roughness: 0.2
        });
        
        const arrowHead = new THREE.Mesh(headGeometry, headMaterial);
        arrowHead.rotation.z = -Math.PI / 2;
        arrowHead.position.x = 0.33;
        arrowGroup.add(arrowHead);
        
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
        feather1.position.set(-0.25, 0.01, 0);
        feather1.rotation.z = Math.PI / 2;
        arrowGroup.add(feather1);
        
        // Second feather (blue) - right side
        const feather2 = new THREE.Mesh(featherGeometry, featherMaterial2);
        feather2.position.set(-0.25, 0, 0.01);
        feather2.rotation.set(0, -Math.PI/2, -Math.PI/2);
        arrowGroup.add(feather2);
        
        // Third feather (green) - left side
        const feather3 = new THREE.Mesh(featherGeometry, featherMaterial3);
        feather3.position.set(-0.25, 0, -0.01);
        feather3.rotation.set(0, Math.PI/2, -Math.PI/2);
        arrowGroup.add(feather3);
        
        // Add a small nock at the end of the arrow
        const nockGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.02, 8);
        const nockMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.5,
            roughness: 0.5
        });
        
        const nock = new THREE.Mesh(nockGeometry, nockMaterial);
        nock.rotation.z = Math.PI / 2;
        nock.position.x = -0.31;
        arrowGroup.add(nock);
        
        // Initially hide the arrow - will be shown during shooting
        arrowGroup.visible = false;
        
        this.arrow = arrowGroup;
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
        // Only handle left click
        if (event.button === 0) {
            // Just shoot once immediately instead of setting a flag
            if (this.canShoot() && !this.gameManager.isBetweenWaves) {
                this.shoot();
            }
        }
    }
    
    onMouseUp(event) {
        // Clear the shooting flag (no longer needed but kept for safety)
        if (event.button === 0) {
            this.shooting = false;
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
            
            // Get the bow position
            const position = new THREE.Vector3();
            const rightArm = this.mesh.children[3];
            this.bow.getWorldPosition(position);
            
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
            console.log('Out of arrows!');
            // Could play a "click" sound here
        }
    }
    
    playShootAnimation() {
        // Set animation state to shooting
        this.animationState = 'shooting';
        
        // Show the arrow when drawing the bow
        this.arrow.visible = true;
        
        // Get the arm for animation
        const leftArm = this.mesh.children[2];
        const rightArm = this.mesh.children[3];
        
        // Animate bow string tension
        // Find the bowstring in the bow group
        let bowstring = null;
        this.bow.traverse((child) => {
            if (child instanceof THREE.Mesh && 
                child.material && 
                child.material.color && 
                child.material.color.getHexString() === 'f0f0f0') {
                bowstring = child;
            }
        });
        
        // Draw the bow animation
        if (bowstring) {
            // Tense the bowstring by scaling it shorter
            bowstring.scale.y = 0.9;
            
            // Slightly bend the bow by rotating the bow group
            this.bow.rotation.z -= 0.1;
        }
        
        // After a short delay, release the arrow and return to original position
        setTimeout(() => {
            // Hide the arrow (it's been fired)
            this.arrow.visible = false;
            
            // Return bowstring to normal
            if (bowstring) {
                bowstring.scale.y = 1.0;
                this.bow.rotation.z += 0.1;
            }
            
            // Return to idle animation after arrow release
            this.animationState = 'idle';
        }, 200);
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
        
        // Remove continuous shooting - we now shoot only once on mouse down
        
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
        else if (this.animationState === 'shooting') {
            // Shooting animation - archery stance
            leftArm.rotation.x = -0.8;  // Left arm extended forward holding the bow
            rightArm.rotation.x = -1.0; // Right arm pulled back further to draw the bowstring
            leftLeg.rotation.x = 0.2;   // Slight stance with left leg forward
            rightLeg.rotation.x = -0.2; // Right leg back for stability
            
            // Slightly rotate upper body for archer stance
            if (!this.shooting_rotation) {
                this.mesh.rotation.y += 0.2;
                this.shooting_rotation = true;
            }
        } else if (this.shooting_rotation) {
            // Reset rotation when not shooting
            this.mesh.rotation.y -= 0.2;
            this.shooting_rotation = false;
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
            
            // Calculate new position with velocity
            this.velocity.copy(this.direction).multiplyScalar(this.stats.speed * delta);
            
            // Store current position before moving
            const currentPosition = this.mesh.position.clone();
            
            // Calculate target position
            const targetPosition = currentPosition.clone().add(this.velocity);
            
            // Check for wall collisions
            const buildingManager = this.gameManager.buildingManager;
            const characterRadius = 1.0; // Player collision radius
            
            // Check if the target position would cause a wall collision
            if (buildingManager && buildingManager.checkWallCollision(targetPosition, characterRadius)) {
                // Try to slide along the wall by checking X and Z movements separately
                const xOnlyMove = currentPosition.clone();
                xOnlyMove.x = targetPosition.x;
                
                const zOnlyMove = currentPosition.clone();
                zOnlyMove.z = targetPosition.z;
                
                // Check if we can move in just the X direction
                if (!buildingManager.checkWallCollision(xOnlyMove, characterRadius)) {
                    // X movement is valid
                    this.mesh.position.x = xOnlyMove.x;
                }
                // Check if we can move in just the Z direction 
                else if (!buildingManager.checkWallCollision(zOnlyMove, characterRadius)) {
                    // Z movement is valid
                    this.mesh.position.z = zOnlyMove.z;
                }
                // If both X and Z cause collisions, don't move (we're in a corner)
            } else {
                // No collision, apply the full movement
                this.mesh.position.copy(targetPosition);
            }
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
        try {
            // Check if gameManager and resourceManager exist
            if (!this.gameManager || !this.gameManager.resourceManager) return;
            
            // Check if resources array exists
            const resources = this.gameManager.resourceManager.resources;
            if (!resources || !Array.isArray(resources)) return;
            
            for (let i = resources.length - 1; i >= 0; i--) {
                // Skip undefined or null resources
                if (i >= resources.length) continue;
                
                const resource = resources[i];
                
                // Make sure resource and resource.mesh exist before accessing resource.mesh.position
                if (resource && 
                    resource.mesh && 
                    resource.mesh.position && 
                    typeof resource.mesh.position.distanceTo === 'function' && 
                    !resource.isCollected) {
                    
                    const distance = this.mesh.position.distanceTo(resource.mesh.position);
                    if (distance <= this.collectionRadius) {
                        console.log(`Auto-collecting ${resource.type}`);
                        try {
                            const amount = resource.collect();
                            this.gameManager.addResources(resource.type, amount);
                            
                            // Visual effect for collection (only if position is available)
                            if (resource.mesh && resource.mesh.position) {
                                this.createCollectionEffect(resource.mesh.position.clone());
                            }
                        } catch (err) {
                            console.error("Error collecting resource:", err);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error in checkResourceCollection:", error);
        }
    }
    
    // Visual effect for collection
    createCollectionEffect(position) {
        try {
            // Validate position is a proper Vector3 with required methods
            if (!position || typeof position.copy !== 'function') {
                console.error("Invalid position passed to createCollectionEffect");
                return;
            }
            
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
                try {
                    const elapsed = (Date.now() - startTime) / 1000;
                    
                    if (elapsed < 1 && particles && particles.children) {
                        // Update each particle
                        particles.children.forEach(particle => {
                            if (particle && particle.position && particle.userData && particle.userData.velocity) {
                                // Move by velocity
                                particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.1));
                                
                                // Gravity effect
                                particle.userData.velocity.y -= 0.1;
                                
                                // Fade out
                                if (particle.material) {
                                    particle.material.opacity = 0.8 * (1 - elapsed);
                                }
                                
                                // Scale down
                                particle.scale.set(1 - elapsed, 1 - elapsed, 1 - elapsed);
                            }
                        });
                        
                        requestAnimationFrame(animateParticles);
                    } else {
                        // Remove particles when done
                        if (particles) {
                            this.scene.remove(particles);
                            if (particles.children) {
                                particles.children.forEach(particle => {
                                    if (particle) {
                                        if (particle.geometry) particle.geometry.dispose();
                                        if (particle.material) particle.material.dispose();
                                    }
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error in animateParticles:", error);
                    // Clean up in case of error
                    if (particles) {
                        this.scene.remove(particles);
                    }
                }
            };
            
            animateParticles();
        } catch (error) {
            console.error("Error in createCollectionEffect:", error);
        }
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
                // Directly update the mana display
                if (this.gameManager.ui) {
                    this.gameManager.ui.updateMana(this.stats.mana, this.stats.maxMana);
                }
            }
        }
    }
} 