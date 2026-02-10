/**
 * Handles all fetch requests to external APIs (Products & Weather),
 * manages error states, and transforms data for internal use.
 */

const baseURL = 'https://wdd330-backend.onrender.com/';
// Visual Crossing Weather API Base URL
const weatherBaseURL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';

async function convertToJson(res) {
    try {
        const data = await res.json();
        if (res.ok) {
            return data;
        } else {
            throw { name: 'servicesError', message: data };
        }
    } catch (err) {
        console.error("Critical API Error during conversion:", err);
        throw err;
    }
}

export default class ExternalServices {
    constructor() { }

    /**
     * [Subtask: Fetch weather data by destination]
     * Retrieves temperature, conditions, and precipitation probability.
     * @param {string} location - Destination (e.g., 'London' or '40.7128,-74.0060').
     * @param {string} apiKey - Your Visual Crossing API Key.
     */
    async getWeatherData(location, apiKey) {
        try {
            // Fetching a 7-day forecast to analyze upcoming conditions
            const response = await fetch(`${weatherBaseURL}${location}?unitGroup=metric&key=${apiKey}&contentType=json`);
            const data = await convertToJson(response);

            /**
             * Transforming API data for internal use.
             * We extract temperature, conditions, and precip probability.
             */
            return {
                temp: data.currentConditions.temp,
                conditions: data.currentConditions.conditions,
                precipProb: data.currentConditions.precipprob,
                description: data.description,
                days: data.days // Useful for future gear mapping
            };
        } catch (error) {
            console.error("Weather API Fetch Error:", error);
            return null;
        }
    }

    async getData(category) {
        try {
            const response = await fetch(`${baseURL}products/search/${category}`);
            const data = await convertToJson(response);
            return data.Result.map(item => ({
                id: item.Id,
                name: item.Name,
                brand: item.Brand.Name,
                weight: item.Weight ? parseFloat(item.Weight) : 0,
                category: category,
                source: 'api'
            }));
        } catch (error) {
            console.error("Data Transformation Error in getData:", error);
            return [];
        }
    }

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