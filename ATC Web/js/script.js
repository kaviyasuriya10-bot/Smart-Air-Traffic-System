const WORLD = { width: 450, height: 500 };

const RADAR_AIRCRAFT = {
  AI101: [120, 340],
  IND450: [200, 180],
  QTR778: [310, 410],
  USA220: [80, 270]
};

const ASH_ZONES = [
  { x: 300, y: 300, radius: 80 },
  { x: 150, y: 450, radius: 60 }
];

const COLLISION_THRESHOLD = 50;
const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "llama3.2:3b";
const HISTORY_KEY = "atcFlightHistory";

let radarContacts = {};
let subjectAircraft = null;
let sweepAngle = 0;
let latestReport = null;
let recognition = null;
let listening = false;

const canvas = document.getElementById("radarCanvas");
const ctx = canvas.getContext("2d");
const form = document.getElementById("intakeForm");
const analyseBtn = document.getElementById("analyseBtn");
const formMessage = document.getElementById("formMessage");

function nowTime() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function tickClock() {
  document.getElementById("clock").textContent = nowTime();
}

setInterval(tickClock, 1000);
tickClock();

function randomPosition() {
  return {
    x: Number((Math.random() * 350 + 50).toFixed(2)),
    y: Number((Math.random() * 400 + 50).toFixed(2))
  };
}

function updateRadarContacts() {
  const result = {};

  for (const [code, position] of Object.entries(RADAR_AIRCRAFT)) {
    result[code] = [
      Number((position[0] + (Math.random() * 10 - 5)).toFixed(1)),
      Number((position[1] + (Math.random() * 10 - 5)).toFixed(1))
    ];
  }

  radarContacts = result;
  document.getElementById("radarStatus").textContent =
    `${Object.keys(radarContacts).length} contacts`;
}

function toCanvas(x, y) {
  return [
    (x / WORLD.width) * canvas.width,
    (y / WORLD.height) * canvas.height
  ];
}

function drawRadar() {
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) / 2 - 5;

  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "#050a07";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(111,239,160,0.15)";
  ctx.lineWidth = 1;

  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, (maxR / 4) * i, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(cx, 5);
  ctx.lineTo(cx, h - 5);
  ctx.moveTo(5, cy);
  ctx.lineTo(w - 5, cy);
  ctx.stroke();

  for (const zone of ASH_ZONES) {
    const [x, y] = toCanvas(zone.x, zone.y);
    const radius = (zone.radius / WORLD.width) * w;

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,107,94,0.10)";
    ctx.strokeStyle = "rgba(255,107,94,0.45)";
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,107,94,0.75)";
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.fillText("ASH", x - 10, y);
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(sweepAngle);

  const sweep = ctx.createLinearGradient(0, 0, maxR, 0);
  sweep.addColorStop(0, "rgba(111,239,160,0.35)");
  sweep.addColorStop(1, "rgba(111,239,160,0)");

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, maxR, -0.18, 0.18);
  ctx.closePath();
  ctx.fillStyle = sweep;
  ctx.fill();
  ctx.restore();

  for (const [code, position] of Object.entries(radarContacts)) {
    const [x, y] = toCanvas(position[0], position[1]);

    ctx.beginPath();
    ctx.fillStyle = "#6fefa0";
    ctx.shadowColor = "rgba(111,239,160,0.8)";
    ctx.shadowBlur = 7;
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#9fd6b8";
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.fillText(code, x + 7, y - 6);
  }

  if (subjectAircraft) {
    const [x, y] = toCanvas(subjectAircraft.x, subjectAircraft.y);

    ctx.beginPath();
    ctx.fillStyle = "#f0a83c";
    ctx.shadowColor = "rgba(240,168,60,0.9)";
    ctx.shadowBlur = 10;
    ctx.arc(x, y, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#f5c98a";
    ctx.font = "bold 11px JetBrains Mono, monospace";
    ctx.fillText(subjectAircraft.label, x + 8, y - 8);
  }
}

