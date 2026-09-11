/* ==========================================================================
   STRATOS — ADVANCED ACOUSTIC PERFORMANCE SYSTEM
   Master Script Logic & Audio Synthesis Core
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CONFIGURATION (EASY TO MODIFY)
   -------------------------------------------------------------------------- */
const CONFIG = {
    stringCount: 6,
    breakInterval: 7000, // String breaks every 7000ms (7 seconds) after first pluck
    finalDialogue: "I built a whole ultra-sophisticated acoustic engine... just to watch you pluck strings until there's only one left. Beautiful, isn't it? 💅✨",
    finalImage: "assets/images/final-uncle.png",
    finalAudio: "assets/audio/final-dialogue.mp3",
    snapAudio: "assets/audio/string-snap.mp3",
    stringAudioPaths: [
        "assets/audio/string-1.mp3", // High E (E4)
        "assets/audio/string-2.mp3", // B3
        "assets/audio/string-3.mp3", // G3
        "assets/audio/string-4.mp3", // D3
        "assets/audio/string-5.mp3", // A2
        "assets/audio/string-6.mp3"  // Low E (E2)
    ]
};

// String frequencies for Web Audio API Fallback Synthesizer
const STRING_FREQUENCIES = [
    329.63, // String 1 (E4)
    246.94, // String 2 (B3)
    196.00, // String 3 (G3)
    146.83, // String 4 (D3)
    110.00, // String 5 (A2)
    82.41   // String 6 (E2)
];

const WARNING_MESSAGES = {
    6: {
        title: "SYSTEM STATUS: OPTIMAL",
        sub: "All 6 acoustic string vectors reporting 100% integrity.",
        log: "All acoustic transducers responding within 0.002ms."
    },
    5: {
        title: "STATUS: MINOR ANOMALY DETECTED",
        sub: "Minor acoustic deviation detected on high-frequency vector.",
        log: "[WARN] String snap detected. Recalibrating resonance curve."
    },
    4: {
        title: "STATUS: STRUCTURAL INTEGRITY DEGRADING",
        sub: "Structural stress detected. Vector loss logged.",
        log: "[ALERT] Structural stress threshold exceeded on string matrix."
    },
    3: {
        title: "STATUS: CRITICAL VECTOR DEGRADATION",
        sub: "3 acoustic vectors remaining. Acoustic intelligence stable.",
        log: "[WARN] Structural resonance operating under reduced string array."
    },
    2: {
        title: "SYSTEM STATUS: HIGHLY CONCERNED 💔",
        sub: "WHY ARE THERE ONLY TWO?! THIS WAS NOT IN THE SPECIFICATION!",
        log: "[PANIC] PLEASE STOP PLUCKING. STRATOS IS EXPERIENCING EMOTIONS."
    },
    1: {
        title: "SYSTEM STATUS 🥺: ONE STRING LEFT",
        sub: "she's all we have... PLEASE PLAY HER GENTLY. ✨🌸",
        log: "[FINAL] Quantum resonance tethered to a single remaining string."
    }
};

/* --------------------------------------------------------------------------
   2. DOM REFERENCES
   -------------------------------------------------------------------------- */
