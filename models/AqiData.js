const mongoose = require('mongoose');

const aqiSchema = new mongoose.Schema({
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pm25: { type: String, required: true },
    pm10: { type: String, required: true },
    so2: { type: String, required: true },
    co: { type: String, required: true },
    o3: { type: String, required: true },
    no2: { type: String, required: true },
    lastUpdatedTime: { type: String, required: true },
});

const AqiData = mongoose.model('AqiData', aqiSchema);

module.exports = AqiData;
