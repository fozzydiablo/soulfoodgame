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
        this.background.position.set(0, 5, -10);
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
        this.titleSprite.position.set(0, 8, -9.5);
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
        this.closeButton.position.set(9, 8, -9);
        this.closeButton.scale.set(0.8, 0.8, 1);
        this.closeButton.visible = false;
        this.scene.add(this.closeButton);
        
        // Create "continue" button
        const continueCanvas = document.createElement('canvas');
        const continueContext = continueCanvas.getContext('2d');
        continueCanvas.width = 512;
        continueCanvas.height = 128;
        
        continueContext.fillStyle = '#005500';
        continueContext.fillRect(0, 0, continueCanvas.width, continueCanvas.height);
        
        continueContext.strokeStyle = '#00ff00';
        continueContext.lineWidth = 4;
        continueContext.strokeRect(4, 4, continueCanvas.width - 8, continueCanvas.height - 8);
        
        continueContext.font = 'bold 48px Arial';
        continueContext.fillStyle = '#ffffff';
        continueContext.textAlign = 'center';
        continueContext.textBaseline = 'middle';
        continueContext.fillText('CONTINUE TO NEXT WAVE', continueCanvas.width / 2, continueCanvas.height / 2);
        
        const continueTexture = new THREE.CanvasTexture(continueCanvas);
        const continueMaterial = new THREE.SpriteMaterial({ map: continueTexture });
        this.continueButton = new THREE.Sprite(continueMaterial);
        this.continueButton.position.set(0, 1, -9);
        this.continueButton.scale.set(4, 1, 1);
        this.continueButton.visible = false;
        this.scene.add(this.continueButton);
    }
    
    openShop() {
        if (this.isShopActive) return;
        
        this.isShopActive = true;
        
        // Pause the game when opening shop
        this.gameManager.pauseGame();
        
        // Show shop UI elements
        this.background.visible = true;
        this.titleSprite.visible = true;
        this.closeButton.visible = true;
        this.continueButton.visible = true;
        
        // Create shop items
        this.createShopItems();
        
        // Show message to player
        if (this.gameManager.ui) {
            this.gameManager.ui.showNotification("Welcome to the shop! Spend your points on upgrades.");
        }
        
        // Play shop sound
        // this.gameManager.soundManager.playSound('shopOpen');
    }
    
    closeShop() {
        if (!this.isShopActive) return;
        
        this.isShopActive = false;
        
        // Resume the game when closing shop
        this.gameManager.resumeGame();
        
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
        
        // Item positions - a 3x2 grid
        const positions = [
            new THREE.Vector3(-6, 4, -8),
            new THREE.Vector3(0, 4, -8),
            new THREE.Vector3(6, 4, -8),
            new THREE.Vector3(-6, 1.5, -8),
            new THREE.Vector3(0, 1.5, -8),
            new THREE.Vector3(6, 1.5, -8)
        ];
        
        // Item types
        const itemTypes = [
            'health',
            'speed',
            'ammo',
            'turretAmmo',
            'turretCooldown',
            'damage'  // Changed duplicate health to damage
        ];
        
        // Item prices - increase with wave number
        const basePrice = 50;
        const waveMultiplier = Math.max(1, this.gameManager.gameState.wave * 0.5);
        
        // Create items
        for (let i = 0; i < positions.length; i++) {
            // Price depends on item type and wave number
            let price;
            switch (itemTypes[i]) {
                case 'health':
                    price = Math.floor(basePrice * 1.5 * waveMultiplier);
                    break;
                case 'speed':
                    price = Math.floor(basePrice * 2 * waveMultiplier);
                    break;
                case 'ammo':
                    price = Math.floor(basePrice * 0.8 * waveMultiplier);
                    break;
                case 'turretAmmo':
                    price = Math.floor(basePrice * 1 * waveMultiplier);
                    break;
                case 'turretCooldown':
                    price = Math.floor(basePrice * 2.5 * waveMultiplier);
                    break;
                case 'damage':
                    price = Math.floor(basePrice * 2.2 * waveMultiplier);
                    break;
                default:
                    price = Math.floor(basePrice * waveMultiplier);
            }
            
            // Create shop item
            const item = new ShopItem(this.scene, positions[i], itemTypes[i], price, this.gameManager);
            this.items.push(item);
        }
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
        if (!this.isShopActive) return;
        
        // Update shop items
        this.items.forEach(item => {
            item.update(this.camera, this.mouse);
        });
    }
    
    onMouseMove(event) {
        // Update mouse position for raycasting
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    }
    
    onClick(event) {
        if (!this.isShopActive) return;
        
        // Calculate normalized device coordinates
        const rect = event.target.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Create raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
        
        // Check for close button click
        const closeIntersects = raycaster.intersectObject(this.closeButton);
        if (closeIntersects.length > 0) {
            this.closeShop();
            return;
        }
        
        // Check for continue button click
        const continueIntersects = raycaster.intersectObject(this.continueButton);
        if (continueIntersects.length > 0) {
            this.closeShop();
            return;
        }
        
        // Check for shop item clicks
        this.items.forEach(item => {
            item.checkClick(raycaster);
        });
    }
} 