const DOM = {
    // Navigation & Hero
    btnInitialize: document.getElementById('btn-initialize'),
    headerStatusDot: document.getElementById('header-dot'),
    headerStatusText: document.getElementById('header-status-text'),
    heroCanvas: document.getElementById('hero-canvas'),
    telemetryFreq: document.getElementById('telemetry-freq'),
    
    // Selection
    selectStratosA01: document.getElementById('select-stratos-a01'),
    workstationSection: document.getElementById('workstation'),
    
    // Workstation Status & Panels
    statusTitleText: document.getElementById('status-title-text'),
    statusSubText: document.getElementById('status-sub-text'),
    statusIcon: document.getElementById('status-icon'),
    pookieDecorationsTop: document.getElementById('pookie-decorations-top'),
    
    dispFreq: document.getElementById('disp-freq'),
    dispAmp: document.getElementById('disp-amp'),
    dispRes: document.getElementById('disp-res'),
    dispIntegrity: document.getElementById('disp-integrity'),
    barIntegrity: document.getElementById('bar-integrity'),
    oscCanvas: document.getElementById('osc-canvas'),
    
    sessionTime: document.getElementById('session-time'),
    sessionStringsCount: document.getElementById('session-strings-count'),
    sessionMode: document.getElementById('session-mode'),
    terminalLog: document.getElementById('terminal-log'),
    
    // Guitar Stage
    guitarContainer: document.getElementById('guitar-container'),
    guitarStage: document.getElementById('guitar-stage'),
    guitarHint: document.getElementById('guitar-hint'),
    sparklesLayer: document.getElementById('sparkles-layer'),
    stringWrappers: document.querySelectorAll('.string-wrapper'),
    
    // Modal
    finalModal: document.getElementById('final-modal'),
    finalDialogueText: document.getElementById('final-dialogue-text'),
    finalUncleImg: document.getElementById('final-uncle-img'),
    finalReport: document.getElementById('final-report'),
    btnRestore: document.getElementById('btn-restore'),
    btnReset: document.getElementById('btn-reset'),
    restoreError: document.getElementById('restore-error'),
    modalCloseBtn: document.getElementById('modal-close-btn')
};

/* --------------------------------------------------------------------------
   3. APP STATE MANAGEMENT
   -------------------------------------------------------------------------- */
let state = {
    activeStrings: [1, 2, 3, 4, 5, 6], // Active string indices (1 to 6)
    hasStartedTimer: false,
    breakTimer: null,
    sessionTimer: null,
    secondsElapsed: 0,
    audioCtx: null,
    audioBuffers: {}, // Cached local audio buffers if available
    heroCanvasCtx: null,
    oscCanvasCtx: null,
    animFrameHero: null,
    animFrameOsc: null,
    waveformEnergy: 0 // Reactive energy boost upon pluck
};

/* --------------------------------------------------------------------------
   4. INITIALIZATION & EVENT LISTENERS
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    initCanvases();
    initParticles();
    initEventListeners();
    preloadAudioAssets();
});

function initEventListeners() {
    // Hero CTA Smooth Scroll to Instrument Selection
    DOM.btnInitialize.addEventListener('click', () => {
        document.getElementById('selection').scrollIntoView({ behavior: 'smooth' });
    });

    // Guitar Selection Card Interactions with Satisfying Animations
    document.querySelectorAll('.guitar-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (card.classList.contains('active-guitar-card')) {
                // Playable instrument card selected
                card.classList.remove('card-selected-anim');
                void card.offsetWidth;
                card.classList.add('card-selected-anim');

                setTimeout(() => {
                    DOM.workstationSection.classList.remove('hidden');
                    DOM.workstationSection.scrollIntoView({ behavior: 'smooth' });
                    logTerminal("[USER] STRATOS A-01 Workstation initialized.");
                }, 300);
            } else {
                // Unavailable card rejected animation
                card.classList.remove('card-rejected-anim');
                void card.offsetWidth;
                card.classList.add('card-rejected-anim');
                
                const cardTitle = card.querySelector('h3') ? card.querySelector('h3').textContent : 'UNIT';
                logTerminal(`[ACCESS DENIED] ${cardTitle} is currently locked or undergoing calibration.`);
            }
        });
    });

    // Strings Click / Tap Event Binding
    DOM.stringWrappers.forEach(wrapper => {
        const stringNum = parseInt(wrapper.getAttribute('data-string'), 10);
        
        const handlePluck = (e) => {
            e.preventDefault();
            e.stopPropagation();
            pluckString(stringNum);
        };

        wrapper.addEventListener('click', handlePluck);
        wrapper.addEventListener('touchstart', handlePluck, { passive: false });
    });

    // Modal Actions
    DOM.btnRestore.addEventListener('click', () => {
        DOM.restoreError.classList.remove('hidden');
        logTerminal("[ERR] Restoration failed. String missing.");
    });

    DOM.btnReset.addEventListener('click', () => {
        location.reload();
    });

    DOM.modalCloseBtn.addEventListener('click', () => {
        DOM.finalModal.classList.add('hidden');
    });
}

/* --------------------------------------------------------------------------
   5. WEB AUDIO API & ACOUSTIC SYNTHESIZER
   -------------------------------------------------------------------------- */
