require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root directory (one level up from server/)
app.use(express.static(path.join(__dirname, '..')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
async function testDbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to MySQL database');
        connection.release();
        
        // Create tables if they don't exist
        await createTables();
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
}

// Create necessary tables
async function createTables() {
    const createSearchHistoryTable = `
        CREATE TABLE IF NOT EXISTS search_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            city VARCHAR(100) NOT NULL,
            country_code VARCHAR(10),
            search_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createFavoritesTable = `
        CREATE TABLE IF NOT EXISTS favorites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            city VARCHAR(100) NOT NULL,
            country_code VARCHAR(10),
            added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    try {
        await pool.query(createSearchHistoryTable);
        await pool.query(createFavoritesTable);
        console.log('Database tables created/verified');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
}

// API Routes

// Get weather for a city
app.get('/api/weather/:city', async (req, res) => {
    const { city } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    try {
        // Log the search
        await pool.query(
            'INSERT INTO search_history (city) VALUES (?)',
            [city]
        );

        // Fetch from OpenWeatherMap API
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
        );
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenWeatherMap API Error:', response.status, errorData);
            throw new Error(`City not found (${response.status}): ${errorData}`);
        }
        
        const data = await response.json();
        console.log('Weather data received for:', data.name);
        res.json(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch weather data' });
    }
});

// Get 5-day forecast
app.get('/api/forecast/:city', async (req, res) => {
    const { city } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch forecast');
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching forecast:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch forecast' });
    }
});

// Get search history
app.get('/api/history', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM search_history ORDER BY search_date DESC LIMIT 10'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching search history:', error);
        res.status(500).json({ error: 'Failed to fetch search history' });
    }
});

// Add to favorites
app.post('/api/favorites', async (req, res) => {
    const { city, countryCode } = req.body;
    
    try {
        await pool.query(
            'INSERT INTO favorites (city, country_code) VALUES (?, ?)',
            [city, countryCode]
        );
        res.status(201).json({ message: 'Added to favorites' });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ error: 'Failed to add to favorites' });
    }
});

// Get favorites
app.get('/api/favorites', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM favorites ORDER BY added_date DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

// Remove from favorites
app.delete('/api/favorites/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query('DELETE FROM favorites WHERE id = ?', [id]);
        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ error: 'Failed to remove from favorites' });
    }
});

// Geocoding endpoint - convert city name to coordinates
app.get('/api/geocode', async (req, res) => {
    const { q } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch geocoding data');
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error in geocoding:', error);
        res.status(500).json({ error: error.message || 'Failed to perform geocoding' });
    }
});

// Reverse geocoding endpoint - convert coordinates to location name
app.get('/api/reverse-geocode', async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Both "lat" and "lon" query parameters are required' });
    }
    
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch reverse geocoding data');
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error in reverse geocoding:', error);
        res.status(500).json({ error: error.message || 'Failed to perform reverse geocoding' });
    }
});

// Start server
async function startServer() {
    await testDbConnection();
    
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

module.exports = app; // For testing
