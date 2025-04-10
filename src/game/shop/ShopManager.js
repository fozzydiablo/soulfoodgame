import * as THREE from 'three';
import { ShopItem } from './ShopItem.js';
import { ShopUI } from './ShopUI.js';

export class ShopManager {
    constructor(scene, gameManager) {
        this.scene = scene;
        this.gameManager = gameManager;
        this.camera = gameManager.camera;
        this.isShopActive = false;
        this.interactionDistance = 5; // How close player needs to be to interact
        
        // Three shop buildings positions (in area B)
        this.shopPositions = [
            new THREE.Vector3(40, 0, -15),  // North area of area B (Items Shop)
            new THREE.Vector3(25, 0, -5),   // West area of area B (Consumables Shop)
            new THREE.Vector3(55, 0, -5)    // East area of area B (Abilities Shop)
        ];
        
        this.shopTypes = ['items', 'consumables', 'abilities'];
        this.currentShopType = null;
        this.shopBuildings = [];
        this.interactionZones = [];
        
        // Create shop buildings
        this.createShopBuildings();
        
        // Create shop UI (but don't show it yet)
        this.shopUI = new ShopUI(this.gameManager);
        
        // Define shop items by type
        this.shopInventory = {
            // Items Shop (permanent upgrades - add to inventory)
            items: [
                {
                    id: 'health_upgrade',
                    name: 'Health Amulet',
                    description: 'Increases max health by 1 when held in inventory',
                    price: 100,
                    icon: 'heart',
                    color: '#ff0000',
                    type: 'wearable', // Item type
                    rarity: 'uncommon', // Item rarity
                    consumable: false,
                    stats: { health: 1 }, // Stats to apply when held
                    addToInventory: true, // Flag to indicate this should be added to inventory
                    // No use function as stats are applied automatically when held
                },
                {
                    id: 'damage_upgrade',
                    name: 'Sharp Blade',
                    description: 'Increases weapon damage by 0.5 when held in inventory',
                    price: 150,
                    icon: 'sword',
                    color: '#ff6600',
                    type: 'wearable',
                    rarity: 'uncommon',
                    consumable: false,
                    stats: { damage: 0.5 },
                    addToInventory: true,
                    // No use function as stats are applied automatically when held
                },
                {
                    id: 'armor_upgrade',
                    name: 'Reinforced Plate',
                    description: 'Increases damage reduction by 5% when held in inventory',
                    price: 180,
                    icon: 'shield',
                    color: '#cccccc',
                    type: 'wearable',
                    rarity: 'uncommon',
                    consumable: false,
                    stats: { armor: 5 },
                    addToInventory: true,
                    // No use function as stats are applied automatically when held
                },
                {
                    id: 'speed_upgrade',
                    name: 'Swift Boots',
                    description: 'Increases movement speed by 0.5 when held in inventory',
                    price: 120,
                    icon: 'boots',
                    color: '#00ff00',
                    type: 'wearable',
                    rarity: 'uncommon',
                    consumable: false,
                    stats: { speed: 0.5 },
                    addToInventory: true,
                    // No use function as stats are applied automatically when held
                },
            ],
            
            // Consumables Shop
            consumables: [
                {
                    id: 'health_potion',
                    name: 'Health Potion',
                    description: 'Restores 2 health instantly',
                    price: 50,
                    icon: 'flask',
                    color: '#ff5555',
                    type: 'consumable',
                    rarity: 'common',
                    consumable: true,
                    addToInventory: true,
                    stats: { healing: 2 },
                    use: function(gameManager) {
                        const maxHealth = gameManager.gameState.maxHealth;
                        gameManager.gameState.health = Math.min(maxHealth, gameManager.gameState.health + 2);
                        gameManager.ui.updateHealth(gameManager.gameState.health, maxHealth);
                        gameManager.ui.showNotification("Used health potion!", 2000);
                        return true; // Item was used successfully
                    }
                },
                {
                    id: 'speed_boost',
                    name: 'Speed Elixir',
                    description: 'Temporarily increases speed by 1.0 for 30 seconds',
                    price: 80,
                    icon: 'bolt',
                    color: '#00ffff',
                    type: 'consumable',
                    rarity: 'uncommon',
                    consumable: true,
                    addToInventory: true,
                    use: function(gameManager) {
                        gameManager.hero.stats.speed += 1.0;
                        gameManager.ui.updatePlayerStats(gameManager.hero);
                        gameManager.ui.showNotification("Speed boosted for 30 seconds!", 2000);
                        
                        // Revert speed after 30 seconds
                        setTimeout(() => {
                            gameManager.hero.stats.speed -= 1.0;
                            gameManager.ui.updatePlayerStats(gameManager.hero);
                            gameManager.ui.showNotification("Speed boost worn off", 2000);
                        }, 30000);
                        return true;
                    }
                },
                {
                    id: 'strength_potion',
                    name: 'Strength Potion',
                    description: 'Temporarily increases damage by 1.0 for 30 seconds',
                    price: 100,
                    icon: 'fire',
                    color: '#ff9900',
                    type: 'consumable',
                    rarity: 'uncommon',
                    consumable: true,
                    addToInventory: true,
                    use: function(gameManager) {
                        gameManager.hero.stats.damage += 1.0;
                        gameManager.ui.updatePlayerStats(gameManager.hero);
                        gameManager.ui.showNotification("Strength boosted for 30 seconds!", 2000);
                        
                        // Revert strength after 30 seconds
                        setTimeout(() => {
                            gameManager.hero.stats.damage -= 1.0;
                            gameManager.ui.updatePlayerStats(gameManager.hero);
                            gameManager.ui.showNotification("Strength boost worn off", 2000);
                        }, 30000);
                        return true;
                    }
                },
                {
                    id: 'revival_token',
                    name: 'Revival Token',
                    description: 'Instantly revive once after death',
                    price: 200,
                    icon: 'star',
                    color: '#ffff00',
                    type: 'consumable',
                    rarity: 'rare',
                    consumable: true,
                    addToInventory: true,
                    use: function(gameManager) {
                        gameManager.gameState.hasRevivalToken = true;
                        gameManager.ui.showNotification("Revival token activated! Will revive you once after death.", 3000);
                        return true;
                    }
                }
            ],
            
            // Abilities Shop
            abilities: [
                {
                    id: 'attack_speed',
                    name: 'Attack Speed',
                    description: 'Increases attack speed by 0.5',
                    price: 140,
                    icon: 'bow',
                    color: '#ffff00',
                    type: 'ability',
                    rarity: 'uncommon',
                    consumable: false,
                    stats: { attackSpeed: 0.5 },
                    addToInventory: true
                },
                {
                    id: 'health_regen',
                    name: 'Health Regen',
                    description: 'Increases health regeneration by 0.05/s',
                    price: 130,
                    icon: 'heart-pulse',
                    color: '#ff9999',
                    type: 'ability',
                    rarity: 'uncommon',
                    consumable: false,
                    stats: { healthRegen: 0.05 },
                    addToInventory: true
                },
                {
                    id: 'deploy_turret',
                    name: 'Deploy Turret',
                    description: 'Place a turret at your location (Press T to use)',
                    price: 200,
                    icon: 'turret',
                    color: '#66cccc',
                    type: 'ability',
                    rarity: 'rare',
                    consumable: false,
                    addToInventory: true,
                    use: function(gameManager) {
                        // Check if player is in combat area (area A)
                        const playerPosition = gameManager.hero.mesh.position.clone();
                        
                        // Check if we're in a valid placement zone
                        if (gameManager.isBetweenWaves) {
                            gameManager.ui.showNotification("Can't deploy turret between waves!", 2000);
                            return false;
                        }
                        
                        // Deploy turret at player position
                        gameManager.turretManager.deployTurret(playerPosition.x, playerPosition.z);
                        gameManager.ui.showNotification("Turret deployed!", 2000);
                        return true;
                    }
                },
                {
                    id: 'dash',
                    name: 'Dash Ability',
                    description: 'Allows quick dash forward (Press Shift)',
                    price: 250,
                    icon: 'forward',
                    color: '#99ccff',
                    type: 'ability',
                    rarity: 'rare',
                    consumable: false,
                    addToInventory: true,
                    effect: () => {
                        this.gameManager.hero.abilities.dash = true;
                        this.gameManager.ui.showNotification("Dash ability unlocked! Press Shift to dash.", 3000);
                    }
                },
                {
                    id: 'area_attack',
                    name: 'Area Attack',
                    description: 'Enables area attack (Press Space)',
                    price: 300,
                    icon: 'burst',
                    color: '#ff66ff',
                    type: 'ability',
                    rarity: 'rare',
                    consumable: false,
                    addToInventory: true,
                    effect: () => {
                        this.gameManager.hero.abilities.areaAttack = true;
                        this.gameManager.ui.showNotification("Area attack unlocked! Press Space to attack all nearby enemies.", 3000);
                    }
                }
            ]
        };
        
        // Current shop items (will be set when entering a specific shop)
        this.shopItems = [];
        
        // Bind methods
        this.update = this.update.bind(this);
        this.toggleShop = this.toggleShop.bind(this);
        
        // Add E key listener for shop interaction
        window.addEventListener('keydown', (e) => {
            if (e.key === 'e' || e.key === 'E') {
                this.onEKeyPressed();
            }
        });
        
        // Create shop signs
        this.createShopSigns();
        
        // Create "Start Next Wave" button
        this.createNextWaveButton();
    }
    
