import * as THREE from 'three';
import { ShopItem } from './ShopItem.js';

export class ShopManager {
    constructor(scene, gameManager) {
        this.scene = scene;
        this.camera = gameManager.camera;
        this.gameManager = gameManager;
        this.items = [];
        this.isShopActive = false;
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
        this.background.visible = false;
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
        this.titleSprite.visible = false;
        this.scene.add(this.titleSprite);
        
        // Create close button
        const closeCanvas = document.createElement('canvas');
        const closeContext = closeCanvas.getContext('2d');
        closeCanvas.width = 128;
        closeCanvas.height = 128;
        
        closeContext.fillStyle = '#aa0000';
        closeContext.fillRect(0, 0, closeCanvas.width, closeCanvas.height);
        
        closeContext.font = 'bold 96px Arial';
        closeContext.fillStyle = '#ffffff';
        closeContext.textAlign = 'center';
        closeContext.textBaseline = 'middle';
        closeContext.fillText('X', closeCanvas.width / 2, closeCanvas.height / 2);
        
        const closeTexture = new THREE.CanvasTexture(closeCanvas);
        const closeMaterial = new THREE.SpriteMaterial({ map: closeTexture });
        this.closeButton = new THREE.Sprite(closeMaterial);
        this.closeButton.position.set(this.shopCenterPosition.x + 9, 8, this.shopCenterPosition.z - 9);
        this.closeButton.scale.set(0.8, 0.8, 1);
        this.closeButton.visible = false;
        this.scene.add(this.closeButton);
        
        // Create "continue" button
        const continueCanvas = document.createElement('canvas');
        const continueContext = continueCanvas.getContext('2d');
        continueCanvas.width = 512;
        continueCanvas.height = 128;
        
        // Create background with gradient
        const gradient = continueContext.createLinearGradient(0, 0, 0, continueCanvas.height);
        gradient.addColorStop(0, '#007700');
        gradient.addColorStop(1, '#005500');
        continueContext.fillStyle = gradient;
        continueContext.fillRect(0, 0, continueCanvas.width, continueCanvas.height);
        
        // Add glowing border
        continueContext.strokeStyle = '#00ff00';
        continueContext.lineWidth = 6;
        continueContext.shadowColor = '#00ff00';
        continueContext.shadowBlur = 15;
        continueContext.shadowOffsetX = 0;
        continueContext.shadowOffsetY = 0;
        continueContext.strokeRect(6, 6, continueCanvas.width - 12, continueCanvas.height - 12);
        
        // Add inner border for depth
        continueContext.strokeStyle = '#ffffff';
        continueContext.lineWidth = 2;
        continueContext.shadowBlur = 0;
        continueContext.strokeRect(12, 12, continueCanvas.width - 24, continueCanvas.height - 24);
        
        // Add text with shadow for better visibility
        continueContext.font = 'bold 48px Arial';
        continueContext.fillStyle = '#ffffff';
        continueContext.shadowColor = '#000000';
        continueContext.shadowBlur = 8;
        continueContext.shadowOffsetX = 2;
        continueContext.shadowOffsetY = 2;
        continueContext.textAlign = 'center';
        continueContext.textBaseline = 'middle';
        continueContext.fillText('CONTINUE TO NEXT WAVE', continueCanvas.width / 2, continueCanvas.height / 2);
        
        const continueTexture = new THREE.CanvasTexture(continueCanvas);
        const continueMaterial = new THREE.SpriteMaterial({ map: continueTexture });
        this.continueButton = new THREE.Sprite(continueMaterial);
        
        // Position it at the top for better visibility
        this.continueButton.position.set(this.shopCenterPosition.x, 1, this.shopCenterPosition.z - 5); // Move closer to the camera to be more visible
        this.continueButton.scale.set(4, 1, 1);
        this.continueButton.visible = false;
        this.scene.add(this.continueButton);
        
        // Create animation for the continue button to make it more noticeable
        this.continueButtonAnimation = () => {
            if (this.continueButton && this.continueButton.visible) {
                // Make it pulse gently
                const scale = 1 + Math.sin(Date.now() * 0.003) * 0.05;
                this.continueButton.scale.set(4 * scale, 1 * scale, 1);
                
                // Request next frame if button is still visible
                if (this.isShopActive) {
                    requestAnimationFrame(this.continueButtonAnimation);
                }
            }
        };
    }
    
    openShop() {
        if (this.isShopActive) return;
        
        this.isShopActive = true;
        
        // Teleport player to the shop area
        if (this.gameManager.hero && this.gameManager.hero.mesh) {
            this.gameManager.hero.mesh.position.set(this.shopCenterPosition.x, this.gameManager.hero.mesh.position.y, this.shopCenterPosition.z);
        }
        
        // We no longer pause the game completely, just slow down time
        // this.gameManager.pauseGame();
        
        // Show shop UI elements
        this.background.visible = true;
        this.titleSprite.visible = true;
        this.closeButton.visible = true;
        this.continueButton.visible = true;
        
        // Start the continue button animation
        requestAnimationFrame(this.continueButtonAnimation);
        
        // Create shop items
        this.createShopItems();
        
        // Show message to player
        if (this.gameManager.ui) {
            this.gameManager.ui.showNotification("Welcome to the shop! Move around to browse upgrades.");
        }
        
        // Play shop sound
        // this.gameManager.soundManager.playSound('shopOpen');
    }
    
    closeShop() {
        if (!this.isShopActive) return;
        
        this.isShopActive = false;
        
        // Teleport player back to the center of Area A
        if (this.gameManager.hero && this.gameManager.hero.mesh) {
            this.gameManager.hero.mesh.position.set(0, this.gameManager.hero.mesh.position.y, 0);
        }
        
        // Resume normal game speed
        // this.gameManager.resumeGame();
        
        // Hide shop UI elements
        this.background.visible = false;
        this.titleSprite.visible = false;
        this.closeButton.visible = false;
        this.continueButton.visible = false;
        
        // Clean up shop items
        this.cleanupItems();
        
        // Start next wave
        this.gameManager.startNextWave();
        
        // Play shop close sound
        // this.gameManager.soundManager.playSound('shopClose');
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
            
            // Final price calculation
            const price = Math.floor(basePrice * priceMultiplier * (1 + (this.gameManager.gameState.wave - 1) * waveMultiplier));
            
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
        // Only update items if shop is active
        if (!this.isShopActive) return;
        
        // Update each shop item
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].update(this.camera, this.mouse);
        }
    }
    
    onMouseMove(event) {
        // Update mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    onClick(event) {
        if (!this.isShopActive) return;
        
        // Create raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check if close button is clicked
        const closeIntersects = raycaster.intersectObject(this.closeButton);
        if (closeIntersects.length > 0) {
            this.closeShop();
            return;
        }
        
        // Check if continue button is clicked
        const continueIntersects = raycaster.intersectObject(this.continueButton);
        if (continueIntersects.length > 0) {
            this.closeShop();
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