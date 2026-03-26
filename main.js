
import * as THREE from 'three';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xf0f0f0); // Set a light gray background
document.body.appendChild(renderer.domElement);

// Materials
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

// House Group
const house = new THREE.Group();

// House Body
const bodyGeometry = new THREE.BoxGeometry(2, 2, 2);
const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
const body = new THREE.LineSegments(bodyEdges, lineMaterial);
house.add(body);

// Roof
const roofGeometry = new THREE.ConeGeometry(1.5, 1, 4);
const roofEdges = new THREE.EdgesGeometry(roofGeometry);
const roof = new THREE.LineSegments(roofEdges, lineMaterial);
roof.position.y = 1.5;
// roof.rotation.y = Math.PI / 4; // Removed rotation for simpler window placement
house.add(roof);

// Windows
// Round window on the roof
const roundWindowGeometry = new THREE.CircleGeometry(0.2, 32);
const roundWindowEdges = new THREE.EdgesGeometry(roundWindowGeometry);
const roundWindow = new THREE.LineSegments(roundWindowEdges, lineMaterial);
roundWindow.position.set(0, 1.8, 1.51); // Move window to the front face
roundWindow.rotation.x = -Math.atan(1 / 1.5); // Align with roof slant
house.add(roundWindow);


// Square windows on the first floor
const window1Geometry = new THREE.PlaneGeometry(0.4, 0.4);
const window1Edges = new THREE.EdgesGeometry(window1Geometry);
const window1 = new THREE.LineSegments(window1Edges, lineMaterial);
window1.position.set(-0.5, 0, 1.01);
house.add(window1);

const window2Geometry = new THREE.PlaneGeometry(0.4, 0.4);
const window2Edges = new THREE.EdgesGeometry(window2Geometry);
const window2 = new THREE.LineSegments(window2Edges, lineMaterial);
window2.position.set(0.5, 0, 1.01);
house.add(window2);


scene.add(house);

camera.position.z = 5;

// Mouse Wheel Interaction
window.addEventListener('wheel', (event) => {
    house.rotation.y += event.deltaY * 0.001;
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