    createShopBuildings() {
        // For each shop position, create a shop building
        this.shopPositions.forEach((position, index) => {
            // Shop building dimensions
            const width = 10;
            const height = 6;
            const depth = 8;
            
            // Create shop building materials
            const wallMaterial = this.createWallMaterial();
            const roofMaterial = new THREE.MeshStandardMaterial({ 
                color: this.getShopColor(index),
                roughness: 0.8,
                metalness: 0.2
            });
            
            // Create main building structure
            const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
            const shopBuilding = new THREE.Mesh(buildingGeometry, wallMaterial);
            shopBuilding.position.set(position.x, height / 2, position.z);
            shopBuilding.castShadow = true;
            shopBuilding.receiveShadow = true;
            this.scene.add(shopBuilding);
            this.shopBuildings.push(shopBuilding);
            
            // Create roof (pointed/triangular)
            const roofHeight = 3;
            const roofGeometry = new THREE.CylinderGeometry(0, width / 2, roofHeight, 4, 1);
            roofGeometry.rotateY(Math.PI / 4); // Rotate to align with building
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.set(position.x, height + roofHeight / 2, position.z);
            roof.castShadow = true;
            this.scene.add(roof);
            
            // Create door
            const doorWidth = 2;
            const doorHeight = 3;
            const doorGeometry = new THREE.PlaneGeometry(doorWidth, doorHeight);
            const doorMaterial = this.createDoorMaterial();
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(
                position.x, 
                doorHeight / 2, 
                position.z + depth / 2 + 0.05
            );
            door.castShadow = true;
            this.scene.add(door);
            
            // Create windows
            this.createWindow(position.x - width / 2 - 0.05, 2, position.z, 'left');
            this.createWindow(position.x + width / 2 + 0.05, 2, position.z, 'right');
            
            // Add interaction trigger zone
            const interactionZone = new THREE.Mesh(
                new THREE.SphereGeometry(this.interactionDistance),
                new THREE.MeshBasicMaterial({ 
                    color: 0x00ff00, 
                    transparent: true, 
                    opacity: 0.0 // Invisible
                })
            );
            interactionZone.position.set(
                position.x,
                this.interactionDistance / 2,
                position.z + depth / 2 + 2 // Outside the door
            );
            interactionZone.userData = { shopIndex: index, shopType: this.shopTypes[index] };
            this.scene.add(interactionZone);
            this.interactionZones.push(interactionZone);
        });
    }
    
