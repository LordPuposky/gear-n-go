import ExternalServices from './ExternalServices.mjs';
import { gearItemTemplate, getLocalStorage, renderList } from './utils.mjs';

const services = new ExternalServices();
const WEATHER_KEY = 'UN9WHVRM7EBAV2LLZMVWM68UR';

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

document.addEventListener('DOMContentLoaded', () => {
    loadSharedComponents();

    const gearListContainer = document.getElementById('gear-list-container');
    if (gearListContainer) {
        renderList(getLocalStorage('gear-closet'), gearListContainer, gearItemTemplate);
    }

    if (gearListContainer) {
        gearListContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('trip-checkbox')) {
                const itemId = e.target.getAttribute('data-id');
                const isPacked = e.target.checked;
                const card = e.target.closest('.inventory-card');

                if (card) card.classList.toggle('packed-item', isPacked);

                const gearList = getLocalStorage('gear-closet');
                const itemIndex = gearList.findIndex(item => item.id == itemId);
                if (itemIndex !== -1) {
                    gearList[itemIndex].packed = isPacked;
                    localStorage.setItem('gear-closet', JSON.stringify(gearList));
                }
            }
        });
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered!', reg))
            .catch(err => console.error('SW Registration failed:', err));
    });
}