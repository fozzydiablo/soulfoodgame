export class UI {
    constructor() {
        this.createUI();
    }
    
    createUI() {
        // Create container for UI elements
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '10px';
        this.container.style.left = '10px';
        this.container.style.color = 'white';
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.fontSize = '20px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.container.style.padding = '10px';
        this.container.style.borderRadius = '5px';
        
        // Create health display
        this.healthDisplay = document.createElement('div');
        this.healthDisplay.id = 'health-display';
        this.container.appendChild(this.healthDisplay);
        
        // Create ammo display
        this.ammoDisplay = document.createElement('div');
        this.ammoDisplay.id = 'ammo-display';
        this.ammoDisplay.style.marginTop = '5px';
        this.container.appendChild(this.ammoDisplay);
        
        // Create wave display
        this.waveDisplay = document.createElement('div');
        this.waveDisplay.id = 'wave-display';
        this.waveDisplay.style.marginTop = '5px';
        this.container.appendChild(this.waveDisplay);
        
        // Create score display
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.id = 'score-display';
        this.scoreDisplay.style.marginTop = '5px';
        this.container.appendChild(this.scoreDisplay);
        
        // Add UI to document
        document.body.appendChild(this.container);
        
        // Add controls instructions
        this.createControlsUI();
    }
    
    createControlsUI() {
        const controlsContainer = document.createElement('div');
        controlsContainer.style.position = 'absolute';
        controlsContainer.style.bottom = '10px';
        controlsContainer.style.left = '10px';
        controlsContainer.style.color = 'white';
        controlsContainer.style.fontFamily = 'Arial, sans-serif';
        controlsContainer.style.fontSize = '16px';
        controlsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        controlsContainer.style.padding = '10px';
        controlsContainer.style.borderRadius = '5px';
        
        controlsContainer.innerHTML = `
            <div style="margin-bottom: 5px; font-weight: bold;">Controls:</div>
            <div>WASD - Move</div>
            <div>SPACE - Jump</div>
            <div>LEFT CLICK - Shoot</div>
            <div>1 - Deploy Turret</div>
            <div>E - Purchase (in shop)</div>
            <div>Walk near ammo crates to collect them</div>
        `;
        
        document.body.appendChild(controlsContainer);
    }
    
    createTurretIndicator() {
        // Create turret ability container
        const abilityContainer = document.createElement('div');
        abilityContainer.style.position = 'absolute';
        abilityContainer.style.bottom = '10px';
        abilityContainer.style.right = '10px';
        abilityContainer.style.width = '60px';
        abilityContainer.style.height = '60px';
        abilityContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        abilityContainer.style.borderRadius = '5px';
        abilityContainer.style.display = 'flex';
        abilityContainer.style.flexDirection = 'column';
        abilityContainer.style.justifyContent = 'center';
        abilityContainer.style.alignItems = 'center';
        abilityContainer.style.padding = '5px';
        
        // Create the ability icon
        const abilityIcon = document.createElement('div');
        abilityIcon.style.width = '40px';
        abilityIcon.style.height = '40px';
        abilityIcon.style.backgroundColor = '#00AAFF';
        abilityIcon.style.borderRadius = '5px';
        abilityIcon.style.display = 'flex';
        abilityIcon.style.justifyContent = 'center';
        abilityIcon.style.alignItems = 'center';
        abilityIcon.style.color = 'white';
        abilityIcon.style.fontWeight = 'bold';
        abilityIcon.style.fontSize = '14px';
        abilityIcon.innerHTML = '1';
        abilityContainer.appendChild(abilityIcon);
        
        // Create cooldown text
        const cooldownText = document.createElement('div');
        cooldownText.style.color = 'white';
        cooldownText.style.fontSize = '12px';
        cooldownText.style.marginTop = '3px';
        cooldownText.innerHTML = 'Ready';
        abilityContainer.appendChild(cooldownText);
        
        // Create cooldown overlay
        const cooldownOverlay = document.createElement('div');
        cooldownOverlay.style.position = 'absolute';
        cooldownOverlay.style.top = '5px';
        cooldownOverlay.style.left = '5px';
        cooldownOverlay.style.width = '40px';
        cooldownOverlay.style.height = '40px';
        cooldownOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        cooldownOverlay.style.borderRadius = '5px';
        cooldownOverlay.style.display = 'none';
        abilityContainer.appendChild(cooldownOverlay);
        
        // Add to document
        document.body.appendChild(abilityContainer);
        
        // Store references
        this.turretAbilityContainer = abilityContainer;
        this.turretAbilityIcon = abilityIcon;
        this.turretCooldownText = cooldownText;
        this.turretCooldownOverlay = cooldownOverlay;
    }
    
    updateTurretCooldown(remainingSeconds) {
        if (!this.turretCooldownText || !this.turretCooldownOverlay) return;
        
        // Update cooldown text
        this.turretCooldownText.innerHTML = `${remainingSeconds}s`;
        
        // Show cooldown overlay
        this.turretCooldownOverlay.style.display = 'block';
        
        // Calculate fill percentage (100% at start of cooldown, 0% at end)
        const percentage = (remainingSeconds / 20) * 100; // 20 is the total cooldown time
        
        // Set height of overlay based on remaining cooldown
        this.turretCooldownOverlay.style.height = `${percentage}%`;
        this.turretCooldownOverlay.style.top = `${5 + (40 - (percentage * 40 / 100))}px`;
    }
    
    updateTurretCooldownComplete() {
        if (!this.turretCooldownText || !this.turretCooldownOverlay) return;
        
        // Reset cooldown display
        this.turretCooldownText.innerHTML = 'Ready';
        this.turretCooldownOverlay.style.display = 'none';
        
        // Flash the icon to indicate it's ready
        this.turretAbilityIcon.style.backgroundColor = '#00FF00'; // Bright green
        
        setTimeout(() => {
            if (this.turretAbilityIcon) {
                this.turretAbilityIcon.style.backgroundColor = '#00AAFF'; // Back to normal blue
            }
        }, 300);
    }
    
    updateHealth(health, maxHealth) {
        const healthPercentage = (health / maxHealth) * 100;
        let healthColor = 'green';
        
        if (healthPercentage < 30) {
            healthColor = 'red';
        } else if (healthPercentage < 70) {
            healthColor = 'orange';
        }
        
        this.healthDisplay.innerHTML = `
            Health: <span style="color: ${healthColor};">${health}/${maxHealth}</span>
            <div style="width: 100%; height: 8px; background-color: #444; border-radius: 3px; margin-top: 5px;">
                <div style="width: ${healthPercentage}%; height: 100%; background-color: ${healthColor}; border-radius: 3px;"></div>
            </div>
        `;
    }
    
    updateAmmo(ammo) {
        this.ammoDisplay.innerHTML = `
            Ammo: ${ammo}
            <div style="margin-top: 3px;">
                ${this.generateAmmoIcons(ammo)}
            </div>
        `;
    }
    
    generateAmmoIcons(ammo) {
        let icons = '';
        const maxIcons = 20; // Don't show too many icons
        
        for (let i = 0; i < Math.min(ammo, maxIcons); i++) {
            icons += '<span style="display: inline-block; width: 7px; height: 14px; background-color: #00FF00; margin-right: 2px;"></span>';
        }
        
        if (ammo > maxIcons) {
            icons += ` +${ammo - maxIcons}`;
        }
        
        return icons;
    }
    
    updateWave(wave) {
        this.waveDisplay.innerHTML = `Wave: ${wave}`;
    }
    
    showGameOver() {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.style.position = 'absolute';
        gameOverScreen.style.top = '0';
        gameOverScreen.style.left = '0';
        gameOverScreen.style.width = '100%';
        gameOverScreen.style.height = '100%';
        gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameOverScreen.style.color = 'red';
        gameOverScreen.style.fontFamily = 'Arial, sans-serif';
        gameOverScreen.style.fontSize = '48px';
        gameOverScreen.style.display = 'flex';
        gameOverScreen.style.justifyContent = 'center';
        gameOverScreen.style.alignItems = 'center';
        gameOverScreen.style.zIndex = '999';
        
        gameOverScreen.innerHTML = `
            <div style="text-align: center;">
                <div>GAME OVER</div>
                <div style="font-size: 24px; margin-top: 20px;">Refresh the page to try again</div>
            </div>
        `;
        
        document.body.appendChild(gameOverScreen);
    }
    
    showWaveNotification(wave) {
        const notification = document.createElement('div');
        notification.style.position = 'absolute';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = '#FF0000';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.fontSize = '36px';
        notification.style.padding = '20px';
        notification.style.borderRadius = '10px';
        notification.style.textAlign = 'center';
        notification.style.zIndex = '100';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        
        notification.innerHTML = `Wave ${wave} Incoming!`;
        
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Fade out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2000);
    }
    
    showShopNotification() {
        const notification = document.createElement('div');
        notification.style.position = 'absolute';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = '#00AAFF';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.fontSize = '36px';
        notification.style.padding = '20px';
        notification.style.borderRadius = '10px';
        notification.style.textAlign = 'center';
        notification.style.zIndex = '100';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        
        notification.innerHTML = `
            <div>Welcome to the Shop!</div>
            <div style="font-size: 20px; margin-top: 10px; color: white;">
                Approach items and press <span style="color: #FFCC00;">E</span> to purchase upgrades
            </div>
            <div style="font-size: 18px; margin-top: 10px; color: #aaaaaa;">
                Exit through the green portal when finished
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Fade out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 4000);
    }
    
    showPurchaseNotification(itemName) {
        const notification = document.createElement('div');
        notification.style.position = 'absolute';
        notification.style.top = '30%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = '#FFCC00';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.fontSize = '24px';
        notification.style.padding = '15px';
        notification.style.borderRadius = '10px';
        notification.style.textAlign = 'center';
        notification.style.zIndex = '100';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        
        notification.innerHTML = `Purchased: ${itemName}`;
        
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Fade out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2000);
    }
    
    updateScore(score) {
        if (!this.scoreDisplay) return;
        this.scoreDisplay.innerHTML = `Score: ${score}`;
    }
    
    // Add a general notification method
    showNotification(message, duration = 2000) {
        const notification = document.createElement('div');
        notification.style.position = 'absolute';
        notification.style.top = '30%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = '#FFCC00';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.fontSize = '24px';
        notification.style.padding = '15px';
        notification.style.borderRadius = '10px';
        notification.style.textAlign = 'center';
        notification.style.zIndex = '100';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        
        notification.innerHTML = message;
        
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Fade out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, duration);
    }
} 