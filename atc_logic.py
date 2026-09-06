"""
Basic ATC processing logic for the educational web simulation.
"""

import math
import random

AIRCRAFT_POSITIONS = [
    {"aircraft_name": "AI-101", "pos_x": 20.0, "pos_y": 35.0},
    {"aircraft_name": "AI-202", "pos_x": 55.0, "pos_y": 48.0},
    {"aircraft_name": "AI-303", "pos_x": 75.0, "pos_y": 25.0},
    {"aircraft_name": "AI-404", "pos_x": 40.0, "pos_y": 70.0},
]

RUNWAYS = [1, 2, 3, 4]


def get_radar_positions():
    return AIRCRAFT_POSITIONS


def process_aircraft(ac):
    # Simulated aircraft position
    pos_x = round(random.uniform(10, 90), 2)
    pos_y = round(random.uniform(10, 90), 2)

    # Weather analysis
    if ac["visibility"] < 3 or ac["wind_speed"] > 40:
        weather_status = "Poor Weather"
    elif ac["visibility"] < 6 or ac["wind_speed"] > 25:
        weather_status = "Moderate Weather"
    else:
        weather_status = "Normal Weather"

    # Collision detection
    nearest_aircraft = None
    nearest_distance = None

    for other in AIRCRAFT_POSITIONS:
        distance = math.sqrt(
            (pos_x - other["pos_x"]) ** 2 +
            (pos_y - other["pos_y"]) ** 2
        )

        if nearest_distance is None or distance < nearest_distance:
            nearest_distance = distance
            nearest_aircraft = other["aircraft_name"]

    if nearest_distance is not None and nearest_distance < 12:
        collision_status = "Potential Conflict"
    else:
        collision_status = "Safe"

    # Simulated volcanic ash zone check
    volcanic_ash = (
        35 <= pos_x <= 50 and
        40 <= pos_y <= 60
    )

    # Emergency detection
    emergency_reasons = []

    if ac["fuel_level"] < 20:
        emergency_reasons.append("Low Fuel")

    if ac["engine_temp"] > 110:
        emergency_reasons.append("High Engine Temperature")

    if weather_status == "Poor Weather":
        emergency_reasons.append("Poor Weather")

    if emergency_reasons:
        emergency_status = "Emergency: " + ", ".join(emergency_reasons)
    else:
        emergency_status = "Normal"

    # Simple runway assignment
    runway_number = RUNWAYS[
        int(abs(pos_x + pos_y)) % len(RUNWAYS)
    ]

    if emergency_reasons:
        runway_reason = "Assigned for emergency priority"
    elif weather_status == "Poor Weather":
        runway_reason = "Assigned considering poor weather"
    else:
        runway_reason = "Standard runway assignment"

    return {
        **ac,
        "pos_x": pos_x,
        "pos_y": pos_y,
        "weather_status": weather_status,
        "collision_status": collision_status,
        "nearest_aircraft": nearest_aircraft,
        "nearest_distance": round(nearest_distance, 2)
        if nearest_distance is not None else None,
        "volcanic_ash": volcanic_ash,
        "emergency_status": emergency_status,
        "runway_number": runway_number,
        "runway_reason": runway_reason
    }
