// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const OPENWEATHER_API_KEY = '9241d5480fc48caeb6e28b2db3147bdb';

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
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');
const toggleThemeBtn = document.getElementById('toggle-theme');

// State
let currentUnit = localStorage.getItem('weatherUnit') || 'celsius';
let currentTheme = localStorage.getItem('weatherTheme') || 'light';
let currentTempC = null; // Store Celsius temperature
let currentTempF = null; // Store Fahrenheit temperature

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
    console.log('DOM loaded, initializing app');
    // Load saved preferences
    loadPreferences();
    updateUnitToggleUI();
    
    // Load search history and favorites
    loadSearchHistory();
    loadFavorites();
    
    // Set up event listeners
    if (searchBtn) {
        console.log('Search button found, attaching click listener');
        searchBtn.addEventListener('click', searchWeather);
    } else {
        console.error('Search button not found');
    }
    
    if (cityInput) {
        console.log('City input found, attaching keypress listener');
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchWeather();
            }
        });
    } else {
        console.error('City input not found');
    }
    
    if (celsiusBtn) {
        console.log('Celsius button found, attaching click listener');
        celsiusBtn.addEventListener('click', () => toggleTemperatureUnit('celsius'));
    } else {
        console.error('Celsius button not found');
    }
    
    if (fahrenheitBtn) {
        console.log('Fahrenheit button found, attaching click listener');
        fahrenheitBtn.addEventListener('click', () => toggleTemperatureUnit('fahrenheit'));
    } else {
        console.error('Fahrenheit button not found');
    }
    
    if (toggleThemeBtn) {
        console.log('Theme toggle button found, attaching click listener');
        toggleThemeBtn.addEventListener('click', toggleTheme);
    } else {
        console.error('Theme toggle button not found');
    }
    
    // Get weather for current location
    getWeatherByLocation();
});

// Load saved preferences
function loadPreferences() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    toggleThemeBtn.innerHTML = `<i class="fas fa-${currentTheme === 'light' ? 'moon' : 'sun'}"></i>`;
    updateUnitToggleUI();
}

// Update unit toggle UI
function updateUnitToggleUI() {
    if (celsiusBtn && fahrenheitBtn) {
        celsiusBtn.classList.toggle('active', currentUnit === 'celsius');
        fahrenheitBtn.classList.toggle('active', currentUnit === 'fahrenheit');
    }
}

// Toggle temperature unit
function toggleTemperatureUnit(unit) {
    console.log('Toggling to unit:', unit);
    currentUnit = unit;
    localStorage.setItem('weatherUnit', currentUnit);
    updateUnitToggleUI();
    updateTemperatureDisplay();
}

// Update temperature display
function updateTemperatureDisplay() {
    if (currentTempC !== null && currentTempF !== null) {
        temperature.textContent = currentUnit === 'celsius' ? `${currentTempC}°C` : `${currentTempF}°F`;
    }
}

// Toggle theme
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    toggleThemeBtn.innerHTML = `<i class="fas fa-${currentTheme === 'light' ? 'moon' : 'sun'}"></i>`;
    localStorage.setItem('weatherTheme', currentTheme);
}

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
                fetchWeather('London');
            }
        );
    } else {
        console.error('Geolocation not supported');
        fetchWeather('London');
    }
}

// Search weather by city name
function searchWeather() {
    console.log('Search button clicked or Enter pressed');
    const city = cityInput.value.trim();
    if (city) {
        console.log('Fetching weather for:', city);
        fetchWeather(city);
    } else {
        console.error('No city entered');
        showError('Please enter a city name');
    }
}

// Show loading state
function showLoading() {
    cityName.textContent = 'Loading...';
    temperature.textContent = '--°C';
    weatherDescription.textContent = 'Fetching weather data';
    weatherIcon.className = 'fas fa-spinner fa-spin';
    forecastContainer.innerHTML = '<div class="loading">Loading forecast...</div>';
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
    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="fas fa-search"></i>';
}

