import ExternalServices from './ExternalServices.mjs';
import { addGearToCloset, removeGearFromCloset } from './storageManager.mjs';
import { gearItemTemplate, getLocalStorage, renderList, setLocalStorage } from './utils.mjs';

const services = new ExternalServices();
const WEIGHT_LIMIT = 5000;
const WEATHER_KEY = 'UN9WHVRM7EBAV2LLZMVWM68UR';

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function loadSharedComponents() {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    if (header && !document.getElementById('offline-notice')) {
        const notice = document.createElement('div');
        notice.id = 'offline-notice';
        notice.textContent = '⚠️ You are currently offline. Viewing cached data.';
        document.body.insertBefore(notice, header);
    }

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

// ─── ONLINE / OFFLINE STATUS ──────────────────────────────────────────────────

function updateOnlineStatus() {
    if (navigator.onLine) {
        document.body.classList.remove('is-offline');
    } else {
        document.body.classList.add('is-offline');
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// ─── WEIGHT INDICATOR (Closet) ────────────────────────────────────────────────

function updateWeightIndicator(gearList) {
    const totalWeight = gearList.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
    const percent = Math.min((totalWeight / WEIGHT_LIMIT) * 100, 100);

    const progressBar = document.getElementById('weight-progress');
    const totalVal = document.getElementById('total-val');
    const statusLabel = document.getElementById('status-label');
    const weightPercent = document.getElementById('weight-percent');

    if (!progressBar) return;

    progressBar.style.width = percent + '%';
    if (weightPercent) weightPercent.textContent = Math.round(percent) + '%';
    if (totalVal) totalVal.textContent = totalWeight.toFixed(0);

    if (percent < 50) {
        progressBar.style.backgroundColor = 'var(--safe-green)';
        if (statusLabel) statusLabel.textContent = 'LIGHT';
    } else if (percent < 80) {
        progressBar.style.backgroundColor = 'var(--warn-yellow)';
        if (statusLabel) statusLabel.textContent = 'MODERATE';
    } else {
        progressBar.style.backgroundColor = 'var(--danger-red)';
        if (statusLabel) statusLabel.textContent = 'HEAVY';
    }
}

// ─── CATEGORY BREAKDOWN (Closet) ──────────────────────────────────────────────

function updateCategoryBreakdown(gearList) {
    const container = document.getElementById('category-breakdown-container');
    if (!container) return;

    if (gearList.length === 0) {
        container.innerHTML = '<p>Add items to see the breakdown...</p>';
        return;
    }

    const categories = {};
    gearList.forEach(item => {
        const cat = item.category || 'Other';
        if (!categories[cat]) categories[cat] = 0;
        categories[cat] += parseFloat(item.weight || 0);
    });

    const totalWeight = Object.values(categories).reduce((a, b) => a + b, 0);

    container.innerHTML = Object.entries(categories).map(([cat, weight]) => {
        const pct = totalWeight > 0 ? ((weight / totalWeight) * 100).toFixed(1) : 0;
        return `
            <div>
                <strong>${cat}</strong>: ${weight.toFixed(0)}g (${pct}%)
                <div class="progress-bar-bg" style="margin-top:4px;">
                    <div style="width:${pct}%; height:100%; background-color:var(--accent-color); border-radius:8px;"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ─── RENDER CLOSET ────────────────────────────────────────────────────────────

function renderCloset() {
    const gearList = getLocalStorage('gear-closet');
    const container = document.getElementById('gear-list-container');
    if (!container) return;

    if (gearList.length === 0) {
        container.innerHTML = '<p>Your closet is empty. Add some gear above!</p>';
    } else {
        renderList(gearList, container, gearItemTemplate);
    }

    updateWeightIndicator(gearList);
    updateCategoryBreakdown(gearList);
}

// ─── GEAR FORM SUBMIT ─────────────────────────────────────────────────────────

function initGearForm() {
    const form = document.getElementById('gear-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('gear-name').value.trim();
        const brand = document.getElementById('gear-brand').value.trim();
        const category = document.getElementById('gear-category').value;
        const weight = parseFloat(document.getElementById('gear-weight').value);

        if (!name || !brand || !category || isNaN(weight) || weight <= 0) {
            alert('Please fill in all fields with valid values.');
            return;
        }

        const newItem = {
            id: Date.now(),
            name,
            brand,
            category,
            weight,
            packed: false,
            condition: "Good",
            addedAt: new Date().toLocaleDateString()
        };

        addGearToCloset(newItem);
        form.reset();
        renderCloset();
    });
}

// ─── REMOVE & PACK ITEMS (Closet) ─────────────────────────────────────────────

function initGearListEvents() {
    const container = document.getElementById('gear-list-container');
    if (!container) return;

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove')) {
            const itemId = e.target.getAttribute('data-id');
            removeGearFromCloset(itemId);
            renderCloset();
        }
    });

    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('trip-checkbox')) {
            const itemId = e.target.getAttribute('data-id');
            const isPacked = e.target.checked;
            const card = e.target.closest('.inventory-card');

            if (card) card.classList.toggle('packed-item', isPacked);

            const gearList = getLocalStorage('gear-closet');
            const itemIndex = gearList.findIndex(item => item.id == itemId);
            if (itemIndex !== -1) {
                gearList[itemIndex].packed = isPacked;
                setLocalStorage('gear-closet', gearList);
            }

            updateWeightIndicator(gearList);
        }
    });
}

// ─── TRIP PAGE ────────────────────────────────────────────────────────────────

function renderTripChecklist() {
    const gearList = getLocalStorage('gear-closet');
    const container = document.getElementById('checklist-container');
    if (!container) return;

    if (gearList.length === 0) {
        container.innerHTML = '<p>Select items from your closet to start planning...</p>';
        return;
    }

    // CORRECCIÓN: Definimos packedItems filtrando la gearList
    const packedItems = gearList.filter(item => item.packed);

    if (packedItems.length === 0) {
        container.innerHTML = '<p>Select items from your closet to start planning...</p>';
        return;
    }

    // Agrupar por categoría
    const categories = {};
    packedItems.forEach(item => {
        const cat = item.category || 'Other';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(item);
    });

    container.innerHTML = Object.entries(categories).map(([cat, items]) => {
        const itemsHTML = items.map(item => `
            <div class="inventory-card animate-pop">
                <div class="card-main-content">
                    <div class="item-text">
                        <span class="item-name"><strong>${item.name}</strong></span>
                        <span class="item-details">${item.brand} | ${item.weight}g</span>
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <div style="margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 0.5rem; color: var(--primary-color);">📦 ${cat}</h3>
                ${itemsHTML}
            </div>
        `;
    }).join('');
}

function renderTripWeightBreakdown() {
    const gearList = getLocalStorage('gear-closet');
    const packedItems = gearList.filter(item => item.packed);

    const totalVal = document.getElementById('total-val');
    const breakdownContainer = document.getElementById('category-breakdown-container');

    const totalWeight = packedItems.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
    if (totalVal) totalVal.textContent = totalWeight.toFixed(0);

    if (!breakdownContainer) return;

    if (packedItems.length === 0) {
        breakdownContainer.innerHTML = '<p>Calculating category distribution...</p>';
        return;
    }

    const categories = {};
    packedItems.forEach(item => {
        const cat = item.category || 'Other';
        if (!categories[cat]) categories[cat] = 0;
        categories[cat] += parseFloat(item.weight || 0);
    });

    breakdownContainer.innerHTML = Object.entries(categories).map(([cat, weight]) => {
        const pct = totalWeight > 0 ? ((weight / totalWeight) * 100).toFixed(1) : 0;
        return `
            <div style="margin-bottom: 0.8rem;">
                <strong>${cat}</strong>: ${weight.toFixed(0)}g (${pct}%)
                <div class="progress-bar-bg" style="margin-top:4px;">
                    <div style="width:${pct}%; height:100%; background-color:var(--accent-color); border-radius:8px;"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ─── WEATHER SUGGESTIONS ──────────────────────────────────────────────────────

function getWeatherGearSuggestions(weatherData) {
    const suggestions = [];
    const { temp, precipProb, conditions } = weatherData;

    if (temp < 5) {
        suggestions.push('🧥 Very cold conditions — bring a heavy insulated jacket and thermal layers.');
    } else if (temp < 15) {
        suggestions.push('🧣 Cool temperatures — pack a fleece or mid-layer jacket.');
    } else if (temp > 30) {
        suggestions.push('☀️ Hot weather — pack sun protection, light clothing, and extra water.');
    }

    if (precipProb > 60) {
        suggestions.push('🌧️ High chance of rain — bring a waterproof rain jacket and dry bags.');
    } else if (precipProb > 30) {
        suggestions.push('🌦️ Possible rain — consider a packable rain cover.');
    }

    if (conditions && conditions.toLowerCase().includes('snow')) {
        suggestions.push('❄️ Snow expected — waterproof boots and gaiters recommended.');
    }

    if (conditions && conditions.toLowerCase().includes('wind')) {
        suggestions.push('💨 Windy conditions — pack a windbreaker layer.');
    }

    if (suggestions.length === 0) {
        suggestions.push('✅ Conditions look good! Standard gear should be sufficient.');
    }

    return suggestions;
}

async function loadWeatherSuggestions() {
    const container = document.getElementById('weather-suggestions');
    if (!container) return;

    container.innerHTML = '<p>Detecting your location for weather recommendations...</p>';

    if (!navigator.geolocation) {
        container.innerHTML = '<p>Geolocation not supported by your browser.</p>';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            const location = `${latitude},${longitude}`;

            const weatherData = await services.getWeatherData(location, WEATHER_KEY);

            if (!weatherData) {
                container.innerHTML = '<p>Could not load weather data. Check your connection.</p>';
                return;
            }

            const suggestions = getWeatherGearSuggestions(weatherData);

            container.innerHTML = `
                <h3 style="margin-bottom:1rem;">🌤️ Weather at Your Location</h3>
                <p><strong>Temperature:</strong> ${weatherData.temp}°C</p>
                <p><strong>Conditions:</strong> ${weatherData.conditions}</p>
                <p><strong>Rain probability:</strong> ${weatherData.precipProb}%</p>
                <hr style="margin: 1rem 0; border-color: rgba(0,0,0,0.1);">
                <h4 style="margin-bottom:0.5rem;">🎒 Gear Recommendations:</h4>
                <ul style="padding-left: 1.2rem;">
                    ${suggestions.map(s => `<li style="margin-bottom:0.4rem;">${s}</li>`).join('')}
                </ul>
            `;
        },
        (error) => {
            console.error('Geolocation error:', error);
            container.innerHTML = '<p>Location access denied. Allow location to get weather suggestions.</p>';
        }
    );
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    loadSharedComponents();

    // Closet page
    if (document.getElementById('gear-list-container')) {
        initGearForm();
        renderCloset();
        initGearListEvents();
    }

    // Trip page
    if (document.getElementById('checklist-container')) {
        renderTripChecklist();
        renderTripWeightBreakdown();
        loadWeatherSuggestions();
    }
});

// ─── SERVICE WORKER ───────────────────────────────────────────────────────────

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered!', reg))
            .catch(err => console.error('SW Registration failed:', err));
    });
}