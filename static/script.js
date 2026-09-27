// ============================================================
// ATC-AI Tower Console — frontend logic
// ============================================================

const WORLD = { w: 450, h: 500 };           // matches backend coordinate space
const ASH_ZONES = [
  { cx: 300, cy: 300, r: 80 },
  { cx: 150, cy: 450, r: 60 },
];

let radarContacts = {};   // known-traffic positions from /api/radar
let subjectBlip = null;   // most recently processed aircraft, drawn in amber
let sweepAngle = 0;

// ── Clock ───────────────────────────────────────────────────
function tickClock() {
  const el = document.getElementById('clock');
  el.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
}
setInterval(tickClock, 1000);
tickClock();

// ── Radar canvas ────────────────────────────────────────────
const canvas = document.getElementById('radarCanvas');
const ctx = canvas.getContext('2d');

function toCanvas(x, y) {
  const cx = (x / WORLD.w) * canvas.width;
  const cy = (y / WORLD.h) * canvas.height;
  return [cx, cy];
}

function drawScope() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2, cy = h / 2, maxR = w / 2 - 4;

  // range rings
  ctx.strokeStyle = 'rgba(111,239,160,0.14)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, (maxR / 3) * i, 0, Math.PI * 2);
    ctx.stroke();
  }
  // crosshair
  ctx.beginPath();
  ctx.moveTo(cx, 4); ctx.lineTo(cx, h - 4);
  ctx.moveTo(4, cy); ctx.lineTo(w - 4, cy);
  ctx.stroke();

  // ash zones
  ASH_ZONES.forEach(z => {
    const [zx, zy] = toCanvas(z.cx, z.cy);
    const zr = (z.r / WORLD.w) * w;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,107,94,0.10)';
    ctx.strokeStyle = 'rgba(255,107,94,0.4)';
    ctx.arc(zx, zy, zr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // sweep (drawn as a fading wedge — conic gradients aren't universally supported)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(sweepAngle);
  const wedge = ctx.createLinearGradient(0, 0, maxR, 0);
  wedge.addColorStop(0, 'rgba(111,239,160,0.35)');
  wedge.addColorStop(1, 'rgba(111,239,160,0)');
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, maxR, -0.18, 0.18);
  ctx.closePath();
  ctx.fillStyle = wedge;
  ctx.fill();
  ctx.restore();

  // known contacts
  Object.entries(radarContacts).forEach(([code, [x, y]]) => {
    const [px, py] = toCanvas(x, y);
    ctx.beginPath();
    ctx.fillStyle = '#6fefa0';
    ctx.shadowColor = 'rgba(111,239,160,0.8)';
    ctx.shadowBlur = 6;
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#9fd6b8';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText(code, px + 7, py - 6);
  });

  // subject aircraft (last processed)
  if (subjectBlip) {
    const [px, py] = toCanvas(subjectBlip.x, subjectBlip.y);
    ctx.beginPath();
    ctx.fillStyle = '#f0a83c';
    ctx.shadowColor = 'rgba(240,168,60,0.9)';
    ctx.shadowBlur = 9;
    ctx.arc(px, py, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f5c98a';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillText(subjectBlip.label, px + 8, py - 8);
  }
}

function animate() {
  sweepAngle += 0.012;
  drawScope();
  requestAnimationFrame(animate);
}

async function refreshRadar() {
  try {
    const res = await fetch('/api/radar');
    radarContacts = await res.json();
  } catch (e) {
    // scope still renders with last-known contacts
  }
}

// ── DB status pill ──────────────────────────────────────────
async function checkDbStatus() {
  const dot = document.getElementById('dbStatusDot');
  const text = document.getElementById('dbStatusText');
  try {
    const res = await fetch('/api/flights?limit=1');
    if (res.ok) {
      dot.className = 'status-pill__dot ok';
      text.textContent = 'database connected';
    } else {
      throw new Error('bad response');
    }
  } catch (e) {
    dot.className = 'status-pill__dot down';
    text.textContent = 'database unreachable';
  }
}

// ── Report rendering ────────────────────────────────────────
function tagFor(kind, value) {
  const map = { ok: 'tag--ok', warn: 'tag--warn', danger: 'tag--danger' };
  return `<span class="tag ${map[kind]}">${value}</span>`;
}

function renderReport(r) {
  const panel = document.getElementById('reportPanel');
  const body = document.getElementById('ticketBody');
  document.getElementById('reportTimestamp').textContent = new Date().toLocaleString();

  const weatherTag = r.weather_status === 'Dangerous'
    ? tagFor('danger', 'DANGEROUS') : tagFor('ok', 'SAFE');
  const collisionTag = r.collision_status === 'RISK'
    ? tagFor('danger', 'RISK') : tagFor('ok', 'SAFE SEPARATION');
  const ashTag = r.volcanic_ash ? tagFor('danger', 'DETECTED') : tagFor('ok', 'CLEAR');
  const emergencyTag = (r.emergencies && r.emergencies.length)
    ? tagFor('warn', r.emergency_status) : tagFor('ok', 'NONE');

  body.innerHTML = `
    <div class="ticket-row"><span>Aircraft</span><span>${r.aircraft_name}</span></div>
    <div class="ticket-row"><span>Flight number</span><span>${r.flight_number}</span></div>
    <div class="ticket-row"><span>Destination</span><span>${r.destination}</span></div>
    <div class="ticket-row"><span>Position</span><span>(${r.pos_x}, ${r.pos_y})</span></div>

    <div class="ticket-section-title">CONDITIONS</div>
    <div class="ticket-row"><span>Fuel level</span><span>${r.fuel_level}%</span></div>
    <div class="ticket-row"><span>Engine temp</span><span>${r.engine_temp}°C</span></div>
    <div class="ticket-row"><span>Wind speed</span><span>${r.wind_speed} km/h</span></div>
    <div class="ticket-row"><span>Visibility</span><span>${r.visibility} m</span></div>
    <div class="ticket-row"><span>Weather</span><span>${weatherTag}</span></div>

    <div class="ticket-section-title">SEPARATION &amp; HAZARDS</div>
    <div class="ticket-row"><span>Nearest contact</span><span>${r.nearest_aircraft} · ${r.nearest_distance} units</span></div>
    <div class="ticket-row"><span>Collision check</span><span>${collisionTag}</span></div>
    <div class="ticket-row"><span>Volcanic ash</span><span>${ashTag}</span></div>
    <div class="ticket-row"><span>Emergency status</span><span>${emergencyTag}</span></div>

    <div class="ticket-section-title">DISPOSITION</div>
    <div class="ticket-row"><span>Runway assigned</span><span>Runway ${r.runway_number}</span></div>
    <div class="ticket-row"><span>Reason</span><span>${r.runway_reason}</span></div>
    <div class="ticket-row"><span>Saved to database</span><span>${r.saved_to_db ? 'yes' : 'no — check MySQL connection'}</span></div>
  `;
  panel.hidden = false;
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Flight log ──────────────────────────────────────────────
function collisionCell(status) {
  return status === 'RISK' ? tagFor('danger', 'RISK') : tagFor('ok', 'SAFE');
}
function weatherCell(status) {
  return status === 'Dangerous' ? tagFor('danger', 'DANGEROUS') : tagFor('ok', 'SAFE');
}
function emergencyCell(status) {
  return (!status || status === 'None') ? tagFor('ok', 'NONE') : tagFor('warn', status);
}

async function refreshLog() {
  const tbody = document.getElementById('logTableBody');
  try {
    const res = await fetch('/api/flights?limit=50');
    const rows = await res.json();
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="log-empty">No flights processed yet.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(f => `
      <tr>
        <td>${f.flight_number ?? ''}</td>
        <td>${f.aircraft_name ?? ''}</td>
        <td>${f.destination ?? ''}</td>
        <td>${weatherCell(f.weather_status)}</td>
        <td>${collisionCell(f.collision_status)}</td>
        <td>${emergencyCell(f.emergency_status)}</td>
        <td>Runway ${f.runway_number ?? '—'}</td>
        <td>${f.created_at ?? ''}</td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="8" class="log-empty">Could not reach the server.</td></tr>';
  }
}

// ── Form submission ─────────────────────────────────────────
const form = document.getElementById('intakeForm');
const submitBtn = document.getElementById('submitBtn');
const errorEl = document.getElementById('formError');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Running advisory…';

  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());

  try {
    const res = await fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Something went wrong.';
      return;
    }

    subjectBlip = { x: data.pos_x, y: data.pos_y, label: data.flight_number };
    renderReport(data);
    refreshLog();
    form.reset();
  } catch (err) {
    errorEl.textContent = 'Could not reach the server.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Run advisory';
  }
});

document.getElementById('refreshLogBtn').addEventListener('click', refreshLog);


// ── Voice input (UI unchanged) ─────────────────────────────
// Chrome/Edge Web Speech API.  Use Alt+V to start/stop listening.
// If a form field is focused, the recognized speech fills that field.
// Otherwise a single spoken sentence can fill all fields, e.g.
// "aircraft Boeing 737, flight AI203, destination Mumbai,
//  fuel 42, engine temperature 78, wind speed 18, visibility 4000".
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let voiceRecognition = null;
let voiceListening = false;

function setFieldValue(name, value) {
  const field = form.querySelector(`[name="${name}"]`);
  if (!field) return;
  field.value = value.trim();
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
}

function cleanVoiceNumber(value) {
  const match = String(value).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  return match ? match[0] : '';
}

function parseVoiceForm(text) {
  const s = text.replace(/\s+/g, ' ').trim();

  const patterns = [
    ['aircraft_name', /(?:aircraft(?:\s+type)?|plane)\s+(.+?)(?=\s+(?:flight|destination|fuel|engine|wind|visibility)\b|$)/i],
    ['flight_number', /(?:flight(?:\s+number)?|flight\s*no\.?)\s+([A-Za-z0-9-]+)/i],
    ['destination', /destination\s+(.+?)(?=\s+(?:fuel|engine|wind|visibility)\b|$)/i],
    ['fuel_level', /fuel(?:\s+level)?\s+([0-9]+(?:\.[0-9]+)?)\s*(?:percent|%)?/i],
    ['engine_temp', /engine(?:\s+temperature|\s+temp)?\s+([0-9]+(?:\.[0-9]+)?)\s*(?:degrees?\s*(?:c|celsius)|°?c)?/i],
    ['wind_speed', /wind(?:\s+speed)?\s+([0-9]+(?:\.[0-9]+)?)\s*(?:km\/?h|kilometers?\s+per\s+hour)?/i],
    ['visibility', /visibility\s+([0-9]+(?:\.[0-9]+)?)\s*(?:m|meters?)?/i],
  ];

  let found = 0;
  for (const [name, pattern] of patterns) {
    const m = s.match(pattern);
    if (m) {
      let value = m[1].trim();
      if (['fuel_level', 'engine_temp', 'wind_speed', 'visibility'].includes(name)) {
        value = cleanVoiceNumber(value);
      }
      if (value) {
        setFieldValue(name, value);
        found++;
      }
    }
  }
  return found;
}

function startVoiceInput() {
  if (!SpeechRecognition) {
    errorEl.textContent = 'Voice input is not supported in this browser. Use Chrome or Edge.';
    return;
  }

  if (voiceListening) {
    voiceRecognition.stop();
    return;
  }

  errorEl.textContent = '';
  voiceRecognition = new SpeechRecognition();
  voiceRecognition.lang = 'en-IN';
  voiceRecognition.interimResults = false;
  voiceRecognition.continuous = false;
  voiceRecognition.maxAlternatives = 1;

  voiceRecognition.onstart = () => {
    voiceListening = true;
    errorEl.textContent = 'Listening…';
  };

  voiceRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    const active = document.activeElement;

    // When a form input is focused, voice works as normal dictation for that field.
    if (active && active.form === form && active.name) {
      if (active.type === 'number') {
        const number = cleanVoiceNumber(transcript);
        if (number) setFieldValue(active.name, number);
      } else {
        setFieldValue(active.name, transcript);
      }
      errorEl.textContent = '';
      return;
    }

    // With no focused form field, try to fill the complete form from one sentence.
    const count = parseVoiceForm(transcript);
    errorEl.textContent = count
      ? `Voice input received (${count} field${count === 1 ? '' : 's'} filled).`
      : 'Could not match the voice input to the form fields.';
  };

  voiceRecognition.onerror = (event) => {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      errorEl.textContent = 'Microphone permission was denied. Allow microphone access and try again.';
    } else if (event.error !== 'aborted') {
      errorEl.textContent = `Voice input error: ${event.error}`;
    }
  };

  voiceRecognition.onend = () => {
    voiceListening = false;
  };

  voiceRecognition.start();
}

// No new visible controls: Alt+V starts/stops voice input.
document.addEventListener('keydown', (event) => {
  if (event.altKey && event.key.toLowerCase() === 'v') {
    event.preventDefault();
    startVoiceInput();
  }
});

// ── Boot ────────────────────────────────────────────────────
refreshRadar();
refreshLog();
checkDbStatus();
setInterval(refreshRadar, 6000);
setInterval(checkDbStatus, 15000);
animate();
