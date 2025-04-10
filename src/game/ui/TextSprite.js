import * as THREE from 'three';

export class TextSprite {
    constructor(text, options = {}) {
        // Default options
        this.options = Object.assign({
            fontFace: 'Arial',
            fontSize: 96, // Much larger default font size
            fontWeight: 'bold',
            color: 0xffffff,
            backgroundColor: 0x000000,
            backgroundOpacity: 0,  // Set default to transparent
            size: 1,
            padding: 24, // Increased padding
            outline: false,
            outlineColor: 0x000000,
            outlineWidth: 6  // Increased outline width
        }, options);
        
        // Handle textColor if provided (for backward compatibility)
        if (options.textColor) {
            if (typeof options.textColor === 'object' && options.textColor.r !== undefined) {
                // Convert RGB object to hex
                this.options.color = (options.textColor.r * 255) << 16 | 
                                    (options.textColor.g * 255) << 8 | 
                                    (options.textColor.b * 255);
            } else {
                this.options.color = options.textColor;
            }
        }
        
        // Handle borderColor if provided
        if (options.borderColor) {
            this.options.outline = true;
            if (typeof options.borderColor === 'object' && options.borderColor.r !== undefined) {
                // Convert RGB object to hex
                this.options.outlineColor = (options.borderColor.r * 255) << 16 | 
                                           (options.borderColor.g * 255) << 8 | 
                                           (options.borderColor.b * 255);
            } else {
                this.options.outlineColor = options.borderColor;
            }
        }
        
        // Handle borderWidth if provided
        if (options.borderWidth !== undefined) {
            this.options.outlineWidth = options.borderWidth;
        }
        
        this.text = text;
        this.sprite = this.createTextSprite();
        
        return this.sprite;
    }
    
    createTextSprite() {
        // Create canvas with higher resolution for better text quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Use an even larger canvas size for higher resolution text
        const fontSizePixels = this.options.fontSize;
        
        // Set font with pixel size
        const fontStyle = `${this.options.fontWeight} ${fontSizePixels}px ${this.options.fontFace}`;
        context.font = fontStyle;
        
        // Measure text dimensions
        const textMetrics = context.measureText(this.text);
        const textWidth = textMetrics.width;
        
        // Calculate a reasonable height (this is approximate since measureText doesn't give height)
        const textHeight = fontSizePixels * 1.4; // Increased height factor for better spacing
        
        // Set canvas size with padding - use power of 2 sizes for better texture performance
        // Add extra padding for larger text
        const extraPadding = fontSizePixels * 0.5; // Extra padding based on font size
        let canvasWidth = Math.pow(2, Math.ceil(Math.log2(textWidth + this.options.padding * 2 + extraPadding)));
        let canvasHeight = Math.pow(2, Math.ceil(Math.log2(textHeight + this.options.padding * 2 + extraPadding)));
        
        // Set canvas dimensions - ensure canvas is large enough
        canvas.width = Math.max(canvasWidth, 512);  // Minimum 512px width for large text
        canvas.height = Math.max(canvasHeight, 256); // Minimum 256px height for large text
        
        // Clear background first
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Add background if opacity > 0
        if (this.options.backgroundOpacity > 0) {
            context.fillStyle = `rgba(${(this.options.backgroundColor >> 16) & 255}, ${(this.options.backgroundColor >> 8) & 255}, ${this.options.backgroundColor & 255}, ${this.options.backgroundOpacity})`;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Reset font after canvas resize (canvas operations can reset context)
        context.font = fontStyle;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Add outline if enabled - draw multiple strokes for better visibility
        if (this.options.outline) {
            context.strokeStyle = `rgb(${(this.options.outlineColor >> 16) & 255}, ${(this.options.outlineColor >> 8) & 255}, ${this.options.outlineColor & 255})`;
            context.lineWidth = this.options.outlineWidth;
            
            // Draw multiple strokes for better visibility - more passes for larger text
            for (let i = 0; i < 5; i++) {
                context.strokeText(this.text, canvas.width / 2, canvas.height / 2);
            }
        }
        
        // Fill text
        context.fillStyle = `rgb(${(this.options.color >> 16) & 255}, ${(this.options.color >> 8) & 255}, ${this.options.color & 255})`;
        context.fillText(this.text, canvas.width / 2, canvas.height / 2);
        
        // Debug - draw border to see canvas bounds
        // context.strokeStyle = 'red';
        // context.lineWidth = 1;
        // context.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Create texture with antialiasing
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        
        // Create sprite material
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        
        // Create sprite
        const sprite = new THREE.Sprite(material);
        
        // Set size based on options and aspect ratio
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