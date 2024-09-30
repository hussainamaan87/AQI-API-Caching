const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const AqiData = require('../models/AqiData');
const { cache, updatePriority } = require('../cache');

const router = express.Router();

// Function to fetch AQI data
const fetchAQIData = async (country, state, city) => {
    const url = `https://www.aqi.in/dashboard/${country}/${state}/${city}`;
    
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const pm25Value = $('.Pollutants_sensor_text.pm25').text().trim();
        const pm10Value = $('.Pollutants_sensor_text.pm10').text().trim();
        const so2Value = $('.Pollutants_sensor_text').eq(2).text().trim();
        const coValue = $('.Pollutants_sensor_text').eq(3).text().trim();
        const o3Value = $('.Pollutants_sensor_text').eq(4).text().trim();
        const no2Value = $('.Pollutants_sensor_text').eq(5).text().trim();
        const lastUpdatedTime = $('.card-location-time').text().replace('Last Updated: ', '').trim();

        return {
            country,
            state,
            city,
            pm25: pm25Value,
            pm10: pm10Value,
            so2: so2Value,
            co: coValue,
            o3: o3Value,
            no2: no2Value,
            lastUpdatedTime
        };
    } catch (error) {
        console.error(`Error fetching data for ${city}:`, error);
        throw error; // Re-throw the error to handle it in the route
    }
};

// Function to store AQI data in MongoDB and cache
const storeAQIData = async (cityData) => {
    const { country, state, city, lastUpdatedTime } = cityData;

    // Check for existing data in MongoDB
    const existingData = await AqiData.findOne({ country, state, city, lastUpdatedTime });

    if (existingData) {
        console.log(`Updating data for ${city}.`);
        existingData.pm25 = cityData.pm25;
        existingData.pm10 = cityData.pm10;
        existingData.so2 = cityData.so2;
        existingData.co = cityData.co;
        existingData.o3 = cityData.o3;
        existingData.no2 = cityData.no2;
        existingData.lastUpdatedTime = lastUpdatedTime;

        await existingData.save(); // Save the updated data
        return existingData;
    } else {
        // Save new data to MongoDB
        const aqiData = new AqiData(cityData);
        await aqiData.save();

        // Store in cache
        const cityKey = `${country}_${state}_${city}`;  // Changed to use underscores for consistency
        cache[cityKey] = cityData;
        console.log(`Saved and cached data for ${cityKey}`);

        updatePriority(cityKey);  // Update priority after data is saved and cached
        return cityData; // Return the newly saved data
    }
};

// Scraping route
router.get('/:country/:state/:city', async (req, res) => {
    const { country, state, city } = req.params;
    const cityKey = `${country}_${state}_${city}`;  // Use underscores for consistency

    if (cache[cityKey]) {
        console.log(`Serving data from cache for ${cityKey}`);
        // Return cached data immediately
        return res.json(cache[cityKey]);
    }

    try {
        const aqiData = await fetchAQIData(country, state, city);

        // Return the fetched data immediately
        res.json(aqiData);

        // Store data in MongoDB and update cache in the background
        storeAQIData(aqiData).catch(err => {
            console.error(`Error storing data for ${cityKey}:`, err);
        });

    } catch (error) {
        console.error(`Error fetching data for ${cityKey}:`, error);
        res.status(500).json({ error: 'Failed to fetch AQI data' });
    }
});

module.exports = { router, fetchAQIData };
