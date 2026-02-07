/**
 * utils.mjs
 * Global helper functions for the Gear & Go application.
 * UI helpers for rendering templates and data persistence.
 */

/**
 * [Subtask: Storage Utilities]
 * Retrieves an item from localStorage and parses it from JSON.
 * @param {string} key - The localStorage key.
 * @returns {Array|Object} - The parsed data or an empty array if not found.
 */
export function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

/**
 * [Subtask: Storage Utilities]
 * Saves data to localStorage after converting it to a JSON string.
 * @param {string} key - The key under which to save the data.
 * @param {any} data - The data to be stored.
 */
export function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * [Subtask: Read/Render Closet]
 * Template for a single gear item card.
 * @param {Object} item - Gear item data.
 * @returns {string} - HTML string for the card.
 */
export function gearItemTemplate(item) {
    return `
    <div class="category-card animate-pop">
        <h3>${item.name}</h3>
        <p><strong>Brand:</strong> ${item.brand}</p>
        <p><strong>Weight:</strong> ${item.weight} g</p>
        <button class="btn-remove" data-id="${item.id}">Remove</button>
    </div>
    `;
}

/**
 * Renders a list of items into a container.
 */
export function renderList(list, containerElement, templateFn) {
    containerElement.innerHTML = ""; // Clear "Loading..." message
    const htmlStrings = list.map(templateFn);
    containerElement.innerHTML = htmlStrings.join("");
}