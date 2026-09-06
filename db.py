"""
MySQL database helper.

Set these environment variables before running:
MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
"""

import os
from datetime import datetime

import mysql.connector
from mysql.connector import Error


def get_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "smart_atc")
    )


def save_flight(data):
    query = """
        INSERT INTO flights (
            aircraft_name, flight_number, destination,
            fuel_level, engine_temp, wind_speed, visibility,
            pos_x, pos_y, weather_status, collision_status,
            nearest_aircraft, nearest_distance, volcanic_ash,
            emergency_status, runway_number, runway_reason,
            created_at
        )
        VALUES (
            %(aircraft_name)s, %(flight_number)s, %(destination)s,
            %(fuel_level)s, %(engine_temp)s, %(wind_speed)s, %(visibility)s,
            %(pos_x)s, %(pos_y)s, %(weather_status)s, %(collision_status)s,
            %(nearest_aircraft)s, %(nearest_distance)s, %(volcanic_ash)s,
            %(emergency_status)s, %(runway_number)s, %(runway_reason)s,
            %(created_at)s
        )
    """

    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()
        data = dict(data)
        data["created_at"] = datetime.now()
        cursor.execute(query, data)
        connection.commit()
        return True
    except Error:
        return False
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def get_all_flights(limit=50):
    query = """
        SELECT *
        FROM flights
        ORDER BY id DESC
        LIMIT %s
    """

    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, (max(1, min(limit, 500)),))
        return cursor.fetchall()
    except Error:
        return []
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
