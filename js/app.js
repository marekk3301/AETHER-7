/**
 * AETHER-7 | A.E.G.I.S. SYSTEM TERMINAL
 * Core Logic & Scientific Visualization (Waterfall)
 */

let port;
let reader;
let writer;
let inputDone;
let outputDone;
let inputStream;
let outputStream;

// UI Elements
const connectBtn = document.getElementById('connect-btn');
const antennaOfflineMsg = document.getElementById('antenna-offline-msg');
const serialStatus = document.getElementById('serial-status');
const logs = document.getElementById('logs');

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

// State Management
let isUnlocked = false;
let block3Unlocked = false;
let auraActive = false;
let auraInterval;
let targetTemp = 22.0;

// Waterfall State
const canvas = document.getElementById('waterfall-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const frequencyMarker = document.getElementById('frequency-marker');
let waterfallData = [];
let tunerValue = 0;

function initWaterfall() {
    if (!canvas) return;
    // Set internal resolution
    canvas.width = 400;
    canvas.height = 300;
    
    // Fill with empty lines
    for (let i = 0; i < canvas.height; i++) {
        waterfallData.push(new Uint8Array(canvas.width).fill(0));
    }
    requestAnimationFrame(renderWaterfall);
}

function renderWaterfall() {
    if (!ctx || !canvas) return;

    // Shift data (Scroll Down)
    const newRow = new Uint8Array(canvas.width);
    
    // Simulated Signal Peak at hidden freq (e.g. 705)
    // Map 0-1023 to 0-canvas.width
    const targetX = (705 / 1023) * canvas.width;
    const tunerX = (tunerValue / 1023) * canvas.width;
    
    // Proximity to target
    const dist = Math.abs(tunerValue - 705);
    const strength = Math.exp(-Math.pow(dist, 2) / 2000); // Sharp peak

    // Generate row noise + signal
    for (let x = 0; x < canvas.width; x++) {
        let noise = Math.random() * 40;
        // Background carrier (always there but weak)
        let carrier = Math.exp(-Math.pow(x - targetX, 2) / 20) * 100;
        newRow[x] = Math.min(255, noise + carrier);
    }
    
    waterfallData.unshift(newRow);
    waterfallData.pop();

    // Draw to Canvas
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const val = waterfallData[y][x];
            const idx = (y * canvas.width + x) * 4;
            
            // Amber palette mapping
            imgData.data[idx] = val;         // R
            imgData.data[idx+1] = val * 0.7; // G
            imgData.data[idx+2] = val * 0.1; // B
            imgData.data[idx+3] = 255;       // A
        }
    }
    ctx.putImageData(imgData, 0, 0);
    
    // Frequency Marker
    if(frequencyMarker) {
        frequencyMarker.style.left = `${(tunerValue / 1023) * 100}%`;
    }

    requestAnimationFrame(renderWaterfall);
}
initWaterfall();

// BOOT SEQUENCE
window.addEventListener('load', () => {
    setTimeout(() => {
        const bootLoader = document.getElementById('boot-loader');
        if (bootLoader) {
            bootLoader.style.opacity = '0';
            setTimeout(() => bootLoader.style.display = 'none', 300);
        }
    }, 1000); 
});

/**
 * INITIALIZATION & SERIAL CONNECTION
 */

if (navigator.serial) {
    navigator.serial.addEventListener('disconnect', (event) => {
        log("SYSTEM_ALERT: HARDWARE DISCONNECTED.");
        handleDisconnect();
    });
}

connectBtn.addEventListener('click', async () => {
    if (port) {
        await handleDisconnect();
    } else {
        await connect();
    }
});

