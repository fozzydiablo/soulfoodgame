import * as THREE from 'three';

export class BuildingManager {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.buildingTypes = {
            tower: {
                cost: { gold: 50, wood: 20 },
                health: 200,
                damage: 15,
                range: 8,
                attackSpeed: 1
            },
            wall: {
                cost: { gold: 20, wood: 30 },
                health: 300,
                damage: 0,
                range: 0,
                attackSpeed: 0
            }
        };
    }
    
    update(delta) {
        this.buildings.forEach(building => building.update(delta));
    }
    
    canBuild(type, position, resources) {
        const config = this.buildingTypes[type];
        if (!config) return false;
        
        // Check if we have enough resources
        for (const [resource, cost] of Object.entries(config.cost)) {
            if (resources[resource] < cost) return false;
        }
        
        // Check if position is valid (not too close to other buildings)
        for (const building of this.buildings) {
            if (building.mesh.position.distanceTo(position) < 3) {
                return false;
            }
        }
        
        return true;
    }
    
    build(type, position, resources) {
        if (!this.canBuild(type, position, resources)) return false;
        
        const config = this.buildingTypes[type];
        const building = new Building(this.scene, type, config, position);
        this.buildings.push(building);
        
        // Deduct resources
        for (const [resource, cost] of Object.entries(config.cost)) {
            resources[resource] -= cost;
        }
        
        return true;
    }
}

class Building {
    constructor(scene, type, config, position) {
        this.scene = scene;
        this.type = type;
        this.config = config;
        this.stats = {
            health: config.health,
            maxHealth: config.health,
            damage: config.damage,
            range: config.range,
            attackSpeed: config.attackSpeed
        };
        
        this.createModel(position);
        
        this.lastAttackTime = 0;
        this.target = null;
    }
    
    createModel(position) {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({ 
            color: this.type === 'tower' ? 0x808080 : 0x8b4513 
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.position.y = 1;
        this.scene.add(this.mesh);
    }
    
    update(delta) {
        if (this.type === 'tower') {
            this.updateCombat(delta);
        }
    }
    
    updateCombat(delta) {
        if (this.target && this.canAttack()) {
            this.attack(this.target);
        }
    }
    
    canAttack() {
        const now = Date.now();
        return now - this.lastAttackTime >= 1000 / this.stats.attackSpeed;
    }
    
    attack(target) {
        this.lastAttackTime = Date.now();
        target.takeDamage(this.stats.damage);
    }
    
    takeDamage(amount) {
        this.stats.health -= amount;
        if (this.stats.health <= 0) {
            this.destroy();
        }
    }
    
    destroy() {
        this.scene.remove(this.mesh);
    }
    
    checkCollision(object) {
        const distance = this.mesh.position.distanceTo(object.mesh.position);
        return distance < 2;
    }
} 