function animateRadar() {
  sweepAngle += 0.012;
  drawRadar();
  requestAnimationFrame(animateRadar);
}

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function checkCollision(x, y) {
  let nearest = null;
  let nearestDistance = Infinity;

  for (const [name, position] of Object.entries(radarContacts)) {
    const distance = calculateDistance(x, y, position[0], position[1]);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = name;
    }
  }

  return {
    nearestAircraft: nearest,
    distance: Number(nearestDistance.toFixed(1)),
    risk: nearestDistance < COLLISION_THRESHOLD
  };
}

function checkVolcanicAsh(x, y) {
  return ASH_ZONES.some(zone =>
    calculateDistance(x, y, zone.x, zone.y) < zone.radius
  );
}

function analyseWeather(wind, visibility) {
  const dangerous = wind > 50 || visibility < 500;

  return {
    status: dangerous ? "Dangerous" : "Safe",
    dangerous
  };
}

function detectEmergencies(fuel, engineTemp, ash) {
  const emergencies = [];

  if (fuel < 20) {
    emergencies.push("LOW FUEL");
  }

  if (engineTemp > 90) {
    emergencies.push("ENGINE OVERHEAT");
  }

  if (ash) {
    emergencies.push("VOLCANIC ASH");
  }

  return emergencies;
}

function allocateRunway(emergencies, wind) {
  if (emergencies.length > 0) {
    return {
      number: 1,
      reason: "Emergency - Priority Landing"
    };
  }

  if (wind > 50) {
    return {
      number: 3,
      reason: "Strong Wind - Safer Runway"
    };
  }

  return {
    number: 2,
    reason: "Regular Operation"
  };
}

function createReport(data) {
  const position = randomPosition();
  const weather = analyseWeather(data.wind, data.visibility);

  const collision = checkCollision(position.x, position.y);
  const ash = checkVolcanicAsh(position.x, position.y);
  const emergencies = detectEmergencies(
    data.fuel,
    data.engineTemp,
    ash
  );
  const runway = allocateRunway(emergencies, data.wind);

  return {
    aircraft_name: data.aircraft,
    flight_number: data.flight,
    destination: data.destination,
    fuel_level: data.fuel,
    engine_temp: data.engineTemp,
    wind_speed: data.wind,
    visibility: data.visibility,
    pos_x: position.x,
    pos_y: position.y,
    weather_status: weather.status,
    collision_status: collision.risk ? "RISK" : "Safe",
    nearest_aircraft: collision.nearestAircraft,
    nearest_distance: collision.distance,
    volcanic_ash: ash,
    emergencies,
    emergency_status: emergencies.length ? emergencies.join(", ") : "None",
    runway_number: runway.number,
    runway_reason: runway.reason,
    created_at: new Date().toISOString()
  };
}

