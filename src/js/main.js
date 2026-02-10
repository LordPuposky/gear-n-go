/**
 * Entry point for Gear & Go
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

// --- WEIGHT CALCULATOR LOGIC (Task 07) ---

/**
 * [Subtask: Sum Logic]
 * Process weight totals from the selected gear list.
 * This function iterates through the gear objects and returns the total in grams.
 */
function calculateTotalWeight(gearList) {
    return gearList.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
}

/**
 * [Subtask: Color-coded indicator]
 * Updates UI with Green (Success), Amber (Warning), or Red (Danger).
 * Includes contrast correction for Warning state.
 */
function updateWeightStatus() {
    console.log("Recalculating weight status...");
    const closet = getLocalStorage('gear-closet');
    const totalWeight = calculateTotalWeight(closet);

    const maxWeight = 5000;
    const percentage = Math.round(Math.min((totalWeight / maxWeight) * 100, 100));

    const weightProgress = document.getElementById('weight-progress');
    const statusLabel = document.getElementById('status-label');
    const totalDisplay = document.getElementById('total-val');
    const percentDisplay = document.getElementById('weight-percent');

    if (weightProgress) {
        weightProgress.style.width = `${percentage}%`;
        if (percentDisplay) percentDisplay.innerText = `${percentage}%`;

        // Contrast and Color Logic
        if (percentage > 80) {
            // DANGER: Red background / White text
            weightProgress.style.backgroundColor = 'var(--danger-red)';
            weightProgress.style.color = 'var(--white)';
            if (statusLabel) statusLabel.innerText = 'DANGER: HEAVY';
        } else if (percentage > 50) {
            // WARNING: Yellow background / Dark text for Contrast
            weightProgress.style.backgroundColor = 'var(--warn-yellow)';
            weightProgress.style.color = '#333';
            if (statusLabel) statusLabel.innerText = 'WARNING: MODERATE';
        } else {
            // SUCCESS: Green background / White text
            weightProgress.style.backgroundColor = 'var(--safe-green)';
            weightProgress.style.color = 'var(--white)';
            if (statusLabel) statusLabel.innerText = 'SUCCESS: LIGHT';
        }
    }

    if (totalDisplay) totalDisplay.innerText = totalWeight.toFixed(0);
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadSharedComponents();

    const gearForm = document.getElementById('gear-form');
    const gearListContainer = document.getElementById('gear-list-container');

    // [Subtask: Initial Load Recalculation]
    // Ensures the list and weight are rendered correctly on startup.
    if (gearListContainer) {
        renderList(getLocalStorage('gear-closet'), gearListContainer, gearItemTemplate);
        updateWeightStatus();
    }

    /**
     * [Subtask: Weight Update Event Listeners]
     * Detects when new items are added to trigger an immediate recalculation.
     */
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

            // Refresh the UI list and update the weight status bar
            renderList(getLocalStorage('gear-closet'), gearListContainer, gearItemTemplate);
            updateWeightStatus();

            gearForm.reset();
        });
    }

    /**
     * [Subtask: Weight Update Event Listeners]
     * Detects when items are removed to trigger an immediate recalculation.
     */
    if (gearListContainer) {
        gearListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove')) {
                const itemId = e.target.getAttribute('data-id');
                removeGearFromCloset(itemId);

                // Refresh the UI list and update the weight status bar
                renderList(getLocalStorage('gear-closet'), gearListContainer, gearItemTemplate);
                updateWeightStatus();
            }
        });
    }
});