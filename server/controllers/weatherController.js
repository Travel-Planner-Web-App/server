const axios = require("axios");
require("dotenv").config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Keep the existing weatherActivities database...
const weatherActivities = {
  // ... (previous weatherActivities object remains the same)
};

// Helper function to map weather conditions (keep existing function)
const mapWeatherCondition = (condition) => {
  condition = condition.toLowerCase();
  if (condition.includes("clear") || condition.includes("sun")) return "clear";
  if (condition.includes("rain") || condition.includes("drizzle")) return "rain";
  if (condition.includes("cloud")) return "clouds";
  return "clear"; // default to clear if no match
};

// Enhanced weather function with 7-day forecast
const getWeather = async (req, res) => {
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ error: "Location is required." });
  }

  try {
    // First, get coordinates for the location
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

    // Then, get 7-day forecast using One Call API
    const forecastApiUrl = `https://api.openweathermap.org/data/3.0/onecall`;
    const forecastResponse = await axios.get(forecastApiUrl, {
      params: {
        lat,
        lon,
        exclude: 'minutely,hourly,alerts',
        appid: WEATHER_API_KEY,
        units: 'metric',
      },
    });

    // Process the 7-day forecast
    const dailyForecasts = forecastResponse.data.daily.slice(0, 7).map(day => {
      const weatherType = mapWeatherCondition(day.weather[0].description);
      
      // Get activities for this weather type
      let activities = JSON.parse(JSON.stringify(weatherActivities[weatherType])) || {
        indoor: [],
        outdoor: [],
      };

      // Apply temperature-based filters
      if (day.temp.max > 30) {
        activities.outdoor = activities.outdoor.filter(
          (activity) => activity.intensity !== "high"
        );
      } else if (day.temp.max < 5) {
        activities.outdoor = activities.outdoor.filter(
          (activity) => activity.intensity === "high"
        );
      }

      // Apply wind-based filters
      if (day.wind_speed > 20) {
        activities.outdoor = activities.outdoor.filter(
          (activity) => !["Cycling", "Photography"].includes(activity.name)
        );
      }

      return {
        date: new Date(day.dt * 1000).toISOString().split('T')[0],
        weather: {
          temperature: {
            max: day.temp.max,
            min: day.temp.min,
            morning: day.temp.morn,
            afternoon: day.temp.day,
            evening: day.temp.eve,
            night: day.temp.night,
          },
          humidity: day.humidity,
          windSpeed: day.wind_speed,
          condition: day.weather[0].description,
          rainProbability: day.pop * 100, // Convert to percentage
          uvi: day.uvi,
        },
        activities: {
          weatherType,
          suggestions: activities,
        },
      };
    });

    // Return combined weather and activity data
    res.status(200).json({
      location: {
        name,
        coordinates: {
          latitude: lat,
          longitude: lon,
        },
      },
      current: {
        temperature: forecastResponse.data.current.temp,
        humidity: forecastResponse.data.current.humidity,
        windSpeed: forecastResponse.data.current.wind_speed,
        condition: forecastResponse.data.current.weather[0].description,
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