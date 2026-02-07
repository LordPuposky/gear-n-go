/**
 * main.js - Entry point for Gear & Go
 * Handles shared components, weight logic, and CRUD operations.
 */
import { addGearToCloset, removeGearFromCloset } from './storageManager.mjs';
import { gearItemTemplate, getLocalStorage, renderList } from './utils.mjs';

// --- SHARED COMPONENTS ---
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
        footer.innerHTML = `<p>&copy; 2026 Gear & Go - Expedition Companion</p>`;
    }
}

// --- WEIGHT LOGIC ---
function updateWeightStatus() {
    console.log("Updating weight status...");
    const closet = getLocalStorage('gear-closet');
    const totalWeight = closet.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);

    const maxWeight = 5000;
    const percentage = Math.round(Math.min((totalWeight / maxWeight) * 100, 100));

    const weightProgress = document.getElementById('weight-progress');
    const statusLabel = document.getElementById('status-label');
    const totalDisplay = document.getElementById('total-val');
    const percentDisplay = document.getElementById('weight-percent');

    if (weightProgress) {
        weightProgress.style.width = `${percentage}%`;
        if (percentDisplay) percentDisplay.innerText = `${percentage}%`;

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

    if (totalDisplay) totalDisplay.innerText = totalWeight.toFixed(0);
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    loadSharedComponents();

    const gearForm = document.getElementById('gear-form');
    const gearListContainer = document.getElementById('gear-list-container');

    // Load existing items
    if (gearListContainer) {
        const currentGear = getLocalStorage('gear-closet');
        renderList(currentGear, gearListContainer, gearItemTemplate);
        updateWeightStatus();
    }

    // Handle Form Submission
    if (gearForm) {
        console.log("Gear form found and listener attached");
        gearForm.addEventListener('submit', (e) => {
            e.preventDefault(); // THIS STOP THE PAGE REFRESH
            console.log("Form submitted!");

            const formData = new FormData(gearForm);
            const newItem = {
                id: Date.now(),
                name: formData.get('name'),
                brand: formData.get('brand'),
                weight: parseFloat(formData.get('weight')) || 0
            };

            addGearToCloset(newItem);

            // Refresh UI
            const updatedCloset = getLocalStorage('gear-closet');
            renderList(updatedCloset, gearListContainer, gearItemTemplate);
            updateWeightStatus();

            gearForm.reset();
        });
    } else {
        console.warn("Gear form NOT found. Check your HTML IDs.");
    }

    // Handle Delete
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
});