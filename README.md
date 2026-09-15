# ✈️ AI Smart Air Traffic Control System

<div align="center">

![ATC Banner](https://img.shields.io/badge/AI%20Smart-ATC%20System-orange?style=for-the-badge&logo=airplane&logoColor=white)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Ollama](https://img.shields.io/badge/Ollama-llama3.2:3b-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A fully browser-based, AI-powered Air Traffic Control system with live radar, collision detection, emergency management, and Ollama LLM integration — no backend, no database, just one HTML file.**

[Features](#-features) · [Demo](#-demo) · [Installation](#-installation) · [How It Works](#-how-it-works) · [Screenshots](#-screenshots) · [Tech Stack](#-tech-stack) · [Project Structure](#-project-structure) · [Contributing](#-contributing)

</div>

---

## 📌 Overview

The **AI Smart Air Traffic Control System** is a complete, single-file web application that simulates a real ATC (Air Traffic Control) environment. It combines classic ATC logic — weather analysis, radar tracking, collision detection, and runway allocation — with a local **Ollama llama3.2:3b** AI model that generates professional aviation-style decisions for every flight processed.

Built entirely with **HTML, CSS, and JavaScript** — no Python, no MySQL, no server required.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📡 **Live Radar** | Animated phosphor-green sweep with 6 tracked aircraft, drift simulation, and ash zone overlays |
| 🌩️ **Weather Analysis** | Checks wind speed and visibility to classify weather as Safe or Dangerous |
| 💥 **Collision Detection** | Calculates real-time distance between your aircraft and all radar traffic |
| 🌋 **Volcanic Ash Detection** | Proximity check against multiple defined ash danger zones |
| 🚨 **Emergency Detection** | Identifies Low Fuel, Engine Overheat, and Volcanic Ash emergencies |
| 🛬 **Smart Runway Allocation** | Auto-assigns Runway 1 (emergency), 2 (normal), or 3 (strong wind) |
| 🤖 **Ollama AI Decision** | llama3.2:3b generates a professional 4–6 sentence ATC advisory per flight |
| 🔊 **Voice Announcements** | Web Speech API reads the full ATC report aloud after each analysis |
| 🗂️ **Session History** | Every processed flight is logged in an in-session table |
| 📊 **Live KPI Bar** | Real-time counters for total flights, safe flights, and emergencies |
| 🎲 **Random Generator** | Instantly load a random aircraft for quick testing |

---

## 🎬 Demo

> Open `atc_system.html` directly in your browser. No installation needed beyond Ollama.

```
✈  Flight AI203  →  Mumbai
📡 Position:  (247, 318)
🌩  Weather:   Safe
💥 Collision:  Safe — IND450 at 87.3 units
🌋 Ash:        Clear
🚨 Emergency:  NONE
🛬 Runway:     2  (Regular Operation)
🤖 AI:         "Flight AI203, radar contact. Weather conditions are within normal
                parameters. Maintain current altitude and heading. Cleared to land
                Runway Two..."
```

---

## 🛠️ Installation

### Prerequisites

You only need two things:

- A modern web browser (Chrome, Firefox, Edge, Safari)
- [Ollama](https://ollama.com) installed on your machine

### Step 1 — Install Ollama

Go to [https://ollama.com](https://ollama.com) and download the installer for your OS.

| OS | Command |
|---|---|
| macOS | `brew install ollama` or download the app |
| Linux | `curl -fsSL https://ollama.com/install.sh \| sh` |
| Windows | Download the `.exe` installer from the website |

### Step 2 — Pull the AI Model

```bash
ollama pull llama3.2:3b
```

This downloads the ~2 GB llama3.2:3b model locally. Only needs to be done once.

### Step 3 — Start Ollama

```bash
ollama serve
```

> ⚠️ **CORS fix for browser requests:** Run Ollama with origins enabled:
> ```bash
> OLLAMA_ORIGINS="*" ollama serve
> ```
> On Windows (PowerShell):
> ```powershell
> $env:OLLAMA_ORIGINS="*"; ollama serve
> ```

### Step 4 — Open the App

```bash
# Just double-click the file, or:
open atc_system.html          # macOS
start atc_system.html         # Windows
xdg-open atc_system.html      # Linux
```

That's it. No `npm install`, no `pip install`, no server to run.

---

## 🔧 How It Works

### System Flow

```
User enters aircraft data
        │
        ▼
┌─────────────────────┐
│   Weather Analysis  │  wind > 50 km/h OR vis < 500m  →  Dangerous
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Radar & Collision  │  distance formula  →  RISK if < 50 units
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Volcanic Ash Check │  proximity to defined ash zones
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Emergency Detection │  fuel < 20% / temp > 90°C / ash
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Runway Allocation  │  Runway 1 / 2 / 3
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Ollama llama3.2:3b │  AI generates aviation decision
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Voice Readout     │  Web Speech API announces results
└──────────┬──────────┘
           │
           ▼
     Session Log + KPIs updated
```

### ATC Decision Rules

#### Weather Analysis
```
Wind Speed > 50 km/h   →  DANGEROUS
Visibility < 500 m     →  DANGEROUS
Otherwise              →  SAFE
```

#### Collision Detection
```
Distance = √((x₂-x₁)² + (y₂-y₁)²)

Distance < 50 units    →  COLLISION RISK
Distance ≥ 50 units    →  SAFE SEPARATION
```

#### Emergency Detection
```
Fuel Level  < 20%   →  LOW FUEL emergency
Engine Temp > 90°C  →  ENGINE OVERHEAT emergency
In Ash Zone         →  VOLCANIC ASH emergency
```

#### Runway Allocation
```
Any emergency exists   →  Runway 1  (Emergency Priority Landing)
Wind Speed > 50 km/h   →  Runway 3  (Strong Wind Conditions)
Normal conditions      →  Runway 2  (Regular Operation)
```

### Ollama AI Integration

Each aircraft analysis sends a structured prompt to `llama3.2:3b` running locally via the Ollama REST API:

```javascript
const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model:  'llama3.2:3b',
    prompt: atcPrompt,
    stream: false,
  }),
});
```

The model receives full aircraft data, ATC analysis results, and is instructed to respond as a senior Air Traffic Controller.

### Simulated Radar Traffic

Six aircraft are permanently tracked on the radar with position jitter for realism:

| Callsign | Base X | Base Y |
|---|---|---|
| AI101  | 120 | 340 |
| IND450 | 200 | 180 |
| QTR778 | 310 | 410 |
| USA220 | 80  | 270 |
| ETH330 | 370 | 130 |
| SIA991 | 260 | 90  |

### Volcanic Ash Zones

Two active ash zones are defined in the radar grid (0–450 unit coordinate space):

| Zone | Centre | Radius |
|---|---|---|
| Zone 1 | (300, 300) | 80 units |
| Zone 2 | (150, 450) | 60 units |

---

## 📸 Screenshots

### Main Dashboard
> Three-panel layout: Input form (left), Radar + Analysis (centre), Alert log (right)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ✈ AI Smart ATC    [0 Processed] [0 Safe] [0 Emg]    llama3.2:3b  Online│
├────────────────┬──────────────────────────────────────┬──────────────────┤
│ Aircraft Data  │  📡 Radar  │ 📊 Analysis │ 🗂 History │  Live Alert Log  │
│                │                                      │                  │
│ Aircraft Name  │    [  Animated Radar Canvas  ]       │ ✅ System online  │
│ Flight Number  │    [  Sweep + Traffic Blips  ]       │ ℹ️  Awaiting data │
│ Destination    │    [  Ash Zones + Your AC    ]       │                  │
│                │                                      │                  │
│ Fuel ──●── 72% │                                      │                  │
│ Temp ──●── 65° │                                      │                  │
│ Wind ──●── 30  │                                      │                  │
│ Vis  ──●──1200 │                                      │                  │
│                │                                      │                  │
│ [⚡ Analyse  ] │                                      │                  │
│ [🎲 Random  ] │                                      │                  │
│ [🤖 Ollama  ] │                                      │                  │
└────────────────┴──────────────────────────────────────┴──────────────────┘
```

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | App structure and layout |
| **CSS3** | Aviation dark theme, animations, grid layout |
| **Vanilla JavaScript** | All ATC logic, canvas radar, Ollama API calls |
| **Canvas API** | Animated radar display with sweep, blips, zones |
| **Ollama REST API** | Local LLM inference via `llama3.2:3b` |
| **Web Speech API** | Browser-native voice announcements |
| **CSS Grid** | Responsive three-column dashboard layout |

### Why no framework?

This project is intentionally zero-dependency. No React, no Vue, no build step. Open the file → it works.

---

## 📁 Project Structure

```
ai-smart-atc/
│
├── atc_system.html          ← The entire application (single file)
└── README.md                ← This file
```

Everything — HTML structure, CSS styling, JavaScript logic, radar canvas, Ollama integration, and voice output — lives in `atc_system.html`.

---

## 🎮 Usage Guide

### Processing an Aircraft

1. Fill in the **Aircraft Name**, **Flight Number**, and **Destination**
2. Adjust the four sliders:
   - **Fuel Level** — set low (< 20%) to trigger a fuel emergency
   - **Engine Temp** — set high (> 90°C) to trigger overheat
   - **Wind Speed** — set above 50 to trigger dangerous weather + Runway 3
   - **Visibility** — set below 500m to trigger dangerous weather
3. Click **⚡ Run ATC Analysis**
4. Watch the radar dot appear, results populate, and hear the voice readout
5. Switch to the **Analysis** tab to see the full report including the Ollama AI decision
6. Switch to the **History** tab to review all processed flights

### Testing Emergency Scenarios

| Scenario | Settings |
|---|---|
| Low Fuel Emergency | Fuel → 10% |
| Engine Overheat | Temp → 100°C |
| Dangerous Weather | Wind → 70 km/h |
| Poor Visibility | Visibility → 200m |
| Collision Risk | Aircraft is randomly placed; re-run until distance < 50 units |
| Ash Emergency | Position is random; re-run to hit a zone |
| All Emergencies | Fuel 5%, Temp 110°C, Wind 80 km/h |

### Quick Test with Random Aircraft

Click **🎲 Random Aircraft** to auto-fill all fields with randomised values. Good for stress-testing the AI decision logic.

---

## ⚙️ Configuration

All configuration is at the top of the `<script>` section in `atc_system.html`:

```javascript
const OLLAMA_URL   = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'llama3.2:3b';

// Collision threshold (units)
const COLLISION_LIMIT = 50;

// Radar traffic positions (x, y in 0-450 grid)
const RADAR_TRAFFIC = {
  'AI101' : {x:120, y:340},
  'IND450': {x:200, y:180},
  // ...add more aircraft here
};

// Volcanic ash danger zones
const ASH_ZONES = [
  {cx:300, cy:300, r:80},
  {cx:150, cy:450, r:60},
  // ...add more zones here
];
```

### Changing the AI Model

To use a different Ollama model, change:

```javascript
const OLLAMA_MODEL = 'llama3.2:3b';  // change to any model you have pulled
```

Popular alternatives:
```bash
ollama pull mistral         # smaller, faster
ollama pull llama3.1:8b    # larger, smarter
ollama pull phi3            # Microsoft Phi-3
```

---

## 🛡️ ATC Logic Reference

### Complete Decision Table

| Condition | Value | Result |
|---|---|---|
| Fuel Level | < 20% | 🚨 LOW FUEL emergency + Runway 1 |
| Engine Temp | > 90°C | 🚨 ENGINE OVERHEAT + Runway 1 |
| Wind Speed | > 50 km/h | ⚠️ Dangerous weather + Runway 3 |
| Visibility | < 500 m | ⚠️ Dangerous weather |
| Traffic Distance | < 50 units | 💥 COLLISION RISK |
| Ash Zone | Within radius | 🌋 VOLCANIC ASH + Runway 1 |
| All clear | — | ✅ Runway 2, normal operation |

### Runway Priority Order
```
Runway 1  ←  HIGHEST priority  (any emergency)
Runway 3  ←  Strong wind only (no emergency)
Runway 2  ←  Default          (all clear)
```

---

## 🤖 AI Prompt Design

The system sends this structured prompt to Ollama for every flight:

```
You are an expert Air Traffic Controller AI. Analyse this aircraft data
and give a professional 4-6 sentence safety assessment with clear 
advisories. Use aviation-style language.

AIRCRAFT: [name]  |  FLIGHT: [number]  →  [destination]
Fuel: [x]%  |  Engine Temp: [x]°C  |  Wind: [x] km/h  |  Visibility: [x]m
Radar Position: ([x], [y])

ATC RESULTS:
- Weather: [Safe/Dangerous]
- Nearest traffic: [callsign] at [distance] units  →  [Safe/RISK]
- Volcanic ash: [Clear/DETECTED IN PATH]
- Emergencies: [list or None]
- Runway assigned: Runway [n]  ([reason])

Give your ATC decision, risk level, and immediate pilot instructions.
```

---

## 🌐 Browser Compatibility

| Browser | Radar | Ollama AI | Voice |
|---|---|---|---|
| Chrome 90+ | ✅ | ✅ | ✅ |
| Firefox 88+ | ✅ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ | ✅ |

> Voice output (Web Speech API) may behave differently across browsers. Chrome gives the best results.

---

## ❓ Troubleshooting

### Ollama AI shows "Offline"

```bash
# Start Ollama with CORS enabled
OLLAMA_ORIGINS="*" ollama serve

# Windows PowerShell
$env:OLLAMA_ORIGINS="*"; ollama serve
```

### Model not found

```bash
# Pull the model first
ollama pull llama3.2:3b

# Check what models you have
ollama list
```

### No voice output

- Make sure your browser volume is not muted
- Chrome works best for Web Speech API
- Some browsers require HTTPS for speech; use Chrome locally

### Radar looks wrong / blank

- Resize the browser window to trigger a canvas resize
- Try a hard refresh: `Ctrl+Shift+R` / `Cmd+Shift+R`

### Ollama is slow

llama3.2:3b requires ~4 GB RAM. If it's slow, ensure no other heavy applications are running, or switch to a smaller model like `phi3`.

---

## 📚 Real-Life Applications

This project demonstrates concepts used in:

- ✈️ Airport ATC management systems
- 🛩️ Flight monitoring and safety software
- 🎓 Aviation training simulators
- 🔬 AI-assisted decision support tools
- 🧪 Emergency management research platforms

---

## 🔮 Future Improvements

- [ ] Multi-aircraft simultaneous processing queue
- [ ] Real weather API integration (OpenWeatherMap)
- [ ] IndexedDB for persistent flight history across sessions
- [ ] WebSocket live radar with simulated moving aircraft
- [ ] Export flight report as PDF
- [ ] Dark/light theme toggle
- [ ] Mobile-responsive layout
- [ ] Audio alerts with distinct tones per emergency type
- [ ] Replay mode for past flights
- [ ] Multiple runways with visual diagram

---

## 📄 License

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---


## ATC is divided into three main categories;

<img width="589" height="224" alt="image" src="https://github.com/user-attachments/assets/8fac4b37-5a4e-47d4-9938-acab0c85f120" />

## How ATC tracks and guide the aircraft
## Radar Tracking and Communication Flow

<img width="599" height="371" alt="image" src="https://github.com/user-attachments/assets/627dfd4b-a289-4223-ba3b-0bbeeb595942" />

## Flight Phases and Corresponding ATC Units

<img width="697" height="637" alt="image" src="https://github.com/user-attachments/assets/2bcd6e81-241c-4a71-b861-ec3cde3df75f" />

## Aircraft Separation Standards

<img width="620" height="388" alt="image" src="https://github.com/user-attachments/assets/69151b6a-f6d9-4c50-87ef-f4a5f493fb7c" />

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

## Disclaimer

This software is an educational simulation. It must not be used for real-world aircraft navigation, safety decisions or professional Air Traffic Control operations.