async function connect() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });

        serialStatus.textContent = "LINK: ONLINE";
        serialStatus.className = "status-connected";
        if (antennaOfflineMsg) antennaOfflineMsg.classList.add('hidden');
        connectBtn.textContent = "TERMINATE LINK";
        log("SERIAL CONNECTION ESTABLISHED AT 9600 BAUD.");

        const encoder = new TextEncoderStream();
        outputDone = encoder.readable.pipeTo(port.writable);
        outputStream = encoder.writable;
        writer = outputStream.getWriter();

        const decoder = new TextDecoderStream();
        inputDone = port.readable.pipeTo(decoder.writable);
        inputStream = decoder.readable
            .pipeThrough(new TransformStream(new LineBreakTransformer()));
        
        reader = inputStream.getReader();
        readLoop();

    } catch (err) {
        log("ERROR: CONNECTION FAILED. " + err.message);
        if (err.message.includes("Failed to open serial port")) {
            log("HINT: CHECK IF ARDUINO SERIAL MONITOR OR ANOTHER APP IS USING THE PORT.");
        }
        console.error(err);
        port = null;
    }
}

async function handleDisconnect() {
    if (reader) {
        try { await reader.cancel(); } catch(e) {}
        reader = null;
    }
    if (port) {
        try { await port.close(); } catch(e) {}
        port = null;
    }
    serialStatus.textContent = "SERIAL_LINK_REQUIRED";
    serialStatus.className = "status-disconnected";
    if (antennaOfflineMsg) antennaOfflineMsg.classList.remove('hidden');
    connectBtn.textContent = "INITIALIZE LINK";
    log("SERIAL CONNECTION TERMINATED.");
}

async function readLoop() {
    while (true) {
        try {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
                processIncomingData(value.trim());
            }
        } catch (err) {
            log("READ_ERROR: " + err.message);
            handleDisconnect();
            break;
        }
    }
}

function processIncomingData(data) {
    if (!data.includes(":")) {
        log(`PROTOCOL_ERROR: INVALID_FORMAT [${data}] - EXPECTING LABEL:VALUE`);
        return;
    }
    const [label, val] = data.split(":");
    switch(label) {
        case "LOGIN":
            if (!isUnlocked && val === "42") unlockStation();
            else if (!isUnlocked) log(`SECURITY_ALERT: INVALID_OVERRIDE_KEY [${val}]`);
            break;
        case "OFFSET":
            if (isUnlocked) {
                const numericVal = parseInt(val);
                if (!isNaN(numericVal)) updateBlock3(numericVal);
                else log(`DATA_ERROR: INVALID_OFFSET_VALUE [${val}]`);
            }
            break;
        case "TEMP":
            const tempVal = parseFloat(val);
            if (!isNaN(tempVal)) updateBlock5(tempVal);
            else log(`DATA_ERROR: INVALID_TEMP_VALUE [${val}]`);
            break;
        default:
            log(`PROTOCOL_ERROR: UNKNOWN_MESSAGE_TYPE [${label}]`);
    }
}

async function writeToSerial(message) {
    if (writer) await writer.write(message + "\n");
}

function unlockStation() {
    isUnlocked = true;
    log("OVERRIDE KEY 42 DETECTED. ACCESS GRANTED.");
    b1Status.textContent = "UNLOCKED";
    b1Status.style.color = "var(--success)";
    b1Status.style.borderColor = "var(--success)";
    document.getElementById('block-2').classList.remove('disabled');
    b2Label.textContent = "ONLINE";
    ledRed.textContent = "[ RED_OFF ]";
    ledRed.style.opacity = "0.2";
    ledGreen.textContent = "[ GRN_ON ]";
    ledGreen.style.opacity = "1";
    writeToSerial("1");
    writeToSerial("STATUS:1");
    document.getElementById('block-3').classList.remove('disabled');
}

// FAKE TELEMETRY
const startTime = Date.now();
setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    if(document.getElementById('uptime')) document.getElementById('uptime').textContent = `${h}:${m}:${s}`;
    const load = (Math.random() * 5 + 10).toFixed(1);
    if(document.getElementById('cpu-load')) document.getElementById('cpu-load').textContent = `${load}%`;
    const mem = (1.43 + Math.random() * 0.05).toFixed(2);
    if(document.getElementById('mem-use')) document.getElementById('mem-use').textContent = `${mem}G/7.68G`;
}, 1000);