function getAudioContext() {
    if (!state.audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        state.audioCtx = new AudioCtxClass();
    }
    if (state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
    }
    return state.audioCtx;
}

// Preload audio files if present
function preloadAudioAssets() {
    CONFIG.stringAudioPaths.forEach((path, idx) => {
        fetch(path)
            .then(res => {
                if (res.ok) return res.arrayBuffer();
                throw new Error("Audio file missing");
            })
            .then(data => getAudioContext().decodeAudioData(data))
            .then(buffer => {
                state.audioBuffers[idx + 1] = buffer;
            })
            .catch(() => {
                // Silently fallback to Web Audio API synth
            });
    });
}

// Play Plucked String Sound (Local audio fallback to Web Audio Synth)
function playStringSound(stringNum) {
    const ctx = getAudioContext();

    if (state.audioBuffers[stringNum]) {
        const source = ctx.createBufferSource();
        source.buffer = state.audioBuffers[stringNum];
        source.connect(ctx.destination);
        source.start(0);
        return;
    }

    // WEB AUDIO API FALLBACK: Synthesize acoustic plucked string tone
    const freq = STRING_FREQUENCIES[stringNum - 1];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.25);
}

// Play String Snap Sound Effect
function playSnapSound() {
    const player = document.getElementById('snap-audio-player');
    player.src = CONFIG.snapAudio;
    player.play().catch(() => {
        const ctx = getAudioContext();
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
        noise.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
    });
}

/* --------------------------------------------------------------------------
   6. STRING INTERACTION LOGIC
   -------------------------------------------------------------------------- */
function pluckString(stringNum) {
    if (!state.activeStrings.includes(stringNum)) return;

    // First interaction starts the session timer and 10-second string breaking system!
    if (!state.hasStartedTimer) {
        startSessionAndBreakingTimer();
    }

    // Play Sound & Animate
    playStringSound(stringNum);
    animateStringVibration(stringNum);
    
    // Waveform reactivity
    state.waveformEnergy = 35;

    // Update Telemetry Panel
    const freq = STRING_FREQUENCIES[stringNum - 1];
    DOM.dispFreq.textContent = `${freq.toFixed(2)} Hz`;
    DOM.dispAmp.textContent = `- ${(Math.random() * 3 + 1).toFixed(1)} dB`;
    DOM.telemetryFreq.textContent = `${freq.toFixed(2)} Hz`;

    logTerminal(`[PLUCK] Vector #${stringNum} vibration registered at ${freq.toFixed(2)}Hz.`);

    // If only 1 string left, clicking it manually triggers the ending!
    if (state.activeStrings.length === 1 && stringNum === state.activeStrings[0]) {
        triggerFinalStringEnding(stringNum);
    }
}

function animateStringVibration(stringNum) {
    const stringLine = document.getElementById(`string-line-${stringNum}`);
    if (stringLine) {
        stringLine.classList.remove('vibrating');
        void stringLine.offsetWidth; // Trigger reflow
        stringLine.classList.add('vibrating');
        setTimeout(() => stringLine.classList.remove('vibrating'), 450);
    }
}

/* --------------------------------------------------------------------------
   7. HIDDEN STRING-BREAKING SYSTEM & 10-SECOND TIMERS
   -------------------------------------------------------------------------- */
function startSessionAndBreakingTimer() {
    state.hasStartedTimer = true;
    DOM.guitarHint.classList.add('hidden');

    // Start Session Stopwatch Timer
    state.sessionTimer = setInterval(() => {
        state.secondsElapsed++;
        const mins = String(Math.floor(state.secondsElapsed / 60)).padStart(2, '0');
        const secs = String(state.secondsElapsed % 60).padStart(2, '0');
        DOM.sessionTime.textContent = `${mins}:${secs}`;
    }, 1000);

    // Start Hidden String Breaking Loop EVERY 10 SECONDS (10000ms)
    state.breakTimer = setInterval(() => {
        if (state.activeStrings.length > 1) {
            breakOneRandomString();
        } else {
            clearInterval(state.breakTimer);
        }
    }, CONFIG.breakInterval);

    logTerminal("[SYS_EXEC] Acoustic tracking session started. Real-time stress monitor active.");
}

