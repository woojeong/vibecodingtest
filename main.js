import * as THREE from 'three';

/**
 * River Environment Setup
 */
class RiverApp {
    constructor() {
        this.canvas = document.getElementById('river-canvas');
        this.scene = new THREE.Scene();
        
        // Theme Colors
        this.themes = {
            dark: {
                bg: 0x001f24,
                water: 0x004d56,
                text: 'rgba(255, 255, 255, 0.9)'
            },
            light: {
                bg: 0xe0f7fa,
                water: 0x81d4fa,
                text: 'rgba(0, 77, 64, 0.9)'
            }
        };
        
        this.currentTheme = 'dark';
        this.scene.background = new THREE.Color(this.themes[this.currentTheme].bg);

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Mouse tracking
        this.mouse = new THREE.Vector2(-1000, -1000);
        this.mouseInWorld = new THREE.Vector3(-1000, -1000, 0);

        // Orthographic camera
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
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.onMouseMove(e.touches[0]);
            }
        });
        
        // Theme Toggle Logic
        this.toggleBtn = document.getElementById('theme-toggle');
        this.toggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    init() {
        this.createWater();
        this.createTextFlow();
    }

    onMouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        // Update mouseInWorld
        const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
        vector.unproject(this.camera);
        const dir = vector.sub(this.camera.position).normalize();
        const distance = -this.camera.position.z / dir.z;
        this.mouseInWorld.copy(this.camera.position).add(dir.multiplyScalar(distance));
        
        if (this.waterMaterial) {
            this.waterMaterial.uniforms.mouse.value.set(this.mouseInWorld.x, this.mouseInWorld.y);
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        const colors = this.themes[this.currentTheme];

        // Update HTML data attribute for CSS transitions
        document.documentElement.setAttribute('data-theme', this.currentTheme);

        // Update Three.js Scene
        this.scene.background.set(colors.bg);
        this.waterMaterial.uniforms.color.value.set(colors.water);

        // Regenerate Text Textures with new colors
        this.textElements.forEach(mesh => {
            const char = mesh.userData.char;
            const { texture } = this.createTextTexture(char);
            mesh.material.map.dispose(); // Clean up old texture
            mesh.material.map = texture;
            mesh.material.needsUpdate = true;
        });
    }

    createWater() {
        const geometry = new THREE.PlaneGeometry(30, 30);
        const waterShader = {
            uniforms: {
                time: { value: 0 },
                mouse: { value: new THREE.Vector2(-1000, -1000) },
                color: { value: new THREE.Color(this.themes[this.currentTheme].water) }
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
                uniform vec2 mouse;
                uniform vec3 color;
                varying vec2 vUv;

                void main() {
                    vec2 uv = vUv;
                    float t = time * 0.2;
                    
                    // Base water pattern
                    float ripple = sin(uv.x * 10.0 + t) * 0.5 + 0.5;
                    ripple += sin(uv.y * 15.0 - t * 1.5 + uv.x * 5.0) * 0.3;
                    ripple += sin((uv.x + uv.y) * 20.0 + t * 2.0) * 0.2;
                    
                    // Mouse disturbance (world space)
                    vec2 worldPos = (uv - 0.5) * 30.0;
                    float dist = distance(worldPos, mouse);
                    float mouseRipple = exp(-dist * 1.5) * sin(dist * 10.0 - time * 5.0) * 0.5;
                    
                    ripple += mouseRipple;

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
        
        context.font = `bold ${fontSize}px 'Pretendard', sans-serif`;
        const metrics = context.measureText(text);
        canvas.width = metrics.width + 20;
        canvas.height = fontSize + 20;

        context.font = `bold ${fontSize}px 'Pretendard', sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        context.shadowColor = this.currentTheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
        context.shadowBlur = 10;
        context.shadowOffsetY = 5;

        context.fillStyle = this.themes[this.currentTheme].text;
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        return { texture, width: canvas.width / 100, height: canvas.height / 100 };
    }

    createTextFlow() {
        const charData = this.phrase.split('');
        const numInstances = 30;

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

            this.resetMesh(mesh);
            mesh.position.y = (Math.random() - 0.5) * 15;

            mesh.userData = {
                char: char,
                speed: (0.01 + Math.random() * 0.02) * 0.4,
                drift: ((Math.random() - 0.5) * 0.005) * 0.4,
                rotationSpeed: ((Math.random() - 0.5) * 0.01) * 0.4,
                velocity: new THREE.Vector2(0, 0),
                externalForce: new THREE.Vector2(0, 0)
            };

            this.scene.add(mesh);
            this.textElements.push(mesh);
        }
    }

    resetMesh(mesh) {
        const aspect = this.width / this.height;
        const frustumWidth = 10 * aspect;
        mesh.position.x = (Math.random() - 0.5) * frustumWidth;
        mesh.position.y = 6;
        mesh.rotation.z = (Math.random() - 0.5) * 0.5;
        mesh.scale.setScalar(0.5 + Math.random() * 0.5);
        
        if (mesh.userData && mesh.userData.velocity) {
            mesh.userData.velocity.set(0, 0);
        }
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
        if (this.waterMaterial) this.waterMaterial.uniforms.time.value = time;

        this.textElements.forEach(mesh => {
            const data = mesh.userData;
            
            // Base River Flow
            data.externalForce.set(0, -data.speed);
            data.externalForce.x += Math.sin(time + mesh.position.y) * data.drift;

            // Mouse Repulsion
            const dist = mesh.position.distanceTo(this.mouseInWorld);
            if (dist < 2.5) {
                const force = new THREE.Vector2().subVectors(
                    new THREE.Vector2(mesh.position.x, mesh.position.y),
                    new THREE.Vector2(this.mouseInWorld.x, this.mouseInWorld.y)
                );
                const strength = (1 - dist / 2.5) * 0.05;
                data.velocity.add(force.normalize().multiplyScalar(strength));
            }

            // Apply Velocity & Damping
            data.velocity.add(data.externalForce);
            mesh.position.x += data.velocity.x;
            mesh.position.y += data.velocity.y;
            data.velocity.multiplyScalar(0.9); // Damping

            mesh.rotation.z += data.rotationSpeed + data.velocity.length() * 0.1;

            // Bounds Check
            const aspect = this.width / this.height;
            const frustumWidth = 10 * aspect;
            if (mesh.position.y < -6) {
                this.resetMesh(mesh);
            }
            if (Math.abs(mesh.position.x) > frustumWidth / 2 + 1) {
                mesh.position.x = -Math.sign(mesh.position.x) * (frustumWidth / 2);
            }
        });

        this.renderer.render(this.scene, this.camera);
    }
}

new RiverApp();
