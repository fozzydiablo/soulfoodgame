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
        
        // Create gold display
        this.goldDisplay = document.createElement('div');
        this.goldDisplay.id = 'gold-display';
        this.goldDisplay.style.marginTop = '5px';
        this.goldDisplay.style.color = '#FFD700';
        this.goldDisplay.style.fontWeight = 'bold';
        this.container.appendChild(this.goldDisplay);
        
        // Create stats display
        this.statsDisplay = document.createElement('div');
        this.statsDisplay.id = 'stats-display';
        this.statsDisplay.style.marginTop = '15px';
        this.statsDisplay.style.fontSize = '16px';
        this.statsDisplay.style.borderTop = '1px solid rgba(255, 255, 255, 0.3)';
        this.statsDisplay.style.paddingTop = '5px';
        this.container.appendChild(this.statsDisplay);
        
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
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.style.position = 'fixed';
        notification.style.top = '20%';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.fontSize = '18px';
        notification.style.fontWeight = 'bold';
        notification.style.textAlign = 'center';
        notification.style.zIndex = '1000';
        notification.style.pointerEvents = 'none';
        notification.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        
        // Check if this is a gold notification and style accordingly
        if (message.includes('Gold')) {
            notification.style.color = '#FFD700'; // Gold color
            notification.style.textShadow = '0 0 5px #996515'; // Gold shadow
            notification.style.borderLeft = '4px solid #FFD700';
            notification.style.borderRight = '4px solid #FFD700';
        }
        
        notification.textContent = message;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Fade in animation
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        
        // Force reflow to make transition work
        notification.offsetHeight;
        
        // Fade in
        notification.style.opacity = '1';
        
        // Remove after duration
        setTimeout(() => {
            // Fade out
            notification.style.opacity = '0';
            
            // Remove after fade out
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    updatePlayerStats(hero) {
        if (!this.statsDisplay || !hero || !hero.stats) return;
        
        const { 
            damage, 
            speed, 
            attackSpeed, 
            health,
            maxHealth,
            healthRegen,
            armor,
            evasion,
            mana,
            maxMana,
            manaRegen
        } = hero.stats;
        
        // Create mana bar HTML
        const manaPercentage = Math.floor((mana / maxMana) * 100);
        const manaBar = `
            <div style="width: 100%; height: 8px; background-color: #444; border-radius: 3px; margin-top: 2px; margin-bottom: 8px;">
                <div style="width: ${manaPercentage}%; height: 100%; background-color: #3366ff; border-radius: 3px;"></div>
            </div>
        `;
        
        this.statsDisplay.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px; color: #ffcc00;">Player Stats:</div>
            
            <div style="margin-bottom: 10px;">
                <div>Mana: <span style="color: #3366ff;">${Math.floor(mana)}/${maxMana}</span></div>
                ${manaBar}
            </div>
            
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 120px;">
                    <div>Damage: <span style="color: #ff6666;">${damage.toFixed(1)}</span></div>
                    <div>Armor: <span style="color: #ddcc77;">${armor.toFixed(1)}%</span></div>
                    <div>Evasion: <span style="color: #77dd77;">${evasion.toFixed(1)}%</span></div>
                </div>
                
                <div style="flex: 1; min-width: 120px;">
                    <div>Speed: <span style="color: #66ccff;">${speed.toFixed(1)}</span></div>
                    <div>Fire Rate: <span style="color: #ff9966;">${attackSpeed.toFixed(1)}/s</span></div>
                    <div>Health Regen: <span style="color: #ff7777;">${(healthRegen * 60).toFixed(1)}/min</span></div>
                </div>
                
                <div style="flex: 1; min-width: 120px;">
                    <div>Collection: <span style="color: #66ff66;">${hero.collectionRadius.toFixed(1)}</span></div>
                    <div>Mana Regen: <span style="color: #7777ff;">${(manaRegen * 60).toFixed(1)}/min</span></div>
                </div>
            </div>
        `;
    }
    
    updateGold(gold) {
        if (!this.goldDisplay) return;
        
        this.goldDisplay.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div style="background-color: #FFD700; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px;"></div>
                Gold: ${gold}
            </div>
        `;
    }
    
    createTooltip(content, x, y) {
        // Remove existing tooltip if any
        this.removeTooltip();
        
        // Create tooltip container
        this.tooltip = document.createElement('div');
        this.tooltip.style.position = 'absolute';
        this.tooltip.style.top = `${y}px`;
        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.tooltip.style.color = 'white';
        this.tooltip.style.padding = '10px';
        this.tooltip.style.borderRadius = '5px';
        this.tooltip.style.zIndex = '1000';
        this.tooltip.style.maxWidth = '300px';
        this.tooltip.style.pointerEvents = 'none'; // So it doesn't interfere with mouse events
        
        // Add content
        this.tooltip.innerHTML = content;
        
        // Add to document
        document.body.appendChild(this.tooltip);
        
        // Make sure tooltip is fully visible on screen
        const rect = this.tooltip.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.tooltip.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.tooltip.style.top = `${window.innerHeight - rect.height - 10}px`;
        }
    }
    
    removeTooltip() {
        if (this.tooltip) {
            document.body.removeChild(this.tooltip);
            this.tooltip = null;
        }
    }
} 