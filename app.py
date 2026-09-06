"""
============================================================
AI SMART AIR TRAFFIC CONTROL SYSTEM — WEB EDITION
Technologies: Python (Flask) | MySQL | HTML/CSS/JS
============================================================

Run with:
    python app.py

Then open:
    http://localhost:5000
"""

from flask import Flask, render_template, request, jsonify
import atc_logic
import db

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/radar", methods=["GET"])
def api_radar():
    """Return current simulated radar positions."""
    return jsonify(atc_logic.get_radar_positions())


@app.route("/api/process", methods=["POST"])
def api_process():
    """
    Accept aircraft data and run the complete ATC pipeline:
    weather analysis, collision detection, volcanic ash detection,
    emergency detection and runway assignment.
    """
    payload = request.get_json(force=True) or {}

    required = [
        "aircraft_name",
        "flight_number",
        "destination",
        "fuel_level",
        "engine_temp",
        "wind_speed",
        "visibility"
    ]

    missing = [
        field for field in required
        if field not in payload or payload[field] in ("", None)
    ]

    if missing:
        return jsonify({
            "error": f"Missing fields: {', '.join(missing)}"
        }), 400

    try:
        ac = {
            "aircraft_name": str(payload["aircraft_name"]),
            "flight_number": str(payload["flight_number"]),
            "destination": str(payload["destination"]),
            "fuel_level": float(payload["fuel_level"]),
            "engine_temp": float(payload["engine_temp"]),
            "wind_speed": float(payload["wind_speed"]),
            "visibility": float(payload["visibility"])
        }
    except (ValueError, TypeError):
        return jsonify({
            "error": (
                "fuel_level, engine_temp, wind_speed and "
                "visibility must be numbers"
            )
        }), 400

    report = atc_logic.process_aircraft(ac)

    saved = db.save_flight({
        "aircraft_name": report["aircraft_name"],
        "flight_number": report["flight_number"],
        "destination": report["destination"],
        "fuel_level": report["fuel_level"],
        "engine_temp": report["engine_temp"],
        "wind_speed": report["wind_speed"],
        "visibility": report["visibility"],
        "pos_x": report["pos_x"],
        "pos_y": report["pos_y"],
        "weather_status": report["weather_status"],
        "collision_status": report["collision_status"],
        "nearest_aircraft": report["nearest_aircraft"],
        "nearest_distance": report["nearest_distance"],
        "volcanic_ash": 1 if report["volcanic_ash"] else 0,
        "emergency_status": report["emergency_status"],
        "runway_number": report["runway_number"],
        "runway_reason": report["runway_reason"]
    })

    report["saved_to_db"] = saved
    return jsonify(report)


@app.route("/api/flights", methods=["GET"])
def api_flights():
    """Return recent flight history."""
    limit = request.args.get("limit", default=50, type=int)
    rows = db.get_all_flights(limit=limit)

    for row in rows:
        if row.get("created_at"):
            row["created_at"] = row["created_at"].strftime(
                "%Y-%m-%d %H:%M:%S"
            )

    return jsonify(rows)


if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )
