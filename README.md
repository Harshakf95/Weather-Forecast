# Weather Forecast Application

A responsive web application that displays current weather conditions and a 5-day forecast for any city worldwide. Built with HTML, CSS, and JavaScript, this app fetches real-time weather data from the OpenWeatherMap API.

## Features

- Current weather conditions (temperature, humidity, wind speed, pressure)
- 5-day weather forecast
- Responsive design that works on desktop, tablet, and mobile devices
- Search functionality by city name
- Automatic location detection
- Weather condition icons
- Clean and modern user interface

## Prerequisites

Before you begin, ensure you have the following:

- A modern web browser (Chrome, Firefox, Safari, Edge)
- An API key from [OpenWeatherMap](https://openweathermap.org/api)

## Setup Instructions

1. **Get an API Key**
   - Sign up for a free account at [OpenWeatherMap](https://openweathermap.org/)
   - Navigate to the [API keys](https://home.openweathermap.org/api_keys) section
   - Copy your API key

2. **Configure the Application**
   - Open the `js/script.js` file
   - Replace `'YOUR_OPENWEATHER_API_KEY'` with your actual OpenWeatherMap API key

3. **Run the Application**
   - Open the `index.html` file in your web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python (if installed)
     python -m http.server 8000
     ```
     Then open `http://localhost:8000` in your browser

## How to Use

1. **Search for a City**
   - Enter a city name in the search box
   - Press Enter or click the search button

2. **Use Your Current Location**
   - Allow location access when prompted
   - The app will automatically display weather for your current location

3. **View Weather Details**
   - Current weather conditions are displayed at the top
   - Scroll down to see the 5-day forecast
   - Additional details like humidity, wind speed, and pressure are shown

## Project Structure

```
weather-forecast/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Styles for the application
├── js/
│   └── script.js       # JavaScript for weather data and interactivity
└── README.md           # This file
```

## Technologies Used

- HTML5
- CSS3 (with CSS Variables for theming)
- JavaScript (ES6+)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Font Awesome](https://fontawesome.com/) for icons

## Customization

### Changing the Theme
You can modify the color scheme by updating the CSS variables in the `:root` selector in `css/style.css`:

```css
:root {
    --primary-color: #3498db;
    --secondary-color: #2980b9;
    --background-color: #f5f7fa;
    --card-bg: #ffffff;
    --text-color: #333333;
    --text-light: #7f8c8d;
}
```

### Adding New Features
- **Temperature Unit Toggle**: Add a button to switch between Celsius and Fahrenheit
- **Search History**: Display recent searches below the search box
- **Weather Maps**: Integrate with OpenWeatherMap's map layers
- **Severe Weather Alerts**: Display weather warnings and alerts

## API Reference

This application uses the [OpenWeatherMap API](https://openweathermap.org/api):
- Current Weather Data API
- 5 Day / 3 Hour Forecast API

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [Font Awesome](https://fontawesome.com/)
- Design inspiration from modern weather applications
