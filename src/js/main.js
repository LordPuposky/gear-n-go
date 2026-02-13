/**
 * Entry point for Gear & Go
 * Handles shared components, weight calculation logic (Task 07),
 * and Weather API integration with gear suggestions (Task 08).
 */
import ExternalServices from './ExternalServices.mjs';
import { addGearToCloset, removeGearFromCloset } from './storageManager.mjs';
import { gearItemTemplate, getLocalStorage, renderList } from './utils.mjs';

const services = new ExternalServices();
const WEATHER_KEY = 'UN9WHVRM7EBAV2LLZMVWM68UR';

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

function calculateTotalWeight(gearList) {
    return gearList.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
}

function updateWeightStatus() {
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

        if (percentage > 80) {
            weightProgress.style.backgroundColor = 'var(--danger-red)';
            weightProgress.style.color = 'var(--white)';
            if (statusLabel) statusLabel.innerText = 'DANGER: HEAVY';
        } else if (percentage > 50) {
            weightProgress.style.backgroundColor = 'var(--warn-yellow)';
            weightProgress.style.color = '#333';
            if (statusLabel) statusLabel.innerText = 'WARNING: MODERATE';
        } else {
            weightProgress.style.backgroundColor = 'var(--safe-green)';
            weightProgress.style.color = 'var(--white)';
            if (statusLabel) statusLabel.innerText = 'SUCCESS: LIGHT';
        }
    }
    if (totalDisplay) totalDisplay.innerText = totalWeight.toFixed(0);
}

// --- WEATHER API INTEGRATION (Task 08) ---

function getCachedWeather(location) {
    const cache = JSON.parse(localStorage.getItem(`weather-${location}`));
    if (cache) {
        const isFresh = (Date.now() - cache.timestamp) < 3600000;
        if (isFresh) return cache.data;
    }
    return null;
}

function displayGearSuggestions(weather) {
    const suggestions = [];

    if (weather.precipProb > 30) suggestions.push("Rain Jacket (High chance of rain)");
    if (weather.temp < 10) suggestions.push("Insulated Down Jacket (Cold weather forecast)");
    if (weather.temp > 25) suggestions.push("Extra Water Bottle (High heat warning)");
    if (weather.conditions.toLowerCase().includes("wind")) suggestions.push("Windbreaker (Breezy conditions)");

    const container = document.getElementById('weather-suggestions');
    if (container) {
        container.innerHTML = `
            <h3>Weather-Based Recommendations</h3>
            <p><strong>Current:</strong> ${weather.conditions}, ${weather.temp}°C</p>
            <ul>${suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
        `;
    }
}

async function initWeather(location) {
    let weatherData = getCachedWeather(location);

    if (!weatherData) {
        weatherData = await services.getWeatherData(location, WEATHER_KEY);

        if (weatherData) {
            localStorage.setItem(`weather-${location}`, JSON.stringify({
                timestamp: Date.now(),
                data: weatherData
            }));
        }
    }

    if (weatherData) {
        displayGearSuggestions(weatherData);
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadSharedComponents();

    const gearForm = document.getElementById('gear-form');
    const gearListContainer = document.getElementById('gear-list-container');

    if (gearListContainer) {
        renderList(getLocalStorage('gear-closet'), gearListContainer, gearItemTemplate);
        updateWeightStatus();
        renderCategoryBreakdown();
    }

    initWeather('Bogota');

    if (gearForm) {
        gearForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(gearForm);
            const newItem = {
                id: Date.now(),
                name: formData.get('name'),
                brand: formData.get('brand'),
                weight: parseFloat(formData.get('weight')) || 0,
                category: formData.get('category'),
                packed: false // Initialize packed state
            };
            addGearToCloset(newItem);
            renderList(getLocalStorage('gear-closet'), gearListContainer, gearItemTemplate);
            updateWeightStatus();
            renderCategoryBreakdown();
            gearForm.reset();
        });
    }

    if (gearListContainer) {
        gearListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove')) {
                removeGearFromCloset(e.target.getAttribute('data-id'));
                renderList(getLocalStorage('gear-closet'), gearListContainer, gearItemTemplate);
                updateWeightStatus();
                renderCategoryBreakdown();
            }
        });
    }

    // --- TASK 11: FIXED CHECKBOX INTERACTION & PERSISTENCE ---
    if (gearListContainer) {
        gearListContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('trip-checkbox')) {
                const itemId = e.target.getAttribute('data-id');
                const isPacked = e.target.checked;

                // 1. Update UI Visually (Fade animation)
                const card = e.target.closest('.inventory-card');
                if (card) card.classList.toggle('packed-item', isPacked);

                // 2. Persist state in localStorage
                const gearList = getLocalStorage('gear-closet');
                const itemIndex = gearList.findIndex(item => item.id == itemId);

                if (itemIndex !== -1) {
                    gearList[itemIndex].packed = isPacked;
                    localStorage.setItem('gear-closet', JSON.stringify(gearList));
                }

                console.log(`Item ${itemId} persistence updated: ${isPacked}`);
            }
        });
    }
});

// --- DATA VISUALIZATION (Task 10) ---

function getCategoryWeights(gearList) {
    const totals = {};
    gearList.forEach(item => {
        const cat = item.category || 'Other';
        const weight = Number(item.weight) || 0;
        if (!totals[cat]) totals[cat] = 0;
        totals[cat] += weight;
    });
    return totals;
}

function renderCategoryBreakdown() {
    const gearList = getLocalStorage('gear-closet');
    const categoryTotals = getCategoryWeights(gearList);
    const container = document.getElementById('category-breakdown-container');

    if (!container) return;

    container.innerHTML = '<h3 style="margin-bottom: 1rem;">Weight by Category</h3>';

    Object.keys(categoryTotals).forEach(category => {
        const weight = categoryTotals[category];
        const catElement = document.createElement('div');
        catElement.className = 'category-stat animate-pop';

        catElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px;">
                <span>${category}</span>
                <span>${weight}g</span>
            </div>
            <div class="progress-bar-bg" style="height: 12px; background: #eee; border-radius: 6px;">
                <div style="width: ${Math.min((weight / 5000) * 100, 100)}%;
                            height: 100%;
                            background: var(--accent-color);
                            border-radius: 6px;
                            transition: width 0.5s ease;"></div>
            </div>
        `;
        container.appendChild(catElement);
    });
}

/**
 * Helper to filter packed items only for specific trip summaries.
 */
function calculateTripWeight(gearList) {
    return gearList
        .filter(item => item.packed)
        .reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
}