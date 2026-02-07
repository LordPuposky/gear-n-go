/**
 * Handles all fetch requests to the external product API,
 * manages error states, and transforms data for internal use.
 */

const baseURL = 'https://wdd330-backend.onrender.com/';

/**
 * Helper function to validate the API response and convert it to JSON.
 * [Subtask: Error Handling] - Manages potential API downtime or invalid responses.
 */
async function convertToJson(res) {
    try {
        const data = await res.json();
        if (res.ok) {
            return data;
        } else {
            // Throws a custom error if the server response is not OK (e.g., 404 or 500)
            throw { name: 'servicesError', message: data };
        }
    } catch (err) {
        console.error("Critical API Error during conversion:", err);
        throw err;
    }
}

export default class ExternalServices {
    constructor() {
        // Basic constructor for the service class
    }

    /**
     * Fetches a list of products by category and transforms them into the app's internal format.
     * [Subtask: Data Fetching Logic & Data Transformation]
     * @param {string} category - The category to search (e.g., 'tents', 'backpacks').
     * @returns {Promise<Array>} - A list of cleaned product objects.
     */
    async getData(category) {
        try {
            const response = await fetch(`${baseURL}products/search/${category}`);
            const data = await convertToJson(response);

            /**
             * Mapping the incoming API data to the Gear & Go internal format.
             * [Subtask: Data Transformation] - Ensures weight is a number and fields are standardized.
             */
            return data.Result.map(item => ({
                id: item.Id,
                name: item.Name,
                brand: item.Brand.Name,
                // Ensures weight is always a number (float) or 0 for future weight calculations
                weight: item.Weight ? parseFloat(item.Weight) : 0,
                category: category,
                source: 'api'
            }));
        } catch (error) {
            // Returns an empty array in case of failure to prevent the app from breaking
            console.error("Data Transformation Error in getData:", error);
            return [];
        }
    }

    /**
     * Fetches full details for a single product by its unique ID.
     * @param {string} id - The product ID.
     * @returns {Promise<Object>} - The raw product data from the API.
     */
    async findProductById(id) {
        try {
            const response = await fetch(`${baseURL}product/${id}`);
            const data = await convertToJson(response);
            return data.Result;
        } catch (error) {
            console.error("Error in findProductById:", error);
            throw error;
        }
    }
}