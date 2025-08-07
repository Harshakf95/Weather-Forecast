-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS weather_app;

-- Use the database
USE weather_app;

-- Table to store search history
CREATE TABLE IF NOT EXISTS search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    country_code VARCHAR(10),
    search_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_search_date (search_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table to store favorite locations
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT 1, -- In a real app, this would reference a users table
    city VARCHAR(100) NOT NULL,
    country_code VARCHAR(10),
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (user_id, city, country_code),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table to store user preferences (for future use)
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    temperature_unit ENUM('celsius', 'fahrenheit') DEFAULT 'celsius',
    theme VARCHAR(20) DEFAULT 'light',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_pref (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add some initial data (optional)
-- INSERT IGNORE INTO user_preferences (user_id, temperature_unit, theme) 
-- VALUES (1, 'celsius', 'light');
