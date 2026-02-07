/**
 * main.js - Entry point for Gear & Go
 * Handles shared components and page-specific routing logic.
 */
import { getLocalStorage, setLocalStorage } from './storageManager.mjs';

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

loadSharedComponents();