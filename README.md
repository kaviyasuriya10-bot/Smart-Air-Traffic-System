## AI Smart Air Traffic Control - Web Version
This version of the project uses only browser technologies for the main ATC system.

## Technologies
HTML
CSS
JavaScript
HTML Canvas
Web Speech API
Browser localStorage
Optional Ollama for AI assessment
There is no Python and no MySQL in this version.

Project Structure
ATC_Web_No_Python_MySQL/
│
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── README.md
## Features
Aircraft data entry
Text input
Voice input
Voice output
Radar simulation
Collision detection
Weather analysis
Volcanic ash detection
Emergency detection
Runway allocation
ATC analysis report
Flight history using localStorage
Live alert log
Random aircraft generator
Text command system
Optional Ollama AI assessment

## How to Run
No Python installation is required.

Recommended method
Use VS Code with the Live Server extension.

Open the project folder in VS Code.
Open index.html.
Start Live Server.
The project will open in your browser.
Voice Input
Press the Start Voice Input button or use:

Alt + V
If an input field is focused, speech is placed into that field.

## commands:

collision detection
runway allocation
weather analysis
emergency check
volcanic ash
system status
Chrome and Microsoft Edge generally provide the best Web Speech API support.

Text Commands
The text command box accepts commands including:

collision detection
runway allocation
weather analysis
emergency check
volcanic ash
system status
Radar
The radar is drawn using HTML Canvas.

It contains four simulated aircraft:

AI101
IND450
QTR778
USA220
Their positions move slightly over time to make the display look like a live radar.

Two simulated volcanic ash zones are also shown.

Collision Detection
The project uses the Euclidean distance formula:

distance = sqrt((x2 - x1)^2 + (y2 - y1)^2)

A collision risk is generated when the nearest simulated aircraft is less than 50 radar units away.

This is an educational simulation and does not represent real aviation separation standards.

Weather Analysis
The project uses simple thresholds:

Wind > 50 km/h       -> Dangerous
Visibility < 500 m   -> Dangerous
Otherwise            -> Safe
Emergency Detection
The system checks:

Fuel < 20%           -> LOW FUEL
Engine temperature > 90 C -> ENGINE OVERHEAT
Inside ash zone      -> VOLCANIC ASH
More than one condition can be active at the same time.

Runway Allocation
The simplified project logic is:

Emergency exists     -> Runway 1
Strong wind          -> Runway 3
Normal operation     -> Runway 2
This is only a demonstration of conditional programming.

Browser Storage
Because MySQL has been removed, flight history is stored in:

localStorage
The history remains available in the same browser until the user clears browser storage or presses Clear History.

Ollama
Ollama is optional.

The project first creates a local browser-based ATC assessment, so the project still works without Ollama.

If Ollama is installed and running, the project can try:

http://localhost:11434
The selected model is:

llama3.2:3b
To use it, install Ollama separately and make sure the model is available.

The browser may block direct requests to Ollama depending on its CORS configuration. If that happens, the normal browser ATC analysis still works.

Why Python and MySQL Were Removed
The original project used Flask/Python for the backend and MySQL for database storage.

This version moves the main processing into JavaScript and uses localStorage for history.

This makes the project easier to run for a school demonstration because it can be opened directly in a browser without installing Python, Flask, MySQL or a database server.

Limitations
This is an educational simulation.

Radar positions are simulated.
Weather data is manually entered.
Volcanic ash zones are predefined.
Runway allocation is simplified.
Browser voice recognition depends on browser support.
Ollama is optional.
The system is not connected to real aircraft or aviation infrastructure.
Future Improvements
Possible additions include:

Real-time flight data
Live weather APIs
Map integration
More advanced trajectory prediction
Multiple airports
Better collision prediction
More environmental hazards
Real database support
Machine-learning traffic prediction
Project Conclusion
The project demonstrates how HTML, CSS and JavaScript can be used to create a complete browser-based ATC simulation.

It combines user input, radar visualization, mathematical collision detection, weather checking, emergency detection, runway allocation, voice interaction and optional local AI in a single application.

It is intended for academic and educational use.

## ATC is divided into three main stages:

<img width="587" height="226" alt="image" src="https://github.com/user-attachments/assets/31ec7351-6820-4f05-8232-2e000f6eae3c" />

## How ATC Tracks and Guides Aircraft
Radar Tracking & Communication Flow

<img width="592" height="336" alt="image" src="https://github.com/user-attachments/assets/7fa5484a-b77f-429d-b574-0555e1c1a58d" />

The ATC Workflow – Step by Step
Flight Phases and Corresponding ATC Units

<img width="444" height="589" alt="image" src="https://github.com/user-attachments/assets/ad053f1c-79f2-4ef3-a549-cc45589ef4f0" />

## Separation and Safety Rules
Aircraft Separation Standards

<img width="432" height="293" alt="image" src="https://github.com/user-attachments/assets/1c64a541-f11c-48e5-97cc-3a241af6a0d5" />

Inside an ATC Tower
Cutaway View of an ATC Tower
<img width="429" height="288" alt="image" src="https://github.com/user-attachments/assets/ca9ab6db-2fc8-40b5-9273-e1e3135fa243" />

## Weather, Emergencies, and Automation
ATC also provides weather updates, reroutes aircraft during storms or turbulence, and coordinates emergency landings.
Modern ATC is evolving toward automation through:

Digital flight strips
Satellite navigation (GNSS)
AI-assisted traffic prediction

## Future of Air Traffic Control
The next generation system, NextGen (U.S.) and SESAR (Europe), aims for:

Satellite-based tracking
Real-time data exchange between aircraft and ATC
Reduced delays and fuel use
