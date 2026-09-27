"""
Database helper for the Smart Air Traffic Control System.
Handles connecting to MySQL, creating the schema, and saving/reading flights.
"""

import mysql.connector
from mysql.connector import Error


DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Your MYSQL Password",  
    "database": "atc_system",
}


def get_connection():
    """Create (and if needed initialize) the database, then return a connection."""
    try:
        
        cfg_no_db = {k: v for k, v in DB_CONFIG.items() if k != "database"}
        tmp = mysql.connector.connect(**cfg_no_db)
        cur = tmp.cursor()
        cur.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
        tmp.commit()
        cur.close()
        tmp.close()

        conn = mysql.connector.connect(**DB_CONFIG)
        _create_table(conn)
        return conn
    except Error as e:
        print(f"[DB] Connection failed: {e}")
        return None


def _create_table(conn):
    sql = """
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
    )
    """
    cur = conn.cursor()
    cur.execute(sql)
    conn.commit()
    cur.close()


def save_flight(record: dict):
    """Insert one processed-flight record. Returns True on success."""
    conn = get_connection()
    if not conn:
        return False
    try:
        cur = conn.cursor()
        sql = """
        INSERT INTO flights (
            aircraft_name, flight_number, destination,
            fuel_level, engine_temp, wind_speed, visibility,
            pos_x, pos_y,
            weather_status, collision_status,
            nearest_aircraft, nearest_distance, volcanic_ash,
            emergency_status, runway_number, runway_reason
        ) VALUES (
            %(aircraft_name)s, %(flight_number)s, %(destination)s,
            %(fuel_level)s, %(engine_temp)s, %(wind_speed)s, %(visibility)s,
            %(pos_x)s, %(pos_y)s,
            %(weather_status)s, %(collision_status)s,
            %(nearest_aircraft)s, %(nearest_distance)s, %(volcanic_ash)s,
            %(emergency_status)s, %(runway_number)s, %(runway_reason)s
        )
        """
        cur.execute(sql, record)
        conn.commit()
        cur.close()
        return True
    except Error as e:
        print(f"[DB] Save error: {e}")
        return False
    finally:
        conn.close()


def get_all_flights(limit: int = 50):
    """Return the most recent flight records, newest first."""
    conn = get_connection()
    if not conn:
        return []
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM flights ORDER BY id DESC LIMIT %s", (limit,))
        rows = cur.fetchall()
        cur.close()
        return rows
    except Error as e:
        print(f"[DB] Read error: {e}")
        return []
    finally:
        conn.close()
