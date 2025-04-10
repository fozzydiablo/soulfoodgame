import * as THREE from 'three';

export class Turret {
    constructor(scene, position, gameManager) {
        this.scene = scene;
        this.gameManager = gameManager;
        this.position = position.clone();
        
        // Turret stats
        this.stats = {
            fireRate: 2,           // Shots per second
            range: 12,             // Detection range
            ammo: 30,              // Total shots before disappearing
            damage: 1,             // Damage per shot
            rotationSpeed: 5       // How fast the turret can rotate to face enemies
        };
        
        this.lastFireTime = 0;
        this.targetEnemy = null;
        
        // Create the turret model
        this.createModel();
    }
    
    createModel() {
        // Create a group for the turret
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);
        
        // Base - cylinder
        const baseGeometry = new THREE.CylinderGeometry(0.8, 1, 0.3, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.7,
            roughness: 0.3
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.15;
        this.mesh.add(base);
        
        // Middle section - smaller cylinder
        const middleGeometry = new THREE.CylinderGeometry(0.5, 0.7, 0.4, 16);
        const middleMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            metalness: 0.6,
            roughness: 0.4
        });
        const middle = new THREE.Mesh(middleGeometry, middleMaterial);
        middle.position.y = 0.5;
        this.mesh.add(middle);
        
        // Rotating turret head
        this.turretHead = new THREE.Group();
        this.turretHead.position.y = 0.8;
        this.mesh.add(this.turretHead);
        
        // Turret body
        const headGeometry = new THREE.BoxGeometry(0.8, 0.4, 1);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.7,
            roughness: 0.2
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.z = 0.1;
        this.turretHead.add(head);
        
        // Turret barrel
        const barrelGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.8, 8);
        const barrelMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.8,
            roughness: 0.1
        });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = 0.7;
        this.gunBarrel = barrel;
        this.turretHead.add(barrel);
        
        // Add a light indicator on top that shows ammo status
        const indicatorGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const indicatorMaterial = new THREE.MeshStandardMaterial({
            color: 0x00FF00,
            emissive: 0x00FF00,
            emissiveIntensity: 0.5
        });
        this.indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        this.indicator.position.y = 1.1;
        this.mesh.add(this.indicator);
        
        // Add shadow casting
        this.mesh.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        this.scene.add(this.mesh);
        
        // Create a range indicator (visible when placing the turret)
        this.createRangeIndicator();
    }
    
    createRangeIndicator() {
        const geometry = new THREE.RingGeometry(this.stats.range - 0.1, this.stats.range, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00AAFF,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3,
            depthWrite: false
        });
        
        this.rangeIndicator = new THREE.Mesh(geometry, material);
        this.rangeIndicator.rotation.x = -Math.PI / 2; // Flat on ground
        this.rangeIndicator.position.y = 0.1;
        this.mesh.add(this.rangeIndicator);
        
        // Hide initially, only show when placing
        this.rangeIndicator.visible = false;
    }
    
    update(delta) {
        // Find nearest enemy if we don't have a target or our target is dead
        if (!this.targetEnemy || this.targetEnemy.isDead) {
            this.findNearestEnemy();
        }
        
        // If we have a target, rotate to face it and try to shoot
        if (this.targetEnemy && !this.targetEnemy.isDead) {
            this.trackTarget(delta);
            this.tryToShoot();
        }
        
        // Update indicator color based on ammo
        this.updateIndicator();
    }
    
    findNearestEnemy() {
        this.targetEnemy = null;
        let nearestDistance = Infinity;
        
        const enemies = this.gameManager.enemyManager.enemies;
        
        for (const enemy of enemies) {
            if (!enemy.isDead) {
                const distance = this.mesh.position.distanceTo(enemy.mesh.position);
                
                if (distance < this.stats.range && distance < nearestDistance) {
                    nearestDistance = distance;
                    this.targetEnemy = enemy;
                }
            }
        }
    }
    
    trackTarget(delta) {
        // Get direction to target
        const targetPosition = this.targetEnemy.mesh.position.clone();
        targetPosition.y = this.turretHead.position.y + this.mesh.position.y; // Keep at same height
        
        // Make turret head look at target
        this.turretHead.lookAt(targetPosition);
    }
    
    tryToShoot() {
        const now = Date.now();
        const fireInterval = 1000 / this.stats.fireRate;
        
        if (now - this.lastFireTime >= fireInterval && this.stats.ammo > 0) {
            this.shoot();
            this.lastFireTime = now;
            this.stats.ammo--;
            
            // Remove turret when out of ammo
            if (this.stats.ammo <= 0) {
                this.remove();
            }
        }
    }
    
    shoot() {
        // Get the gun barrel position in world space
        const barrelPosition = new THREE.Vector3();
        this.gunBarrel.getWorldPosition(barrelPosition);
        
        // Get firing direction - the barrel's forward is in the z direction
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(this.turretHead.quaternion);
        
        // Fire projectile from the turret
        const projectile = this.gameManager.projectileManager.firePlayerProjectile(barrelPosition, direction);
        
        // Play shooting effects
        this.playShootEffect();
    }
    
    playShootEffect() {
        // Muzzle flash - light up the barrel briefly
        this.gunBarrel.material.emissive = new THREE.Color(1, 0.5, 0);
        this.gunBarrel.material.emissiveIntensity = 1;
        
        // Reset after a short time
        setTimeout(() => {
            this.gunBarrel.material.emissive = new THREE.Color(0, 0, 0);
            this.gunBarrel.material.emissiveIntensity = 0;
        }, 50);
    }
    
    updateIndicator() {
        // Update color based on remaining ammo
        const ammoRatio = this.stats.ammo / 30; // 30 is the starting ammo
        
        if (ammoRatio > 0.6) {
            // Green when plenty of ammo
            this.indicator.material.color.set(0x00FF00);
            this.indicator.material.emissive.set(0x00FF00);
        } else if (ammoRatio > 0.3) {
            // Yellow when getting low
            this.indicator.material.color.set(0xFFFF00);
            this.indicator.material.emissive.set(0xFFFF00);
        } else {
            // Red when almost out
            this.indicator.material.color.set(0xFF0000);
            this.indicator.material.emissive.set(0xFF0000);
        }
    }
    
    showRangeIndicator() {
        if (this.rangeIndicator) {
            this.rangeIndicator.visible = true;
        }
    }
    
    hideRangeIndicator() {
        if (this.rangeIndicator) {
            this.rangeIndicator.visible = false;
        }
    }
    
    remove() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh = null;
        }
    }
} 