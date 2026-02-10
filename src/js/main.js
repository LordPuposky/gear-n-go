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

/**
 * [Subtask: Sum Logic]
 * Process weight totals from the selected gear list.
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

        // Threshold-based color logic
        if (percentage > 80) {
            weightProgress.style.backgroundColor = 'var(--danger-red)';
            weightProgress.style.color = 'var(--white)';
            if (statusLabel) statusLabel.innerText = 'DANGER: HEAVY';
        } else if (percentage > 50) {
            // Text color adjusted to dark for yellow contrast
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

/**
 * [Subtask: Implement API caching]
 * Checks localStorage for recent weather data (less than 1 hour old) to stay within rate limits.
 */
function getCachedWeather(location) {
    const cache = JSON.parse(localStorage.getItem(`weather-${location}`));
    if (cache) {
        const isFresh = (Date.now() - cache.timestamp) < 3600000; // 1 hour expiration
        if (isFresh) return cache.data;
    }
    return null;
}

/**
 * [Subtask: Map weather conditions to gear suggestions]
 * Analyzes forecast data to recommend essential gear items.
 */
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

/**
 * [Subtask: Fetch weather data by destination]
 * Main orchestrator for weather retrieval and caching logic.
 */
async function initWeather(location) {
    let weatherData = getCachedWeather(location);

    if (!weatherData) {
        console.log("Fetching new weather data from API...");
        weatherData = await services.getWeatherData(location, WEATHER_KEY);

        if (weatherData) {
            // Save to cache for efficiency
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

    // Initial load and render
    if (gearListContainer) {
        renderList(getLocalStorage('gear-closet'), gearListContainer, gearItemTemplate);
        updateWeightStatus();
    }

    // Trigger weather for a default location or dynamic input (e.g., 'Bogota')
    initWeather('Bogota');

    // [Subtask: Weight Update Event Listeners]
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

    if (gearListContainer) {
        gearListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove')) {
                removeGearFromCloset(e.target.getAttribute('data-id'));
                renderList(getLocalStorage('gear-closet'), gearListContainer, gearItemTemplate);
                updateWeightStatus();
            }
        });
    }
});