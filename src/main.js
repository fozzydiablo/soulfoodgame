import * as THREE from 'three';
import { GameManager } from './game/GameManager.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

// Add fog for a more immersive feeling
scene.fog = new THREE.FogExp2(0x87CEEB, 0.01);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Basic lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Directional light (sun)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 15, 10);
directionalLight.castShadow = true;

// Improve shadow quality
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;

scene.add(directionalLight);

// Camera position and angle
camera.position.set(0, 30, 12);
camera.lookAt(0, 0, 0);

// Set camera field of view to a wider angle
camera.fov = 70;
camera.updateProjectionMatrix();

// Ground
const groundSize = 40;
const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 32, 32);

// Create a Minecraft-like grass texture with code
const groundCanvas = document.createElement('canvas');
groundCanvas.width = 256;
groundCanvas.height = 256;
const groundContext = groundCanvas.getContext('2d');

// Draw grass texture
groundContext.fillStyle = '#7CFC00';  // Bright green base
groundContext.fillRect(0, 0, 256, 256);

// Add some variation to make it look more natural
for (let i = 0; i < 1000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const size = 2 + Math.random() * 4;
    
    groundContext.fillStyle = Math.random() > 0.5 ? '#5EBB00' : '#90EE90';
    groundContext.fillRect(x, y, size, size);
}

const groundTexture = new THREE.CanvasTexture(groundCanvas);
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(10, 10);

const groundMaterial = new THREE.MeshStandardMaterial({ 
    map: groundTexture,
    side: THREE.DoubleSide
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Initialize game manager
const gameManager = new GameManager(scene, camera);

// Game loop
function animate() {
    requestAnimationFrame(animate);
    gameManager.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the game
animate(); 