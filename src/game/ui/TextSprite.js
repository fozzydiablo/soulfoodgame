import * as THREE from 'three';

export class TextSprite {
    constructor(text, options = {}) {
        // Default options
        this.options = Object.assign({
            fontFace: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            color: 0xffffff,
            backgroundColor: 0x000000,
            backgroundOpacity: 0.5,
            size: 1,
            padding: 10,
            outline: false,
            outlineColor: 0x000000,
            outlineWidth: 4
        }, options);
        
        this.text = text;
        this.sprite = this.createTextSprite();
        
        return this.sprite;
    }
    
    createTextSprite() {
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set font
        const fontStyle = `${this.options.fontWeight} ${this.options.fontSize}px ${this.options.fontFace}`;
        context.font = fontStyle;
        
        // Measure text width
        const textWidth = context.measureText(this.text).width;
        
        // Set canvas size with padding
        canvas.width = textWidth + this.options.padding * 2;
        canvas.height = this.options.fontSize + this.options.padding * 2;
        
        // Background
        context.fillStyle = `rgba(${(this.options.backgroundColor >> 16) & 255}, ${(this.options.backgroundColor >> 8) & 255}, ${this.options.backgroundColor & 255}, ${this.options.backgroundOpacity})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        context.font = fontStyle;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Add outline if enabled
        if (this.options.outline) {
            context.strokeStyle = `rgb(${(this.options.outlineColor >> 16) & 255}, ${(this.options.outlineColor >> 8) & 255}, ${this.options.outlineColor & 255})`;
            context.lineWidth = this.options.outlineWidth;
            context.strokeText(this.text, canvas.width / 2, canvas.height / 2);
        }
        
        // Fill text
        context.fillStyle = `rgb(${(this.options.color >> 16) & 255}, ${(this.options.color >> 8) & 255}, ${this.options.color & 255})`;
        context.fillText(this.text, canvas.width / 2, canvas.height / 2);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        
        // Create sprite material
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        
        // Create sprite
        const sprite = new THREE.Sprite(material);
        
        // Set size based on options
        const aspectRatio = canvas.width / canvas.height;
        sprite.scale.set(this.options.size * aspectRatio, this.options.size, 1);
        
        return sprite;
    }
    
    // Helper method to create text sprites quickly
    static createText(text, position, options = {}) {
        const sprite = new TextSprite(text, options);
        sprite.position.copy(position);
        return sprite;
    }
} 