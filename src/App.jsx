import { useState } from 'react';
import weatherDescriptions from './constants/weatherCodes';

// Background gradients by weather
const getBackground = (code) => {
  if (code === 0 || code === 1) return 'from-blue-400 to-blue-600'; // clear
  if (code === 2 || code === 3) return 'from-gray-400 to-gray-600'; // cloudy
  if (code >= 45 && code <= 48) return 'from-gray-300 to-gray-500'; // fog
  if (code >= 61 && code <= 65) return 'from-blue-700 to-gray-900'; // rain
  if (code >= 71 && code <= 75) return 'from-blue-200 to-white'; // snow
  if (code >= 95) return 'from-purple-700 to-gray-900'; // thunder
  return 'from-sky-400 to-sky-600'; // default
};

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      // Step 1: Get city coordinates
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1`
      );
      const locationData = await res.json();

      if (!locationData.results?.length) {
        throw new Error('City not found');
      }

      const { latitude, longitude, name, country } = locationData.results[0];

      // Step 2: Get weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      setWeather({ ...weatherData.current_weather, name, country });
    } catch (err) {
      setError(err.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  // Allow pressing Enter to trigger fetch
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') getWeather();
  };

  // Dynamic background
  const bgGradient = weather
    ? getBackground(weather.weathercode)
    : 'from-sky-400 to-sky-600';

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-6 
                  bg-gradient-to-r ${bgGradient} text-white transition-all duration-500`}
    >
      <h1 className="text-3xl font-bold mb-6 drop-shadow">🌍 Weather Now</h1>

      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter city name"
          className="px-4 py-2 border rounded-lg shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button
          onClick={getWeather}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-black font-semibold ${
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-yellow-400 hover:bg-yellow-300'
          }`}
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-red-200 mb-4">{error}</p>}

      {/* Weather Card */}
      {weather && (
        <div className="bg-white text-black p-6 rounded-2xl shadow-md text-center w-80">
          <h2 className="text-xl font-semibold mb-2">
            {weather.name}, {weather.country}
          </h2>
          <p className="text-5xl font-bold mb-4">{weather.temperature}°C</p>
          <p className="text-lg">
            {weatherDescriptions[weather.weathercode] || '🌍 Unknown'}
          </p>
          <p className="text-md mt-2">💨 {weather.windspeed} km/h</p>
          <p className="text-sm text-gray-600 mt-2">
            Updated at: {new Date(weather.time).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
