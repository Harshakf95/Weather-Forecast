// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const weatherIcon = document.getElementById('weather-icon');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast-container');
const searchHistoryList = document.getElementById('search-history');
const favoritesList = document.getElementById('favorites');
const toggleUnitBtn = document.getElementById('toggle-unit');
const toggleThemeBtn = document.getElementById('toggle-theme');

// State
let currentUnit = 'celsius';
let currentTheme = 'light';

// Weather Icons Mapping
const weatherIcons = {
    '01d': 'sun',
    '01n': 'moon',
    '02d': 'cloud-sun',
    '02n': 'cloud-moon',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloud',
    '04n': 'cloud',
    '09d': 'cloud-rain',
    '09n': 'cloud-rain',
    '10d': 'cloud-sun-rain',
    '10n': 'cloud-moon-rain',
    '11d': 'bolt',
    '11n': 'bolt',
    '13d': 'snowflake',
    '13n': 'snowflake',
    '50d': 'smog',
    '50n': 'smog'
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load saved preferences
    loadPreferences();
    
    // Load search history and favorites
    loadSearchHistory();
    loadFavorites();
    
    // Set up event listeners
    searchBtn.addEventListener('click', searchWeather);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });
    
    toggleUnitBtn.addEventListener('click', toggleTemperatureUnit);
    toggleThemeBtn.addEventListener('click', toggleTheme);
    
    // Get weather for current location
    getWeatherByLocation();
});

// Default city on load
document.addEventListener('DOMContentLoaded', () => {
    getWeatherByLocation();
});

// Get weather by geolocation
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                console.error('Error getting location:', error);
                // Default to London if geolocation fails
                fetchWeather('London');
            }
        );
    } else {
        // Browser doesn't support geolocation
        fetchWeather('London');
    }
}

// Search weather by city name
function searchWeather() {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
}

// Show loading state
function showLoading() {
    cityName.textContent = 'Loading...';
    temperature.textContent = '--°C';
    weatherDescription.textContent = 'Fetching weather data';
    weatherIcon.className = 'fas fa-spinner fa-spin';
    forecastContainer.innerHTML = '<div class="loading">Loading forecast...</div>';
    
    // Disable search button while loading
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
}

// Show error state
function showError(message) {
    cityName.textContent = 'Error';
    temperature.textContent = '--°C';
    weatherDescription.textContent = message || 'Failed to fetch weather data';
    weatherIcon.className = 'fas fa-exclamation-triangle';
    forecastContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            ${message || 'Failed to fetch weather data'}
        </div>`;
    
    // Re-enable search button on error
    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="fas fa-search"></i>';
}

// Fetch weather data from OpenWeather API
async function fetchWeather(city) {
    if (!city) return;
    
    showLoading();
    
    try {
        // Fetch current weather and forecast from our backend
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/weather/${encodeURIComponent(city)}`),
            fetch(`${API_BASE_URL}/forecast/${encodeURIComponent(city)}`)
        ]);
        
        if (!currentWeatherResponse.ok) {
            const errorData = await currentWeatherResponse.json();
            throw new Error(errorData.error || 'City not found');
        }
        
        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();
        
        // Update UI with the fetched data
        updateCurrentWeather(currentWeatherData);
        updateForecast(forecastData);
        
        // Save to search history
        saveToHistory(city);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError(error.message || 'Failed to fetch weather data. Please try again.');
    }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        
        const data = await response.json();
        updateCurrentWeather(data);
        
        // Update input field
        cityInput.value = data.name;
        
        // Fetch forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        
        const forecastData = await forecastResponse.json();
        updateForecast(forecastData);
        
    } catch (error) {
        console.error('Error fetching weather by coordinates:', error);
    }
}

// Update current weather UI
function updateCurrentWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    
    // Store the temperature in both units
    const tempC = Math.round(data.main.temp);
    const tempF = Math.round((tempC * 9/5) + 32);
    
    // Update temperature based on current unit
    updateTemperatureDisplay(tempC, tempF);
    
    weatherDescription.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`; // Convert m/s to km/h
    pressure.textContent = `${data.main.pressure} hPa`;
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    updateWeatherIcon(iconCode);
    
    // Re-enable search button after successful update
    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="fas fa-search"></i>';
    
    // Add to search history
    addToSearchHistory(data.name, data.sys.country);
}

// Update forecast UI
function updateForecast(data) {
    // Clear previous forecast
    forecastContainer.innerHTML = '';
    
    // Group forecast by day
    const dailyForecast = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!dailyForecast[day]) {
            dailyForecast[day] = {
                temp: [],
                icon: item.weather[0].icon,
                description: item.weather[0].description
            };
        }
        
        dailyForecast[day].temp.push(item.main.temp);
    });
    
    // Display 5-day forecast
    let dayCount = 0;
    for (const [day, forecast] of Object.entries(dailyForecast)) {
        if (dayCount >= 5) break;
        
        const avgTemp = Math.round(forecast.temp.reduce((a, b) => a + b, 0) / forecast.temp.length);
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-day">${day}</div>
            <div class="forecast-icon">
                <i class="fas fa-${weatherIcons[forecast.icon] || 'cloud'}"></i>
            </div>
            <div class="forecast-temp">${avgTemp}°C</div>
            <div class="forecast-desc">${forecast.description}</div>
        `;
        
        forecastContainer.appendChild(forecastCard);
        dayCount++;
    }
}

// Update weather icon based on weather condition
function updateWeatherIcon(iconCode) {
    const iconName = weatherIcons[iconCode] || 'cloud';
    weatherIcon.className = `fas fa-${iconName}`;
}

// Save search to local storage
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    
    // Add city if not already in history
    if (!history.includes(city)) {
        history.unshift(city);
        // Keep only the last 5 searches
        if (history.length > 5) {
            history = history.slice(0, 5);
        }
        localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
    }
}
