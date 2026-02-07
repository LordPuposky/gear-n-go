/**
 * UI helpers for rendering templates.
 */

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