/**
 * Handles saving and retrieving data from the browser's LocalStorage.
 */

/**
 * Retrieves an item from localStorage and parses it from JSON.
 * @param {string} key - The key of the item to retrieve.
 * @returns {Array|Object} - The parsed data or an empty array if not found.
 */
export function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

/**
 * Saves data to localStorage after converting it to a JSON string.
 * @param {string} key - The key under which to save the data.
 * @param {any} data - The data to be stored.
 */
export function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * [Subtask: Create Function]
 * Adds a new gear item to the existing list in localStorage.
 * @param {Object} newItem - The gear object to add.
 */
export function addGearToCloset(newItem) {
    const closet = getLocalStorage('gear-closet');
    closet.push(newItem);
    setLocalStorage('gear-closet', closet);
}

/**
 * [Subtask: Delete Function]
 * Removes a gear item from localStorage by its ID.
 * @param {number|string} itemId - The unique ID of the item to remove.
 */
export function removeGearFromCloset(itemId) {
    let closet = getLocalStorage('gear-closet');
    // Filter out the item that matches the ID
    closet = closet.filter(item => item.id != itemId);
    setLocalStorage('gear-closet', closet);
}