"""
Core AI logic for the Air Traffic Control System.
Pure functions — no I/O — so they're easy to test and reuse from the web layer.
"""

import math
import random

# ── Simulated radar: nearby aircraft with (x, y) positions ──────────────
RADAR_AIRCRAFT = {
    "AI101":  (120, 340),
    "IND450": (200, 180),
    "QTR778": (310, 410),
    "USA220": (80,  270),
}

COLLISION_THRESHOLD = 50  # units

ASH_ZONES = [
    {"center": (300, 300), "radius": 80},
    {"center": (150, 450), "radius": 60},
]


def get_radar_positions() -> dict:
    """Return simulated radar positions (with tiny random drift)."""
    return {
        code: (round(x + random.uniform(-5, 5), 1), round(y + random.uniform(-5, 5), 1))
        for code, (x, y) in RADAR_AIRCRAFT.items()
    }


def calculate_distance(x1, y1, x2, y2) -> float:
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)


def check_collision(pos_x: float, pos_y: float, radar: dict):
    """Returns (nearest_aircraft, distance, is_risk)."""
    closest_name = None
    closest_dist = float("inf")
    for name, (rx, ry) in radar.items():
        dist = calculate_distance(pos_x, pos_y, rx, ry)
        if dist < closest_dist:
            closest_dist = dist
            closest_name = name
    return closest_name, closest_dist, closest_dist < COLLISION_THRESHOLD


def check_volcanic_ash(pos_x: float, pos_y: float) -> bool:
    for zone in ASH_ZONES:
        cx, cy = zone["center"]
        if calculate_distance(pos_x, pos_y, cx, cy) < zone["radius"]:
            return True
    return False


def analyse_weather(wind_speed: float, visibility: float):
    """Returns (weather_status, is_dangerous)."""
    if wind_speed > 50 or visibility < 500:
        return "Dangerous", True
    return "Safe", False


def detect_emergency(fuel_level: float, engine_temp: float, ash_detected: bool):
    emergencies = []
    if fuel_level < 20:
        emergencies.append("LOW FUEL")
    if engine_temp > 90:
        emergencies.append("ENGINE OVERHEAT")
    if ash_detected:
        emergencies.append("VOLCANIC ASH")
    return emergencies


def allocate_runway(emergencies: list, wind_speed: float):
    """Returns (runway_number, reason)."""
    if emergencies:
        return 1, "Emergency — Priority Landing"
    if wind_speed > 50:
        return 3, "Strong Wind — Safer Runway"
    return 2, "Regular Operation"


def process_aircraft(ac: dict) -> dict:
    """
    Run the full ATC pipeline for one aircraft and return a complete report dict.
    `ac` must contain: aircraft_name, flight_number, destination,
    fuel_level, engine_temp, wind_speed, visibility.
    Position is assigned here, same as radar assignment for a new arrival.
    """
    ac = dict(ac)  # don't mutate caller's dict
    ac["pos_x"] = round(random.uniform(50, 400), 2)
    ac["pos_y"] = round(random.uniform(50, 450), 2)

    weather, dangerous = analyse_weather(ac["wind_speed"], ac["visibility"])

    radar = get_radar_positions()
    nearest, dist, is_risk = check_collision(ac["pos_x"], ac["pos_y"], radar)
    collision_status = "RISK" if is_risk else "Safe"

    ash = check_volcanic_ash(ac["pos_x"], ac["pos_y"])
    emergencies = detect_emergency(ac["fuel_level"], ac["engine_temp"], ash)
    runway, runway_reason = allocate_runway(emergencies, ac["wind_speed"])

    return {
        **ac,
        "weather_status": weather,
        "weather_dangerous": dangerous,
        "collision_status": collision_status,
        "nearest_aircraft": nearest,
        "nearest_distance": round(dist, 1),
        "volcanic_ash": ash,
        "emergency_status": ", ".join(emergencies) if emergencies else "None",
        "emergencies": emergencies,
        "runway_number": runway,
        "runway_reason": runway_reason,
        "radar": radar,
    }