// Fetch weather data from OpenWeatherMap API
async function fetchWeather(city) {
    if (!city) {
        showError('City name is required');
        return;
    }
    showLoading();
    try {
        console.log('Fetching weather for city:', city);
        const geocodingResponse = await fetch(
            `${API_BASE_URL}/geocode?q=${encodeURIComponent(city)}`
        );
        console.log('Geocoding response status:', geocodingResponse.status);
        if (!geocodingResponse.ok) {
            throw new Error(`Geocoding failed: ${geocodingResponse.status}`);
        }
        const locationData = await geocodingResponse.json();
        console.log('Geocoding data:', locationData);
        if (!locationData || locationData.length === 0) {
            throw new Error('Location not found. Please try another city name.');
        }
        const { lat, lon, name, country } = locationData[0];
        const currentWeatherResponse = await fetch(
            `${API_BASE_URL}/weather/${name},${country}`
        );
        if (!currentWeatherResponse.ok) {
            const errorData = await currentWeatherResponse.json();
            throw new Error(errorData.error || 'Failed to fetch weather data');
        }
        const currentWeatherData = await currentWeatherResponse.json();
        const forecastResponse = await fetch(
            `${API_BASE_URL}/forecast/${name},${country}`
        );
        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        const forecastData = await forecastResponse.json();
        updateCurrentWeather({
            ...currentWeatherData,
            name: name,
            sys: { country: country }
        });
        updateForecast(forecastData);
        saveToHistory(`${name}, ${country}`);
    } catch (error) {
        console.error('Fetch weather error:', error);
        showError(error.message || 'An error occurred while fetching weather data');
    } finally {
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="fas fa-search"></i>';
    }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
    try {
        showLoading();
        const reverseGeocodeResponse = await fetch(
            `${API_BASE_URL}/reverse-geocode?lat=${lat}&lon=${lon}`
        );
        if (!reverseGeocodeResponse.ok) {
            throw new Error('Failed to get location information');
        }
        const locationData = await reverseGeocodeResponse.json();
        const { name, country } = locationData[0];
        const currentWeatherResponse = await fetch(
            `${API_BASE_URL}/weather/${name},${country}`
        );
        if (!currentWeatherResponse.ok) {
            throw new Error('Failed to fetch weather data for your location');
        }
        const currentWeatherData = await currentWeatherResponse.json();
        const forecastResponse = await fetch(
            `${API_BASE_URL}/forecast/${name},${country}`
        );
        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        const forecastData = await forecastResponse.json();
        updateCurrentWeather({
            ...currentWeatherData,
            name: name,
            sys: { country: country }
        });
        updateForecast(forecastData);
        saveToHistory(`${name}, ${country}`);
    } catch (error) {
        console.error('Error fetching weather by coordinates:', error);
        showError(error.message || 'Failed to fetch weather data');
    }
}

// Update current weather UI
function updateCurrentWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentTempC = Math.round(data.main.temp);
    currentTempF = Math.round((currentTempC * 9/5) + 32);
    updateTemperatureDisplay();
    weatherDescription.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    pressure.textContent = `${data.main.pressure} hPa`;
    const iconCode = data.weather[0].icon;
    updateWeatherIcon(iconCode);
    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="fas fa-search"></i>';
    addToSearchHistory(data.name, data.sys.country);
}

// Update forecast UI
function updateForecast(data) {
    forecastContainer.innerHTML = '';
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
    let dayCount = 0;
    for (const [day, forecast] of Object.entries(dailyForecast)) {
        if (dayCount >= 5) break;
        const avgTempC = Math.round(forecast.temp.reduce((a, b) => a + b, 0) / forecast.temp.length);
        const avgTempF = Math.round((avgTempC * 9/5) + 32);
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-day">${day}</div>
            <div class="forecast-icon">
                <i class="fas fa-${weatherIcons[forecast.icon] || 'cloud'}"></i>
            </div>
            <div class="forecast-temp">${currentUnit === 'celsius' ? avgTempC : avgTempF}°${currentUnit === 'celsius' ? 'C' : 'F'}</div>
            <div class="forecast-desc">${forecast.description}</div>
        `;
        forecastContainer.appendChild(forecastCard);
        dayCount++;
    }
}

// Update weather icon
function updateWeatherIcon(iconCode) {
    const iconName = weatherIcons[iconCode] || 'cloud';
    weatherIcon.className = `fas fa-${iconName}`;
}

// Save search to local storage
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    if (!history.includes(city)) {
        history.unshift(city);
        if (history.length > 5) {
            history = history.slice(0, 5);
        }
        localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
    }
    loadSearchHistory();
}

// Load search history
function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    searchHistoryList.innerHTML = '';
    history.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => fetchWeather(city));
        searchHistoryList.appendChild(li);
    });
}

// Add to search history
function addToSearchHistory(city, country) {
    const fullCity = `${city}, ${country}`;
    saveToHistory(fullCity);
}

// Load favorites (placeholder)
function loadFavorites() {
    // Implement if needed
}