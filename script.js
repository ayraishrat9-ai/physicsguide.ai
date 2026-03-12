// Physics Hub Frontend JavaScript
const API_BASE = 'http://localhost:5000/api';

// User state
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCalculations();
    checkAuth();
    initBackground();
    loadExperiment('solar');
});

// Check authentication
function checkAuth() {
    const user = localStorage.getItem('physicsUser');
    if (user) {
        currentUser = JSON.parse(user);
        updateAuthUI();
    }
}

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    if (currentUser) {
        authButtons.style.display = 'none';
        userInfo.style.display = 'flex';
        document.getElementById('userName').textContent = currentUser.name;
    } else {
        authButtons.style.display = 'flex';
        userInfo.style.display = 'none';
    }
}

// Auth functions
function showLogin() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('signupModal').classList.remove('active');
}

function showSignup() {
    document.getElementById('signupModal').classList.add('active');
    document.getElementById('loginModal').classList.remove('active');
}

function switchToSignup() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('signupModal').classList.add('active');
}

function switchToLogin() {
    document.getElementById('signupModal').classList.remove('active');
    document.getElementById('loginModal').classList.add('active');
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('physicsUser', JSON.stringify(data.user));
            updateAuthUI();
            document.getElementById('loginModal').classList.remove('active');
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
            alert('Login successful!');
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Backend not running. Please start the Flask server.');
    }
}

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    
    if (!name || !email || !password || !confirm) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirm) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            switchToLogin();
            document.getElementById('signupName').value = '';
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
            document.getElementById('signupConfirm').value = '';
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Backend not running. Please start the Flask server.');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('physicsUser');
    updateAuthUI();
    alert('Logged out successfully');
}

// Calculator functions
let calculationsList = [];

