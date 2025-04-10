import * as THREE from 'three';

export class BuildingManager {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.boundaryWalls = []; // Separate array to track boundary walls for collision
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
        
        // Create boundary walls automatically
        this.createBoundaryWalls();
        // Create boundary walls for the second game area
        this.createSecondAreaBoundaryWalls();
    }
    
    update(delta) {
        this.buildings.forEach(building => building.update(delta));
    }
    
    // Check if a position collides with any boundary wall
    checkWallCollision(position, radius = 1.0) {
        for (const wall of this.boundaryWalls) {
            // Get wall dimensions and position
            const size = wall.geometry.parameters;
            const wallPos = wall.position.clone();
            
            // Calculate the closest point on the wall box to the position
            const closest = new THREE.Vector3().copy(position);
            
            // Clamp position to the box boundaries
            closest.x = Math.max(wallPos.x - size.width / 2, Math.min(wallPos.x + size.width / 2, closest.x));
            closest.y = Math.max(wallPos.y - size.height / 2, Math.min(wallPos.y + size.height / 2, closest.y));
            closest.z = Math.max(wallPos.z - size.depth / 2, Math.min(wallPos.z + size.depth / 2, closest.z));
            
            // Calculate distance from closest point to position
            const distance = position.distanceTo(closest);
            
            // If distance is less than character radius, there's a collision
            if (distance < radius) {
                return true;
            }
        }
        
        return false;
    }
    
    // Get the corrected position to prevent wall penetration
    getValidPosition(currentPosition, targetPosition, radius = 1.0) {
        // If there's no collision, return the target position
        if (!this.checkWallCollision(targetPosition, radius)) {
            return targetPosition;
        }
        
        // If trying to move would cause a collision, return the current position
        return currentPosition;
    }
    
    createBoundaryWalls() {
        // The ground size from main.js is 40x40
        const mapSize = 40;
        const wallHeight = 4;
        const wallThickness = 1;
        const halfSize = mapSize / 2;
        
        // Create the wall material with texture
        const wallMaterial = this.createWallMaterial();
        
        // Create north wall (negative Z)
        this.createWallSection(
            new THREE.Vector3(0, wallHeight / 2, -halfSize), 
            new THREE.Vector3(mapSize, wallHeight, wallThickness),
            wallMaterial,
            'north'
        );
        
        // Create south wall (positive Z) - no longer has a gate
        this.createWallSection(
            new THREE.Vector3(0, wallHeight / 2, halfSize), 
            new THREE.Vector3(mapSize, wallHeight, wallThickness),
            wallMaterial,
            'south'
        );
        
        // Create east wall (positive X)
        this.createWallSection(
            new THREE.Vector3(halfSize, wallHeight / 2, 0), 
            new THREE.Vector3(wallThickness, wallHeight, mapSize),
            wallMaterial,
            'east'
        );
        
        // Create west wall (negative X)
        this.createWallSection(
            new THREE.Vector3(-halfSize, wallHeight / 2, 0), 
            new THREE.Vector3(wallThickness, wallHeight, mapSize),
            wallMaterial,
            'west'
        );
        
        // Add corner towers for aesthetics
        this.createCornerTower(new THREE.Vector3(-halfSize, 0, -halfSize), wallMaterial);
        this.createCornerTower(new THREE.Vector3(halfSize, 0, -halfSize), wallMaterial);
        this.createCornerTower(new THREE.Vector3(halfSize, 0, halfSize), wallMaterial);
        this.createCornerTower(new THREE.Vector3(-halfSize, 0, halfSize), wallMaterial);
    }
    
    createSecondAreaBoundaryWalls() {
        // The ground size from main.js is 40x40
        const mapSize = 40;
        const wallHeight = 4;
        const wallThickness = 1;
        const halfSize = mapSize / 2;
        
        // Offset for the second area (positioned to the right of original)
        const offsetX = mapSize;
        
        // Create the wall material with texture
        const wallMaterial = this.createWallMaterial();
        
        // Create north wall (negative Z)
        this.createWallSection(
            new THREE.Vector3(offsetX, wallHeight / 2, -halfSize), 
            new THREE.Vector3(mapSize, wallHeight, wallThickness),
            wallMaterial,
            'north'
        );
        
        // Create south wall (positive Z)
        this.createWallSection(
            new THREE.Vector3(offsetX, wallHeight / 2, halfSize), 
            new THREE.Vector3(mapSize, wallHeight, wallThickness),
            wallMaterial,
            'south'
        );
        
        // Create east wall (positive X)
        this.createWallSection(
            new THREE.Vector3(offsetX + halfSize, wallHeight / 2, 0), 
            new THREE.Vector3(wallThickness, wallHeight, mapSize),
            wallMaterial,
            'east'
        );
        
        // Create west wall (negative X)
        // Note: Since this is the shared wall with the original area, we could skip this
        // But we'll create it for completeness (might be slightly overlapping)
        this.createWallSection(
            new THREE.Vector3(offsetX - halfSize, wallHeight / 2, 0), 
            new THREE.Vector3(wallThickness, wallHeight, mapSize),
            wallMaterial,
            'west'
        );
        
        // Add corner towers for aesthetics
        this.createCornerTower(new THREE.Vector3(offsetX - halfSize, 0, -halfSize), wallMaterial);
        this.createCornerTower(new THREE.Vector3(offsetX + halfSize, 0, -halfSize), wallMaterial);
        this.createCornerTower(new THREE.Vector3(offsetX + halfSize, 0, halfSize), wallMaterial);
        this.createCornerTower(new THREE.Vector3(offsetX - halfSize, 0, halfSize), wallMaterial);
    }
    
    createWallMaterial() {
        // Create a canvas for the stone wall texture
        const textureSize = 256;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const ctx = canvas.getContext('2d');
        
        // Base color
        ctx.fillStyle = '#777777';
        ctx.fillRect(0, 0, textureSize, textureSize);
        
        // Add stone pattern
        ctx.fillStyle = '#555555';
        
        // Create brick pattern
        const brickWidth = 32;
        const brickHeight = 16;
        let offsetX = 0;
        
        for (let y = 0; y < textureSize; y += brickHeight) {
            offsetX = (Math.floor(y / brickHeight) % 2) * (brickWidth / 2);
            
            for (let x = 0; x < textureSize; x += brickWidth) {
                // Stone brick
                ctx.fillRect(
                    x + offsetX, 
                    y, 
                    brickWidth - 2, 
                    brickHeight - 2
                );
                
                // Add some color variation to bricks
                ctx.fillStyle = '#' + (Math.floor(Math.random() * 20) + 70).toString(16).padStart(2, '0') +
                                (Math.floor(Math.random() * 20) + 70).toString(16).padStart(2, '0') +
                                (Math.floor(Math.random() * 20) + 70).toString(16).padStart(2, '0');
            }
        }
        
        // Create the texture from the canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 2);
        
        // Create the material with the texture
        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.2
        });
    }
    
    createWallSection(position, size, material, direction) {
        // Create the main wall section
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const wall = new THREE.Mesh(geometry, material);
        wall.position.copy(position);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.scene.add(wall);
        
        // Store wall in boundaryWalls array for collision detection
        this.boundaryWalls.push(wall);
        
        // Create battlement on top (crenellations)
        this.createBattlements(position, size, material, direction);
        
        // Add to buildings array but with a special type
        const wallBuilding = new Building(
            this.scene, 
            'boundaryWall', 
            {
                health: 1000, // Very sturdy boundary walls
                maxHealth: 1000,
                damage: 0,
                range: 0,
                attackSpeed: 0
            }, 
            position
        );
        
        // Override the default mesh with our custom wall
        this.scene.remove(wallBuilding.mesh);
        wallBuilding.mesh = wall;
        
        this.buildings.push(wallBuilding);
    }
    
    createBattlements(position, size, material, direction) {
        const battlementHeight = 1;
        const battlementDepth = 0.5;
        const spacing = 2;
        
        // Determine the orientation of the battlements based on wall direction
        let segmentSize, segments, startPosition, increment;
        if (direction === 'north' || direction === 'south') {
            segmentSize = new THREE.Vector3(1.5, battlementHeight, battlementDepth);
            segments = Math.floor(size.x / spacing);
            startPosition = new THREE.Vector3(
                position.x - size.x / 2 + spacing / 2,
                position.y + size.y / 2 + battlementHeight / 2,
                position.z + (direction === 'north' ? battlementDepth / 2 : -battlementDepth / 2)
            );
            increment = new THREE.Vector3(spacing, 0, 0);
        } else {
            segmentSize = new THREE.Vector3(battlementDepth, battlementHeight, 1.5);
            segments = Math.floor(size.z / spacing);
            startPosition = new THREE.Vector3(
                position.x + (direction === 'west' ? battlementDepth / 2 : -battlementDepth / 2),
                position.y + size.y / 2 + battlementHeight / 2,
                position.z - size.z / 2 + spacing / 2
            );
            increment = new THREE.Vector3(0, 0, spacing);
        }
        
        const battlementGeometry = new THREE.BoxGeometry(
            segmentSize.x, segmentSize.y, segmentSize.z
        );
        
        for (let i = 0; i < segments; i++) {
            const battlementPosition = startPosition.clone();
            battlementPosition.x += increment.x * i;
            battlementPosition.z += increment.z * i;
            
            const battlement = new THREE.Mesh(battlementGeometry, material);
            battlement.position.copy(battlementPosition);
            battlement.castShadow = true;
            battlement.receiveShadow = true;
            this.scene.add(battlement);
            
            // Add battlement to collision array
            this.boundaryWalls.push(battlement);
        }
    }
    
    createCornerTower(position, material) {
        const towerRadius = 2;
        const towerHeight = 6;
        
        // Create tower body
        const towerGeometry = new THREE.CylinderGeometry(towerRadius, towerRadius, towerHeight, 16);
        const tower = new THREE.Mesh(towerGeometry, material);
        tower.position.set(position.x, towerHeight / 2, position.z);
        tower.castShadow = true;
        tower.receiveShadow = true;
        this.scene.add(tower);
        
        // Add tower to collision array - use a box approx for cylinder
        const towerBox = new THREE.Mesh(
            new THREE.BoxGeometry(towerRadius * 2, towerHeight, towerRadius * 2),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        towerBox.position.copy(tower.position);
        this.boundaryWalls.push(towerBox);
        
        // Create tower roof
        const roofGeometry = new THREE.ConeGeometry(towerRadius + 0.5, 2, 16);
        const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(position.x, towerHeight + 1, position.z);
        roof.castShadow = true;
        roof.receiveShadow = true;
        this.scene.add(roof);
        
        // Add to buildings array
        const towerBuilding = new Building(
            this.scene, 
            'boundaryTower', 
            {
                health: 1500, // Even sturdier tower
                maxHealth: 1500,
                damage: 0,
                range: 0,
                attackSpeed: 0
            }, 
            new THREE.Vector3(position.x, towerHeight / 2, position.z)
        );
        
        // Override the default mesh with our custom tower
        this.scene.remove(towerBuilding.mesh);
        towerBuilding.mesh = tower;
        
        this.buildings.push(towerBuilding);
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