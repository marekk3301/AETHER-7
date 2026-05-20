/**
 * AETHER-7 | A.E.G.I.S. SYSTEM TERMINAL
 * Core Logic & Protocol Refinement
 */

/**
 * LineBreakTransformer
 * Splitting the serial stream by newlines.
 */
class LineBreakTransformer {
    constructor() { this.container = ''; }
    transform(chunk, controller) {
        this.container += chunk;
        const lines = this.container.split('\n');
        this.container = lines.pop();
        lines.forEach(line => controller.enqueue(line));
    }
    flush(controller) { controller.enqueue(this.container); }
}

let port = null;
let reader = null;
let writer = null;
let readableStreamClosed = null;
let isConnecting = false;

// UI Elements
const connectBtn = document.getElementById('connect-btn');
const antennaOfflineMsg = document.getElementById('antenna-offline-msg');
const serialStatus = document.getElementById('serial-status');
const logs = document.getElementById('logs');
const rawSerialContainer = document.getElementById('raw-content') || document.getElementById('raw-serial');
const tabSys = document.getElementById('tab-sys');
const tabRaw = document.getElementById('tab-raw');
const serialInput = document.getElementById('serial-input');
const serialSendBtn = document.getElementById('serial-send-btn');

// Block Elements
const b1Status = document.getElementById('b1-status');
const b2Label = document.getElementById('b2-label');
const ledRed = document.getElementById('led-red');
const ledGreen = document.getElementById('led-green');
const b3Value = document.getElementById('b3-value');
const b3Fill = document.getElementById('b3-fill');
const b3StatusMsg = document.getElementById('b3-status');
const signalPercentLabel = document.getElementById('signal-percent');
const auraToggle = document.getElementById('aura-toggle');
const auraToggleLabel = document.getElementById('aura-toggle-label');
const auraAlert = document.getElementById('aura-alert');
const b5Temp = document.getElementById('b5-temp');
const b5TargetVal = document.getElementById('b5-target-val');
const b5Slider = document.getElementById('b5-slider');
const b5StatusMsg = document.getElementById('b5-status');

// App State
let isUnlocked = false;
let block3Unlocked = false;
let auraActive = false;
let auraInterval;
let targetTemp = 22.0;

