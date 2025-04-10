export class ShopUI {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.isVisible = false;
        this.shopItems = [];
        
        // Create shop UI elements (but don't add them to DOM yet)
        this.createShopUI();
    }
    
    createShopUI() {
        // Create the shop container
        this.container = document.createElement('div');
        this.container.id = 'shop-ui';
        this.container.style.position = 'fixed';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.width = '600px';
        this.container.style.maxHeight = '80vh';
        this.container.style.backgroundColor = 'rgba(20, 20, 20, 0.9)';
        this.container.style.color = 'white';
        this.container.style.padding = '20px';
        this.container.style.borderRadius = '10px';
        this.container.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        this.container.style.zIndex = '1000';
        this.container.style.display = 'none';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.overflow = 'auto';
        this.container.style.border = '2px solid #884400';
        
        // Create shop header
        const header = document.createElement('div');
        header.style.width = '100%';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '20px';
        header.style.borderBottom = '2px solid #884400';
        header.style.paddingBottom = '10px';
        
        // Shop title
        const title = document.createElement('h2');
        title.textContent = 'SHOP';
        title.style.margin = '0';
        title.style.fontSize = '28px';
        title.style.color = '#FFD700';
        title.style.fontFamily = 'Arial, sans-serif';
        title.style.textShadow = '2px 2px 2px rgba(0, 0, 0, 0.5)';
        
        // Gold display
        this.goldDisplay = document.createElement('div');
        this.goldDisplay.style.display = 'flex';
        this.goldDisplay.style.alignItems = 'center';
        this.goldDisplay.style.gap = '8px';
        this.goldDisplay.style.fontSize = '20px';
        this.goldDisplay.style.color = '#FFD700';
        
        // Gold icon
        const goldIcon = document.createElement('div');
        goldIcon.style.width = '16px';
        goldIcon.style.height = '16px';
        goldIcon.style.borderRadius = '50%';
        goldIcon.style.backgroundColor = '#FFD700';
        goldIcon.style.boxShadow = '0 0 5px #FFD700';
        
        // Gold amount
        this.goldAmount = document.createElement('span');
        this.goldAmount.textContent = this.gameManager.gameState.resources.gold || 0;
        
        // Add gold icon and amount to gold display
        this.goldDisplay.appendChild(goldIcon);
        this.goldDisplay.appendChild(this.goldAmount);
        
        // Add title and gold display to header
        header.appendChild(title);
        header.appendChild(this.goldDisplay);
        
        // Create items container
        this.itemsContainer = document.createElement('div');
        this.itemsContainer.style.width = '100%';
        this.itemsContainer.style.display = 'grid';
        this.itemsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        this.itemsContainer.style.gap = '15px';
        this.itemsContainer.style.marginBottom = '20px';
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'CLOSE';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#884400';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.fontSize = '16px';
        closeButton.style.fontWeight = 'bold';
        closeButton.style.cursor = 'pointer';
        closeButton.style.marginTop = '10px';
        closeButton.style.transition = 'background-color 0.2s';
        
        // Close button hover effect
        closeButton.addEventListener('mouseover', () => {
            closeButton.style.backgroundColor = '#AA5500';
        });
        closeButton.addEventListener('mouseout', () => {
            closeButton.style.backgroundColor = '#884400';
        });
        
        // Close button click event
        closeButton.addEventListener('click', () => {
            this.hide();
        });
        
        // Add elements to container
        this.container.appendChild(header);
        this.container.appendChild(this.itemsContainer);
        this.container.appendChild(closeButton);
        
        // Add to document
        document.body.appendChild(this.container);
        
        // Add ESC key listener to close shop
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }
    
    createItemCard(item) {
        // Create item card container
        const card = document.createElement('div');
        card.className = 'shop-item';
        card.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
        card.style.borderRadius = '8px';
        card.style.padding = '15px';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.style.border = '1px solid #555555';
        card.style.transition = 'all 0.2s ease';
        
        // Create item icon
        const iconContainer = document.createElement('div');
        iconContainer.style.width = '50px';
        iconContainer.style.height = '50px';
        iconContainer.style.backgroundColor = item.color || '#999999';
        iconContainer.style.borderRadius = '8px';
        iconContainer.style.display = 'flex';
        iconContainer.style.justifyContent = 'center';
        iconContainer.style.alignItems = 'center';
        iconContainer.style.marginBottom = '10px';
        
        // Add icon based on item type
        const iconSymbol = this.getIconSymbol(item.icon);
        iconContainer.innerHTML = iconSymbol;
        
        // Create item name
        const name = document.createElement('h3');
        name.textContent = item.name;
        name.style.margin = '0 0 8px 0';
        name.style.fontSize = '18px';
        name.style.textAlign = 'center';
        name.style.color = '#FFFFFF';
        
        // Create item description
        const description = document.createElement('p');
        description.textContent = item.description;
        description.style.margin = '0 0 15px 0';
        description.style.fontSize = '14px';
        description.style.textAlign = 'center';
        description.style.color = '#CCCCCC';
        description.style.minHeight = '40px';
        
        // Create price display
        const priceContainer = document.createElement('div');
        priceContainer.style.display = 'flex';
        priceContainer.style.alignItems = 'center';
        priceContainer.style.gap = '5px';
        priceContainer.style.marginBottom = '10px';
        
        // Gold coin icon
        const coinIcon = document.createElement('div');
        coinIcon.style.width = '12px';
        coinIcon.style.height = '12px';
        coinIcon.style.borderRadius = '50%';
        coinIcon.style.backgroundColor = '#FFD700';
        coinIcon.style.boxShadow = '0 0 3px #FFD700';
        
        // Price amount
        const price = document.createElement('span');
        price.textContent = item.price;
        price.style.color = '#FFD700';
        price.style.fontSize = '16px';
        price.style.fontWeight = 'bold';
        
        priceContainer.appendChild(coinIcon);
        priceContainer.appendChild(price);
        
        // Create buy button
        const buyButton = document.createElement('button');
        buyButton.textContent = 'BUY';
        buyButton.style.padding = '8px 15px';
        buyButton.style.backgroundColor = '#228822';
        buyButton.style.color = 'white';
        buyButton.style.border = 'none';
        buyButton.style.borderRadius = '5px';
        buyButton.style.fontSize = '14px';
        buyButton.style.fontWeight = 'bold';
        buyButton.style.cursor = 'pointer';
        buyButton.style.transition = 'background-color 0.2s';
        
        // Check if player can afford this item
        const canAfford = this.gameManager.gameState.resources.gold >= item.price;
        if (!canAfford) {
            buyButton.style.backgroundColor = '#555555';
            buyButton.style.cursor = 'not-allowed';
            buyButton.style.opacity = '0.7';
        }
        
        // Buy button hover effect (only if can afford)
        buyButton.addEventListener('mouseover', () => {
            if (canAfford) {
                buyButton.style.backgroundColor = '#33AA33';
            }
        });
        buyButton.addEventListener('mouseout', () => {
            if (canAfford) {
                buyButton.style.backgroundColor = '#228822';
            }
        });
        
        // Buy button click event
        buyButton.addEventListener('click', () => {
            if (canAfford) {
                this.gameManager.shopManager.purchaseItem(item.id);
                this.updateGoldDisplay();
                
                // Update affordability for all items
                this.updateItemAffordability();
            }
        });
        
        // Card hover effect
        card.addEventListener('mouseover', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
            card.style.borderColor = item.color || '#777777';
        });
        
        card.addEventListener('mouseout', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
            card.style.borderColor = '#555555';
        });
        
        // Add all elements to card
        card.appendChild(iconContainer);
        card.appendChild(name);
        card.appendChild(description);
        card.appendChild(priceContainer);
        card.appendChild(buyButton);
        
        // Store reference to buy button for updating
        card.buyButton = buyButton;
        card.itemId = item.id;
        card.itemPrice = item.price;
        
        return card;
    }
    
    getIconSymbol(iconType) {
        // Return unicode or SVG icons based on item type
        switch (iconType) {
            case 'heart':
                return '❤️';
            case 'sword':
                return '⚔️';
            case 'boots':
                return '👢';
            case 'shield':
                return '🛡️';
            case 'bow':
                return '🏹';
            case 'heart-pulse':
                return '💓';
            default:
                return '📦';
        }
    }
    
    updateGoldDisplay() {
        if (this.goldAmount) {
            this.goldAmount.textContent = this.gameManager.gameState.resources.gold || 0;
        }
    }
    
    updateItemAffordability() {
        // Find all item cards and update their buy buttons
        const cards = this.itemsContainer.querySelectorAll('.shop-item');
        cards.forEach(card => {
            const canAfford = this.gameManager.gameState.resources.gold >= card.itemPrice;
            
            if (canAfford) {
                card.buyButton.style.backgroundColor = '#228822';
                card.buyButton.style.cursor = 'pointer';
                card.buyButton.style.opacity = '1';
                
                // Reinstall hover events
                card.buyButton.onmouseover = () => {
                    card.buyButton.style.backgroundColor = '#33AA33';
                };
                card.buyButton.onmouseout = () => {
                    card.buyButton.style.backgroundColor = '#228822';
                };
            } else {
                card.buyButton.style.backgroundColor = '#555555';
                card.buyButton.style.cursor = 'not-allowed';
                card.buyButton.style.opacity = '0.7';
                
                // Remove hover events
                card.buyButton.onmouseover = null;
                card.buyButton.onmouseout = null;
            }
        });
    }
    
    show(shopItems, shopTitle = 'SHOP') {
        // Store shop items
        this.shopItems = shopItems;
        
        // Update the shop title
        const title = this.container.querySelector('h2');
        if (title) {
            title.textContent = shopTitle;
        }
        
        // Update gold display
        this.updateGoldDisplay();
        
        // Clear existing items
        this.itemsContainer.innerHTML = '';
        
        // Create item cards
        shopItems.forEach(item => {
            const card = this.createItemCard(item);
            this.itemsContainer.appendChild(card);
        });
        
        // Show the container
        this.container.style.display = 'flex';
        this.isVisible = true;
        
        // Update affordability state for all items
        this.updateItemAffordability();
    }
    
    hide() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        
        // Animate out
        this.container.style.opacity = '0';
        this.container.style.transform = 'translate(-50%, -50%) scale(0.9)';
        
        // Hide after animation
        setTimeout(() => {
            this.container.style.display = 'none';
            // Reset transform to default state to avoid issues when reopening
            this.container.style.transform = 'translate(-50%, -50%)';
            this.container.style.opacity = '1';
        }, 300);
    }
} 