// BLOCK 3 (Waterfall Scientific)
function updateBlock3(val) {
    tunerValue = val;
    // Format as Frequency (e.g. 1420.00 MHz base + offset)
    const freq = (1420.42 + (val / 1023) * 10).toFixed(2);
    b3Value.textContent = freq;
    
    // Proximity to Target (705)
    const dist = Math.abs(val - 705);
    const strength = Math.exp(-Math.pow(dist, 2) / 2500); 
    const snr = (strength * 45).toFixed(1); // 0-45 dB SNR
    
    signalPercentLabel.textContent = `${snr} dB`;
    const percent = Math.floor(strength * 100);
    b3Fill.style.width = `${percent}%`;

    if (percent >= 95) {
        b3StatusMsg.textContent = "SIGNAL_LOCKED";
        b3StatusMsg.style.color = "var(--success)";
        if (!block3Unlocked) {
            log("PHOBOS-LINK SYNCHRONIZED. DOWNLOADING DIAGNOSTICS...");
            block3Unlocked = true;
            document.getElementById('block-4').classList.remove('disabled');
        }
    } else {
        b3StatusMsg.textContent = "SCANNING_BAND...";
        b3StatusMsg.style.color = "var(--warning)";
    }
}

auraToggle.addEventListener('change', (e) => {
    auraActive = e.target.checked;
    auraToggleLabel.textContent = auraActive ? "ACTIVE" : "INACTIVE";
    if (auraActive) {
        log("AURA DIAGNOSTIC FEED ENABLED. MONITORING ERRORS...");
        document.getElementById('block-5').classList.remove('disabled');
        startAuraCycle();
    } else {
        log("AURA DIAGNOSTIC FEED SUSPENDED.");
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
    }, 4000);
}

function stopAuraCycle() { clearInterval(auraInterval); }

function updateAuraUI(code) {
    auraAlert.classList.add('hazard');
    const title = auraAlert.querySelector('.alert-title');
    const codeDisplay = auraAlert.querySelector('.alert-code');
    codeDisplay.textContent = `CODE: ${code}`;
    switch(code) {
        case 101: title.textContent = "HYDROPONICS LEAK"; log("ALERT: HYDROPONICS LEAK DETECTED."); break;
        case 102: title.textContent = "HULL DECOMPRESSION"; log("CRITICAL: HULL DECOMPRESSION IN PROGRESS."); break;
        case 103: title.textContent = "CORE OVERLOAD"; log("EMERGENCY: CORE OVERLOAD IMMINENT."); break;
    }
}

function resetAuraUI() {
    auraAlert.classList.remove('hazard');
    auraAlert.querySelector('.alert-title').textContent = "SYSTEM NOMINAL";
    auraAlert.querySelector('.alert-code').textContent = "CODE: 000";
}

b5Slider.addEventListener('input', (e) => {
    targetTemp = parseFloat(e.target.value);
    b5TargetVal.textContent = targetTemp.toFixed(1) + "°C";
});

function updateBlock5(currentTemp) {
    b5Temp.textContent = currentTemp.toFixed(1) + "°C";
    const diff = currentTemp - targetTemp;
    const deadzone = 1.0;
    if (diff > deadzone) {
        b3StatusMsg.textContent = "STATUS: COOLING (VENTILATORS ACTIVE)";
        b3StatusMsg.style.color = "var(--text-primary)";
    } else if (diff < -deadzone) {
        b3StatusMsg.textContent = "STATUS: HEATING (THERMAL COILS ACTIVE)";
        b3StatusMsg.style.color = "var(--danger)";
    } else {
        b3StatusMsg.textContent = "STATUS: STABILIZED (IDLE)";
        b3StatusMsg.style.color = "var(--success)";
    }
}

function log(msg) {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    logs.innerHTML = `[${time}] ${msg}<br>${logs.innerHTML}`;
}

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