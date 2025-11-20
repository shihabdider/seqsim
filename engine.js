// SeqSim Engine Logic

// Store all loaded simulations
const SIMULATIONS = {};
let currentSimulation = null;
let currentStepIndex = 0;

const stage = document.getElementById('stage');
const titleEl = document.getElementById('sim-title');
const stepLabelEl = document.getElementById('step-label');
const stepDescEl = document.getElementById('step-desc');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progressBar = document.getElementById('progress-bar');
const simSwitcher = document.getElementById('sim-switcher');

function registerSimulation(simData) {
    SIMULATIONS[simData.id] = simData;
}

function loadSimulation(simId) {
    if (!SIMULATIONS[simId]) {
        console.error(`Simulation "${simId}" not found.`);
        return;
    }

    currentSimulation = SIMULATIONS[simId];
    currentStepIndex = 0;
    titleEl.textContent = currentSimulation.title;
    renderActors();
    updateState(0);
}

function init() {
    // Register all simulations that have been loaded
    // Each simulation file sets window.SIMULATION_DATA
    // We need to collect them all

    // Since scripts load sequentially, we can't directly capture each SIMULATION_DATA
    // Instead, we'll use a different approach: each simulation file should call registerSimulation()

    // For backward compatibility, check if SIMULATION_DATA exists
    if (typeof window.SIMULATION_DATA !== 'undefined') {
        console.warn("Legacy SIMULATION_DATA detected. Please update simulation files to use registerSimulation().");
        registerSimulation(window.SIMULATION_DATA);
    }

    // Load the first available simulation or the one selected in dropdown
    const selectedSim = simSwitcher.value;
    if (SIMULATIONS[selectedSim]) {
        loadSimulation(selectedSim);
    } else {
        // Load first available simulation
        const firstSimId = Object.keys(SIMULATIONS)[0];
        if (firstSimId) {
            simSwitcher.value = firstSimId;
            loadSimulation(firstSimId);
        } else {
            console.error("No simulations loaded.");
        }
    }
}

function renderActors() {
    stage.innerHTML = ''; // Clear stage
    currentSimulation.actors.forEach(actor => {
        const el = document.createElement('div');
        el.id = `actor-${actor.id}`;
        el.className = `actor absolute flex flex-col items-center justify-center pointer-events-none`;
        // Centering fix: translate-x-1/2 translate-y-1/2 so x/y are center points
        el.style.transform = 'translate(-50%, -50%)';

        // Icon (Iconify)
        const icon = document.createElement('span');
        icon.className = "iconify";
        icon.setAttribute('data-icon', actor.icon);
        // Set base size for Iconify icons
        icon.style.width = '48px';
        icon.style.height = '48px';

        // Add color classes to the parent actor element (text color flows down to SVG)
        el.classList.add(...actor.color.split(' '));

        // Label (Optional, small below icon)
        if (actor.label) {
            const label = document.createElement('span');
            label.textContent = actor.label;
            label.className = "text-[10px] mt-0.5 opacity-80 whitespace-nowrap";
            el.appendChild(icon);
            el.appendChild(label);
        } else {
            el.appendChild(icon);
        }

        stage.appendChild(el);
    });
}

function updateState(index) {
    const step = currentSimulation.steps[index];

    // Update Text
    stepLabelEl.textContent = `${index + 1}. ${step.label}`;
    stepDescEl.textContent = step.text;

    // Update Progress Bar
    const progress = ((index) / (currentSimulation.steps.length - 1)) * 100;
    progressBar.style.width = `${progress}%`;

    // Update Buttons
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === currentSimulation.steps.length - 1;

    // Update Actors
    currentSimulation.actors.forEach(actor => {
        const el = document.getElementById(`actor-${actor.id}`);
        const actorState = step.state[actor.id] || { opacity: 0, x: 50, y: 50, scale: 1, rotate: 0 };

        // Apply Styles
        el.style.left = `${actorState.x}%`;
        el.style.top = `${actorState.y}%`;
        el.style.opacity = actorState.opacity;

        // Transform: translate(-50%, -50%) is base, add scale and rotate
        // Note: We must keep the centering translation
        el.style.transform = `translate(-50%, -50%) scale(${actorState.scale}) rotate(${actorState.rotate}deg)`;
    });
}

// --- CONTROLS ---

nextBtn.addEventListener('click', () => {
    if (currentStepIndex < currentSimulation.steps.length - 1) {
        currentStepIndex++;
        updateState(currentStepIndex);
    }
});

prevBtn.addEventListener('click', () => {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        updateState(currentStepIndex);
    }
});

// Simulation Switcher
simSwitcher.addEventListener('change', (e) => {
    loadSimulation(e.target.value);
});

// Expose registerSimulation globally so simulation files can use it
window.registerSimulation = registerSimulation;

// Start - use window.onload to ensure all scripts have executed
// This is important because simulation scripts need to call registerSimulation() before init()
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded, call init immediately
    init();
}