async function loadCalculations() {
    try {
        const response = await fetch(`${API_BASE}/calculations`);
        const data = await response.json();
        calculationsList = data;
        
        const select = document.getElementById('calcType');
        data.forEach(calc => {
            const option = document.createElement('option');
            option.value = calc.type;
            option.textContent = calc.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load calculations:', error);
        // Fallback calculations
        loadFallbackCalculations();
    }
}

function loadFallbackCalculations() {
    const fallbackCalcs = [
        {type: 'velocity', name: 'Velocity', inputs: ['displacement (m)', 'time (s)'], formula: 'v = d/t'},
        {type: 'acceleration', name: 'Acceleration', inputs: ['final velocity (m/s)', 'initial velocity (m/s)', 'time (s)'], formula: 'a = (v-u)/t'},
        {type: 'force', name: 'Force (F=ma)', inputs: ['mass (kg)', 'acceleration (m/s²)'], formula: 'F = ma'},
        {type: 'kinetic_energy', name: 'Kinetic Energy', inputs: ['mass (kg)', 'velocity (m/s)'], formula: 'KE = ½mv²'},
        {type: 'potential_energy', name: 'Potential Energy', inputs: ['mass (kg)', 'height (m)'], formula: 'PE = mgh'},
        {type: 'momentum', name: 'Momentum', inputs: ['mass (kg)', 'velocity (m/s)'], formula: 'p = mv'},
        {type: 'mass_energy', name: 'Mass-Energy (E=mc²)', inputs: ['mass (kg)'], formula: 'E = mc²'}
    ];
    
    const select = document.getElementById('calcType');
    fallbackCalcs.forEach(calc => {
        const option = document.createElement('option');
        option.value = calc.type;
        option.textContent = calc.name;
        select.appendChild(option);
    });
}

function updateCalcInputs() {
    const type = document.getElementById('calcType').value;
    const inputsDiv = document.getElementById('calcInputs');
    inputsDiv.innerHTML = '';
    
    if (!type) return;
    
    const calc = calculationsList.find(c => c.type === type) || {inputs: [], formula: ''};
    const inputLabels = {
        'velocity': ['Displacement (m)', 'Time (s)'],
        'acceleration': ['Final Velocity (m/s)', 'Initial Velocity (m/s)', 'Time (s)'],
        'force': ['Mass (kg)', 'Acceleration (m/s²)'],
        'kinetic_energy': ['Mass (kg)', 'Velocity (m/s)'],
        'potential_energy': ['Mass (kg)', 'Height (m)', 'Gravity (m/s², default 9.8)'],
        'momentum': ['Mass (kg)', 'Velocity (m/s)'],
        'pressure': ['Force (N)', 'Area (m²)'],
        'density': ['Mass (kg)', 'Volume (m³)'],
        'work': ['Force (N)', 'Displacement (m)', 'Angle (degrees)'],
        'power': ['Work (J)', 'Time (s)'],
        'gravitational_force': ['Mass 1 (kg)', 'Mass 2 (kg)', 'Distance (m)'],
        'coulomb_force': ['Charge 1 (C)', 'Charge 2 (C)', 'Distance (m)'],
        'wave_speed': ['Frequency (Hz)', 'Wavelength (m)'],
        'pendulum_period': ['Length (m)', 'Gravity (m/s²)'],
        'mass_energy': ['Mass (kg)'],
        'photon_energy': ['Frequency (Hz)'],
        'de_broglie': ['Mass (kg)', 'Velocity (m/s)']
    };
    
    const labels = inputLabels[type] || [];
    labels.forEach((label, i) => {
        const div = document.createElement('div');
        div.innerHTML = `<label>${label}</label><input type="number" id="input${i}" step="any">`;
        inputsDiv.appendChild(div);
    });
}

async function calculate() {
    const type = document.getElementById('calcType').value;
    if (!type) {
        alert('Please select a calculation type');
        return;
    }
    
    const inputElements = document.querySelectorAll('#calcInputs input');
    const inputs = {};
    inputElements.forEach((el, i) => {
        inputs[`input${i}`] = parseFloat(el.value) || 0;
    });
    
    // Map inputs based on calculation type
    let body = {};
    switch(type) {
        case 'velocity': body = { displacement: inputs.input0, time: inputs.input1 }; break;
        case 'acceleration': body = { v_final: inputs.input0, v_initial: inputs.input1, time: inputs.input2 }; break;
        case 'force': body = { mass: inputs.input0, acceleration: inputs.input1 }; break;
        case 'kinetic_energy': body = { mass: inputs.input0, velocity: inputs.input1 }; break;
        case 'potential_energy': body = { mass: inputs.input0, height: inputs.input1, gravity: inputs.input2 || 9.8 }; break;
        case 'momentum': body = { mass: inputs.input0, velocity: inputs.input1 }; break;
        case 'mass_energy': body = { mass: inputs.input0 }; break;
        case 'wave_speed': body = { frequency: inputs.input0, wavelength: inputs.input1 }; break;
        case 'pendulum_period': body = { length: inputs.input0, gravity: inputs.input1 || 9.8 }; break;
        default: body = inputs;
    }
    
    try {
        const response = await fetch(`${API_BASE}/calculate/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const result = await response.json();
        displayResult(result);
    } catch (error) {
        console.error('Calculation error:', error);
        // Fallback calculation
        const fallbackResult = calculateFallback(type, inputs);
        displayResult(fallbackResult);
    }
}

function calculateFallback(type, inputs) {
    switch(type) {
        case 'velocity': return { velocity: inputs.input1 ? inputs.input0 / inputs.input1 : 0, unit: 'm/s' };
        case 'force': return { force: inputs.input0 * inputs.input1, unit: 'N' };
        case 'kinetic_energy': return { energy: 0.5 * inputs.input0 * inputs.input1 * inputs.input1, unit: 'J' };
        case 'potential_energy': return { energy: inputs.input0 * 9.8 * inputs.input1, unit: 'J' };
        case 'momentum': return { momentum: inputs.input0 * inputs.input1, unit: 'kg·m/s' };
        case 'mass_energy': return { energy: inputs.input0 * 299792458 * 299792458, unit: 'J', formula: 'E=mc²' };
        default: return { error: 'Calculation not available' };
    }
}

function displayResult(result) {
    const resultDiv = document.getElementById('calcResult');
    resultDiv.classList.add('show');
    
    if (result.error) {
        resultDiv.innerHTML = `<div style="color: #ff006e;">${result.error}</div>`;
    } else {
        const keys = Object.keys(result).filter(k => k !== 'unit' && k !== 'formula');
        let html = '';
        keys.forEach(key => {
            const value = typeof result[key] === 'number' ? result[key].toPrecision(6) : result[key];
            html += `<div class="result-value">${key}: ${value} <span class="result-unit">${result.unit || ''}</span></div>`;
        });
        if (result.formula) {
            html += `<div style="color: #888; margin-top: 10px;">Formula: ${result.formula}</div>`;
        }
        resultDiv.innerHTML = html;
    }
}

// AI Chat functions
function toggleAI() {
    document.getElementById('aiChatBox').classList.toggle('active');
}

async function sendAI() {
    const input = document.getElementById('aiInput');
    const msg = input.value.trim();
    if (!msg) return;
    
    addAIMessage('user', msg);
    input.value = '';
    
    const lower = msg.toLowerCase();
    
    // Check for 3D experiment requests
    if (lower.includes('3d') || lower.includes('experiment') || lower.includes('show') || lower.includes('visualize') || lower.includes('simulation') || lower.includes('run')) {
        if (lower.includes('solar') || lower.includes('planet')) {
            loadExperiment('solar');
            addAIMessage('ai', 'Loading realistic Solar System with 8 planets orbiting the Sun!');
        } else if (lower.includes('atom') || lower.includes('electron') || lower.includes('quantum')) {
            loadExperiment('atom');
            addAIMessage('ai', 'Loading 3D Hydrogen Atom with electron shells!');
        } else if (lower.includes('wave') || lower.includes('light') || lower.includes('sound')) {
            loadExperiment('wave');
            addAIMessage('ai', 'Loading 3D Wave visualization!');
        } else if (lower.includes('pendulum') || lower.includes('gravity')) {
            loadExperiment('pendulum');
            addAIMessage('ai', 'Loading Pendulum physics simulation!');
        } else if (lower.includes('collision') || lower.includes('particle')) {
            loadExperiment('collision');
            addAIMessage('ai', 'Loading Particle Collision simulation!');
        } else if (lower.includes('well') || lower.includes('spacetime') || lower.includes('curved')) {
            loadExperiment('gravity');
            addAIMessage('ai', 'Loading Gravity Well visualization!');
        } else {
            loadExperiment('solar');
            addAIMessage('ai', 'Loading Solar System for you!');
        }
        return;
    }
    
    // Try backend AI
    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        
        const data = await response.json();
        addAIMessage('ai', data.response);
    } catch (error) {
        console.error('AI chat error:', error);
        // Fallback responses
        const fallbackResponse = getFallbackResponse(lower);
        setTimeout(() => addAIMessage('ai', fallbackResponse), 400);
    }
}

function getFallbackResponse(query) {
    const responses = {
        'einstein': 'Albert Einstein (1879-1955) developed Special and General Relativity. His famous equation E=mc² shows mass-energy equivalence.',
        'newton': 'Isaac Newton (1643-1727) formulated laws of motion and universal gravitation. F=ma is his famous second law.',
        'muslim': 'Muslim scientists made huge contributions! Ibn al-Haytham (Alhazen) father of optics. Al-Biruni calculated Earth\'s circumference. Al-Khwarizmi gave us algebra.',
        'alhazen': 'Ibn al-Haytham (965-1040), known as Alhazen, is the father of modern optics. He invented camera obscura and developed scientific method.',
        'quantum': 'Quantum mechanics studies atomic/subatomic particles. Key: superposition, entanglement, uncertainty principle.',
        'e=mc': 'E=mc² - Einstein\'s mass-energy equivalence. Mass can be converted to energy (nuclear reactions). c = 299,792,458 m/s.',
        'f=ma': 'F=ma - Newton\'s Second Law. Force equals mass times acceleration. Foundation of classical mechanics.',
        'branches': 'Main physics branches: Quantum Mechanics, Relativity, Particle Physics, Astrophysics, Thermodynamics, Electromagnetism, Nuclear Physics.'
    };
    
    for (let key in responses) {
        if (query.includes(key)) return responses[key];
    }
    
    if (query.includes('calculate') || query.includes('compute')) {
        return 'I can help with calculations! Go to the Calculator section. Formulas: velocity = distance/time, F=ma, KE=½mv², E=mc²';
    }
    
    return 'Great question! Ask me about physics topics, scientists, formulas, or request a 3D experiment!';
}

function addAIMessage(type, text) {
    const container = document.getElementById('aiMessages');
    const div = document.createElement('div');
    div.className = 'ai-msg' + (type === 'user' ? ' user-msg' : '');
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Three.js Background
function initBackground() {
    const bgCanvas = document.getElementById('bg-canvas');
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const bgRenderer = new THREE.WebGLRenderer({ canvas: bgCanvas, alpha: true });
    
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgCamera.position.z = 50;
    
    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 200;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.15, color: 0x00d4ff, transparent: true, opacity: 0.8 });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    bgScene.add(particlesMesh);
    
    // Atoms
    const atoms = [];
    for (let i = 0; i < 25; i++) {
        const size = 0.8 + Math.random() * 1.2;
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: Math.random() > 0.5 ? 0x00d4ff : 0xff006e, 
            emissive: 0x00d4ff, 
            emissiveIntensity: 0.4,
            shininess: 100
        });
        const atom = new THREE.Mesh(geometry, material);
        atom.position.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 50);
        
        // Electron orbits
        for (let j = 0; j < 3; j++) {
            const orbitGeometry = new THREE.TorusGeometry(2 + j * 1.5 + Math.random(), 0.03, 16, 100);
            const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.25 });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.random() * Math.PI;
            orbit.rotation.y = Math.random() * Math.PI;
            atom.add(orbit);
        }
        
        atoms.push(atom);
        bgScene.add(atom);
    }
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    bgScene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00d4ff, 1.2);
    pointLight.position.set(50, 50, 50);
    bgScene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0xff006e, 0.8);
    pointLight2.position.set(-50, -50, 50);
    bgScene.add(pointLight2);
    
    function animateBg() {
        requestAnimationFrame(animateBg);
        particlesMesh.rotation.y += 0.0003;
        particlesMesh.rotation.x += 0.0001;
        atoms.forEach(atom => { 
            atom.rotation.y += 0.008; 
            atom.rotation.x += 0.004; 
        });
        bgRenderer.render(bgScene, bgCamera);
    }
    animateBg();
    
    // Resize handler
    window.addEventListener('resize', () => {
        bgCamera.aspect = window.innerWidth / window.innerHeight;
        bgCamera.updateProjectionMatrix();
        bgRenderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// 3D Experiments
let expScene, expCamera, expRenderer, expObjects = [], currentExp = 'solar', animationId = null;

function initExperiment() {
    const expCanvas = document.getElementById('experiment-canvas');
    expScene = new THREE.Scene();
    expCamera = new THREE.PerspectiveCamera(60, expCanvas.clientWidth / 650, 0.1, 1000);
    expRenderer = new THREE.WebGLRenderer({ canvas: expCanvas, alpha: true, antialias: true });
    
    expRenderer.setSize(expCanvas.clientWidth, 650);
    expRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    expCamera.position.z = 30;
    
    const light = new THREE.AmbientLight(0xffffff, 0.5);
    expScene.add(light);
    const pLight = new THREE.PointLight(0xffffff, 1);
    pLight.position.set(20, 20, 20);
    expScene.add(pLight);
}

function clearExp() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    expObjects.forEach(obj => expScene.remove(obj));
    expObjects = [];
}

function loadExperiment(type) {
    currentExp = type;
    if (!expScene) initExperiment();
    clearExp();
    
    const expDesc = document.getElementById('expDesc');
    
    if (type === 'solar') {
        expDesc.textContent = "Solar System: Realistic planets orbiting the Sun with different speeds";
        
        // Sun
        const sunGeometry = new THREE.SphereGeometry(4, 64, 64);
        const sunMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffdd00, 
            emissive: 0xffaa00, 
            emissiveIntensity: 0.6,
            shininess: 150
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        expScene.add(sun);
        expObjects.push(sun);
        
        // Sun glow
        const glowGeometry = new THREE.SphereGeometry(5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00, transparent: true, opacity: 0.15 });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        expScene.add(glow);
        expObjects.push(glow);
        
        // Planets
        const planets = [
            { color: 0x888888, size: 0.6, distance: 8, speed: 2.5, name: 'Mercury' },
            { color: 0xff9944, size: 0.9, distance: 12, speed: 2.0, name: 'Venus' },
            { color: 0x2244ff, size: 1.0, distance: 16, speed: 1.7, name: 'Earth' },
            { color: 0xff4422, size: 0.7, distance: 20, speed: 1.4, name: 'Mars' },
            { color: 0xddaa44, size: 2.2, distance: 26, speed: 0.9, name: 'Jupiter' },
            { color: 0xddcc88, size: 1.8, distance: 32, speed: 0.7, name: 'Saturn' },
            { color: 0x88ccff, size: 1.3, distance: 38, speed: 0.5, name: 'Uranus' },
            { color: 0x4488ff, size: 1.2, distance: 44, speed: 0.4, name: 'Neptune' }
        ];
        
        planets.forEach((p) => {
            const geometry = new THREE.SphereGeometry(p.size, 32, 32);
            const material = new THREE.MeshPhongMaterial({ color: p.color, shininess: 30 });
            const planet = new THREE.Mesh(geometry, material);
            planet.userData = { distance: p.distance, speed: p.speed, angle: Math.random() * Math.PI * 2 };
            expObjects.push(planet);
            expScene.add(planet);
            
            // Orbit ring
            const orbitGeometry = new THREE.RingGeometry(p.distance - 0.1, p.distance + 0.1, 128);
            const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            expScene.add(orbit);
            expObjects.push(orbit);
            
            // Saturn rings
            if (p.name === 'Saturn') {
                const ringGeometry = new THREE.RingGeometry(2.5, 3.5, 64);
                const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xccaa77, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = Math.PI / 2.5;
                planet.add(ring);
            }
        });
        
        expCamera.position.z = 55;
        
        animateExp(() => {
            expObjects.forEach(obj => {
                if (obj.userData && obj.userData.distance) {
                    obj.userData.angle += obj.userData.speed * 0.01;
                    obj.position.x = Math.cos(obj.userData.angle) * obj.userData.distance;
                    obj.position.z = Math.sin(obj.userData.angle) * obj.userData.distance;
                    obj.rotation.y += 0.02;
                }
            });
        });
    }
    else if (type === 'atom' || type === 'atom3d') {
        expDesc.textContent = "Hydrogen Atom: Electrons orbiting the nucleus in 3D space";
        
        // Nucleus
        const nucleusGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const nucleusMaterial = new THREE.MeshPhongMaterial({ color: 0xff2222, emissive: 0xff0000, emissiveIntensity: 0.5, shininess: 100 });
        const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
        expScene.add(nucleus);
        expObjects.push(nucleus);
        
        // Nucleus glow
        const nGlow = new THREE.Mesh(new THREE.SphereGeometry(1.6, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.12 }));
        expScene.add(nGlow);
        expObjects.push(nGlow);
        
        // Electrons with orbits
        for (let shell = 0; shell < 3; shell++) {
            const orbitRadius = 5 + shell * 4;
            const orbitGeometry = new THREE.TorusGeometry(orbitRadius, 0.04, 16, 128);
            const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.35 - shell * 0.08 });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2 + shell * 0.4;
            orbit.rotation.y = shell * 0.6;
            expScene.add(orbit);
            expObjects.push(orbit);
            
            const electronsInShell = shell + 1;
            for (let e = 0; e < electronsInShell; e++) {
                const electronGeometry = new THREE.SphereGeometry(0.4, 16, 16);
                const electronMaterial = new THREE.MeshPhongMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.6 });
                const electron = new THREE.Mesh(electronGeometry, electronMaterial);
                electron.userData = { radius: orbitRadius, speed: 0.03 * (3 - shell), angle: (e / electronsInShell) * Math.PI * 2, tilt: shell * 0.4 };
                expObjects.push(electron);
                expScene.add(electron);
            }
        }
        
        expCamera.position.z = 28;
        
        animateExp(() => {
            expObjects.forEach(obj => {
                if (obj.userData && obj.userData.radius) {
                    obj.userData.angle += obj.userData.speed;
                    const r = obj.userData.radius;
                    const tilt = obj.userData.tilt || 0;
                    obj.position.x = Math.cos(obj.userData.angle) * r;
                    obj.position.y = Math.sin(obj.userData.angle) * r * Math.cos(tilt);
                    obj.position.z = Math.sin(obj.userData.angle) * r * Math.sin(tilt);
                }
            });
        });
    }
    else if (type === 'wave') {
        expDesc.textContent = "Wave Motion: Visualize light, sound, and water waves in 3D";
        
        const waveGeometry = new THREE.PlaneGeometry(40, 20, 150, 75);
        const waveMaterial = new THREE.MeshPhongMaterial({ color: 0x00d4ff, wireframe: true, side: THREE.DoubleSide, shininess: 80 });
        const wave = new THREE.Mesh(waveGeometry, waveMaterial);
        wave.rotation.x = -Math.PI / 2;
        wave.position.y = -2;
        expScene.add(wave);
        expObjects.push(wave);
        
        const wave2 = new THREE.Mesh(waveGeometry.clone(), new THREE.MeshPhongMaterial({ color: 0xff006e, wireframe: true, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
        wave2.rotation.x = -Math.PI / 2;
        wave2.position.y = 2;
        expScene.add(wave2);
        expObjects.push(wave2);
        
        expCamera.position.z = 25;
        
        animateExp(() => {
            const positions = wave.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const z = positions.getZ(i);
                positions.setY(i, Math.sin(x * 0.3 + Date.now() * 0.003) * 2.5 + Math.cos(z * 0.2 + Date.now() * 0.002) * 1.5);
            }
            positions.needsUpdate = true;
            
            const positions2 = wave2.geometry.attributes.position;
            for (let i = 0; i < positions2.count; i++) {
                const x = positions2.getX(i);
                const z = positions2.getZ(i);
                positions2.setY(i, Math.sin(x * 0.2 + Date.now() * 0.004) * 2 + Math.cos(z * 0.3 + Date.now() * 0.002) * 1);
            }
            positions2.needsUpdate = true;
        });
    }
    else if (type === 'pendulum') {
        expDesc.textContent = "Pendulum: Classic physics demonstrating simple harmonic motion and gravity";
        
        const support = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 0.4), new THREE.MeshPhongMaterial({ color: 0x888888, shininess: 50 }));
        support.position.y = 8;
        expScene.add(support);
        expObjects.push(support);
        
        const colors = [0xff006e, 0x00d4ff, 0xffaa00, 0x00ff88, 0xaa00ff];
        
        for (let i = 0; i < 5; i++) {
            const length = 6 - i * 0.5;
            const pivotY = 8;
            
            const stringGeometry = new THREE.CylinderGeometry(0.06, 0.06, length, 8);
            const stringMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
            const string = new THREE.Mesh(stringGeometry, stringMaterial);
            string.userData = { length, pivotY, angle: 0.8 - i * 0.15, speed: Math.sqrt(9.8 / length) * 0.15 };
            expObjects.push(string);
            expScene.add(string);
            
            const bobGeometry = new THREE.SphereGeometry(0.8 - i * 0.08, 32, 32);
            const bobMaterial = new THREE.MeshPhongMaterial({ color: colors[i], emissive: colors[i], emissiveIntensity: 0.3, shininess: 80 });
            const bob = new THREE.Mesh(bobGeometry, bobMaterial);
            bob.userData = { string, length, pivotY, angle: 0.8 - i * 0.15, speed: Math.sqrt(9.8 / length) * 0.15 };
            expObjects.push(bob);
            expScene.add(bob);
        }
        
        expCamera.position.z = 22;
        
        animateExp(() => {
            expObjects.forEach(obj => {
                if (obj.userData && obj.userData.length) {
                    const t = Date.now() * 0.001;
                    obj.userData.angle = obj.userData.angle * Math.cos(obj.userData.speed * 3 * t) + 0.4 * Math.sin(obj.userData.speed * 3 * t);
                    
                    const x = Math.sin(obj.userData.angle) * obj.userData.length;
                    const y = obj.userData.pivotY - Math.cos(obj.userData.angle) * obj.userData.length;
                    
                    if (obj.geometry.type === 'CylinderGeometry') {
                        obj.position.set(x / 2, obj.userData.pivotY - obj.userData.length / 2, 0);
                        obj.rotation.z = -obj.userData.angle;
                    } else {
                        obj.position.set(x, y, 0);
                    }
                }
            });
        });
    }
    else if (type === 'collision') {
        expDesc.textContent = "Particle Collision: Watch particles bounce and interact in 3D space";
        
        for (let i = 0; i < 30; i++) {
            const size = 0.3 + Math.random() * 0.4;
            const geometry = new THREE.SphereGeometry(size, 24, 24);
            const material = new THREE.MeshPhongMaterial({ 
                color: Math.random() > 0.5 ? 0x00d4ff : 0xff006e,
                emissive: Math.random() > 0.5 ? 0x00d4ff : 0xff006e,
                emissiveIntensity: 0.3,
                shininess: 60
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.set((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10);
            particle.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.15);
            expObjects.push(particle);
            expScene.add(particle);
        }
        
        const boundary = new THREE.Mesh(new THREE.BoxGeometry(28, 18, 12), new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.15 }));
        expScene.add(boundary);
        expObjects.push(boundary);
        
        expCamera.position.z = 25;
        
        animateExp(() => {
            expObjects.forEach(p => {
                if (p.velocity) {
                    p.position.add(p.velocity);
                    if (p.position.x > 13 || p.position.x < -13) p.velocity.x *= -1;
                    if (p.position.y > 8 || p.position.y < -8) p.velocity.y *= -1;
                    if (p.position.z > 5 || p.position.z < -5) p.velocity.z *= -1;
                    p.rotation.x += p.velocity.y * 2;
                    p.rotation.y += p.velocity.x * 2;
                }
            });
        });
    }
    else if (type === 'gravity') {
        expDesc.textContent = "Gravity Well: Visualize how mass curves spacetime";
        
        const massGeometry = new THREE.SphereGeometry(2.5, 48, 48);
        const massMaterial = new THREE.MeshPhongMaterial({ color: 0x222222, emissive: 0xff6600, emissiveIntensity: 0.4, shininess: 100 });
        const mass = new THREE.Mesh(massGeometry, massMaterial);
        expScene.add(mass);
        expObjects.push(mass);
        
        const glow = new THREE.Mesh(new THREE.SphereGeometry(3.5, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.12 }));
        expScene.add(glow);
        expObjects.push(glow);
        
        for (let i = 0; i < 15; i++) {
            const objGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const objMaterial = new THREE.MeshPhongMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.4 });
            const obj = new THREE.Mesh(objGeometry, objMaterial);
            const r = 6 + Math.random() * 8;
            const angle = Math.random() * Math.PI * 2;
            obj.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
            obj.userData = { radius: r, angle, speed: 0.3 / Math.sqrt(r) };
            expObjects.push(obj);
            expScene.add(obj);
        }
        
        expCamera.position.z = 22;
        
        animateExp(() => {
            expObjects.forEach(obj => {
                if (obj.userData && obj.userData.radius !== undefined) {
                    obj.userData.angle += obj.userData.speed * 0.02;
                    const newX = Math.cos(obj.userData.angle) * obj.userData.radius;
                    const newZ = Math.sin(obj.userData.angle) * obj.userData.radius;
                    const wobble = Math.sin(obj.userData.angle * 3) * 0.5;
                    obj.position.set(newX, wobble, newZ);
                }
            });
        });
    }
}

function animateExp(onUpdate) {
    function anim() {
        animationId = requestAnimationFrame(anim);
        if (onUpdate) onUpdate();
        expRenderer.render(expScene, expCamera);
    }
    anim();
}