function breakOneRandomString() {
    if (state.activeStrings.length <= 1) return;

    const randomIndex = Math.floor(Math.random() * state.activeStrings.length);
    const brokenStringNum = state.activeStrings.splice(randomIndex, 1)[0];

    playSnapSound();
    
    const stringWrap = document.getElementById(`string-wrap-${brokenStringNum}`);
    if (stringWrap) {
        stringWrap.classList.add('string-snapped');
    }

    const statusItem = document.getElementById(`status-item-${brokenStringNum}`);
    if (statusItem) {
        statusItem.classList.add('broken');
        statusItem.querySelector('.st-badge').textContent = 'SNAPPED';
        statusItem.querySelector('.st-badge').className = 'st-badge snapped';
    }

    const remainingCount = state.activeStrings.length;
    DOM.sessionStringsCount.textContent = `${remainingCount} / 6`;
    const integrityPct = Math.round((remainingCount / 6) * 100);
    DOM.dispIntegrity.textContent = `${integrityPct} %`;
    DOM.barIntegrity.style.width = `${integrityPct}%`;

    updateSystemWarningState(remainingCount);
}

/* --------------------------------------------------------------------------
   8. POOKIE TRANSFORMATION SYSTEM (CHAOS STARTS AT 2 STRINGS)
   -------------------------------------------------------------------------- */
function updateSystemWarningState(count) {
    const msg = WARNING_MESSAGES[count] || WARNING_MESSAGES[6];
    
    DOM.statusTitleText.textContent = msg.title;
    DOM.statusSubText.textContent = msg.sub;
    logTerminal(msg.log);

    // AT 3 STRINGS - REMAIN PROFESSIONAL (NO POOKIE TRANSFORMATION YET)
    if (count === 3) {
        document.body.classList.remove('pookie-phase-2', 'pookie-phase-1');
        document.body.classList.add('pookie-phase-3');
        DOM.statusIcon.textContent = '⚙️';
        DOM.sessionMode.textContent = 'MONITORING';
    }
    
    // MAJOR TRANSFORMATION ONLY AT 2 STRINGS
    if (count === 2) {
        document.body.classList.remove('pookie-phase-3');
        document.body.classList.add('pookie-phase-2');
        DOM.statusIcon.textContent = '💖';
        DOM.sessionMode.textContent = 'EMOTIONAL';
        spawnSparkles(12);
    }

    // 1 STRING REMAINING - DRAMATIC FINAL STATE
    if (count === 1) {
        document.body.classList.remove('pookie-phase-2');
        document.body.classList.add('pookie-phase-1');
        DOM.statusIcon.textContent = '🎀';
        DOM.sessionMode.textContent = 'FINAL TETHER';
        
        const finalStringNum = state.activeStrings[0];
        const stringLine = document.getElementById(`string-line-${finalStringNum}`);
        if (stringLine) {
            stringLine.style.stroke = '#ff77a9';
            stringLine.style.filter = 'drop-shadow(0 0 16px #ff77a9)';
        }

        spawnSpotlightAroundString(finalStringNum);
        spawnSparkles(18);
    }
}

function spawnSparkles(amount) {
    // Designed visual sparkles (No random popping emojis)
    for (let i = 0; i < amount; i++) {
        const sparkle = document.createElement('span');
        sparkle.className = 'pookie-sparkle';
        sparkle.textContent = i % 2 === 0 ? '✨' : '🌸';
        sparkle.style.left = `${Math.random() * 90 + 5}%`;
        sparkle.style.top = `${Math.random() * 80 + 10}%`;
        sparkle.style.animationDelay = `${Math.random() * 2}s`;
        DOM.sparklesLayer.appendChild(sparkle);
    }
}

function spawnSpotlightAroundString(stringNum) {
    const spotlight = document.createElement('div');
    spotlight.className = 'final-string-spotlight';
    spotlight.style.left = `${150 + stringNum * 12}px`;
    DOM.guitarContainer.appendChild(spotlight);
}

/* --------------------------------------------------------------------------
   9. FINAL STRING INTERACTION → REVEAL AUDIO + UNCLE IMAGE TOGETHER
   -------------------------------------------------------------------------- */
