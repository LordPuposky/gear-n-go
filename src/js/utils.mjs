/**
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
 * [Subtask: Task 11 - Dynamic Checklist Template]
 * Template for a single gear item card including a trip checkbox.
 * Includes conditional classes for the fade animation on packed items.
 * @param {Object} item - Gear item data.
 * @returns {string} - HTML string for the card.
 */
export function gearItemTemplate(item) {
    // Check if the item was previously marked as packed
    const isChecked = item.packed ? 'checked' : '';

    return `
        <div class="inventory-card animate-pop ${item.packed ? 'packed-item' : ''}">
            <div class="card-main-content">
                <input type="checkbox" class="trip-checkbox" data-id="${item.id}" ${isChecked}>
                <div class="item-text">
                    <span class="item-name"><strong>${item.name}</strong></span>
                    <span class="item-details">${item.brand} | ${item.weight}g</span>
                </div>
            </div>
            <button class="btn-remove" data-id="${item.id}">Remove Item</button>
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