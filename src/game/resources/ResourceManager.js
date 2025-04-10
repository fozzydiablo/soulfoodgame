import * as THREE from 'three';

export class ResourceManager {
    constructor(scene) {
        this.scene = scene;
        this.resources = [];
        this.resourceTypes = {
            // ammo resources have been removed - ammo is now unlimited
        };
        
        this.spawnInitialResources();
    }
    
    spawnInitialResources() {
        // No resources to spawn - ammo is now unlimited
    }
    
    spawnResource(type) {
        const config = this.resourceTypes[type];
        const resource = new Resource(this.scene, type, config);
        this.resources.push(resource);
    }
    
    update(delta) {
        this.resources.forEach(resource => resource.update(delta));
    }
    
    collectResource(resource, collector) {
        const index = this.resources.indexOf(resource);
        if (index !== -1) {
            this.resources.splice(index, 1);
            resource.collect();
            return resource.config.value;
        }
        return 0;
    }
}

class Resource {
    constructor(scene, type, config) {
        this.scene = scene;
        this.type = type;
        this.config = config;
        this.isCollected = false;
        this.respawnTimer = 0;
        this.isResource = true;
        
        // Create visual indicator
        this.indicator = null;
        
        this.createModel();
    }
    
    createModel() {
        // Create ammo box model
        const boxGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.4);
        const material = new THREE.MeshStandardMaterial({ 
            color: this.config.color,
            transparent: true,
            opacity: 0.8
        });
        this.mesh = new THREE.Mesh(boxGeometry, material);
        
        // Random position within bounds
        const x = (Math.random() - 0.5) * 18;
        const z = (Math.random() - 0.5) * 18;
        this.mesh.position.set(x, 0.5, z);
        
        // Store reference to this resource on the mesh
        this.mesh.userData = {
            resource: this,
            type: 'resource',
            resourceType: this.type
        };
        
        // Add a floating animation to make resources more visible
        this.initialY = this.mesh.position.y;
        this.animationOffset = Math.random() * Math.PI * 2; // Random start phase
        
        // Add a visual indicator around the resource
        this.createIndicator();
        
        this.scene.add(this.mesh);
    }
    
    createIndicator() {
        // Create a ring around the resource to indicate it's collectible
        const geometry = new THREE.RingGeometry(0.7, 0.8, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00FF00,  // Green for ammo
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        
        this.indicator = new THREE.Mesh(geometry, material);
        this.indicator.position.copy(this.mesh.position);
        this.indicator.position.y = 0.1; // Just above ground
        this.indicator.rotation.x = -Math.PI / 2; // Flat on ground
        
        this.scene.add(this.indicator);
    }
    
    update(delta) {
        if (this.isCollected) {
            this.respawnTimer += delta;
            if (this.respawnTimer >= this.config.respawnTime) {
                this.respawn();
            }
        } else if (this.mesh) {
            // Floating animation
            this.mesh.position.y = this.initialY + Math.sin(Date.now() * 0.002 + this.animationOffset) * 0.15;
            
            // Rotate slowly
            this.mesh.rotation.y += delta * 0.5;
            
            // Update indicator position
            if (this.indicator) {
                this.indicator.position.x = this.mesh.position.x;
                this.indicator.position.z = this.mesh.position.z;
                // Pulse animation for the indicator
                this.indicator.scale.set(
                    1 + Math.sin(Date.now() * 0.003) * 0.1,
                    1 + Math.sin(Date.now() * 0.003) * 0.1,
                    1
                );
            }
        }
    }
    
    collect() {
        this.isCollected = true;
        this.respawnTimer = 0;
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh = null;
        }
        if (this.indicator) {
            this.scene.remove(this.indicator);
            this.indicator = null;
        }
        return this.config.value;
    }
    
    respawn() {
        this.isCollected = false;
        this.createModel();
    }
    
    checkCollision(object) {
        if (!this.mesh) return false;
        const distance = this.mesh.position.distanceTo(object.mesh.position);
        return distance < 1.5;
    }
} 