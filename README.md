# ✈️ Smart Air Traffic Control System

A Class XII Computer Science project that demonstrates a software-based Smart Air Traffic Control (ATC) simulation using Python, Flask, MySQL, HTML, CSS and JavaScript.

> **Educational use only:** This project is a simulation and is not intended to replace certified real-world Air Traffic Control systems.

## Features

- Aircraft information processing
- Simulated radar positions
- Weather analysis
- Collision/conflict detection
- Volcanic ash detection
- Emergency-condition detection
- Runway assignment
- MySQL flight-history storage
- JSON APIs
- Web-based interface

## Technologies

- Python
- Flask
- MySQL
- HTML
- CSS
- JavaScript
- mysql-connector-python
- pyttsx3
- SpeechRecognition

## Project Structure

```text
Smart-Air-Traffic-Control-System/
│
├── app.py
├── atc_logic.py
├── db.py
├── requirements.txt
├── README.md
├── .gitignore
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
│
├── sql/
│   └── schema.sql
│
└── docs/
    ├── FLOWCHART.md
    └── PROJECT_CONTENT.md
```

## How the System Works

```text
START
  ↓
Run Flask Application
  ↓
Open Web Browser
  ↓
Load Web Interface
  ↓
User Enters Aircraft Data
  ↓
POST /api/process
  ↓
Check Required Fields
  ↓
Validate Numerical Data
  ↓
ATC Processing
  ├── Weather Analysis
  ├── Collision Detection
  ├── Volcanic Ash Detection
  ├── Emergency Detection
  └── Runway Assignment
  ↓
Save Processed Flight to MySQL
  ↓
Return JSON Report
  ↓
Display Result
```

## API Endpoints

### Home Page

```text
GET /
```

Loads the main web interface.

### Radar API

```text
GET /api/radar
```

Returns simulated aircraft positions.

### Aircraft Processing API

```text
POST /api/process
```

Accepts aircraft data, processes it through the ATC logic, stores the result in MySQL and returns a JSON report.

Required fields:

```text
aircraft_name
flight_number
destination
fuel_level
engine_temp
wind_speed
visibility
```

### Flight History API

```text
GET /api/flights
```

Returns recent flight records stored in MySQL.

## Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Smart-Air-Traffic-Control-System
```

### 2. Install Python packages

```bash
pip install -r requirements.txt
```

### 3. Create the MySQL database

Open MySQL and run:

```text
sql/schema.sql
```

### 4. Configure database details

Set these environment variables:

```text
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=smart_atc
```

### 5. Start the application

```bash
python app.py
```

### 6. Open the website

```text
http://localhost:5000
```

## Database Information

The database stores aircraft and processed ATC information including:

- Aircraft name
- Flight number
- Destination
- Fuel level
- Engine temperature
- Wind speed
- Visibility
- Aircraft position
- Weather status
- Collision status
- Nearest aircraft
- Nearest distance
- Volcanic ash status
- Emergency status
- Runway number
- Runway reason
- Time of operation

## Mathematical Processing

Aircraft distance is calculated using:

```text
Distance = √((x₂ - x₁)² + (y₂ - y₁)²)
```

Python's `math.sqrt()` is used for this calculation.

## Learning Outcomes

This project demonstrates:

- Python programming
- Functions and modules
- Conditional statements
- Data validation
- Mathematical calculations
- Flask web development
- JSON communication
- MySQL database connectivity
- API concepts
- Modular programming
- Basic automation

## Future Development

Possible extensions include:

- Live radar data
- Digital maps
- Real-time weather information
- More advanced AI models
- Improved conflict detection
- Real-time aircraft data
- More detailed airport information

## Project Information

**Project:** Smart Air Traffic Control System  
**Subject:** Computer Science  
**Class:** XII – CBSE  
**Academic Year:** 2026–2027

## Disclaimer

This software is an educational simulation. It must not be used for real-world aircraft navigation, safety decisions or professional Air Traffic Control operations.
