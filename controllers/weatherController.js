const axios = require("axios");
require("dotenv").config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Weather activities database
const weatherActivities = {
  clear: {
    indoor: ["Yoga", "Cooking", "Board Games"],
    outdoor: ["Running", "Hiking", "Picnic"],
  },
  rain: {
    indoor: ["Reading", "Watching Movies", "Painting"],
    outdoor: ["Walking with an umbrella"],
  },
  clouds: {
    indoor: ["Gym", "DIY Projects", "Baking"],
    outdoor: ["Cycling", "Photography"],
  },
};

// Helper function to map weather conditions
const mapWeatherCondition = (condition) => {
  condition = condition.toLowerCase();
  if (condition.includes("clear") || condition.includes("sun")) return "clear";
  if (condition.includes("rain") || condition.includes("drizzle")) return "rain";
  if (condition.includes("cloud")) return "clouds";
  return "clear"; // Default to clear if no match
};

// Helper function to aggregate and process data
const processForecastData = (forecastData) => {
  const dailySummary = {};
  
  forecastData.forEach((entry) => {
    const date = new Date(entry.dt * 1000).toISOString().split('T')[0];
    if (!dailySummary[date]) {
      dailySummary[date] = {
        temperatures: [],
        humidities: [],
        windSpeeds: [],
        conditions: [],
        rainProbabilities: [],
      };
    }

    const dayData = dailySummary[date];
    dayData.temperatures.push(entry.main.temp);
    dayData.humidities.push(entry.main.humidity);
    dayData.windSpeeds.push(entry.wind.speed);
    dayData.conditions.push(entry.weather[0].description);
    if (entry.pop !== undefined) {
      dayData.rainProbabilities.push(entry.pop * 100);
    }
  });

  return Object.keys(dailySummary).slice(0, 7).map((date) => {
    const data = dailySummary[date];
    const mostCommonCondition = data.conditions.sort(
      (a, b) =>
        data.conditions.filter((v) => v === a).length -
        data.conditions.filter((v) => v === b).length
    ).pop();

    return {
      date,
      weather: {
        temperature: {
          max: Math.max(...data.temperatures),
          min: Math.min(...data.temperatures),
        },
        humidity: Math.round(
          data.humidities.reduce((a, b) => a + b, 0) / data.humidities.length
        ),
        windSpeed: Math.round(
          data.windSpeeds.reduce((a, b) => a + b, 0) / data.windSpeeds.length
        ),
        condition: mostCommonCondition,
        rainProbability: Math.round(
          data.rainProbabilities.reduce((a, b) => a + b, 0) /
            data.rainProbabilities.length
        ),
      },
      activities: {
        weatherType: mapWeatherCondition(mostCommonCondition),
        suggestions: weatherActivities[mapWeatherCondition(mostCommonCondition)] || {
          indoor: [],
          outdoor: [],
        },
      },
    };
  });
};

// Enhanced weather function with aggregated 7-day forecast
const getWeather = async (req, res) => {
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ error: "Location is required." });
  }

  try {
    // Get coordinates for the location
    const geoApiUrl = `http://api.openweathermap.org/geo/1.0/direct`;
    const geoResponse = await axios.get(geoApiUrl, {
      params: {
        q: location,
        limit: 1,
        appid: WEATHER_API_KEY,
      },
    });

    if (!geoResponse.data.length) {
      return res.status(404).json({ error: "Location not found." });
    }

    const { lat, lon, name } = geoResponse.data[0];

    // Get 5 Day / 3 Hour Forecast data
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast`;
    const forecastResponse = await axios.get(forecastApiUrl, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric',
      },
    });

    const dailyForecasts = processForecastData(forecastResponse.data.list);

    res.status(200).json({
      location: {
        name,
        coordinates: {
          latitude: lat,
          longitude: lon,
        },
      },
      dailyForecasts,
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: "Location not found." });
    }
    res.status(500).json({ error: "Failed to fetch weather data." });
  }
};

module.exports = { getWeather };
