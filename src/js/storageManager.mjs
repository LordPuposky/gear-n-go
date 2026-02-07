/**
 * storageManager.mjs
 * Handles gear-specific logic using global storage utilities.
 * Important: Only imports storage functions, does not re-declare them.
 */
import { getLocalStorage, setLocalStorage } from './utils.mjs';

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
    // Filter out the item that matches the ID to update the list
    closet = closet.filter(item => item.id != itemId);
    setLocalStorage('gear-closet', closet);
}