function tag(text, type) {
  return `<span class="tag ${type}">${escapeHTML(text)}</span>`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderReport(report) {
  const panel = document.getElementById("reportPanel");
  const grid = document.getElementById("reportGrid");

  const weather = report.weather_status === "Dangerous"
    ? tag("DANGEROUS", "danger")
    : tag("SAFE", "safe");

  const collision = report.collision_status === "RISK"
    ? tag("RISK", "danger")
    : tag("SAFE SEPARATION", "safe");

  const ash = report.volcanic_ash
    ? tag("DETECTED", "danger")
    : tag("CLEAR", "safe");

  const emergency = report.emergencies.length
    ? tag(report.emergency_status, "warn")
    : tag("NONE", "safe");

  grid.innerHTML = `
    <div class="report-item">
      <span class="label">Aircraft</span>
      <span class="value">${escapeHTML(report.aircraft_name)}</span>
    </div>
    <div class="report-item">
      <span class="label">Flight</span>
      <span class="value">${escapeHTML(report.flight_number)}</span>
    </div>
    <div class="report-item">
      <span class="label">Destination</span>
      <span class="value">${escapeHTML(report.destination)}</span>
    </div>
    <div class="report-item">
      <span class="label">Position</span>
      <span class="value">(${report.pos_x}, ${report.pos_y})</span>
    </div>

    <div class="report-item">
      <span class="label">Fuel</span>
      <span class="value">${report.fuel_level}%</span>
    </div>
    <div class="report-item">
      <span class="label">Engine temperature</span>
      <span class="value">${report.engine_temp} °C</span>
    </div>
    <div class="report-item">
      <span class="label">Wind speed</span>
      <span class="value">${report.wind_speed} km/h</span>
    </div>
    <div class="report-item">
      <span class="label">Visibility</span>
      <span class="value">${report.visibility} m</span>
    </div>

    <div class="report-item">
      <span class="label">Weather</span>
      <span class="value">${weather}</span>
    </div>
    <div class="report-item">
      <span class="label">Nearest traffic</span>
      <span class="value">${escapeHTML(report.nearest_aircraft)} / ${report.nearest_distance} units</span>
    </div>
    <div class="report-item">
      <span class="label">Collision check</span>
      <span class="value">${collision}</span>
    </div>
    <div class="report-item">
      <span class="label">Volcanic ash</span>
      <span class="value">${ash}</span>
    </div>

    <div class="report-item">
      <span class="label">Emergency status</span>
      <span class="value">${emergency}</span>
    </div>
    <div class="report-item">
      <span class="label">Runway</span>
      <span class="value">Runway ${report.runway_number}</span>
    </div>
    <div class="report-item">
      <span class="label">Runway reason</span>
      <span class="value">${escapeHTML(report.runway_reason)}</span>
    </div>
    <div class="report-item">
      <span class="label">Processing mode</span>
      <span class="value">Browser JavaScript</span>
    </div>
  `;

  document.getElementById("reportTime").textContent =
    `Processed at ${new Date(report.created_at).toLocaleString()}`;

  panel.hidden = false;
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function buildLocalAssessment(report) {
  const lines = [];

  if (report.emergencies.length) {
    lines.push(
      `Emergency conditions detected: ${report.emergency_status}.`
    );
  } else {
    lines.push("No immediate emergency condition was detected.");
  }

  if (report.collision_status === "RISK") {
    lines.push(
      `Collision risk is present near ${report.nearest_aircraft}. The aircraft should maintain separation.`
    );
  } else {
    lines.push(
      `The nearest simulated traffic is ${report.nearest_aircraft}, at ${report.nearest_distance} units.`
    );
  }

  if (report.weather_status === "Dangerous") {
    lines.push(
      "Weather conditions are outside the project's normal operating thresholds."
    );
  } else {
    lines.push("Wind speed and visibility are within the project's normal thresholds.");
  }

  if (report.volcanic_ash) {
    lines.push("The aircraft position is inside a simulated volcanic ash zone.");
  }

  lines.push(
    `Runway ${report.runway_number} is assigned using the project's simplified runway allocation rules.`
  );

  return lines.join(" ");
}

async function askOllama(report) {
  const prompt = `
You are an educational air traffic control assistant.
Give a short, factual ATC assessment for this simulated aircraft.

Aircraft: ${report.aircraft_name}
Flight: ${report.flight_number}
Destination: ${report.destination}
Fuel: ${report.fuel_level} percent
Engine temperature: ${report.engine_temp} C
Wind: ${report.wind_speed} km/h
Visibility: ${report.visibility} m
Weather: ${report.weather_status}
Collision status: ${report.collision_status}
Nearest aircraft: ${report.nearest_aircraft}
Nearest distance: ${report.nearest_distance}
Volcanic ash: ${report.volcanic_ash ? "detected" : "clear"}
Emergency: ${report.emergency_status}
Runway: ${report.runway_number}

Return 4 to 6 concise sentences. Do not invent sensor readings.
`;

  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama returned ${response.status}`);
  }

  const result = await response.json();

  if (!result.response) {
    throw new Error("No response received from Ollama");
  }

  return result.response.trim();
}

async function generateAssessment(report) {
  const output = document.getElementById("aiOutput");
  const status = document.getElementById("aiStatus");

  output.textContent = buildLocalAssessment(report);
  status.textContent = "Browser rule-based assessment";

  try {
    const aiText = await askOllama(report);
    output.textContent = aiText;
    status.textContent = `Ollama ${OLLAMA_MODEL}`;
    addAlert("ok", "AI", "Ollama assessment received.");
  } catch (error) {
    status.textContent = "Local assessment";
    addAlert(
      "info",
      "AI",
      "Ollama was not available. Local assessment is being used."
    );
  }
}

function saveHistory(report) {
  const history = getHistory();
  history.unshift(report);

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history.slice(0, 50))
  );

  renderHistory();
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function renderHistory() {
  const history = getHistory();
  const body = document.getElementById("historyBody");
  const count = document.getElementById("historyCount");

  count.textContent = `${history.length} record${history.length === 1 ? "" : "s"}`;

  if (!history.length) {
    body.innerHTML =
      '<tr><td colspan="8" class="empty">No flights processed yet.</td></tr>';
    return;
  }

  body.innerHTML = history.map(report => {
    const weather = report.weather_status === "Dangerous"
      ? tag("DANGEROUS", "danger")
      : tag("SAFE", "safe");

    const collision = report.collision_status === "RISK"
      ? tag("RISK", "danger")
      : tag("SAFE", "safe");

    const emergency = report.emergency_status === "None"
      ? tag("NONE", "safe")
      : tag(report.emergency_status, "warn");

    return `
      <tr>
        <td>${escapeHTML(report.flight_number)}</td>
        <td>${escapeHTML(report.aircraft_name)}</td>
        <td>${escapeHTML(report.destination)}</td>
        <td>${weather}</td>
        <td>${collision}</td>
        <td>${emergency}</td>
        <td>Runway ${report.runway_number}</td>
        <td>${new Date(report.created_at).toLocaleString()}</td>
      </tr>
    `;
  }).join("");
}

function addAlert(level, label, message) {
  const alerts = document.getElementById("alerts");
  const row = document.createElement("div");

  row.className = `alert ${level}`;
  row.innerHTML = `
    <span class="alert-time">${nowTime()}</span>
    <span class="alert-level">${escapeHTML(label)}</span>
    <span>${escapeHTML(message)}</span>
  `;

  alerts.prepend(row);

  while (alerts.children.length > 30) {
    alerts.removeChild(alerts.lastElementChild);
  }
}

function readForm() {
  const fd = new FormData(form);

  return {
    aircraft: String(fd.get("aircraft_name")).trim(),
    flight: String(fd.get("flight_number")).trim(),
    destination: String(fd.get("destination")).trim(),
    fuel: Number(fd.get("fuel_level")),
    engineTemp: Number(fd.get("engine_temp")),
    wind: Number(fd.get("wind_speed")),
    visibility: Number(fd.get("visibility"))
  };
}

function validateData(data) {
  if (!data.aircraft || !data.flight || !data.destination) {
    return "Please fill in the aircraft, flight number and destination.";
  }

  const numbers = [
    data.fuel,
    data.engineTemp,
    data.wind,
    data.visibility
  ];

  if (numbers.some(value => !Number.isFinite(value))) {
    return "Fuel, engine temperature, wind speed and visibility must be numbers.";
  }

  if (data.fuel < 0 || data.fuel > 100) {
    return "Fuel level must be between 0 and 100.";
  }

  if (data.wind < 0 || data.visibility < 0) {
    return "Wind speed and visibility cannot be negative.";
  }

  return "";
}

async function processAircraft() {
  formMessage.textContent = "";

  const data = readForm();
  const error = validateData(data);

  if (error) {
    formMessage.textContent = error;
    addAlert("warn", "INPUT", error);
    return;
  }

  analyseBtn.disabled = true;
  analyseBtn.textContent = "Analysing...";

  try {
    const report = createReport(data);
    latestReport = report;

    subjectAircraft = {
      x: report.pos_x,
      y: report.pos_y,
      label: report.flight_number
    };

    renderReport(report);
    saveHistory(report);

    addAlert("ok", "ANALYSIS", `${report.flight_number} processed successfully.`);

    if (report.collision_status === "RISK") {
      addAlert(
        "danger",
        "COLLISION",
        `Traffic conflict detected near ${report.nearest_aircraft}.`
      );
    }

    if (report.weather_status === "Dangerous") {
      addAlert("warn", "WEATHER", "Wind or visibility is outside the normal threshold.");
    }

    if (report.volcanic_ash) {
      addAlert("danger", "ASH", "Aircraft is inside a simulated volcanic ash zone.");
    }

    if (report.emergencies.length) {
      addAlert("danger", "EMERGENCY", report.emergency_status);
    }

    addAlert(
      "info",
      "RUNWAY",
      `Runway ${report.runway_number} assigned.`
    );

    await generateAssessment(report);
  } finally {
    analyseBtn.disabled = false;
    analyseBtn.textContent = "Run ATC Analysis";
  }
}

function fillRandomAircraft() {
  const aircraft = [
    "Boeing 737",
    "Airbus A320",
    "Boeing 787",
    "Airbus A350",
    "ATR 72"
  ];

  const destinations = [
    "Mumbai",
    "Chennai",
    "Delhi",
    "Bengaluru",
    "Hyderabad",
    "Kolkata"
  ];

  form.elements.aircraft_name.value =
    aircraft[Math.floor(Math.random() * aircraft.length)];

  form.elements.flight_number.value =
    "AI" + Math.floor(100 + Math.random() * 899);

  form.elements.destination.value =
    destinations[Math.floor(Math.random() * destinations.length)];

  form.elements.fuel_level.value =
    Math.floor(15 + Math.random() * 80);

  form.elements.engine_temp.value =
    Math.floor(65 + Math.random() * 40);

  form.elements.wind_speed.value =
    Math.floor(10 + Math.random() * 65);

  form.elements.visibility.value =
    Math.floor(300 + Math.random() * 5000);

  formMessage.textContent = "Random aircraft data loaded.";
  addAlert("info", "INPUT", "Random aircraft data generated.");
}

function runTextCommand() {
  const input = document.getElementById("commandInput");
  const command = input.value.trim().toLowerCase();

  if (!command) {
    formMessage.textContent = "Enter an ATC command first.";
    return;
  }

  addAlert("info", "COMMAND", command);

  if (command.includes("collision")) {
    if (!latestReport) {
      formMessage.textContent = "Run an aircraft analysis first.";
      return;
    }

    const c = checkCollision(latestReport.pos_x, latestReport.pos_y);
    const message = c.risk
      ? `Collision risk detected. Nearest traffic is ${c.nearestAircraft} at ${c.distance} units.`
      : `No collision risk detected. Nearest traffic is ${c.nearestAircraft} at ${c.distance} units.`;

    formMessage.textContent = message;
    addAlert(c.risk ? "danger" : "ok", "COLLISION", message);
    return;
  }

  if (command.includes("runway")) {
    if (!latestReport) {
      formMessage.textContent = "Run an aircraft analysis first.";
      return;
    }

    const message =
      `Runway ${latestReport.runway_number}: ${latestReport.runway_reason}.`;

    formMessage.textContent = message;
    addAlert("info", "RUNWAY", message);
    return;
  }

  if (command.includes("weather")) {
    if (!latestReport) {
      formMessage.textContent = "Run an aircraft analysis first.";
      return;
    }

    const message =
      `Weather status: ${latestReport.weather_status}. Wind ${latestReport.wind_speed} km/h, visibility ${latestReport.visibility} m.`;

    formMessage.textContent = message;
    addAlert(
      latestReport.weather_status === "Dangerous" ? "warn" : "ok",
      "WEATHER",
      message
    );
    return;
  }

  if (command.includes("emergency")) {
    if (!latestReport) {
      formMessage.textContent = "Run an aircraft analysis first.";
      return;
    }

    const message =
      latestReport.emergency_status === "None"
        ? "No emergency condition detected."
        : `Emergency conditions: ${latestReport.emergency_status}.`;

    formMessage.textContent = message;
    addAlert(
      latestReport.emergency_status === "None" ? "ok" : "danger",
      "EMERGENCY",
      message
    );
    return;
  }

  if (command.includes("ash") || command.includes("volcanic")) {
    if (!latestReport) {
      formMessage.textContent = "Run an aircraft analysis first.";
      return;
    }

    const message = latestReport.volcanic_ash
      ? "Volcanic ash detected at the simulated aircraft position."
      : "No volcanic ash zone detected at the simulated aircraft position.";

    formMessage.textContent = message;
    addAlert(
      latestReport.volcanic_ash ? "danger" : "ok",
      "ASH",
      message
    );
    return;
  }

  if (command.includes("status")) {
    const message = latestReport
      ? `System online. Latest flight: ${latestReport.flight_number}.`
      : "System online. No aircraft has been analysed yet.";

    formMessage.textContent = message;
    addAlert("ok", "SYSTEM", message);
    return;
  }

  formMessage.textContent =
    "Command not recognised. Try collision detection, runway allocation, weather analysis, emergency check, volcanic ash, or system status.";
}

function setField(name, value) {
  const field = form.elements[name];
  if (field) {
    field.value = String(value).trim();
  }
}

function numberFromSpeech(text) {
  const match = text.replaceAll(",", "").match(/-?\d+(?:\.\d+)?/);
  return match ? match[0] : "";
}

function parseVoiceForm(text) {
  const s = text.replace(/\s+/g, " ").trim();

  const patterns = [
    ["aircraft_name", /(?:aircraft(?: type)?|plane)\s+(.+?)(?=\s+(?:flight|destination|fuel|engine|wind|visibility)\b|$)/i],
    ["flight_number", /(?:flight(?: number)?|flight no)\s+([A-Za-z0-9-]+)/i],
    ["destination", /destination\s+(.+?)(?=\s+(?:fuel|engine|wind|visibility)\b|$)/i],
    ["fuel_level", /fuel(?: level)?\s+([0-9]+(?:\.[0-9]+)?)/i],
    ["engine_temp", /engine(?: temperature| temp)?\s+([0-9]+(?:\.[0-9]+)?)/i],
    ["wind_speed", /wind(?: speed)?\s+([0-9]+(?:\.[0-9]+)?)/i],
    ["visibility", /visibility\s+([0-9]+(?:\.[0-9]+)?)/i]
  ];

  let found = 0;

  for (const [name, pattern] of patterns) {
    const match = s.match(pattern);

    if (!match) {
      continue;
    }

    let value = match[1].trim();

    if (
      name === "fuel_level" ||
      name === "engine_temp" ||
      name === "wind_speed" ||
      name === "visibility"
    ) {
      value = numberFromSpeech(value);
    }

    if (value) {
      setField(name, value);
      found++;
    }
  }

  return found;
}

function startVoiceInput() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    formMessage.textContent =
      "Voice input is not supported here. Use Chrome or Microsoft Edge.";
    return;
  }

  if (listening) {
    recognition.stop();
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    listening = true;
    document.getElementById("voiceBtn").textContent = "Stop Voice Input";
    document.getElementById("voiceStatus").textContent = "Listening";
    formMessage.textContent = "Listening...";
  };

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript.trim();
    const active = document.activeElement;

    if (active && active.form === form && active.name) {
      if (active.type === "number") {
        const number = numberFromSpeech(transcript);
        if (number) {
          setField(active.name, number);
        }
      } else {
        setField(active.name, transcript);
      }

      formMessage.textContent = `Voice input: ${transcript}`;
      addAlert("info", "VOICE", transcript);
      return;
    }

    const commandWords = [
      "collision",
      "runway",
      "weather",
      "emergency",
      "volcanic",
      "ash",
      "status"
    ];

    if (commandWords.some(word => transcript.toLowerCase().includes(word))) {
      document.getElementById("commandInput").value = transcript;
      runTextCommand();
      return;
    }

    const count = parseVoiceForm(transcript);

    formMessage.textContent = count
      ? `Voice input received. ${count} field(s) filled.`
      : "The voice input could not be matched to the form.";
  };

  recognition.onerror = event => {
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      formMessage.textContent =
        "Microphone permission was denied. Allow microphone access and try again.";
    } else if (event.error !== "aborted") {
      formMessage.textContent = `Voice input error: ${event.error}`;
    }
  };

  recognition.onend = () => {
    listening = false;
    document.getElementById("voiceBtn").textContent = "Start Voice Input";
    document.getElementById("voiceStatus").textContent = "Voice ready";
  };

  recognition.start();
}

async function checkOllama() {
  const status = document.getElementById("aiStatus");

  status.textContent = "Checking Ollama...";

  try {
    const response = await fetch(
      "http://localhost:11434/api/tags"
    );

    if (!response.ok) {
      throw new Error("Ollama unavailable");
    }

    const data = await response.json();
    const models = (data.models || []).map(model => model.name);

    if (models.some(name => name.startsWith(OLLAMA_MODEL))) {
      status.textContent = `Ollama ready: ${OLLAMA_MODEL}`;
      addAlert("ok", "OLLAMA", `${OLLAMA_MODEL} is available.`);
    } else {
      status.textContent = "Ollama is running, but the selected model was not found.";
      addAlert("warn", "OLLAMA", `Model ${OLLAMA_MODEL} was not found.`);
    }
  } catch {
    status.textContent = "Ollama not available";
    addAlert(
      "info",
      "OLLAMA",
      "Ollama could not be reached. The browser assessment still works."
    );
  }
}

function speakLatestResult() {
  if (!latestReport) {
    formMessage.textContent = "Run an analysis first.";
    return;
  }

  if (!("speechSynthesis" in window)) {
    formMessage.textContent =
      "Speech output is not supported by this browser.";
    return;
  }

  const text =
    `Flight ${latestReport.flight_number}. ` +
    `Destination ${latestReport.destination}. ` +
    `Weather ${latestReport.weather_status}. ` +
    `Collision status ${latestReport.collision_status}. ` +
    `Emergency status ${latestReport.emergency_status}. ` +
    `Runway ${latestReport.runway_number}. ` +
    `${latestReport.runway_reason}.`;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  utterance.rate = 0.95;

  window.speechSynthesis.speak(utterance);
  addAlert("info", "VOICE", "ATC result is being read aloud.");
}

document.getElementById("randomBtn")
  .addEventListener("click", fillRandomAircraft);

document.getElementById("voiceBtn")
  .addEventListener("click", startVoiceInput);

document.getElementById("commandBtn")
  .addEventListener("click", runTextCommand);

document.getElementById("commandInput")
  .addEventListener("keydown", event => {
    if (event.key === "Enter") {
      runTextCommand();
    }
  });

document.getElementById("clearHistoryBtn")
  .addEventListener("click", () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
    addAlert("info", "HISTORY", "Flight history cleared.");
  });

document.getElementById("clearAlertsBtn")
  .addEventListener("click", () => {
    document.getElementById("alerts").innerHTML = "";
  });

document.getElementById("ollamaBtn")
  .addEventListener("click", checkOllama);

document.getElementById("speakBtn")
  .addEventListener("click", speakLatestResult);

form.addEventListener("submit", event => {
  event.preventDefault();
  processAircraft();
});

document.addEventListener("keydown", event => {
  if (event.altKey && event.key.toLowerCase() === "v") {
    event.preventDefault();
    startVoiceInput();
  }
});

updateRadarContacts();
renderHistory();
animateRadar();

setInterval(updateRadarContacts, 5000);