    // Get color for each shop type
    getShopColor(shopIndex) {
        const colors = [
            0x884400,  // Brown for Items shop
            0x008844,  // Green for Consumables shop
            0x000088   // Blue for Abilities shop
        ];
        return colors[shopIndex];
    }
    
    createWallMaterial() {
        // Create a canvas for the stone wall texture
        const textureSize = 256;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const ctx = canvas.getContext('2d');
        
        // Base color for shop (different than walls)
        ctx.fillStyle = '#B08040'; // Tan/wood color
        ctx.fillRect(0, 0, textureSize, textureSize);
        
        // Add wood grain pattern
        ctx.fillStyle = '#805030';
        
        // Create wood plank pattern
        const plankWidth = 256;
        const plankHeight = 32;
        
        for (let y = 0; y < textureSize; y += plankHeight) {
            ctx.fillRect(0, y, textureSize, 2); // Horizontal plank dividers
            
            // Add some color variation to planks
            ctx.fillStyle = '#' + (Math.floor(Math.random() * 20) + 96).toString(16).padStart(2, '0') +
                            (Math.floor(Math.random() * 20) + 64).toString(16).padStart(2, '0') +
                            (Math.floor(Math.random() * 20) + 40).toString(16).padStart(2, '0');
            
            // Add wood grain lines
            for (let i = 0; i < 5; i++) {
                const grainY = y + Math.random() * plankHeight;
                ctx.beginPath();
                ctx.moveTo(0, grainY);
                ctx.bezierCurveTo(
                    textureSize/4, grainY + (Math.random() * 5 - 2.5),
                    textureSize/2, grainY + (Math.random() * 8 - 4),
                    textureSize, grainY + (Math.random() * 5 - 2.5)
                );
                ctx.lineWidth = 1 + Math.random();
                ctx.stroke();
            }
        }
        
        // Create the texture from the canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        
        // Create the material with the texture
        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.2
        });
    }
    
    createDoorMaterial() {
        const textureSize = 256;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const ctx = canvas.getContext('2d');
        
        // Door base color
        ctx.fillStyle = '#664422';
        ctx.fillRect(0, 0, textureSize, textureSize);
        
        // Door frame
        ctx.strokeStyle = '#442200';
        ctx.lineWidth = 16;
        ctx.strokeRect(16, 16, textureSize - 32, textureSize - 32);
        
        // Door panels
        ctx.fillStyle = '#553311';
        ctx.fillRect(40, 40, textureSize - 80, (textureSize - 120) / 2);
        ctx.fillRect(40, 40 + (textureSize - 80) / 2, textureSize - 80, (textureSize - 120) / 2);
        
        // Door handle
        ctx.fillStyle = '#DDAA00';
        ctx.beginPath();
        ctx.arc(textureSize - 60, textureSize / 2, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Create the texture from the canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create the material with the texture
        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.6,
            metalness: 0.3
        });
    }
    
    createWindow(x, y, z, side) {
        // Window dimensions
        const windowWidth = 1.5;
        const windowHeight = 2;
        
        // Create window geometry
        const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
        const windowMaterial = this.createWindowMaterial();
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        
        // Position window based on side
        if (side === 'left') {
            window.position.set(x, y, z);
            window.rotation.y = Math.PI / 2;
        } else if (side === 'right') {
            window.position.set(x, y, z);
            window.rotation.y = -Math.PI / 2;
        }
        
        window.castShadow = true;
        this.scene.add(window);
    }
    
    createWindowMaterial() {
        const textureSize = 128;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const ctx = canvas.getContext('2d');
        
        // Window base (glass)
        ctx.fillStyle = '#88CCFF';
        ctx.fillRect(0, 0, textureSize, textureSize);
        
        // Window frame
        ctx.strokeStyle = '#442200';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, textureSize - 10, textureSize - 10);
        
        // Window panes
        ctx.strokeStyle = '#442200';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(textureSize / 2, 0);
        ctx.lineTo(textureSize / 2, textureSize);
        ctx.moveTo(0, textureSize / 2);
        ctx.lineTo(textureSize, textureSize / 2);
        ctx.stroke();
        
        // Add some reflection/light effects
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(textureSize / 4, textureSize / 4, 20, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Create the texture from the canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create the material with the texture
        return new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9,
            roughness: 0.1,
            metalness: 0.1
        });
    }
    
    createShopSigns() {
        // For each shop position, create a shop sign
        this.shopPositions.forEach((position, index) => {
            // Create sign board
            const signWidth = 4;
            const signHeight = 1.5;
            const signGeometry = new THREE.BoxGeometry(signWidth, signHeight, 0.2);
            const signMaterial = this.createSignMaterial(index);
            const shopSign = new THREE.Mesh(signGeometry, signMaterial);
            
            // Position sign above the door
            shopSign.position.set(
                position.x,
                8, // Above the building
                position.z + 4 + 0.2 // Slightly in front of building
            );
            
            shopSign.castShadow = true;
            this.scene.add(shopSign);
            
            // Store reference to shop sign
            if (!this.shopSigns) {
                this.shopSigns = [];
            }
            this.shopSigns.push(shopSign);
        });
    }
    
    createSignMaterial(shopIndex) {
        const textureSize = 512;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize / 2; // Match the sign proportions
        const ctx = canvas.getContext('2d');
        
        // Sign background color varies by shop type
        const bgColors = ['#884400', '#008844', '#000088'];
        ctx.fillStyle = bgColors[shopIndex];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add border
        ctx.strokeStyle = '#DDAA00';
        ctx.lineWidth = 20;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Add text based on shop type
        const shopNames = ['ITEMS', 'CONSUMABLES', 'ABILITIES'];
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(shopNames[shopIndex], canvas.width / 2, canvas.height / 2);
        
        // Create the texture from the canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create the material with the texture
        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.6,
            metalness: 0.4
        });
    }
    
    createNextWaveButton() {
        // Create a flat text on the ground for "Start Next Wave"
        const textSize = 15; // Triple the size (from 5 to 15)
        
        // Create a canvas for the text texture - make it wider to fit text
        const canvas = document.createElement('canvas');
        canvas.width = 1600; // Double width for higher resolution
        canvas.height = 256; // Double height for higher resolution
        const ctx = canvas.getContext('2d');
        
        // Make canvas transparent (no background)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Add red text with appropriate spacing - triple font size
        ctx.fillStyle = '#FF0000'; // Red text
        ctx.font = 'bold 168px Arial'; // Tripled from 56px
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('START NEXT WAVE', canvas.width / 2, canvas.height / 2);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create plane geometry for the ground text - make it wider to match canvas aspect ratio
        const aspectRatio = canvas.width / canvas.height;
        const geometry = new THREE.PlaneGeometry(textSize, textSize / aspectRatio);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        // Create mesh and position on the ground
        this.nextWaveButton = new THREE.Mesh(geometry, material);
        this.nextWaveButton.position.set(40, 0.05, 10); // Position on the ground in area B
        this.nextWaveButton.rotation.x = -Math.PI / 2; // Rotate to lay flat on the ground
        
        // Add the text to the scene
        this.scene.add(this.nextWaveButton);
        
        // Update trigger zone to match new text dimensions
        this.nextWaveTriggerZone = new THREE.Mesh(
            new THREE.BoxGeometry(textSize, 2, textSize / aspectRatio), // Match the aspect ratio
            new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0.0 // Invisible
            })
        );
        this.nextWaveTriggerZone.position.set(40, 1, 10); // Above the text
        this.scene.add(this.nextWaveTriggerZone);
    }
    
    createNextWaveButtonMaterial() {
        // Not needed with the new implementation, but kept for compatibility
        return new THREE.MeshBasicMaterial({ visible: false });
    }
    
    update(delta) {
        // Animate shop signs
        if (this.shopSigns) {
            this.shopSigns.forEach(sign => {
                // Make signs always face the camera
                sign.lookAt(this.camera.position);
            });
        }
        
        // Handle visibility for the next wave button
        if (this.gameManager.isBetweenWaves) {
            // Make text visible between waves
            if (this.nextWaveButton && !this.nextWaveButton.visible) {
                this.nextWaveButton.visible = true;
                this.nextWaveTriggerZone.visible = true;
            }
        } else {
            // Hide text when not between waves
            if (this.nextWaveButton) {
                this.nextWaveButton.visible = false;
                this.nextWaveTriggerZone.visible = false;
            }
        }
        
        // Check if player has walked over the text
        if (this.gameManager.isBetweenWaves && this.nextWaveTriggerZone && this.nextWaveTriggerZone.visible) {
            const playerPosition = this.gameManager.hero.mesh.position;
            const triggerBox = new THREE.Box3().setFromObject(this.nextWaveTriggerZone);
            
            // Create a tiny box around the player's feet
            const playerBox = new THREE.Box3();
            playerBox.min.set(
                playerPosition.x - 0.5,
                playerPosition.y - 1.2, // Lower to catch the feet
                playerPosition.z - 0.5
            );
            playerBox.max.set(
                playerPosition.x + 0.5,
                playerPosition.y - 0.8,
                playerPosition.z + 0.5
            );
            
            // Check for intersection
            if (triggerBox.intersectsBox(playerBox)) {
                // Player walked over the text - start next wave
                console.log("Player walked over next wave text!");
                
                // Start the next wave
                this.startNextWave();
            }
        }
        
        // Check if player is near any of the shop interaction zones
        const playerPosition = this.gameManager.hero.mesh.position;
        let isNearShop = false;
        let nearestShopIndex = -1;
        let nearestShopDistance = Infinity;
        
        // Find the closest shop the player is near enough to interact with
        this.interactionZones.forEach((zone, index) => {
            const distanceToShop = playerPosition.distanceTo(zone.position);
            
            if (distanceToShop <= this.interactionDistance && distanceToShop < nearestShopDistance) {
                nearestShopDistance = distanceToShop;
                nearestShopIndex = index;
                isNearShop = true;
            }
        });
        
        // Show interaction prompt if player is near a shop
        if (isNearShop && nearestShopIndex !== -1) {
            const shopType = this.shopTypes[nearestShopIndex];
            
            if (!this.promptVisible) {
                this.gameManager.ui.showNotification(`Press E to enter ${shopType.toUpperCase()} shop`, 99999);
                this.promptVisible = true;
                this.currentNearShopIndex = nearestShopIndex;
            }
        } else {
            // Hide prompt if player moves away
            if (this.promptVisible) {
                // Remove any permanent notifications
                document.querySelectorAll('.game-notification').forEach(el => {
                    if (el.textContent.includes("Press E to")) {
                        document.body.removeChild(el);
                    }
                });
                this.promptVisible = false;
                this.currentNearShopIndex = -1;
            }
            
            // Auto-close shop if player moves too far away from all shops
            if (this.isShopActive) {
                let stillInRange = false;
                
                this.interactionZones.forEach(zone => {
                    const distanceToShop = playerPosition.distanceTo(zone.position);
                    if (distanceToShop <= this.interactionDistance * 1.5) {
                        stillInRange = true;
                    }
                });
                
                if (!stillInRange) {
                    this.toggleShop(false);
                }
            }
        }
    }
    
    checkNextWaveButtonClick() {
        // This function is no longer needed as we're now using collision detection
        // The functionality has been moved to update()
    }
    
    startNextWave() {
        // Start the next wave
        this.gameManager.startNextWave();
        
        // Show notification
        this.gameManager.ui.showNotification("Starting next wave! Returning to combat area.");
    }
    
    onEKeyPressed() {
        // Only respond if player is near any of the interaction zones
        const playerPosition = this.gameManager.hero.mesh.position;
        let nearestShopIndex = -1;
        let nearestShopDistance = Infinity;
        
        // Find the closest shop the player is near enough to interact with
        this.interactionZones.forEach((zone, index) => {
            const distanceToShop = playerPosition.distanceTo(zone.position);
            
            if (distanceToShop <= this.interactionDistance && distanceToShop < nearestShopDistance) {
                nearestShopDistance = distanceToShop;
                nearestShopIndex = index;
            }
        });
        
        if (nearestShopIndex !== -1) {
            // Set the current shop type and items
            this.currentShopType = this.shopTypes[nearestShopIndex];
            this.shopItems = this.shopInventory[this.currentShopType];
            
            // Toggle shop UI
            this.toggleShop(!this.isShopActive);
        }
    }
    
    toggleShop(active) {
        this.isShopActive = active;
        
        if (active && this.currentShopType) {
            // Display shop UI with appropriate title and items
            this.shopUI.show(this.shopItems, this.currentShopType.toUpperCase());
            
            // Pause game while shopping (optional)
            // this.gameManager.pauseGame();
        } else {
            // Hide shop UI
            this.shopUI.hide();
            
            // Resume game after shopping (optional)
            // this.gameManager.resumeGame();
        }
    }
    
    purchaseItem(itemId) {
        // Find the item
        const item = this.shopItems.find(item => item.id === itemId);
        
        if (!item) {
            console.error(`Item ${itemId} not found in shop inventory`);
            return false;
        }
        
        // Check if player has enough gold
        if (this.gameManager.gameState.resources.gold >= item.price) {
            // Deduct gold
            this.gameManager.gameState.resources.gold -= item.price;
            
            // Update UI
            this.gameManager.ui.updateGold(this.gameManager.gameState.resources.gold);
            
            // For items that should be added to inventory
            if (item.addToInventory) {
                // Item is ready to be added to inventory directly
                if (this.gameManager.inventory.addItem(item)) {
                    // Show purchase notification
                    this.gameManager.ui.showNotification(`Purchased: ${item.name} (Added to inventory)`, 2000);
                    return true;
                } else {
                    // Inventory is full, refund gold
                    this.gameManager.gameState.resources.gold += item.price;
                    this.gameManager.ui.updateGold(this.gameManager.gameState.resources.gold);
                    return false;
                }
            } else {
                // Apply the item effect directly (for items without addToInventory flag)
                item.effect();
                
                // Show purchase notification
                this.gameManager.ui.showNotification(`Purchased: ${item.name}`, 2000);
                return true;
            }
        } else {
            // Show not enough gold notification
            this.gameManager.ui.showNotification("Not enough gold!", 2000);
            return false;
        }
    }
} 