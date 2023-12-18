let gameStarted = false;
let score = 0;
let timeLeft = 60;
const objects = []; // Renamed from 'cubes' to 'objects' for generality
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Create the scene
const scene = new THREE.Scene();

// Ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Create and position the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffc0cb); // Set background color to white
document.body.appendChild(renderer.domElement);

// Function to add a random object with texture
function addRandomObject() {
    const randomShape = Math.random() > 0.5 ? 'cube' : 'sphere';
    let geometry, edgeGeometry, edgeMaterial, object, edges;
    const size = THREE.MathUtils.randFloat(0.5, 1);

    if (randomShape === 'cube') {
        geometry = new THREE.BoxGeometry(size, size, size);
        edgeGeometry = new THREE.EdgesGeometry(geometry);
        edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);

        const material = new THREE.MeshStandardMaterial({ color: 0xFFA500 }); // Orange color
        object = new THREE.Mesh(geometry, material);
        object.add(edges); // Add black edges to the cube
    } else {
        geometry = new THREE.SphereGeometry(size / 2, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
        object = new THREE.Mesh(geometry, material);
    }

    object.castShadow = true;
    object.receiveShadow = true;

    // Add random rotation
    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;

    setObjectPosition(object);
    scene.add(object);
    objects.push(object);

    
}


function setObjectPosition(object) {
    const centralArea = { x: [-3, 3], y: [-1, 2], z: [-2, 2] };
    object.position.x = THREE.MathUtils.randFloat(centralArea.x[0], centralArea.x[1]);
    object.position.y = THREE.MathUtils.randFloat(centralArea.y[0], centralArea.y[1]);
    object.position.z = THREE.MathUtils.randFloat(centralArea.z[0], centralArea.z[1]);
}

// Function to create a particle system
function createParticles(position) {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3); // x, y, z for each particle

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.025, color: 0xffffff });
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    particleSystem.position.copy(position);
    scene.add(particleSystem);

    setTimeout(() => {
        scene.remove(particleSystem);
    }, 2000);
}

// Click Event Handling
document.addEventListener('mousedown', onDocumentMouseDown, false);
function onDocumentMouseDown(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0 && gameStarted) {
        const intersectedObject = intersects[0].object;

        // Create particles at the position of the clicked object
        createParticles(intersectedObject.position);

        // Remove all objects and spawn a new one
        objects.forEach(object => scene.remove(object));
        objects.length = 0;
        updateScore(1);
        addRandomObject();
    }
}


// Start Game Function
document.getElementById('startButton').addEventListener('click', startGame);
function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    score = 0;
    timeLeft = 60;
    updateScore(0);
    objects.forEach(object => scene.remove(object));
    objects.length = 0;
    addRandomObject();
    startTimer();

    
    document.getElementById('instructions').style.display = 'none';
}

// Timer Function
function startTimer() {
    const timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            document.getElementById('timeLeft').innerText = timeLeft;
        } else {
            clearInterval(timer);
            gameStarted = false;
            alert('Game Over! Your score: ' + score);
        }
    }, 1000);
}


function updateScore(increment) {
    score += increment;
    document.getElementById('score').innerText = score;
}


function animate(time) {
    requestAnimationFrame(animate);

    objects.forEach(object => {
        object.rotation.x += 0.01;
        object.rotation.y += 0.01;

        // Scale up and down
        object.scale.x = Math.abs(Math.sin(time * 0.001)) + 0.5;
        object.scale.y = Math.abs(Math.sin(time * 0.001)) + 0.5;
        object.scale.z = Math.abs(Math.sin(time * 0.001)) + 0.5;

        // Color change over time
        object.material.color.setHSL((time * 0.0001) % 1, 0.5, 0.5);
    });

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window
