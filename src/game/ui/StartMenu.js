import * as THREE from 'three';
import { TextSprite } from './TextSprite.js';

export class StartMenu {
    constructor(scene, camera) {
        this.scene = scene || new THREE.Scene();
        this.camera = camera;
        this.isActive = true;
        this.buttons = [];
        this.menuContainer = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.clock = new THREE.Clock(); // Add a clock for animations
        
        // Initialize default camera position and rotation
        this.originalCameraPosition = new THREE.Vector3(0, 30, 12);
        this.originalCameraRotation = new THREE.Euler(0, 0, 0);
        
        // Ensure camera exists
        if (!this.camera) {
            // Create a temporary camera if none provided
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.copy(this.originalCameraPosition);
            console.warn("StartMenu: No camera provided, created temporary camera");
        } else if (this.camera.position) {
            // Save original camera state if it exists
            this.originalCameraPosition.copy(this.camera.position);
            if (this.camera.rotation) {
                this.originalCameraRotation.copy(this.camera.rotation);
            }
        }
        
        // Track mouse position for hover effects
        this.setupMouseListeners();
        
        // Create the menu after ensuring all dependencies are properly initialized
        this.createMenu();
    }
    
    setupMouseListeners() {
        // Track mouse position
        window.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -((event.clientY / window.innerHeight) * 2 - 1);
        });
        
        // Handle click events
        window.addEventListener('click', (event) => {
            if (!this.isActive) return;
            
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -((event.clientY / window.innerHeight) * 2 - 1)
            );
            
            // Create a raycaster
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            
            // Check if any buttons were clicked
            const buttonMeshes = this.buttons.map(btn => btn.mesh);
            const intersects = raycaster.intersectObjects(buttonMeshes, false);
            
            if (intersects.length > 0) {
                const clickedObject = intersects[0].object;
                const clickedButton = this.buttons.find(btn => btn.mesh === clickedObject);
                
                if (clickedButton) {
                    // Visual feedback for click
                    const originalColor = clickedButton.mesh.material.color.getHex();
                    clickedButton.mesh.material.color.setHex(0xaaaaaa); // Flash to a lighter color
                    
                    // Delay the action slightly to show the visual feedback
                    setTimeout(() => {
                        clickedButton.mesh.material.color.setHex(originalColor);
                        clickedButton.onClick();
                    }, 100);
                }
            }
        });
    }
    
    createMenu() {
        // Create 3D menu container
        this.menuContainer = new THREE.Group();
        this.scene.add(this.menuContainer);
        
        // Position the container in front of the camera
        this.menuContainer.position.set(0, 5, -10);
        
        // Create a completely black background panel - extremely large to cover everything
        const bgGeometry = new THREE.PlaneGeometry(1000, 1000);
        const bgMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: false,
            side: THREE.DoubleSide,
            depthTest: false
        });
        
        const background = new THREE.Mesh(bgGeometry, bgMaterial);
        background.position.set(0, 0, -50);
        background.renderOrder = -1;
        this.menuContainer.add(background);
        
        // Add a second background closer to the camera
        const frontBgGeometry = new THREE.PlaneGeometry(100, 100);
        const frontBgMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: false,
            side: THREE.DoubleSide
        });
        
        const frontBackground = new THREE.Mesh(frontBgGeometry, frontBgMaterial);
        frontBackground.position.set(0, 0, -2);
        this.menuContainer.add(frontBackground);
        
        // Create a decorative frame for the title
        const frameGeometry = new THREE.PlaneGeometry(16, 5);
        const frameMaterial = new THREE.MeshBasicMaterial({
            color: 0x332200,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 2, -0.5);
        this.menuContainer.add(frame);
        
        // Add a subtle glow effect around title
        const glowGeometry = new THREE.PlaneGeometry(17, 6);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffcc44,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0, 2, -0.6);
        this.menuContainer.add(glow);
        
        // Create title text with larger size and golden color
        const titleSprite = new TextSprite('SOUL FOOD GAME', { 
            fontFace: 'Arial',
            fontSize: 96,
            fontWeight: 'bold',
            textColor: { r: 1, g: 0.85, b: 0.2 },
            borderColor: { r: 0.5, g: 0.3, b: 0 },
            borderWidth: 8,
            size: 2.2
        });
        titleSprite.position.set(0, 2, 0);
        this.menuContainer.add(titleSprite);
        
        // Create a container for buttons to group them together
        this.buttonContainer = new THREE.Group();
        this.buttonContainer.position.set(0, -1, 0);
        this.menuContainer.add(this.buttonContainer);
        
        // Create a decorative panel behind the buttons
        const buttonsPanelGeometry = new THREE.PlaneGeometry(10, 7);
        const buttonsPanelMaterial = new THREE.MeshBasicMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const buttonsPanel = new THREE.Mesh(buttonsPanelGeometry, buttonsPanelMaterial);
        buttonsPanel.position.set(0, -0.9, -0.3);
        this.buttonContainer.add(buttonsPanel);
        
        // Create buttons with improved spacing
        this.createButton('Start Game', 0, 1, () => {
            this.hide();
            if (this.onStartGame) this.onStartGame();
        });
        
        this.createButton('Controls', 0, -0.9, () => {
            this.showControls();
        });
        
        this.createButton('About', 0, -2.8, () => {
            this.showAbout();
        });
        
        // Add decorative elements around the menu
        this.addDecorativeElements();
        
        // Position camera to view menu if camera exists and has position property
        if (this.camera && this.camera.position) {
            this.camera.position.set(0, 5, 0);
            this.camera.lookAt(0, 5, -10);
        }
    }
    
    addDecorativeElements() {
        // Add some decorative particle effects
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 100;
        
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            // Create a cloud of particles around the menu
            const x = (Math.random() - 0.5) * 30;
            const y = (Math.random() - 0.5) * 30;
            const z = (Math.random() - 0.5) * 10 - 5;
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffcc44,
            size: 0.05,
            transparent: true,
            opacity: 0.3
        });
        
        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.menuContainer.add(this.particles);
        
        // Don't use setInterval anymore, we'll update in the render loop
        if (this.particleAnimation) {
            clearInterval(this.particleAnimation);
            this.particleAnimation = null;
        }
    }
    
    createButton(text, x, y, onClick) {
        // Create button with text - TextSprite constructor returns the sprite directly
        const buttonText = new TextSprite(text, { 
            fontFace: 'Arial',
            fontSize: 72,
            fontWeight: 'bold',
            textColor: { r: 1, g: 1, b: 1 },
            borderColor: { r: 0.2, g: 0.2, b: 0.2 },
            borderWidth: 3,
            size: 1.4
        });
        
        // Create button mesh with rounded corners
        const buttonGeometry = new THREE.PlaneGeometry(8, 1.6);
        const buttonMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x444444,
            transparent: true,
            opacity: 0.8
        });
        
        const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
        buttonMesh.position.set(x, y, 0);
        
        // Add a border around the button
        const borderGeometry = new THREE.PlaneGeometry(8.2, 1.8);
        const borderMaterial = new THREE.MeshBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(x, y, -0.05);
        
        // Position text slightly in front of button
        buttonText.position.set(x, y, 0.1);
        
        // Add to container
        this.buttonContainer.add(border);
        this.buttonContainer.add(buttonMesh);
        this.buttonContainer.add(buttonText);
        
        // Store button data with enhanced hover effect and animation properties
        this.buttons.push({
            mesh: buttonMesh,
            border: border,
            text: buttonText,
            onClick: onClick,
            defaultColor: 0x444444,
            hoverColor: 0x666666,
            borderDefaultColor: 0x666666,
            borderHoverColor: 0xffcc44,
            initialY: y,
            hovered: false,
            pulsePhase: Math.random() * Math.PI * 2 // Random starting phase for animation
        });
        
        return buttonMesh;
    }
    
    showControls() {
        // Create a modal dialog for controls
        const controlsModal = document.createElement('div');
        controlsModal.style.position = 'absolute';
        controlsModal.style.top = '50%';
        controlsModal.style.left = '50%';
        controlsModal.style.transform = 'translate(-50%, -50%)';
        controlsModal.style.width = '500px';
        controlsModal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        controlsModal.style.padding = '30px';
        controlsModal.style.color = 'white';
        controlsModal.style.fontFamily = 'Arial, sans-serif';
        controlsModal.style.fontSize = '20px';
        controlsModal.style.borderRadius = '15px';
        controlsModal.style.boxShadow = '0 0 30px rgba(255, 204, 68, 0.3)';
        controlsModal.style.border = '1px solid rgba(255, 204, 68, 0.5)';
        controlsModal.style.zIndex = '1000';
        
        controlsModal.innerHTML = `
            <h2 style="text-align: center; color: #FFD700; font-size: 32px; margin-bottom: 20px; text-shadow: 0 0 10px rgba(255, 204, 68, 0.7);">Controls</h2>
            <div style="display: grid; grid-template-columns: auto 1fr; grid-gap: 15px; margin: 20px 0;">
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center; font-weight: bold;">WASD</div>
                <div style="display: flex; align-items: center;">Move character</div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center; font-weight: bold;">SPACE</div>
                <div style="display: flex; align-items: center;">Jump</div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center; font-weight: bold;">LEFT CLICK</div>
                <div style="display: flex; align-items: center;">Shoot</div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center; font-weight: bold;">1</div>
                <div style="display: flex; align-items: center;">Deploy Turret</div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center; font-weight: bold;">E</div>
                <div style="display: flex; align-items: center;">Interact with Shop</div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center; font-weight: bold;">P</div>
                <div style="display: flex; align-items: center;">Pause game</div>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <button id="close-controls" style="padding: 12px 30px; background: linear-gradient(to bottom, #FFD700, #B8860B); color: black; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; font-weight: bold; box-shadow: 0 4px 8px rgba(0,0,0,0.3); transition: all 0.2s;">CLOSE</button>
            </div>
        `;
        
        document.body.appendChild(controlsModal);
        
        const closeButton = document.getElementById('close-controls');
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.transform = 'scale(1.05)';
            closeButton.style.boxShadow = '0 6px 12px rgba(0,0,0,0.5)';
        });
        
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.transform = 'scale(1)';
            closeButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        });
        
        closeButton.addEventListener('click', () => {
            document.body.removeChild(controlsModal);
        });
    }
    
    showAbout() {
        // Create a modal dialog for about info
        const aboutModal = document.createElement('div');
        aboutModal.style.position = 'absolute';
        aboutModal.style.top = '50%';
        aboutModal.style.left = '50%';
        aboutModal.style.transform = 'translate(-50%, -50%)';
        aboutModal.style.width = '550px';
        aboutModal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        aboutModal.style.padding = '30px';
        aboutModal.style.color = 'white';
        aboutModal.style.fontFamily = 'Arial, sans-serif';
        aboutModal.style.fontSize = '20px';
        aboutModal.style.borderRadius = '15px';
        aboutModal.style.boxShadow = '0 0 30px rgba(255, 204, 68, 0.3)';
        aboutModal.style.border = '1px solid rgba(255, 204, 68, 0.5)';
        aboutModal.style.zIndex = '1000';
        
        aboutModal.innerHTML = `
            <h2 style="text-align: center; color: #FFD700; font-size: 32px; margin-bottom: 20px; text-shadow: 0 0 10px rgba(255, 204, 68, 0.7);">Soul Food Game</h2>
            <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px; margin: 10px 0 30px 0; line-height: 1.6;">
                <p>A tower defense game where you collect resources, defeat enemies, and upgrade your character!</p>
                <p style="margin-top: 15px;">Build turrets, upgrade your weapons, and survive waves of increasing difficulty.</p>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 30px 0 15px 0;">
                <div style="text-align: center; flex: 1; padding: 10px;">
                    <div style="font-size: 16px; color: #FFD700; margin-bottom: 5px;">COLLECT</div>
                    <div style="font-size: 14px;">Resources & Power-ups</div>
                </div>
                <div style="text-align: center; flex: 1; padding: 10px;">
                    <div style="font-size: 16px; color: #FFD700; margin-bottom: 5px;">BUILD</div>
                    <div style="font-size: 14px;">Turrets & Defenses</div>
                </div>
                <div style="text-align: center; flex: 1; padding: 10px;">
                    <div style="font-size: 16px; color: #FFD700; margin-bottom: 5px;">SURVIVE</div>
                    <div style="font-size: 14px;">Endless Waves</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <button id="close-about" style="padding: 12px 30px; background: linear-gradient(to bottom, #FFD700, #B8860B); color: black; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; font-weight: bold; box-shadow: 0 4px 8px rgba(0,0,0,0.3); transition: all 0.2s;">CLOSE</button>
            </div>
        `;
        
        document.body.appendChild(aboutModal);
        
        const closeButton = document.getElementById('close-about');
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.transform = 'scale(1.05)';
            closeButton.style.boxShadow = '0 6px 12px rgba(0,0,0,0.5)';
        });
        
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.transform = 'scale(1)';
            closeButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        });
        
        closeButton.addEventListener('click', () => {
            document.body.removeChild(aboutModal);
        });
    }
    
    update() {
        if (!this.isActive) return;
        
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        
        // Check for button hover
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(this.mouseX, this.mouseY);
        raycaster.setFromCamera(mouse, this.camera);
        
        // Check all button meshes for intersections
        const buttonMeshes = this.buttons.map(btn => btn.mesh);
        const intersects = raycaster.intersectObjects(buttonMeshes, false);
        
        // Reset hover state for all buttons
        this.buttons.forEach(btn => {
            btn.hovered = false;
        });
        
        // Detect hover state
        if (intersects.length > 0) {
            const hoveredObject = intersects[0].object;
            const hoveredButton = this.buttons.find(btn => btn.mesh === hoveredObject);
            
            if (hoveredButton) {
                hoveredButton.hovered = true;
                document.body.style.cursor = 'pointer';
            }
        } else {
            document.body.style.cursor = 'default';
        }
        
        // Animate buttons
        this.buttons.forEach(btn => {
            // Reset to default appearance
            btn.mesh.material.color.setHex(btn.defaultColor);
            btn.border.material.color.setHex(btn.borderDefaultColor);
            btn.border.material.opacity = 0.5;
            
            // Apply subtle floating animation to all buttons
            const floatOffset = Math.sin(time * 1.5 + btn.pulsePhase) * 0.05;
            btn.mesh.position.y = btn.initialY + floatOffset;
            btn.border.position.y = btn.initialY + floatOffset;
            btn.text.position.y = btn.initialY + floatOffset;
            
            // If hovered, apply additional effects
            if (btn.hovered) {
                btn.mesh.material.color.setHex(btn.hoverColor);
                btn.border.material.color.setHex(btn.borderHoverColor);
                btn.border.material.opacity = 0.8;
                
                // Scale up slightly when hovered
                const pulseScale = 1.0 + Math.sin(time * 8) * 0.02;
                btn.mesh.scale.set(pulseScale, pulseScale, 1);
                btn.border.scale.set(pulseScale, pulseScale, 1);
            } else {
                // Reset scale when not hovered
                btn.mesh.scale.set(1, 1, 1);
                btn.border.scale.set(1, 1, 1);
            }
        });
        
        // Update the particle animation here instead of using setInterval
        if (this.particles && this.particles.geometry.attributes.position) {
            const positions = this.particles.geometry.attributes.position.array;
            const particleCount = positions.length / 3;
            
            for (let i = 0; i < particleCount; i++) {
                // Subtle movement
                positions[i * 3 + 1] += Math.sin(time * 2 + i) * 0.01;
                positions[i * 3] += Math.cos(time * 2 + i) * 0.01;
            }
            
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    hide() {
        this.isActive = false;
        if (this.menuContainer) {
            this.menuContainer.visible = false;
        }
        
        // Restore camera position and rotation if camera exists
        if (this.camera && this.camera.position && this.originalCameraPosition) {
            this.camera.position.copy(this.originalCameraPosition);
            if (this.camera.rotation && this.originalCameraRotation) {
                this.camera.rotation.copy(this.originalCameraRotation);
            }
        }
    }
    
    show() {
        this.isActive = true;
        if (this.menuContainer) {
            this.menuContainer.visible = true;
        }
        
        // Save current camera state if camera exists
        if (this.camera && this.camera.position) {
            this.originalCameraPosition.copy(this.camera.position);
            if (this.camera.rotation) {
                this.originalCameraRotation.copy(this.camera.rotation);
            }
            
            // Position camera to view menu
            this.camera.position.set(0, 5, 0);
            this.camera.lookAt(0, 5, -10);
        }
    }
} 