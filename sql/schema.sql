CREATE DATABASE IF NOT EXISTS smart_atc;

USE smart_atc;

CREATE TABLE IF NOT EXISTS flights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aircraft_name VARCHAR(100) NOT NULL,
    flight_number VARCHAR(50) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    fuel_level FLOAT NOT NULL,
    engine_temp FLOAT NOT NULL,
    wind_speed FLOAT NOT NULL,
    visibility FLOAT NOT NULL,
    pos_x FLOAT,
    pos_y FLOAT,
    weather_status VARCHAR(100),
    collision_status VARCHAR(100),
    nearest_aircraft VARCHAR(100),
    nearest_distance FLOAT,
    volcanic_ash TINYINT(1),
    emergency_status VARCHAR(255),
    runway_number INT,
    runway_reason VARCHAR(255),
    created_at DATETIME
);