// Vector Scope State
const canvas = document.getElementById('vector-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let tunerValue = 0;
let angle = 0;

/**
 * INITIALIZATION
 */

function initVectorScope() {
    if (!canvas) return;
    canvas.width = 400; canvas.height = 400;
    requestAnimationFrame(renderVectorScope);
}

function renderVectorScope() {
    if (!ctx || !canvas) return;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;
    const dist = Math.abs(tunerValue - 705);
    const stability = Math.exp(-Math.pow(dist, 2) / 1000); 
    const noiseLevel = (1 - stability) * 50;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 176, 0, ${0.5 + stability * 0.5})`;
    ctx.lineWidth = 2;
    if (stability > 0.95) ctx.strokeStyle = '#ccff00';
    for (let i = 0; i < 100; i++) {
        const t = angle + (i * 0.1);
        let x = Math.cos(t) * radius;
        let y = Math.sin(t * 2) * radius; 
        x += (Math.random() - 0.5) * noiseLevel;
        y += (Math.random() - 0.5) * noiseLevel;
        if (i === 0) ctx.moveTo(centerX + x, centerY + y);
        else ctx.lineTo(centerX + x, centerY + y);
    }
    ctx.stroke();
    angle += 0.05;
    requestAnimationFrame(renderVectorScope);
}
initVectorScope();

// Dynamic Uptime
const startTime = Date.now();
setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    const uptimeEl = document.getElementById('uptime');
    if (uptimeEl) uptimeEl.textContent = `${h}:${m}:${s}`;
}, 1000);

// Boot Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('boot-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 300);
        }
    }, 1000);
});

// Tab Switching
if (tabSys && tabRaw) {
    tabSys.addEventListener('click', () => {
        tabSys.classList.add('active'); tabRaw.classList.remove('active');
        logs.classList.remove('hidden');
        const rawEl = document.getElementById('raw-serial');
        if (rawEl) rawEl.classList.add('hidden');
    });
    tabRaw.addEventListener('click', () => {
        tabRaw.classList.add('active'); tabSys.classList.remove('active');
        const rawEl = document.getElementById('raw-serial');
        if (rawEl) rawEl.classList.remove('hidden');
        logs.classList.add('hidden');
    });
}

/**
 * SERIAL COMMUNICATION (ROBUST PATTERN)
 */

if (navigator.serial) {
    navigator.serial.addEventListener('disconnect', () => {
        log("SYSTEM_ALERT: PHYSICAL_DISCONNECT.");
        handleDisconnect();
    });
}

connectBtn.addEventListener('click', async () => {
    if (port) await handleDisconnect();
    else await connect();
});

async function connect() {
    if (isConnecting) return;
    isConnecting = true;
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        
        serialStatus.textContent = "LINK: ONLINE";
        serialStatus.className = "status-connected";
        if (antennaOfflineMsg) antennaOfflineMsg.classList.add('hidden');
        connectBtn.textContent = "TERMINATE LINK";
        log("SERIAL CONNECTION ESTABLISHED AT 9600 BAUD.");

        // Setup IO
        const textDecoder = new TextDecoderStream();
        readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const inputStream = textDecoder.readable.pipeThrough(new TransformStream(new LineBreakTransformer()));
        reader = inputStream.getReader();
        writer = port.writable.getWriter();

        readLoop();
    } catch (err) {
        log("ERROR: CONNECTION FAILED. " + err.message);
        port = null;
    } finally {
        isConnecting = false;
    }
}

async function handleDisconnect() {
    if (!port) return;

    log("TERMINATING SERIAL LINK...");

    if (reader) {
        try {
            await reader.cancel();
            await readableStreamClosed.catch(() => {});
            reader.releaseLock();
        } catch (e) {}
        reader = null;
    }

    if (writer) {
        try { await writer.releaseLock(); } catch (e) {}
        writer = null;
    }

    if (port) {
        try { await port.close(); } catch (e) {}
        port = null;
    }

    serialStatus.textContent = "SERIAL_LINK_REQUIRED";
    serialStatus.className = "status-disconnected";
    if (antennaOfflineMsg) antennaOfflineMsg.classList.remove('hidden');
    connectBtn.textContent = "INITIALIZE LINK";
    log("SERIAL CONNECTION TERMINATED.");
}

async function readLoop() {
    while (port) {
        try {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
                const trimmed = value.trim();
                logRaw(trimmed); 
                processIncomingData(trimmed);
            }
        } catch (err) {
            console.error("Read Error:", err);
            break;
        }
    }
    if (port) handleDisconnect();
}

function processIncomingData(data) {
    if (!data.includes(":")) return;
    const [label, val] = data.split(":");
    
    switch(label) {
        case "LOGIN":
            if (!isUnlocked && val === "42") unlockStation();
            break;
        case "OFFSET":
            if (isUnlocked) updateBlock3(parseInt(val));
            break;
        case "TEMP":
            updateBlock5(parseFloat(val));
            break;
    }
}

async function writeToSerial(message) {
    if (!writer) return;
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(message + "\n");
        await writer.write(data);
    } catch(err) {
        console.error("Write Error:", err);
    }
}

// Persistent Hardware Sync Heartbeat
setInterval(() => {
    if (port && writer && isUnlocked) {
        // Standardized to "1" instead of "STATUS:1"
        writeToSerial("1");
    }
}, 3000); 

/**
 * DOM LOGIC
 */

function unlockStation() {
    if (isUnlocked) return;
    isUnlocked = true;
    log("OVERRIDE KEY 42 DETECTED. ACCESS GRANTED.");
    
    b1Status.textContent = "UNLOCKED";
    b1Status.style.color = "var(--success)";
    b1Status.style.borderColor = "var(--success)";

    const b1GlitchText = document.querySelector('#block-1 .glitch-text');
    if (b1GlitchText) b1GlitchText.textContent = "ACCESS GRANTED";
    
    document.getElementById('block-2').classList.remove('disabled');
    b2Label.textContent = "ONLINE";
    ledRed.textContent = "[ RED_OFF ]"; ledRed.style.opacity = "0.2";
    ledGreen.textContent = "[ GRN_ON ]"; ledGreen.style.opacity = "1";
    
    writeToSerial("1");
    document.getElementById('block-3').classList.remove('disabled');
}

function updateBlock3(val) {
    tunerValue = val;
    b3Value.textContent = val.toString().padStart(3, '0');
    const dist = Math.abs(val - 705);
    const stability = Math.exp(-Math.pow(dist, 2) / 1500); 
    const percent = Math.floor(stability * 100);
    signalPercentLabel.textContent = `${percent}%`;
    b3Fill.style.width = `${percent}%`;

    if (percent >= 95) {
        b3StatusMsg.textContent = "PHASE_LOCKED";
        b3StatusMsg.style.color = "var(--success)";
        if (!block3Unlocked) {
            log("VECTOR PHASE SYNCHRONIZED.");
            block3Unlocked = true;
            document.getElementById('block-4').classList.remove('disabled');
        }
    } else {
        b3StatusMsg.textContent = "UNSTABLE_SIGNAL";
        b3StatusMsg.style.color = "var(--warning)";
    }
}

auraToggle.addEventListener('change', (e) => {
    auraActive = e.target.checked;
    auraToggleLabel.textContent = auraActive ? "ACTIVE" : "INACTIVE";
    if (auraActive) {
        log("AURA DIAGNOSTIC FEED ENABLED.");
        document.getElementById('block-5').classList.remove('disabled');
        startAuraCycle();
    } else {
        stopAuraCycle();
        writeToSerial("0");
        resetAuraUI();
    }
});

function startAuraCycle() {
    auraInterval = setInterval(() => {
        if (!auraActive) return;
        const codes = [101, 102, 103];
        const randomCode = codes[Math.floor(Math.random() * codes.length)];
        writeToSerial(randomCode.toString());
        updateAuraUI(randomCode);
    }, 10000); 
}

function stopAuraCycle() { clearInterval(auraInterval); }

function updateAuraUI(code) {
    auraAlert.classList.add('hazard');
    const title = auraAlert.querySelector('.alert-title');
    const codeDisplay = auraAlert.querySelector('.alert-code');
    if (codeDisplay) codeDisplay.textContent = `CODE: ${code}`;
    switch(code) {
        case 101: title.textContent = "MINOR FLUID LEAK"; break;
        case 102: title.textContent = "COMMUNICATIONS LAG"; break;
        case 103: title.textContent = "THERMAL FLUCTUATION"; break;
    }
}

function resetAuraUI() {
    auraAlert.classList.remove('hazard');
    auraAlert.querySelector('.alert-title').textContent = "SYSTEM NOMINAL";
    const codeDisplay = auraAlert.querySelector('.alert-code');
    if (codeDisplay) codeDisplay.textContent = "CODE: 000";
}

b5Slider.addEventListener('input', (e) => {
    targetTemp = parseFloat(e.target.value);
    b5TargetVal.textContent = targetTemp.toFixed(1) + "°C";
});

function updateBlock5(currentTemp) {
    b5Temp.textContent = currentTemp.toFixed(1) + "°C";
    const diff = currentTemp - targetTemp;
    if (diff > 1.0) b5StatusMsg.textContent = "STATUS: COOLING";
    else if (diff < -1.0) b5StatusMsg.textContent = "STATUS: HEATING";
    else b5StatusMsg.textContent = "STATUS: STABILIZED";
}

function log(msg) {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    logs.innerHTML = `[${time}] ${msg}<br>${logs.innerHTML}`;
}

function logRaw(data) {
    const target = document.getElementById('raw-content') || document.getElementById('raw-serial');
    if (!target) return;
    const time = new Date().toLocaleTimeString([], { hour12: false });
    const line = `[${time}] > ${data}<br>`;
    target.innerHTML = line + target.innerHTML;
    const lines = target.innerHTML.split('<br>');
    if (lines.length > 100) {
        target.innerHTML = lines.slice(0, 100).join('<br>');
    }
}
