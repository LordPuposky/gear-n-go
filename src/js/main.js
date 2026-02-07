/**
 * Entry point for Gear & Go
 * Handles shared components, weight logic, and CRUD operations.
 */
import { addGearToCloset, getLocalStorage, removeGearFromCloset } from './storageManager.mjs';
import { gearItemTemplate, renderList } from './utils.mjs';

/**
 * Loads the shared navigation and footer across all pages.
 */
function loadSharedComponents() {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    if (header) {
        header.innerHTML = `
            <nav>
                <div class="logo">Gear & Go</div>
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="closet.html">Closet</a></li>
                    <li><a href="trip.html">Trip</a></li>
                </ul>
            </nav>
        `;
    }

    if (footer) {
        footer.innerHTML = `
            <p>&copy; 2026 Gear & Go - Expedition Companion</p>
        `;
    }
}

/**
 * [Subtask: Update Weight Logic - Enhanced]
 * Calculates weight and updates the UI progress bar, percentage, and capacity label.
 */
function updateWeightStatus() {
    const closet = getLocalStorage('gear-closet');
    const totalWeight = closet.reduce((sum, item) => sum + (item.weight || 0), 0);

    // Max capacity limit for a light expedition (5000g)
    const maxWeight = 5000;
    const percentage = Math.round(Math.min((totalWeight / maxWeight) * 100, 100));

    // UI Elements
    const weightProgress = document.getElementById('weight-progress');
    const statusLabel = document.getElementById('status-label');
    const totalDisplay = document.getElementById('total-val');
    const percentDisplay = document.getElementById('weight-percent');

    if (weightProgress) {
        // Update bar width and percentage text
        weightProgress.style.width = `${percentage}%`;
        if (percentDisplay) percentDisplay.innerText = `${percentage}%`;

        // Color and Label logic based on thresholds
        if (percentage > 80) {
            weightProgress.style.backgroundColor = 'var(--danger-red)';
            if (statusLabel) statusLabel.innerText = 'HEAVY';
        } else if (percentage > 50) {
            weightProgress.style.backgroundColor = 'var(--warn-yellow)';
            if (statusLabel) statusLabel.innerText = 'MODERATE';
        } else {
            weightProgress.style.backgroundColor = 'var(--safe-green)';
            if (statusLabel) statusLabel.innerText = 'LIGHT';
        }
    }

    // Display the exact total weight
    if (totalDisplay) {
        totalDisplay.innerText = totalWeight.toFixed(0);
    }
}

// --- INITIALIZATION ---

const gearForm = document.getElementById('gear-form');
const gearListContainer = document.getElementById('gear-list-container');

// Initial Load: Render list and calculate weight
if (gearListContainer) {
    const currentGear = getLocalStorage('gear-closet');
    renderList(currentGear, gearListContainer, gearItemTemplate);
    updateWeightStatus();
}

// Handle Form Submission (Create)
if (gearForm) {
    gearForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(gearForm);

        const newItem = {
            id: Date.now(),
            name: formData.get('name'),
            brand: formData.get('brand'),
            weight: parseFloat(formData.get('weight')) || 0
        };

        addGearToCloset(newItem);
        renderList(getLocalStorage('gear-closet'), gearListContainer, gearItemTemplate);
        updateWeightStatus();
        gearForm.reset();
    });
}

// Handle Item Removal (Delete) via Event Delegation
if (gearListContainer) {
    gearListContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove')) {
            const itemId = e.target.getAttribute('data-id');

            removeGearFromCloset(itemId);
            renderList(getLocalStorage('gear-closet'), gearListContainer, gearItemTemplate);
            updateWeightStatus();
        }
    });
}

// Load global UI components
loadSharedComponents();