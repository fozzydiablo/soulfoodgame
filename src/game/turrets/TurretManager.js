import * as THREE from 'three';
import { Turret } from './Turret.js';

export class TurretManager {
    constructor(scene, gameManager) {
        this.scene = scene;
        this.gameManager = gameManager;
        this.turrets = [];
        
        // Cooldown system
        this.lastTurretTime = 0;
        this.cooldownTime = 20000; // 20 seconds in milliseconds
        this.isOnCooldown = false;
        
        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        
        // Add keyboard listener
        document.addEventListener('keydown', this.handleKeyDown);
    }
    
    handleKeyDown(event) {
        // Check if player pressed the "1" key
        if (event.key === '1') {
            this.attemptToDeployTurret();
        }
    }
    
    attemptToDeployTurret() {
        const now = Date.now();
        
        // Check if on cooldown
        if (now - this.lastTurretTime < this.cooldownTime) {
            console.log("Turret ability on cooldown!");
            return false;
        }
        
        // Deploy turret at player position
        const playerPosition = this.gameManager.hero.mesh.position.clone();
        
        // Create a new turret
        const turret = new Turret(this.scene, playerPosition, this.gameManager);
        this.turrets.push(turret);
        
        // Set cooldown
        this.lastTurretTime = now;
        this.isOnCooldown = true;
        
        // Update UI
        this.gameManager.ui.updateTurretCooldown(this.cooldownTime / 1000); // Convert to seconds
        
        // Start cooldown timer
        setTimeout(() => {
            this.isOnCooldown = false;
            // Update UI when cooldown is complete
            this.gameManager.ui.updateTurretCooldownComplete();
        }, this.cooldownTime);
        
        return true;
    }
    
    update(delta) {
        // Update all active turrets
        for (let i = this.turrets.length - 1; i >= 0; i--) {
            const turret = this.turrets[i];
            
            // Update turret if it exists
            if (turret.mesh) {
                turret.update(delta);
            } else {
                // Remove turret from array if it's been destroyed
                this.turrets.splice(i, 1);
            }
        }
        
        // Update cooldown UI if needed
        if (this.isOnCooldown) {
            const now = Date.now();
            const elapsed = now - this.lastTurretTime;
            const remaining = Math.max(0, this.cooldownTime - elapsed);
            this.gameManager.ui.updateTurretCooldown(Math.ceil(remaining / 1000)); // Round up to nearest second
        }
    }
    
    getRemainingCooldown() {
        const now = Date.now();
        return Math.max(0, this.cooldownTime - (now - this.lastTurretTime));
    }
} 