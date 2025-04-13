export class UI {
    constructor(gameManager) {
        this.gameManager = gameManager;
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
        this.container.style.fontSize = '18px';
        this.container.style.display = 'flex';
        this.container.style.alignItems = 'center';
        
        // Create player face container (square on the left)
        this.faceContainer = document.createElement('div');
        this.faceContainer.style.width = '80px';
        this.faceContainer.style.height = '80px';
        this.faceContainer.style.backgroundColor = '#222222';
        this.faceContainer.style.border = '4px solid #333333';
        this.faceContainer.style.borderRadius = '5px';
        this.faceContainer.style.boxShadow = 'inset 0 0 10px rgba(0, 0, 0, 0.8)';
        this.faceContainer.style.display = 'flex';
        this.faceContainer.style.justifyContent = 'center';
        this.faceContainer.style.alignItems = 'center';
        this.faceContainer.style.overflow = 'hidden';
        this.container.appendChild(this.faceContainer);
        
        // Create player face with CSS
        this.playerFace = document.createElement('div');
        this.playerFace.style.width = '70px';
        this.playerFace.style.height = '70px';
        this.playerFace.style.position = 'relative';
        this.playerFace.style.backgroundColor = '#E0AC69'; // Skin color matching Hero.js
        this.playerFace.style.borderRadius = '3px';
        this.playerFace.innerHTML = `
            <!-- Eyes -->
            <div style="position: absolute; left: 15px; top: 20px; width: 10px; height: 10px; background-color: #333; border-radius: 50%;"></div>
            <div style="position: absolute; right: 15px; top: 20px; width: 10px; height: 10px; background-color: #333; border-radius: 50%;"></div>
            
            <!-- Mouth -->
            <div style="position: absolute; left: 25px; top: 40px; width: 20px; height: 5px; background-color: #333; border-radius: 2px;"></div>
            
            <!-- Hair -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 15px; background-color: #663300;"></div>
            
            <!-- Shirt collar (hint of blue shirt) -->
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 10px; background-color: #3333FF;"></div>
        `;
        this.faceContainer.appendChild(this.playerFace);
        
        // Create bars container
        this.barsContainer = document.createElement('div');
        this.barsContainer.style.marginLeft = '10px';
        this.barsContainer.style.width = '250px';
        this.barsContainer.style.display = 'flex';
        this.barsContainer.style.flexDirection = 'column';
        this.barsContainer.style.justifyContent = 'center';
        this.container.appendChild(this.barsContainer);
        
        // Create health display
        this.healthDisplay = document.createElement('div');
        this.healthDisplay.id = 'health-display';
        this.healthDisplay.style.height = '25px';
        this.healthDisplay.style.marginBottom = '10px';
        this.barsContainer.appendChild(this.healthDisplay);
        
        // Create mana display
        this.manaDisplay = document.createElement('div');
        this.manaDisplay.id = 'mana-display';
        this.manaDisplay.style.height = '25px';
        this.manaDisplay.style.marginBottom = '10px';
        this.barsContainer.appendChild(this.manaDisplay);
        
        // Create gold tracker
        this.goldTrackerContainer = document.createElement('div');
        this.goldTrackerContainer.style.display = 'flex';
        this.goldTrackerContainer.style.alignItems = 'center';
        this.goldTrackerContainer.style.height = '25px';
        this.goldTrackerContainer.style.padding = '0 5px';
        this.barsContainer.appendChild(this.goldTrackerContainer);
        
        // Gold coin icon
        const goldIcon = document.createElement('div');
        goldIcon.style.width = '20px';
        goldIcon.style.height = '20px';
        goldIcon.style.borderRadius = '50%';
        goldIcon.style.background = 'radial-gradient(circle at 30% 30%, #FFD700, #B8860B)';
        goldIcon.style.marginRight = '10px';
        goldIcon.style.boxShadow = '0 0 5px rgba(255, 215, 0, 0.5)';
        this.goldTrackerContainer.appendChild(goldIcon);
        
        // Gold amount text
        this.goldAmountDisplay = document.createElement('div');
        this.goldAmountDisplay.style.fontWeight = 'bold';
        this.goldAmountDisplay.style.color = '#FFD700';
        this.goldAmountDisplay.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.8)';
        this.goldAmountDisplay.style.fontSize = '16px'; // Slightly smaller text
        this.goldTrackerContainer.appendChild(this.goldAmountDisplay);
        
        // Create wave counter in top center
        this.waveCounterContainer = document.createElement('div');
        this.waveCounterContainer.style.position = 'absolute';
        this.waveCounterContainer.style.top = '10px';
        this.waveCounterContainer.style.left = '50%';
        this.waveCounterContainer.style.transform = 'translateX(-50%)';
        this.waveCounterContainer.style.backgroundColor = '#222222';
        this.waveCounterContainer.style.border = '3px solid #444444';
        this.waveCounterContainer.style.borderRadius = '5px';
        this.waveCounterContainer.style.padding = '5px 15px';
        this.waveCounterContainer.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.5)';
        this.waveCounterContainer.style.color = 'white';
        this.waveCounterContainer.style.fontFamily = 'Arial, sans-serif';
        this.waveCounterContainer.style.fontSize = '20px';
        this.waveCounterContainer.style.fontWeight = 'bold';
        this.waveCounterContainer.style.zIndex = '1000';
        this.waveCounterContainer.style.textAlign = 'center';
        
        this.waveCounter = document.createElement('div');
        this.waveCounterContainer.appendChild(this.waveCounter);
        document.body.appendChild(this.waveCounterContainer);
        
        // Initial update of wave counter
        this.updateWave(this.gameManager?.gameState?.wave || 0);
        
        // Initial update of gold
        this.updateGold(this.gameManager?.gameState?.resources?.gold || 0);
        
        // Initial update of health and mana
        if (this.gameManager && this.gameManager.gameState) {
            this.updateHealth(
                this.gameManager.gameState.health,
                this.gameManager.gameState.maxHealth
            );
        }
        
        if (this.gameManager && this.gameManager.hero && this.gameManager.hero.stats) {
            this.updateMana(
                this.gameManager.hero.stats.mana,
                this.gameManager.hero.stats.maxMana
            );
        }
        
        // Add UI to document
        document.body.appendChild(this.container);
        
        // Add Player Info button
        this.createPlayerInfoButton();
    }
    
    createPlayerInfoButton() {
        // Create button container
        this.playerInfoButton = document.createElement('div');
        this.playerInfoButton.style.position = 'absolute';
        this.playerInfoButton.style.bottom = '20px';
        this.playerInfoButton.style.left = '20px';
        this.playerInfoButton.style.backgroundColor = '#333333';
        this.playerInfoButton.style.color = 'white';
        this.playerInfoButton.style.padding = '10px 15px';
        this.playerInfoButton.style.borderRadius = '5px';
        this.playerInfoButton.style.fontFamily = 'Arial, sans-serif';
        this.playerInfoButton.style.fontSize = '16px';
        this.playerInfoButton.style.fontWeight = 'bold';
        this.playerInfoButton.style.cursor = 'pointer';
        this.playerInfoButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.5)';
        this.playerInfoButton.style.border = '2px solid #555555';
        this.playerInfoButton.style.transition = 'all 0.2s ease';
        this.playerInfoButton.style.zIndex = '1000'; // Ensure it's above other elements
        this.playerInfoButton.textContent = 'Player Info';
        
        // Hover effect
        this.playerInfoButton.addEventListener('mouseover', () => {
            this.playerInfoButton.style.backgroundColor = '#444444';
            this.playerInfoButton.style.boxShadow = '0 3px 7px rgba(0, 0, 0, 0.6)';
        });
        
        this.playerInfoButton.addEventListener('mouseout', () => {
            this.playerInfoButton.style.backgroundColor = '#333333';
            this.playerInfoButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.5)';
        });
        
        // Click effect
        this.playerInfoButton.addEventListener('mousedown', () => {
            this.playerInfoButton.style.transform = 'translateY(2px)';
            this.playerInfoButton.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.4)';
        });
        
        this.playerInfoButton.addEventListener('mouseup', () => {
            this.playerInfoButton.style.transform = 'translateY(0)';
            this.playerInfoButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.5)';
        });
        
        // Open player info modal when clicked
        this.playerInfoButton.addEventListener('click', () => {
            console.log('Player Info button clicked');
            if (!this.gameManager) {
                console.error('GameManager reference not available in UI');
                this.showNotification('Error: Game not fully initialized', 2000);
                return;
            }
            
            if (!this.gameManager.hero) {
                console.error('Hero reference not available in GameManager');
                this.showNotification('Error: Player character not available', 2000);
                return;
            }
            
            console.log('Opening player info modal. Hero stats:', this.gameManager.hero.stats);
            this.openPlayerInfoModal();
        });
        
        document.body.appendChild(this.playerInfoButton);
    }
    
    openPlayerInfoModal() {
        if (!this.gameManager || !this.gameManager.hero) {
            console.error("GameManager or Hero not available");
            this.showNotification("Player info not available", 2000);
            return;
        }
        
        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.style.position = 'fixed';
        modalBackdrop.style.top = '0';
        modalBackdrop.style.left = '0';
        modalBackdrop.style.width = '100%';
        modalBackdrop.style.height = '100%';
        modalBackdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        modalBackdrop.style.zIndex = '2000'; // Ensure it's above everything else
        modalBackdrop.style.display = 'flex';
        modalBackdrop.style.justifyContent = 'center';
        modalBackdrop.style.alignItems = 'center';
        
        // Create modal container - make it wider to accommodate inventory
        const modalContainer = document.createElement('div');
        modalContainer.style.width = '1000px';
        modalContainer.style.height = '600px';
        modalContainer.style.backgroundColor = '#222222';
        modalContainer.style.borderRadius = '10px';
        modalContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.8)';
        modalContainer.style.display = 'flex';
        modalContainer.style.flexDirection = 'row';
        modalContainer.style.overflow = 'hidden';
        modalContainer.style.border = '3px solid #444444';
        modalContainer.style.position = 'relative'; // Ensure proper stacking context
        
        // Create left side for 3D model view - make it smaller
        const modelViewContainer = document.createElement('div');
        modelViewContainer.style.width = '30%';
        modelViewContainer.style.height = '100%';
        modelViewContainer.style.backgroundColor = '#1a1a1a';
        modelViewContainer.style.display = 'flex';
        modelViewContainer.style.justifyContent = 'center';
        modelViewContainer.style.alignItems = 'center';
        modelViewContainer.style.position = 'relative';
        modelViewContainer.style.borderRight = '2px solid #444444';
        
        // Create canvas for 3D model (will be populated later)
        const modelCanvas = document.createElement('div');
        modelCanvas.id = 'player-model-view';
        modelCanvas.style.width = '90%';
        modelCanvas.style.height = '90%';
        modelCanvas.style.position = 'relative';
        
        // Create placeholder for 3D model if it can't be loaded
        modelCanvas.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #aaa; background-color: #111;">
                <div style="position: relative; width: 200px; height: 300px;">
                    <!-- Head -->
                    <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 60px; height: 60px; background-color: #2a2a2a; border-radius: 50%;"></div>
                    
                    <!-- Body -->
                    <div style="position: absolute; top: 60px; left: 50%; transform: translateX(-50%); width: 80px; height: 120px; background-color: #3333aa; border-radius: 10px;"></div>
                    
                    <!-- Arms -->
                    <div style="position: absolute; top: 70px; left: calc(50% - 70px); width: 30px; height: 100px; background-color: #2a2a2a; border-radius: 10px;"></div>
                    <div style="position: absolute; top: 70px; right: calc(50% - 70px); width: 30px; height: 100px; background-color: #2a2a2a; border-radius: 10px;"></div>
                    
                    <!-- Legs -->
                    <div style="position: absolute; top: 180px; left: calc(50% - 40px); width: 35px; height: 120px; background-color: #222; border-radius: 10px;"></div>
                    <div style="position: absolute; top: 180px; right: calc(50% - 40px); width: 35px; height: 120px; background-color: #222; border-radius: 10px;"></div>
                    
                    <!-- Bow -->
                    <div style="position: absolute; top: 100px; right: calc(50% - 110px); width: 80px; height: 15px; background-color: #8B4513; border-radius: 5px; transform: rotate(10deg);"></div>
                    <div style="position: absolute; top: 95px; right: calc(50% - 105px); width: 1px; height: 20px; background-color: #FFF; border-radius: 5px;"></div>
                </div>
                <div style="font-weight: bold; font-size: 24px; margin-top: 20px;">Player Character</div>
            </div>
        `;
        
        modelViewContainer.appendChild(modelCanvas);
        
        // Create middle section for stats
        const statsContainer = document.createElement('div');
        statsContainer.style.width = '35%';
        statsContainer.style.height = '100%';
        statsContainer.style.padding = '20px';
        statsContainer.style.boxSizing = 'border-box';
        statsContainer.style.overflowY = 'auto';
        statsContainer.style.color = 'white';
        statsContainer.style.fontFamily = 'Arial, sans-serif';
        statsContainer.style.borderRight = '2px solid #444444';
        
        // Populate stats
        this.populatePlayerStats(statsContainer);
        
        // Create right side for inventory
        const inventoryContainer = document.createElement('div');
        inventoryContainer.style.width = '35%';
        inventoryContainer.style.height = '100%';
        inventoryContainer.style.padding = '20px';
        inventoryContainer.style.boxSizing = 'border-box';
        inventoryContainer.style.overflowY = 'auto';
        inventoryContainer.style.color = 'white';
        inventoryContainer.style.fontFamily = 'Arial, sans-serif';
        
        // Populate inventory
        this.populatePlayerInventory(inventoryContainer);
        
        // Create close button
        const closeButton = document.createElement('div');
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.width = '30px';
        closeButton.style.height = '30px';
        closeButton.style.borderRadius = '50%';
        closeButton.style.backgroundColor = '#333';
        closeButton.style.display = 'flex';
        closeButton.style.justifyContent = 'center';
        closeButton.style.alignItems = 'center';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '18px';
        closeButton.style.fontWeight = 'bold';
        closeButton.style.zIndex = '2010'; // Higher than the backdrop
        closeButton.textContent = 'X';
        closeButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.5)';
        
        closeButton.addEventListener('mouseover', () => {
            closeButton.style.backgroundColor = '#555';
        });
        
        closeButton.addEventListener('mouseout', () => {
            closeButton.style.backgroundColor = '#333';
        });
        
        closeButton.addEventListener('click', () => {
            // Close modal
            document.body.removeChild(modalBackdrop);
            
            // Cleanup any Three.js instances if needed
            if (this.playerModelRenderer) {
                this.playerModelRenderer.dispose();
                this.playerModelRenderer = null;
            }
        });
        
        // Add components to modal
        modalContainer.appendChild(modelViewContainer);
        modalContainer.appendChild(statsContainer);
        modalContainer.appendChild(inventoryContainer);
        modalContainer.appendChild(closeButton);
        modalBackdrop.appendChild(modalContainer);
        
        // Add modal to document
        document.body.appendChild(modalBackdrop);
        
        // Initialize 3D model view
        this.initializePlayerModelView();
    }
    
    populatePlayerStats(container) {
        if (!this.gameManager || !this.gameManager.hero || !this.gameManager.hero.stats) {
            container.innerHTML = '<div style="text-align: center; padding: 20px;">No player data available</div>';
            return;
        }
        
        const hero = this.gameManager.hero;
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
        
        // Create header
        const header = document.createElement('div');
        header.style.fontSize = '24px';
        header.style.fontWeight = 'bold';
        header.style.marginBottom = '20px';
        header.style.textAlign = 'center';
        header.style.color = '#ffcc00';
        header.style.borderBottom = '2px solid #ffcc00';
        header.style.paddingBottom = '10px';
        header.textContent = 'Player Statistics';
        
        // Create stats sections
        const statsContent = document.createElement('div');
        
        // Health and Mana section
        const resourcesSection = this.createStatsSection('Resources');
        
        // Health bar
        const healthPercentage = (health / maxHealth) * 100;
        const healthBar = this.createProgressBar(healthPercentage, '#50C878', health, maxHealth, 'Health');
        resourcesSection.appendChild(healthBar);
        
        // Mana bar
        const manaPercentage = (mana / maxMana) * 100;
        const manaBar = this.createProgressBar(manaPercentage, '#3366ff', mana, maxMana, 'Mana');
        resourcesSection.appendChild(manaBar);
        
        // Combat stats section
        const combatSection = this.createStatsSection('Combat');
        
        const damageRow = this.createStatRow('Damage', damage.toFixed(1), '#ff6666');
        const attackSpeedRow = this.createStatRow('Attack Speed', `${attackSpeed.toFixed(1)}/s`, '#ff9966');
        const armorRow = this.createStatRow('Armor', `${armor.toFixed(1)}%`, '#ddcc77');
        const evasionRow = this.createStatRow('Evasion', `${evasion.toFixed(1)}%`, '#77dd77');
        
        combatSection.appendChild(damageRow);
        combatSection.appendChild(attackSpeedRow);
        combatSection.appendChild(armorRow);
        combatSection.appendChild(evasionRow);
        
        // Utility stats section
        const utilitySection = this.createStatsSection('Utility');
        
        const speedRow = this.createStatRow('Speed', speed.toFixed(1), '#66ccff');
        const healthRegenRow = this.createStatRow('Health Regen', `${(healthRegen * 60).toFixed(1)}/min`, '#ff7777');
        const manaRegenRow = this.createStatRow('Mana Regen', `${(manaRegen * 60).toFixed(1)}/min`, '#7777ff');
        const collectionRow = this.createStatRow('Collection', hero.collectionRadius.toFixed(1), '#66ff66');
        
        utilitySection.appendChild(speedRow);
        utilitySection.appendChild(healthRegenRow);
        utilitySection.appendChild(manaRegenRow);
        utilitySection.appendChild(collectionRow);
        
        // Add abilities section if the hero has abilities
        if (hero.abilities) {
            const abilitiesSection = this.createStatsSection('Abilities');
            
            if (hero.abilities.dash) {
                const dashRow = this.createStatRow('Dash', 'Unlocked', '#ffaa00');
                abilitiesSection.appendChild(dashRow);
            }
            
            if (hero.abilities.areaAttack) {
                const areaAttackRow = this.createStatRow('Area Attack', 'Unlocked', '#ffaa00');
                abilitiesSection.appendChild(areaAttackRow);
            }
            
            statsContent.appendChild(abilitiesSection);
        }
        
        // Add all sections to the container
        statsContent.appendChild(resourcesSection);
        statsContent.appendChild(combatSection);
        statsContent.appendChild(utilitySection);
        
        container.appendChild(header);
        container.appendChild(statsContent);
    }
    
    createStatsSection(title) {
        const section = document.createElement('div');
        section.style.marginBottom = '20px';
        
        const sectionTitle = document.createElement('div');
        sectionTitle.style.fontSize = '18px';
        sectionTitle.style.fontWeight = 'bold';
        sectionTitle.style.marginBottom = '10px';
        sectionTitle.style.color = '#cccccc';
        sectionTitle.style.borderBottom = '1px solid #444444';
        sectionTitle.style.paddingBottom = '5px';
        sectionTitle.textContent = title;
        
        section.appendChild(sectionTitle);
        return section;
    }
    
    createStatRow(label, value, color) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.marginBottom = '5px';
        row.style.padding = '5px';
        row.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        row.style.borderRadius = '3px';
        
        const labelElement = document.createElement('div');
        labelElement.textContent = label;
        
        const valueElement = document.createElement('div');
        valueElement.style.fontWeight = 'bold';
        valueElement.style.color = color || 'white';
        valueElement.textContent = value;
        
        row.appendChild(labelElement);
        row.appendChild(valueElement);
        
        return row;
    }
    
    createProgressBar(percentage, color, current, max, label) {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';
        
        const labelRow = document.createElement('div');
        labelRow.style.display = 'flex';
        labelRow.style.justifyContent = 'space-between';
        labelRow.style.marginBottom = '5px';
        
        const labelElement = document.createElement('div');
        labelElement.textContent = label;
        
        const valueElement = document.createElement('div');
        valueElement.style.fontWeight = 'bold';
        valueElement.textContent = `${Math.floor(current)}/${max}`;
        
        labelRow.appendChild(labelElement);
        labelRow.appendChild(valueElement);
        
        const barContainer = document.createElement('div');
        barContainer.style.height = '15px';
        barContainer.style.width = '100%';
        barContainer.style.backgroundColor = '#333333';
        barContainer.style.borderRadius = '3px';
        barContainer.style.overflow = 'hidden';
        
        const bar = document.createElement('div');
        bar.style.height = '100%';
        bar.style.width = `${percentage}%`;
        bar.style.backgroundColor = color;
        bar.style.borderRadius = '3px';
        bar.style.transition = 'width 0.3s ease-in-out';
        
        barContainer.appendChild(bar);
        container.appendChild(labelRow);
        container.appendChild(barContainer);
        
        return container;
    }
    
    initializePlayerModelView() {
        // This function would normally initialize a Three.js scene to show the player model
        // For now, we'll enhance the placeholder
        console.log('Player model view would be initialized here');
        
        // Get the canvas element
        const modelCanvas = document.getElementById('player-model-view');
        if (!modelCanvas) return;
        
        // Create a more detailed placeholder that shows the character silhouette
        modelCanvas.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #aaa; background-color: #111;">
                <div style="position: relative; width: 200px; height: 300px;">
                    <!-- Head -->
                    <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 60px; height: 60px; background-color: #2a2a2a; border-radius: 50%;"></div>
                    
                    <!-- Body -->
                    <div style="position: absolute; top: 60px; left: 50%; transform: translateX(-50%); width: 80px; height: 120px; background-color: #3333aa; border-radius: 10px;"></div>
                    
                    <!-- Arms -->
                    <div style="position: absolute; top: 70px; left: calc(50% - 70px); width: 30px; height: 100px; background-color: #2a2a2a; border-radius: 10px;"></div>
                    <div style="position: absolute; top: 70px; right: calc(50% - 70px); width: 30px; height: 100px; background-color: #2a2a2a; border-radius: 10px;"></div>
                    
                    <!-- Legs -->
                    <div style="position: absolute; top: 180px; left: calc(50% - 40px); width: 35px; height: 120px; background-color: #222; border-radius: 10px;"></div>
                    <div style="position: absolute; top: 180px; right: calc(50% - 40px); width: 35px; height: 120px; background-color: #222; border-radius: 10px;"></div>
                    
                    <!-- Bow -->
                    <div style="position: absolute; top: 100px; right: calc(50% - 110px); width: 80px; height: 15px; background-color: #8B4513; border-radius: 5px; transform: rotate(10deg);"></div>
                    <div style="position: absolute; top: 95px; right: calc(50% - 105px); width: 1px; height: 20px; background-color: #FFF; border-radius: 5px;"></div>
                </div>
                <div style="font-weight: bold; font-size: 24px; margin-top: 20px;">Player Character</div>
            </div>
        `;
    }
    
    createTurretIndicator() {
        // This method is intentionally empty to remove the turret ability indicator
        // from the bottom right corner of the screen
        
        // Set these to null to prevent errors in other methods that might try to use them
        this.turretAbilityContainer = null;
        this.turretAbilityIcon = null;
        this.turretCooldownText = null;
        this.turretCooldownOverlay = null;
    }
    
    updateTurretCooldown(remainingSeconds) {
        // Do nothing - turret indicator has been removed
        return;
    }
    
    updateTurretCooldownComplete() {
        // Do nothing - turret indicator has been removed
        return;
    }
    
    updateHealth(health, maxHealth) {
        const healthPercentage = (health / maxHealth) * 100;
        let healthColor = '#50C878'; // Green
        
        if (healthPercentage < 30) {
            healthColor = '#FF5555'; // Red
        } else if (healthPercentage < 70) {
            healthColor = '#FFA500'; // Orange
        }
        
        // Update health bar with metallic style
        this.healthDisplay.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #222222; border: 2px solid #444444; border-radius: 5px; box-sizing: border-box;"></div>
                <div style="position: absolute; top: 3px; left: 3px; width: calc(${healthPercentage}% - 6px); height: calc(100% - 6px); 
                    background: linear-gradient(to bottom, ${healthColor}, ${healthColor}AA); 
                    border-radius: 3px; 
                    box-shadow: 
                        inset 0 1px 0 rgba(255, 255, 255, 0.6),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.4);
                    "></div>
                <div style="position: absolute; top: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 14px; text-shadow: 1px 1px 2px #000; font-weight: bold;">
                    ${Math.floor(health)}/${maxHealth}
                </div>
            </div>
        `;
    }
    
    updateMana(mana, maxMana) {
        const manaPercentage = Math.floor((mana / maxMana) * 100);
        
        // Update mana bar with metallic style
        this.manaDisplay.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #222222; border: 2px solid #444444; border-radius: 5px; box-sizing: border-box;"></div>
                <div style="position: absolute; top: 3px; left: 3px; width: calc(${manaPercentage}% - 6px); height: calc(100% - 6px); 
                    background: linear-gradient(to bottom, #3366FF, #3355DDAA); 
                    border-radius: 3px; 
                    box-shadow: 
                        inset 0 1px 0 rgba(255, 255, 255, 0.6),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.4);
                    "></div>
                <div style="position: absolute; top: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 14px; text-shadow: 1px 1px 2px #000; font-weight: bold;">
                    ${Math.floor(mana)}/${maxMana}
                </div>
            </div>
        `;
    }
    
    updateAmmo(ammo) {
        // This method is retained but does nothing to prevent errors
        return;
    }
    
    generateAmmoIcons(ammo) {
        // This method is retained but does nothing to prevent errors
        return '';
    }
    
    updateWave(wave) {
        if (!this.waveCounter) return;
        
        // Add glow effect for higher waves
        let glowIntensity = '0px';
        let waveColor = '#FFFFFF';
        
        if (wave >= 10) {
            glowIntensity = '5px';
            waveColor = '#FF9900'; // Orange for higher waves
        }
        if (wave >= 20) {
            glowIntensity = '8px';
            waveColor = '#FF0000'; // Red for even higher waves
        }
        
        this.waveCounter.innerHTML = `
            <div>WAVE</div>
            <div style="font-size: 28px; margin-top: 2px; color: ${waveColor}; text-shadow: 0 0 ${glowIntensity} ${waveColor};">${wave}</div>
        `;
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
    
    showWaveCompletedNotification() {
        const notification = document.createElement('div');
        notification.style.position = 'absolute';
        notification.style.top = '80px'; // Increased from 60px to create a gap with the wave indicator
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        notification.style.color = '#FFFF00'; // Yellow
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.fontSize = '32px';
        notification.style.padding = '15px 30px';
        notification.style.borderRadius = '10px';
        notification.style.textAlign = 'center';
        notification.style.zIndex = '100';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.8s';
        notification.style.boxShadow = '0 0 20px rgba(255, 255, 0, 0.5)';
        
        notification.innerHTML = 'Wave Completed!';
        
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
            }, 800);
        }, 3000);
    }
    
    showNextWaveButtonHint() {
        // This method is intentionally empty to remove the hint message
    }
    
    removeNextWaveButtonHint() {
        const hint = document.getElementById('next-wave-hint');
        if (hint) {
            hint.style.opacity = '0';
            hint.style.transition = 'opacity 0.3s';
            
            setTimeout(() => {
                if (hint.parentNode) {
                    document.body.removeChild(hint);
                }
            }, 300);
        }
    }
    
    updateScore(score) {
        if (!this.scoreDisplay) return;
        this.scoreDisplay.innerHTML = `Score: ${score}`;
    }
    
    // Add a general notification method
    showNotification(message, duration = 2000) {
        // Static counter for gold notifications
        if (!this.goldNotificationCount) {
            this.goldNotificationCount = 0;
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.style.position = 'fixed';
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
        
        // Default starting position
        notification.style.top = '20%';
        
        // Check if this is a gold notification and style accordingly
        const isGoldNotification = message.includes('Gold');
        if (isGoldNotification) {
            notification.style.color = '#FFD700'; // Gold color
            notification.style.textShadow = '0 0 5px #996515'; // Gold shadow
            notification.style.borderLeft = '4px solid #FFD700';
            notification.style.borderRight = '4px solid #FFD700';
            
            // Add a gold coin icon if it's a gold reward notification
            if (message.includes('+')) {
                const goldAmount = message.split(' ')[0]; // Get the "+X" part
                message = `<div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <div style="background-color: #FFD700; width: 15px; height: 15px; border-radius: 50%;"></div>
                    ${goldAmount} Gold
                </div>`;
                notification.innerHTML = message;
                
                // For gold notifications, increment counter and position with offset
                this.goldNotificationCount++;
                const currentNotificationNumber = this.goldNotificationCount;
                const offset = (currentNotificationNumber - 1) * 50; // 50px spacing
                notification.style.top = `calc(20% + ${offset}px)`;
            } else {
                notification.textContent = message;
            }
        } else {
            notification.textContent = message;
        }
        
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
                    
                    // Decrement counter for gold notifications when a gold notification is removed
                    if (isGoldNotification && message.includes('+')) {
                        this.goldNotificationCount--;
                    }
                }
            }, 300);
        }, duration);
    }
    
    updatePlayerStats(hero) {
        if (!hero || !hero.stats) return;
        
        const { 
            mana,
            maxMana
        } = hero.stats;
        
        // Update mana display
        this.updateMana(mana, maxMana);
    }
    
    updateGold(gold) {
        if (!this.goldAmountDisplay) return;
        
        // Format the gold amount with commas for thousands
        const formattedGold = gold.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        this.goldAmountDisplay.textContent = formattedGold;
        
        // Add pulse effect when gold changes
        this.goldAmountDisplay.style.transform = 'scale(1.2)';
        this.goldAmountDisplay.style.transition = 'transform 0.2s ease-out';
        
        setTimeout(() => {
            if (this.goldAmountDisplay) {
                this.goldAmountDisplay.style.transform = 'scale(1)';
            }
        }, 200);
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
    
    cleanup() {
        // Remove main UI container
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        // Remove wave counter
        if (this.waveCounterContainer && this.waveCounterContainer.parentNode) {
            this.waveCounterContainer.parentNode.removeChild(this.waveCounterContainer);
        }
        
        // Remove player info button
        if (this.playerInfoButton && this.playerInfoButton.parentNode) {
            this.playerInfoButton.parentNode.removeChild(this.playerInfoButton);
        }
        
        // No need to try removing the turret ability UI since it doesn't exist
        
        // Remove any active notifications
        const notifications = document.querySelectorAll('.wave-notification, .notification');
        notifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        // Remove next wave button if it exists
        const nextWaveButton = document.getElementById('next-wave-button');
        if (nextWaveButton && nextWaveButton.parentNode) {
            nextWaveButton.parentNode.removeChild(nextWaveButton);
        }
        
        // Remove any tooltips
        this.removeTooltip();
    }
    
    populatePlayerInventory(container) {
        if (!this.gameManager || !this.gameManager.inventory) {
            container.innerHTML = '<div style="text-align: center; padding: 20px;">No inventory data available</div>';
            return;
        }
        
        const inventory = this.gameManager.inventory;
        
        // Create header
        const header = document.createElement('div');
        header.style.fontSize = '24px';
        header.style.fontWeight = 'bold';
        header.style.marginBottom = '20px';
        header.style.textAlign = 'center';
        header.style.color = '#ffcc00';
        header.style.borderBottom = '2px solid #ffcc00';
        header.style.paddingBottom = '10px';
        header.textContent = 'Inventory';
        container.appendChild(header);
        
        // Create inventory sections
        
        // Items section (wearable items)
        const itemsSection = document.createElement('div');
        itemsSection.style.marginBottom = '25px';
        
        const itemsTitle = document.createElement('div');
        itemsTitle.style.fontSize = '18px';
        itemsTitle.style.fontWeight = 'bold';
        itemsTitle.style.marginBottom = '10px';
        itemsTitle.style.color = '#cccccc';
        itemsTitle.style.borderBottom = '1px solid #444444';
        itemsTitle.style.paddingBottom = '5px';
        itemsTitle.textContent = 'Equipment';
        itemsSection.appendChild(itemsTitle);
        
        // Create item slots grid
        const itemSlotsGrid = document.createElement('div');
        itemSlotsGrid.style.display = 'grid';
        itemSlotsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        itemSlotsGrid.style.gap = '10px';
        
        // Add item slots
        const { itemSlots } = inventory;
        for (let i = 0; i < itemSlots.length; i++) {
            const item = itemSlots[i];
            const slot = this.createInventorySlot(item);
            itemSlotsGrid.appendChild(slot);
        }
        
        itemsSection.appendChild(itemSlotsGrid);
        container.appendChild(itemsSection);
        
        // Consumables section
        const consumablesSection = document.createElement('div');
        consumablesSection.style.marginBottom = '25px';
        
        const consumablesTitle = document.createElement('div');
        consumablesTitle.style.fontSize = '18px';
        consumablesTitle.style.fontWeight = 'bold';
        consumablesTitle.style.marginBottom = '10px';
        consumablesTitle.style.color = '#cccccc';
        consumablesTitle.style.borderBottom = '1px solid #444444';
        consumablesTitle.style.paddingBottom = '5px';
        consumablesTitle.textContent = 'Consumables';
        consumablesSection.appendChild(consumablesTitle);
        
        // Create consumable slots grid
        const consumableSlotsGrid = document.createElement('div');
        consumableSlotsGrid.style.display = 'grid';
        consumableSlotsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        consumableSlotsGrid.style.gap = '10px';
        
        // Add consumable slots
        const { consumableSlots } = inventory;
        for (let i = 0; i < consumableSlots.length; i++) {
            const item = consumableSlots[i];
            const slot = this.createInventorySlot(item);
            consumableSlotsGrid.appendChild(slot);
        }
        
        consumablesSection.appendChild(consumableSlotsGrid);
        container.appendChild(consumablesSection);
        
        // Abilities section
        const abilitiesSection = document.createElement('div');
        
        const abilitiesTitle = document.createElement('div');
        abilitiesTitle.style.fontSize = '18px';
        abilitiesTitle.style.fontWeight = 'bold';
        abilitiesTitle.style.marginBottom = '10px';
        abilitiesTitle.style.color = '#cccccc';
        abilitiesTitle.style.borderBottom = '1px solid #444444';
        abilitiesTitle.style.paddingBottom = '5px';
        abilitiesTitle.textContent = 'Abilities';
        abilitiesSection.appendChild(abilitiesTitle);
        
        // Create abilities slots grid
        const abilitySlotsGrid = document.createElement('div');
        abilitySlotsGrid.style.display = 'grid';
        abilitySlotsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        abilitySlotsGrid.style.gap = '10px';
        
        // Add ability slots
        const { abilitySlots } = inventory;
        for (let i = 0; i < abilitySlots.length; i++) {
            const item = abilitySlots[i];
            const slot = this.createInventorySlot(item);
            abilitySlotsGrid.appendChild(slot);
        }
        
        abilitiesSection.appendChild(abilitySlotsGrid);
        container.appendChild(abilitiesSection);
    }
    
    createInventorySlot(item) {
        const slot = document.createElement('div');
        slot.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        slot.style.border = '2px solid #444444';
        slot.style.borderRadius = '5px';
        slot.style.height = '60px';
        slot.style.padding = '5px';
        slot.style.display = 'flex';
        slot.style.flexDirection = 'column';
        slot.style.alignItems = 'center';
        slot.style.justifyContent = 'center';
        slot.style.position = 'relative';
        slot.style.transition = 'all 0.2s ease';
        
        // Add hover effect
        slot.addEventListener('mouseenter', () => {
            slot.style.backgroundColor = 'rgba(255, 204, 0, 0.2)';
            slot.style.border = '2px solid #ffcc00';
            slot.style.transform = 'scale(1.05)';
        });
        
        slot.addEventListener('mouseleave', () => {
            slot.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
            slot.style.border = '2px solid #444444';
            slot.style.transform = 'scale(1)';
        });
        
        if (item) {
            // Item color based on rarity
            const rarityColors = {
                common: '#aaaaaa',
                uncommon: '#55aa55',
                rare: '#5555ff',
                epic: '#aa55aa',
                legendary: '#ffaa00'
            };
            
            const rarityColor = rarityColors[item.rarity] || '#aaaaaa';
            
            // Item icon/visual representation
            const itemIcon = document.createElement('div');
            itemIcon.style.width = '30px';
            itemIcon.style.height = '30px';
            itemIcon.style.backgroundColor = item.color || rarityColor;
            itemIcon.style.borderRadius = '5px';
            itemIcon.style.marginBottom = '5px';
            
            // Display icon based on type
            const iconType = item.icon || 'default';
            let iconContent = '?';
            
            switch (iconType) {
                case 'sword':
                    iconContent = '⚔️';
                    break;
                case 'shield':
                    iconContent = '🛡️';
                    break;
                case 'heart':
                    iconContent = '❤️';
                    break;
                case 'potion':
                    iconContent = '🧪';
                    break;
                case 'bow':
                    iconContent = '🏹';
                    break;
                case 'wand':
                    iconContent = '🪄';
                    break;
                case 'boots':
                    iconContent = '👢';
                    break;
                case 'amulet':
                    iconContent = '📿';
                    break;
                default:
                    iconContent = '?';
                    break;
            }
            
            itemIcon.style.display = 'flex';
            itemIcon.style.justifyContent = 'center';
            itemIcon.style.alignItems = 'center';
            itemIcon.style.fontSize = '18px';
            itemIcon.textContent = iconContent;
            
            // Item name
            const itemName = document.createElement('div');
            itemName.style.fontSize = '12px';
            itemName.style.color = rarityColor;
            itemName.style.whiteSpace = 'nowrap';
            itemName.style.overflow = 'hidden';
            itemName.style.textOverflow = 'ellipsis';
            itemName.style.width = '100%';
            itemName.style.textAlign = 'center';
            itemName.textContent = item.name;
            
            slot.appendChild(itemIcon);
            slot.appendChild(itemName);
            
            // Add tooltip on hover - more detailed version that matches bottom UI
            slot.addEventListener('mouseenter', () => {
                // Create tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'item-tooltip';
                tooltip.style.position = 'absolute';
                tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
                tooltip.style.color = 'white';
                tooltip.style.padding = '10px';
                tooltip.style.borderRadius = '5px';
                tooltip.style.width = '200px';
                tooltip.style.zIndex = '2500';
                tooltip.style.pointerEvents = 'none';
                tooltip.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
                tooltip.style.border = '1px solid #555';
                tooltip.id = 'inventory-tooltip';
                
                // Get position of the slot
                const slotRect = slot.getBoundingClientRect();
                
                // Position the tooltip above the slot
                tooltip.style.bottom = `${window.innerHeight - slotRect.top + 5}px`;
                tooltip.style.left = `${slotRect.left + slotRect.width / 2 - 100}px`;
                
                // Item name
                const name = document.createElement('div');
                name.style.fontSize = '16px';
                name.style.fontWeight = 'bold';
                name.style.color = '#ffcc00';
                name.style.marginBottom = '5px';
                name.textContent = item.name;
                tooltip.appendChild(name);
                
                // Item description
                const desc = document.createElement('div');
                desc.style.fontSize = '14px';
                desc.style.color = '#cccccc';
                desc.style.marginBottom = '5px';
                desc.textContent = item.description || 'No description';
                tooltip.appendChild(desc);
                
                // Item stats
                if (item.stats) {
                    const stats = document.createElement('div');
                    stats.style.fontSize = '13px';
                    stats.style.color = '#aaffaa';
                    stats.style.marginTop = '5px';
                    
                    Object.entries(item.stats).forEach(([key, value]) => {
                        // Choose color based on stat type
                        let statColor = '#aaffaa';
                        if (key.includes('damage')) statColor = '#ff6666';
                        if (key.includes('health')) statColor = '#66cc66';
                        if (key.includes('mana')) statColor = '#6666ff';
                        if (key.includes('speed')) statColor = '#66ccff';
                        if (key.includes('armor')) statColor = '#ddcc77';
                        
                        const statText = document.createElement('div');
                        // Format stat name
                        let formattedStat = key.replace(/([A-Z])/g, ' $1').toLowerCase();
                        formattedStat = formattedStat.charAt(0).toUpperCase() + formattedStat.slice(1);
                        
                        // Format values with + sign for positive values
                        const formattedValue = value > 0 ? `+${value}` : value;
                        
                        statText.innerHTML = `${formattedStat}: <span style="color: ${statColor};">${formattedValue}</span>`;
                        stats.appendChild(statText);
                    });
                    
                    tooltip.appendChild(stats);
                }
                
                // Rarity
                if (item.rarity) {
                    const rarity = document.createElement('div');
                    rarity.style.fontSize = '12px';
                    rarity.style.marginTop = '5px';
                    
                    // Set color based on rarity
                    switch(item.rarity) {
                        case 'uncommon':
                            rarity.style.color = '#00cc00';
                            break;
                        case 'rare':
                            rarity.style.color = '#0066ff';
                            break;
                        case 'epic':
                            rarity.style.color = '#aa00ff';
                            break;
                        case 'legendary':
                            rarity.style.color = '#ff9900';
                            break;
                        default:
                            rarity.style.color = '#aaaaaa';
                    }
                    
                    rarity.textContent = `${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}`;
                    tooltip.appendChild(rarity);
                }
                
                // Type
                if (item.type) {
                    const typeElem = document.createElement('div');
                    typeElem.style.fontSize = '12px';
                    typeElem.style.color = '#aaaaaa';
                    typeElem.style.marginTop = '3px';
                    typeElem.textContent = `Type: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`;
                    tooltip.appendChild(typeElem);
                }
                
                // Consumable indicator
                if (item.consumable) {
                    const consumable = document.createElement('div');
                    consumable.style.fontSize = '12px';
                    consumable.style.color = '#ff5555';
                    consumable.style.marginTop = '3px';
                    consumable.textContent = 'Consumable - used once';
                    tooltip.appendChild(consumable);
                }
                
                document.body.appendChild(tooltip);
            });
            
            slot.addEventListener('mouseleave', () => {
                const tooltip = document.getElementById('inventory-tooltip');
                if (tooltip) {
                    document.body.removeChild(tooltip);
                }
            });
        } else {
            // Empty slot
            const emptyText = document.createElement('div');
            emptyText.style.color = '#555555';
            emptyText.style.fontSize = '12px';
            emptyText.textContent = 'Empty';
            slot.appendChild(emptyText);
        }
        
        return slot;
    }
    
    // New function for ability cooldown indicators
    createAbilityCooldownIndicator(slotElement) {
        if (!slotElement) return;
        
        // Create cooldown overlay
        const cooldownOverlay = document.createElement('div');
        cooldownOverlay.style.position = 'absolute';
        cooldownOverlay.style.top = '0';
        cooldownOverlay.style.left = '0';
        cooldownOverlay.style.width = '100%';
        cooldownOverlay.style.height = '100%';
        cooldownOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        cooldownOverlay.style.borderRadius = '5px';
        cooldownOverlay.style.display = 'none';
        cooldownOverlay.style.zIndex = '2'; // Above the item, below the keybind
        cooldownOverlay.dataset.isCooldownOverlay = 'true';
        
        // Create cooldown text
        const cooldownText = document.createElement('div');
        cooldownText.style.position = 'absolute';
        cooldownText.style.top = '50%';
        cooldownText.style.left = '50%';
        cooldownText.style.transform = 'translate(-50%, -50%)';
        cooldownText.style.color = 'white';
        cooldownText.style.fontSize = '18px';
        cooldownText.style.fontWeight = 'bold';
        cooldownText.style.textShadow = '0 0 3px black';
        cooldownText.style.zIndex = '3';
        cooldownText.dataset.isCooldownText = 'true';
        
        cooldownOverlay.appendChild(cooldownText);
        slotElement.appendChild(cooldownOverlay);
        
        return { cooldownOverlay, cooldownText };
    }
    
    updateAbilityCooldown(slotElement, remainingSeconds, totalCooldown) {
        if (!slotElement) return;
        
        // Find or create cooldown overlay
        let cooldownOverlay = slotElement.querySelector('[data-is-cooldown-overlay="true"]');
        let cooldownText = cooldownOverlay?.querySelector('[data-is-cooldown-text="true"]');
        
        if (!cooldownOverlay) {
            const cooldownElements = this.createAbilityCooldownIndicator(slotElement);
            cooldownOverlay = cooldownElements.cooldownOverlay;
            cooldownText = cooldownElements.cooldownText;
        }
        
        // Show cooldown overlay
        cooldownOverlay.style.display = 'block';
        
        // Update cooldown text
        cooldownText.textContent = `${Math.ceil(remainingSeconds)}`;
        
        // Calculate fill percentage (100% at start of cooldown, 0% at end)
        const percentage = (remainingSeconds / totalCooldown) * 100;
        
        // Keep overlay at full size but adjust opacity for visual effect
        cooldownOverlay.style.opacity = percentage / 100 * 0.8 + 0.2; // Range from 0.2 to 1.0
    }
    
    completeAbilityCooldown(slotElement) {
        if (!slotElement) return;
        
        // Find cooldown overlay
        const cooldownOverlay = slotElement.querySelector('[data-is-cooldown-overlay="true"]');
        if (!cooldownOverlay) return;
        
        // Hide cooldown overlay
        cooldownOverlay.style.display = 'none';
    }
} 