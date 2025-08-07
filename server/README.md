# Weather App Backend

This is the backend server for the Weather Forecast application, built with Node.js, Express, and MySQL.

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn package manager

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Set Up MySQL**
   - Make sure MySQL server is running
   - Create a new database named `weather_app`
   - Update the `.env` file with your MySQL credentials

3. **Initialize Database**
   - Run the SQL script to create the necessary tables:
   ```bash
   mysql -u your_username -p weather_app < database.sql
   ```

4. **Configure Environment Variables**
   Copy `.env.example` to `.env` and update the values:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=weather_app
   OPENWEATHER_API_KEY=your_openweather_api_key
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic reloading.

### Production Mode
```bash
npm start
```

## API Endpoints

### Weather
- `GET /api/weather/:city` - Get current weather for a city
- `GET /api/forecast/:city` - Get 5-day forecast for a city

### Search History
- `GET /api/history` - Get recent search history

### Favorites
- `GET /api/favorites` - Get favorite locations
- `POST /api/favorites` - Add a location to favorites
- `DELETE /api/favorites/:id` - Remove a location from favorites

## Database Schema

### Tables
1. **search_history**
   - id (INT, PK)
   - city (VARCHAR)
   - country_code (VARCHAR)
   - search_date (TIMESTAMP)

2. **favorites**
   - id (INT, PK)
   - user_id (INT)
   - city (VARCHAR)
   - country_code (VARCHAR)
   - added_date (TIMESTAMP)

3. **user_preferences**
   - id (INT, PK)
   - user_id (INT)
   - temperature_unit (ENUM)
   - theme (VARCHAR)
   - last_updated (TIMESTAMP)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port to run the server on | 3000 |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL username | - |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | Database name | weather_app |
| OPENWEATHER_API_KEY | OpenWeatherMap API key | - |

## Testing

To run tests (when available):
```bash
npm test
```

## Deployment

For production deployment, consider using:
- PM2 for process management
- Nginx as a reverse proxy
- Environment-specific configuration files
- Proper logging and monitoring

## License

MIT
