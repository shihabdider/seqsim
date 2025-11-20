// SeqSim Engine Logic

let currentStepIndex = 0;
const stage = document.getElementById('stage');
const titleEl = document.getElementById('sim-title');
const stepLabelEl = document.getElementById('step-label');
const stepDescEl = document.getElementById('step-desc');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progressBar = document.getElementById('progress-bar');

function init() {
    // Ensure SIMULATION_DATA is available
    if (typeof window.SIMULATION_DATA === 'undefined') {
        console.error("SIMULATION_DATA not found. Make sure a simulation file is loaded.");
        return;
    }

    titleEl.textContent = window.SIMULATION_DATA.title;
    renderActors();
    updateState(0);

    // Iconify automatically watches the DOM, so we don't need an explicit create call like Lucide.
}

function renderActors() {
    stage.innerHTML = ''; // Clear stage
    window.SIMULATION_DATA.actors.forEach(actor => {
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
    const step = window.SIMULATION_DATA.steps[index];

    // Update Text
    stepLabelEl.textContent = `${index + 1}. ${step.label}`;
    stepDescEl.textContent = step.text;

    // Update Progress Bar
    const progress = ((index) / (window.SIMULATION_DATA.steps.length - 1)) * 100;
    progressBar.style.width = `${progress}%`;

    // Update Buttons
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === window.SIMULATION_DATA.steps.length - 1;

    // Update Actors
    window.SIMULATION_DATA.actors.forEach(actor => {
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
    if (currentStepIndex < window.SIMULATION_DATA.steps.length - 1) {
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

// Start
document.addEventListener('DOMContentLoaded', init);
