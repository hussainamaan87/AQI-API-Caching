require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { router: aqiRoutes, fetchAQIData } = require('./routes/aqi');  // Updated to fetchAQIData
const { getTopCities, updatePriority } = require('./cache');  // Import cache functions

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use the cors middleware
app.use(cors({
    origin: '*',
}));

// Connect to MongoDB Atlas
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB connected successfully');
        // Start the server and the initial data fetching
        app.listen(PORT, async () => {
            console.log(`Server is running on port ${PORT}`);
            await fetchTopCitiesData();  // Fetch initial data when server starts
            fetchDataPeriodically();  // Start periodic fetching after the initial fetch
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the application if MongoDB connection fails
    });

// Landing page route
app.get('/', (req, res) => {
    res.render('index');
});

// Use the AQI routes
app.use('/aqi', aqiRoutes);  // Attach the AQI routes

// Function to fetch data for the top 3 cities
const fetchTopCitiesData = async () => {
    console.log("Fetching top cities...");

    const topCities = getTopCities(3);  // Get top 3 cities based on priority

    if (topCities.length === 0) {
        console.log("No cities available in the priority queue.");
        return;
    }

    for (const cityKey of topCities) {
        const [country, state, city] = cityKey.split('_');
        await fetchAQIData(country, state, city);  // Updated to fetchAQIData
        console.log(`Fetched data for ${cityKey}`);

        // Increase priority of the city after fetching its data
        updatePriority(cityKey, 1);  // Increase the priority by 1 (or any value)
    }

    console.log("______________________________________");
};

// Function to fetch top 3 cities every 15 minutes
const fetchDataPeriodically = () => {
    setInterval(fetchTopCitiesData, 900000);  // 900000 ms = 15 minutes
};
