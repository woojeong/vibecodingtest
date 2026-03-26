import * as THREE from 'three';

/**
 * River Environment Setup
 */
class RiverApp {
    constructor() {
        this.canvas = document.getElementById('river-canvas');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x001f24);

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Orthographic camera for a flattened top-down view
        const aspect = this.width / this.height;
        const frustumSize = 10;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            0.1,
            100
        );
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.textElements = [];
        this.phrase = "수요일과 바다 유리";
        
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.onResize());
    }

    init() {
        // 1. Create the Water Surface
        this.createWater();

        // 2. Create Flowing Text
        this.createTextFlow();
    }

    createWater() {
        const geometry = new THREE.PlaneGeometry(30, 30);
        
        // Custom Shader for flowing water ripples
        const waterShader = {
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0x004d56) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec2 vUv;

                // Simple noise function
                float noise(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }

                void main() {
                    vec2 uv = vUv;
                    float t = time * 0.2;
                    
                    // Layered sine waves for water movement
                    float ripple = sin(uv.x * 10.0 + t) * 0.5 + 0.5;
                    ripple += sin(uv.y * 15.0 - t * 1.5 + uv.x * 5.0) * 0.3;
                    ripple += sin((uv.x + uv.y) * 20.0 + t * 2.0) * 0.2;

                    vec3 finalColor = mix(color, color * 1.2, ripple * 0.3);
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        };

        this.waterMaterial = new THREE.ShaderMaterial({
            uniforms: waterShader.uniforms,
            vertexShader: waterShader.vertexShader,
            fragmentShader: waterShader.fragmentShader
        });

        const waterPlane = new THREE.Mesh(geometry, this.waterMaterial);
        waterPlane.position.z = -1;
        this.scene.add(waterPlane);
    }

    createTextTexture(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = 64;
        
        // Measure text to size canvas
        context.font = `bold ${fontSize}px 'Pretendard', sans-serif`;
        const metrics = context.measureText(text);
        canvas.width = metrics.width + 20;
        canvas.height = fontSize + 20;

        // Draw text with glow
        context.font = `bold ${fontSize}px 'Pretendard', sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Soft shadow for depth
        context.shadowColor = 'rgba(0, 0, 0, 0.3)';
        context.shadowBlur = 10;
        context.shadowOffsetY = 5;

        context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        return { texture, width: canvas.width / 100, height: canvas.height / 100 };
    }

    createTextFlow() {
        const charData = this.phrase.split('');
        const numInstances = 25;

        for (let i = 0; i < numInstances; i++) {
            const char = charData[Math.floor(Math.random() * charData.length)];
            if (char === ' ') continue;

            const { texture, width, height } = this.createTextTexture(char);
            const material = new THREE.MeshBasicMaterial({ 
                map: texture, 
                transparent: true,
                opacity: 0.6 + Math.random() * 0.4
            });
            const geometry = new THREE.PlaneGeometry(width, height);
            const mesh = new THREE.Mesh(geometry, material);

            // Random initial positions
            this.resetMesh(mesh);
            mesh.position.y = (Math.random() - 0.5) * 15; // Randomly distribute initially

            mesh.userData = {
                speed: 0.01 + Math.random() * 0.02,
                drift: (Math.random() - 0.5) * 0.005,
                rotationSpeed: (Math.random() - 0.5) * 0.01
            };

            this.scene.add(mesh);
            this.textElements.push(mesh);
        }
    }

    resetMesh(mesh) {
        const aspect = this.width / this.height;
        const frustumWidth = 10 * aspect;
        mesh.position.x = (Math.random() - 0.5) * frustumWidth;
        mesh.position.y = 6; // Start just above the top
        mesh.rotation.z = (Math.random() - 0.5) * 0.5;
        mesh.scale.setScalar(0.5 + Math.random() * 0.5);
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        const aspect = this.width / this.height;
        const frustumSize = 10;
        
        this.camera.left = -frustumSize * aspect / 2;
        this.camera.right = frustumSize * aspect / 2;
        this.camera.top = frustumSize / 2;
        this.camera.bottom = -frustumSize / 2;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = performance.now() * 0.001;
        if (this.waterMaterial) {
            this.waterMaterial.uniforms.time.value = time;
        }

        this.textElements.forEach(mesh => {
            // Move down with the "flow"
            mesh.position.y -= mesh.userData.speed;
            mesh.position.x += Math.sin(time + mesh.position.y) * mesh.userData.drift;
            mesh.rotation.z += mesh.userData.rotationSpeed;

            // Subtle "floating" scale effect
            const scaleBase = mesh.scale.x;
            mesh.scale.setScalar(mesh.scale.x + Math.sin(time * 2 + mesh.position.x) * 0.001);

            // Wrap around
            if (mesh.position.y < -6) {
                this.resetMesh(mesh);
            }
        });

        this.renderer.render(this.scene, this.camera);
    }
}

new RiverApp();
