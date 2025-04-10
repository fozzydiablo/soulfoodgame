import * as THREE from 'three';
import { ShopItem } from './ShopItem.js';

export class ShopManager {
    constructor(scene, gameManager) {
        this.scene = scene;
        this.camera = gameManager.camera;
        this.gameManager = gameManager;
        this.items = [];
        this.isShopActive = true; // Shop is always active
        this.mouse = new THREE.Vector2();
        
        // Shop location (now in area B)
        this.shopCenterPosition = new THREE.Vector3(40, 0, 0); // Position at the center of area B
        
        // Bind methods
        this.update = this.update.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);
        
        // Add event listeners
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('click', this.onClick);
        
        // Create shop background
        this.createBackground();
        
        // Create helper text for the next wave button
        this.createNextWaveHelperText();
        
        // Don't initialize shop items immediately - wait until gameState is ready
        // We'll initialize them on the first update call instead
    }
    
    createBackground() {
        // Create a semi-transparent plane behind the shop items
        const geometry = new THREE.PlaneGeometry(20, 10);
        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        
        this.background = new THREE.Mesh(geometry, material);
        this.background.position.set(this.shopCenterPosition.x, 5, this.shopCenterPosition.z - 10);
        this.background.visible = false; // Initially hidden until first update
        this.scene.add(this.background);
        
        // Create shop title
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        context.fillStyle = '#222222';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.strokeStyle = '#ffcc00';
        context.lineWidth = 8;
        context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        context.font = 'bold 72px Arial';
        context.fillStyle = '#ffcc00';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('SHOP', canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const titleMaterial = new THREE.SpriteMaterial({ map: texture });
        this.titleSprite = new THREE.Sprite(titleMaterial);
        this.titleSprite.position.set(this.shopCenterPosition.x, 8, this.shopCenterPosition.z - 9.5);
        this.titleSprite.scale.set(4, 1, 1);
        this.titleSprite.visible = false; // Initially hidden until first update
        this.scene.add(this.titleSprite);
        
        // Create "next wave" button
        const nextWaveCanvas = document.createElement('canvas');
        const nextWaveContext = nextWaveCanvas.getContext('2d');
        nextWaveCanvas.width = 512;
        nextWaveCanvas.height = 128;
        
        // Create background with gradient
        const gradient = nextWaveContext.createLinearGradient(0, 0, 0, nextWaveCanvas.height);
        gradient.addColorStop(0, '#007700');
        gradient.addColorStop(1, '#005500');
        nextWaveContext.fillStyle = gradient;
        nextWaveContext.fillRect(0, 0, nextWaveCanvas.width, nextWaveCanvas.height);
        
        // Add glowing border
        nextWaveContext.strokeStyle = '#00ff00';
        nextWaveContext.lineWidth = 6;
        nextWaveContext.shadowColor = '#00ff00';
        nextWaveContext.shadowBlur = 15;
        nextWaveContext.shadowOffsetX = 0;
        nextWaveContext.shadowOffsetY = 0;
        nextWaveContext.strokeRect(6, 6, nextWaveCanvas.width - 12, nextWaveCanvas.height - 12);
        
        // Add inner border for depth
        nextWaveContext.strokeStyle = '#ffffff';
        nextWaveContext.lineWidth = 2;
        nextWaveContext.shadowBlur = 0;
        nextWaveContext.strokeRect(12, 12, nextWaveCanvas.width - 24, nextWaveCanvas.height - 24);
        
        // Add text with shadow for better visibility
        nextWaveContext.font = 'bold 48px Arial';
        nextWaveContext.fillStyle = '#ffffff';
        nextWaveContext.shadowColor = '#000000';
        nextWaveContext.shadowBlur = 8;
        nextWaveContext.shadowOffsetX = 2;
        nextWaveContext.shadowOffsetY = 2;
        nextWaveContext.textAlign = 'center';
        nextWaveContext.textBaseline = 'middle';
        nextWaveContext.fillText('START NEXT WAVE', nextWaveCanvas.width / 2, nextWaveCanvas.height / 2);
        
        const nextWaveTexture = new THREE.CanvasTexture(nextWaveCanvas);
        const nextWaveMaterial = new THREE.SpriteMaterial({ map: nextWaveTexture });
        this.nextWaveButton = new THREE.Sprite(nextWaveMaterial);
        
        // Position it more prominently - centered and elevated for better visibility
        this.nextWaveButton.position.set(this.shopCenterPosition.x, 3, this.shopCenterPosition.z - 6);
        this.nextWaveButton.scale.set(5, 1.5, 1); // Make it larger
        this.nextWaveButton.visible = false; // Initially hidden until first update
        this.scene.add(this.nextWaveButton);
        
        // Create animation for the next wave button to make it more noticeable
        this.nextWaveButtonAnimation = () => {
            if (this.nextWaveButton && this.nextWaveButton.visible) {
                // Make it pulse more dramatically
                const time = Date.now() * 0.003;
                const scale = 1 + Math.sin(time) * 0.1; // Increased pulsing
                const baseScaleX = 5;
                const baseScaleY = 1.5;
                
                this.nextWaveButton.scale.set(baseScaleX * scale, baseScaleY * scale, 1);
                
                // Add a slight floating motion
                this.nextWaveButton.position.y = 3 + Math.sin(time * 0.7) * 0.2;
                
                // Request next frame if button is still visible
                requestAnimationFrame(this.nextWaveButtonAnimation);
            }
        };
    }
    
    createNextWaveHelperText() {
        // Create a canvas for the helper text
        const helperCanvas = document.createElement('canvas');
        const helperContext = helperCanvas.getContext('2d');
        helperCanvas.width = 512;
        helperCanvas.height = 64;
        
        // Fill with semi-transparent black background
        helperContext.fillStyle = 'rgba(0, 0, 0, 0.7)';
        helperContext.fillRect(0, 0, helperCanvas.width, helperCanvas.height);
        
        // Add subtle border
        helperContext.strokeStyle = '#ffcc00';
        helperContext.lineWidth = 2;
        helperContext.strokeRect(4, 4, helperCanvas.width - 8, helperCanvas.height - 8);
        
        // Add instructional text
        helperContext.font = 'bold 24px Arial';
        helperContext.fillStyle = '#ffffff';
        helperContext.textAlign = 'center';
        helperContext.textBaseline = 'middle';
        helperContext.fillText('Click this button to start the next wave!', helperCanvas.width / 2, helperCanvas.height / 2);
        
        // Create texture and sprite
        const helperTexture = new THREE.CanvasTexture(helperCanvas);
        const helperMaterial = new THREE.SpriteMaterial({ map: helperTexture });
        this.helperText = new THREE.Sprite(helperMaterial);
        
        // Position it above the next wave button
        this.helperText.position.set(this.shopCenterPosition.x, 5, this.shopCenterPosition.z - 6);
        this.helperText.scale.set(4, 0.8, 1);
        this.helperText.visible = false; // Initially hidden
        this.scene.add(this.helperText);
    }
    
    startNextWave() {
        // Refresh shop items when starting a new wave
        this.refreshShopItems();
        
        // Reset the between-waves flag
        this.gameManager.gameState.isBetweenWaves = false;
        
        // Start the next wave
        this.gameManager.startNextWave();
        
        // Transport player back to Area A (combat area)
        this.gameManager.hero.mesh.position.set(0, this.gameManager.hero.mesh.position.y, 0);
        
        // Show notification to player
        if (this.gameManager.ui) {
            this.gameManager.ui.showNotification("Starting next wave! Returning to combat area.");
        }
    }
    
    refreshShopItems() {
        // Clean up existing items
        this.cleanupItems();
        
        // Create new items
        this.createShopItems();
        
        // Flag that we just completed a wave (used to prevent duplicate notifications)
        this.justCompletedWave = true;
        
        // Make sure shop UI elements are visible
        this.background.visible = true;
        this.titleSprite.visible = true;
        this.nextWaveButton.visible = true;
        this.helperText.visible = true;
        
        // Start the next wave button animation
        requestAnimationFrame(this.nextWaveButtonAnimation);
    }
    
    createShopItems() {
        // Clean up existing items first
        this.cleanupItems();
        
        // Calculate positions in a circle
        const numDisplayedItems = 6; // Only display 6 items at a time
        const radius = 8; // Increased radius for more items
        const centerY = 1.5; // Height of the items
        
        const positions = [];
        for (let i = 0; i < numDisplayedItems; i++) {
            // Calculate position on the circle
            const angle = (i / numDisplayedItems) * Math.PI * 2;
            const x = Math.cos(angle) * radius + this.shopCenterPosition.x;
            const z = Math.sin(angle) * radius + this.shopCenterPosition.z;
            
            positions.push(new THREE.Vector3(x, centerY, z));
        }
        
        // All possible item types - we'll randomly select 6 from this list
        const allItemTypes = [
            'health',
            'speed',
            'ammo',
            'turretAmmo',
            'turretCooldown',
            'damage',
            'armor',
            'evasion',
            'mana',
            'healthRegen',
            'manaRegen',
            'attackSpeed',
            'jumpHeight',
            'collection'  // Added collection upgrade
        ];
        
        // Shuffle array and take first 6 items
        const shuffledItems = this.shuffleArray([...allItemTypes]);
        const selectedItemTypes = shuffledItems.slice(0, numDisplayedItems);
        
        // Item prices - increase with wave number
        const basePrice = 50;
        const waveMultiplier = 0.5;
        
        // Create shop items
        for (let i = 0; i < numDisplayedItems; i++) {
            const itemType = selectedItemTypes[i];
            
            // Calculate price - more powerful items cost more, and price increases with wave number
            let priceMultiplier = 1;
            switch(itemType) {
                case 'health':
                    priceMultiplier = 1.5;
                    break;
                case 'speed':
                    priceMultiplier = 1.2;
                    break;
                case 'damage':
                    priceMultiplier = 1.8;
                    break;
                case 'armor':
                    priceMultiplier = 2;
                    break;
                case 'evasion':
                    priceMultiplier = 1.5;
                    break;
                case 'attackSpeed':
                    priceMultiplier = 1.8;
                    break;
                default:
                    priceMultiplier = 1;
            }
            
            // Get the current wave number safely, default to 1 if not available
            const currentWave = this.gameManager.gameState && this.gameManager.gameState.wave 
                ? this.gameManager.gameState.wave 
                : 1;
            
            // Final price calculation
            const price = Math.floor(basePrice * priceMultiplier * (1 + (currentWave - 1) * waveMultiplier));
            
            // Create shop item
            const shopItem = new ShopItem(
                this.scene,
                positions[i],
                itemType,
                price,
                this.gameManager
            );
            
            this.items.push(shopItem);
        }
    }
    
    // Helper method to shuffle array
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }
    
    cleanupItems() {
        // Remove all shop items
        this.items.forEach(item => {
            item.cleanup();
        });
        
        // Clear items array
        this.items = [];
    }
    
    update(delta) {
        // Check if player is near the shop area
        const playerNearShop = this.gameManager.hero.mesh.position.distanceTo(this.shopCenterPosition) < 15;
        
        // If player is near shop, make shop visible and active
        if (playerNearShop) {
            // Show shop UI elements if not already visible
            if (!this.background.visible) {
                this.background.visible = true;
                this.titleSprite.visible = true;
                this.nextWaveButton.visible = true;
                this.helperText.visible = true;
                
                // Start the next wave button animation
                requestAnimationFrame(this.nextWaveButtonAnimation);
                
                // Only show welcome message if player wasn't transported here by wave completion
                if (this.gameManager.ui && !this.justCompletedWave) {
                    this.gameManager.ui.showNotification("Welcome to the shop! Browse upgrades.");
                }
                this.justCompletedWave = false;
            }
            
            // Initialize shop items if they haven't been created yet and gameState is ready
            if (this.items.length === 0 && this.gameManager.gameState) {
                this.createShopItems();
            }
            
            // Update each shop item
            for (let i = 0; i < this.items.length; i++) {
                this.items[i].update(this.camera, this.mouse);
            }
        } else {
            // Hide shop UI elements if player is not near and they're visible
            if (this.background.visible) {
                this.background.visible = false;
                this.titleSprite.visible = false;
                this.nextWaveButton.visible = false;
                this.helperText.visible = false;
            }
        }
    }
    
    onMouseMove(event) {
        // Update mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    onClick(event) {
        // Only handle clicks if shop UI is visible (player is near shop)
        if (!this.background.visible) return;
        
        // Create raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check if next wave button is clicked
        const nextWaveIntersects = raycaster.intersectObject(this.nextWaveButton);
        if (nextWaveIntersects.length > 0) {
            this.startNextWave();
            return;
        }
        
        // Check if any shop item is clicked
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].checkClick(raycaster)) {
                // This item was clicked, no need to check others
                return;
            }
        }
    }
} 