-- ============================================================
--  AI SMART AIR TRAFFIC CONTROL SYSTEM — DATABASE SCHEMA
-- ============================================================

CREATE DATABASE IF NOT EXISTS atc_system;
USE atc_system;

CREATE TABLE IF NOT EXISTS flights (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    aircraft_name    VARCHAR(100),
    flight_number    VARCHAR(50),
    destination      VARCHAR(100),
    fuel_level       FLOAT,
    engine_temp      FLOAT,
    wind_speed       FLOAT,
    visibility       FLOAT,
    pos_x            FLOAT,
    pos_y            FLOAT,
    weather_status   VARCHAR(50),
    collision_status VARCHAR(50),
    nearest_aircraft VARCHAR(50),
    nearest_distance FLOAT,
    volcanic_ash     TINYINT(1),
    emergency_status VARCHAR(150),
    runway_number    INT,
    runway_reason    VARCHAR(150),
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);