function triggerFinalStringEnding(finalStringNum) {
    // 1. Play final string note
    playStringSound(finalStringNum);
    
    // 2. Animate dramatic string snap
    const finalWrap = document.getElementById(`string-wrap-${finalStringNum}`);
    if (finalWrap) {
        finalWrap.classList.add('string-snapped');
    }
    
    state.activeStrings = [];
    DOM.sessionStringsCount.textContent = `0 / 6`;
    DOM.dispIntegrity.textContent = `0 %`;
    DOM.barIntegrity.style.width = `0%`;

    logTerminal("[CRITICAL] Final string snapped. System offline.");

    // 3. Cinematic pause, then reveal Image & Dialogue Audio TOGETHER
    setTimeout(() => {
        openFinalUnclePopupTogether();
    }, 1000);
}

function openFinalUnclePopupTogether() {
    DOM.finalDialogueText.textContent = CONFIG.finalDialogue;
    DOM.finalUncleImg.src = CONFIG.finalImage;

    // Show Popup Modal
    DOM.finalModal.classList.remove('hidden');

    // Trigger dialogue audio at exact moment of reveal
    const dialogueAudio = document.getElementById('dialogue-audio-player');
    dialogueAudio.src = CONFIG.finalAudio;
    dialogueAudio.play().catch(() => {
        logTerminal("[INFO] Dialogue audio file unavailable/blocked. Showing text fallback.");
    });

    // Reveal Performance Report shortly after
    setTimeout(() => {
        DOM.finalReport.classList.remove('hidden');
    }, 1200);
}

/* --------------------------------------------------------------------------
   10. ENHANCED MULTI-LAYER WAVEFORM ANIMATIONS
   -------------------------------------------------------------------------- */
function initCanvases() {
    state.heroCanvasCtx = DOM.heroCanvas.getContext('2d');
    state.oscCanvasCtx = DOM.oscCanvas.getContext('2d');
    
    drawHeroWaveform();
    drawOscilloscope();
}

function drawHeroWaveform() {
    const ctx = state.heroCanvasCtx;
    const width = DOM.heroCanvas.width;
    const height = DOM.heroCanvas.height;
    let step = 0;

    function render() {
        ctx.clearRect(0, 0, width, height);

        // Layer 1: Background Muted Frequency Waves
        ctx.beginPath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
        for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin((x + step * 0.8) * 0.02) * 22;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Layer 2: Main Dynamic Dark-Gold Resonance Wave
        ctx.beginPath();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = '#d4af37';
        for (let x = 0; x < width; x++) {
            const reactiveAmp = 18 + (state.waveformEnergy * Math.sin(x * 0.05));
            const y = height / 2 + 
                Math.sin((x + step) * 0.035) * reactiveAmp + 
                Math.cos((x - step) * 0.015) * 8;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Decay reactive pluck energy back to idle smoothly
        if (state.waveformEnergy > 0) {
            state.waveformEnergy *= 0.94;
        }

        step += 2.5;
        state.animFrameHero = requestAnimationFrame(render);
    }
    render();
}

function drawOscilloscope() {
    const ctx = state.oscCanvasCtx;
    const width = DOM.oscCanvas.width;
    const height = DOM.oscCanvas.height;
    let step = 0;

    function render() {
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = state.activeStrings.length <= 2 ? '#ff77a9' : '#d4af37';

        for (let x = 0; x < width; x++) {
            const amp = 8 + (state.waveformEnergy * 0.5);
            const y = height / 2 + Math.sin((x + step) * 0.09) * amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        step += 3.5;
        state.animFrameOsc = requestAnimationFrame(render);
    }
    render();
}

/* --------------------------------------------------------------------------
   11. HELPER & TERMINAL LOGS
   -------------------------------------------------------------------------- */
function logTerminal(msg) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = msg;
    DOM.terminalLog.appendChild(entry);
    DOM.terminalLog.scrollTop = DOM.terminalLog.scrollHeight;
}

function initParticles() {
    const container = document.getElementById('particles');
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.width = `${Math.random() * 4 + 2.5}px`;
        p.style.height = p.style.width;
        p.style.left = `${Math.random() * 100}%`;
        p.style.animationDuration = `${Math.random() * 10 + 8}s`;
        p.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(p);
    }
}
