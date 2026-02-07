/**
 * main.js - Entry point for Gear & Go
 * Handles shared components and page-specific routing logic.
 */
import ExternalServices from './ExternalServices.mjs';

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

const services = new ExternalServices();

/**
 * Test function to verify API connection.
 * This will be removed once the Closet logic is implemented.
 */
async function testAPI() {
    try {
        const tents = await services.getData('tents');
        console.log('API Connection Successful! Tents found:', tents);
    } catch (error) {
        console.error('API Connection Failed:', error);
    }
}

testAPI();

loadSharedComponents();