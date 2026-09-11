/* ==========================================================================
   STRATOS — PRECISION ACOUSTIC PERFORMANCE SYSTEM
   Master Script Logic & Audio Synthesis Engine
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CONFIGURATION (CENTRALIZED)
   -------------------------------------------------------------------------- */
const CONFIG = {
    stringCount: 6,
    breakInterval: 7000, // Exactly 7 seconds (7000ms) after the first pluck
    finalDialogue: "I engineered a multi-tier acoustic intelligence matrix with zero-latency resonance tracking... solely to observe you pluck strings until zero vectors remain. Statistically, you were warned.",
    finalImage: "assets/images/uncle.jpeg",
    finalAudio: "assets/audio/final.mpeg",
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

// Standard Guitar Frequencies for Web Audio API Synthesis Engine
const STRING_FREQUENCIES = [
    329.63, // String 1 (E4)
    246.94, // String 2 (B3)
    196.00, // String 3 (G3)
    146.83, // String 4 (D3)
    110.00, // String 5 (A2)
    82.41   // String 6 (E2)
];

// Exact X coordinates on 896-width geometry (average between nut and bridge)
const STRING_X_COORDS = [
    475.5, // String 1
    465.0, // String 2
    454.5, // String 3
    444.0, // String 4
    433.5, // String 5
    423.0  // String 6
];

// Deadpan Technical Meme Degradation State Machine
const WARNING_MESSAGES = {
    6: {
        title: "SYSTEM STATUS: OPTIMAL",
        sub: "All 6 acoustic string vectors reporting 100% integrity.",
        log: "All acoustic transducers responding within 0.002ms.",
        mode: "PRECISION ANALYSIS",
        meta: "CONTINUOUS ANALYSIS"
    },
    5: {
        title: "STATUS: MINOR ANOMALY NOTED",
        sub: "Single vector loss logged. Recalibrating resonance curve.",
        log: "[WARN] Vector loss registered. Acoustic matrix compensated to 5 strings.",
        mode: "CONTINUOUS ANALYSIS",
        meta: "REDUCED ARRAY"
    },
    4: {
        title: "STATUS: STRUCTURAL STRESS DETECTED",
        sub: "Acoustic tension loss noted. Structural integrity degrading.",
        log: "[ALERT] Transducer stress threshold exceeded on primary soundboard.",
        mode: "STRESS MONITORING",
        meta: "STRUCTURAL COMPLIANCE"
    },
    3: {
        title: "SYSTEM STATUS: STRUCTURAL CONCERN",
        sub: "Three acoustic vectors remain. Acceptable parameters are becoming increasingly theoretical.",
        log: "[WARN] Acoustic confidence: 61.4%. Situation within theoretical tolerances.",
        mode: "DAMAGE ASSESSMENT",
        meta: "DAMAGE ASSESSMENT"
    },
    2: {
        title: "SYSTEM STATUS: HIGHLY CONCERNING",
        sub: "TWO STRINGS REMAINING. This situation is becoming difficult to justify to acoustic engineering standards.",
        log: "[CRITICAL] Predictive Analysis: We predicted this would happen. Why are you continuing?",
        mode: "DAMAGE CONTROL",
        meta: "DAMAGE CONTROL"
    },
    1: {
        title: "SYSTEM STATUS: THIS IS NOT IDEAL",
        sub: "RECOMMENDED ACTION: STOP TOUCHING THE GUITAR. USER ACTION PROJECTION: LIKELY TO IGNORE RECOMMENDATION.",
        log: "[FINAL] Zero redundancy remaining. System operating on pure hopes and prayers.",
        mode: "FINAL TETHER",
        meta: "FINAL TETHER"
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
    workstationBanner: document.getElementById('workstation-banner'),
    
    // Workstation Status & Panels
    statusTitleText: document.getElementById('status-title-text'),
    statusSubText: document.getElementById('status-sub-text'),
    statusIcon: document.getElementById('status-icon'),
    metaModeText: document.getElementById('meta-mode-text'),
    
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
    
    // Guitar Center Stage
    guitarContainer: document.getElementById('guitar-container'),
    guitarStage: document.getElementById('guitar-stage'),
    guitarHint: document.getElementById('guitar-hint'),
    spotlightLayer: document.getElementById('spotlight-layer'),
    stringWrappers: document.querySelectorAll('.string-wrapper'),
    
    // Final Debriefing Modal
    finalModal: document.getElementById('final-modal'),
    finalDialogueText: document.getElementById('final-dialogue-text'),
    finalUncleImg: document.getElementById('final-uncle-img'),
    finalReport: document.getElementById('final-report'),
    btnRestore: document.getElementById('btn-restore'),
    btnReset: document.getElementById('btn-reset'),
    restoreError: document.getElementById('restore-error'),
    modalCloseBtn: document.getElementById('modal-close-btn'),

    // Predictive Analysis Metric in Hero section
    predictiveVal: document.getElementById('metric-predictive-val'),
    predictiveSub: document.getElementById('metric-predictive-sub')
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
    setupImageFallback();
});

function initEventListeners() {
    // Hero CTA Smooth Scroll to Instrument Selection
    if (DOM.btnInitialize) {
        DOM.btnInitialize.addEventListener('click', () => {
            const sel = document.getElementById('selection');
            if (sel) sel.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Guitar Selection Card Interactions
    document.querySelectorAll('.guitar-card').forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('active-guitar-card')) {
                // Playable instrument card selected
                card.classList.remove('card-selected-anim');
                void card.offsetWidth;
                card.classList.add('card-selected-anim');

                setTimeout(() => {
                    DOM.workstationSection.classList.remove('hidden');
                    DOM.workstationSection.scrollIntoView({ behavior: 'smooth' });
                    logTerminal("[USER] STRATOS A-01 Master Workstation initialized.");
                }, 280);
            } else {
                // Unavailable card rejected animation
                card.classList.remove('card-rejected-anim');
                void card.offsetWidth;
                card.classList.add('card-rejected-anim');
                
                const cardTitle = card.querySelector('h3') ? card.querySelector('h3').textContent : 'UNIT';
                logTerminal(`[ACCESS DENIED] ${cardTitle} is currently locked or undergoing acoustic calibration.`);
            }
        });
    });

    // Strings Click / Touch Event Binding (Zero-delay interaction)
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
    if (DOM.btnRestore) {
        DOM.btnRestore.addEventListener('click', () => {
            if (DOM.restoreError) DOM.restoreError.classList.remove('hidden');
            logTerminal("[ERR] Restoration failed. Structural vector array missing.");
        });
    }

    if (DOM.btnReset) {
        DOM.btnReset.addEventListener('click', () => {
            resetSystem();
        });
    }

    if (DOM.modalCloseBtn) {
        DOM.modalCloseBtn.addEventListener('click', () => {
            if (DOM.finalModal) DOM.finalModal.classList.add('hidden');
        });
    }
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
                throw new Error("Local audio file not provided");
            })
            .then(data => getAudioContext().decodeAudioData(data))
            .then(buffer => {
                state.audioBuffers[idx + 1] = buffer;
            })
            .catch(() => {
                // Silently fallback to Web Audio API synthesis
            });
    });
}

// Play Plucked String Sound (Local audio fallback to Web Audio Synth)
function playStringSound(stringNum) {
    try {
        const ctx = getAudioContext();

        if (state.audioBuffers[stringNum]) {
            const source = ctx.createBufferSource();
            source.buffer = state.audioBuffers[stringNum];
            source.connect(ctx.destination);
            source.start(0);
            return;
        }

        // WEB AUDIO API FALLBACK: Synthesize warm acoustic plucked string tone
        const freq = STRING_FREQUENCIES[stringNum - 1];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.48, ctx.currentTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.3);
    } catch (e) {
        console.warn("AudioContext interaction pending user gesture.", e);
    }
}

// Play String Snap Sound Effect
function playSnapSound() {
    try {
        const player = document.getElementById('snap-audio-player');
        if (player) {
            player.src = CONFIG.snapAudio;
            player.play().catch(() => {
                // Synthesize rapid acoustic string snap noise burst
                const ctx = getAudioContext();
                const bufferSize = Math.floor(ctx.sampleRate * 0.09);
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
                }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.65, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.085);
                noise.connect(gain);
                gain.connect(ctx.destination);
                noise.start();
            });
        }
    } catch (e) {
        console.warn("Snap audio synthesis fallback engaged.");
    }
}

/* --------------------------------------------------------------------------
   6. STRING INTERACTION LOGIC
   -------------------------------------------------------------------------- */
function pluckString(stringNum) {
    if (!state.activeStrings.includes(stringNum)) return;

    // First interaction starts the session timer and 7-second string breaking system
    if (!state.hasStartedTimer) {
        startSessionAndBreakingTimer();
    }

    // Play Sound & Animate
    playStringSound(stringNum);
    animateStringVibration(stringNum);
    
    // Waveform reactivity
    state.waveformEnergy = 42;

    // Update Telemetry Panel
    const freq = STRING_FREQUENCIES[stringNum - 1];
    DOM.dispFreq.textContent = `${freq.toFixed(2)} Hz`;
    DOM.dispAmp.textContent = `- ${(Math.random() * 2.8 + 1.2).toFixed(1)} dB`;
    DOM.telemetryFreq.textContent = `${freq.toFixed(2)} Hz`;

    logTerminal(`[PLUCK] Vector #${stringNum} vibration registered at ${freq.toFixed(2)}Hz.`);

    // If only 1 string left, clicking it manually triggers the ending
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
   7. SEVEN-SECOND STRING BREAKING ENGINE (7000ms INTERVAL)
   -------------------------------------------------------------------------- */
function startSessionAndBreakingTimer() {
    state.hasStartedTimer = true;
    if (DOM.guitarHint) DOM.guitarHint.classList.add('hidden');

    // Start Session Stopwatch Timer
    state.sessionTimer = setInterval(() => {
        state.secondsElapsed++;
        const mins = String(Math.floor(state.secondsElapsed / 60)).padStart(2, '0');
        const secs = String(state.secondsElapsed % 60).padStart(2, '0');
        DOM.sessionTime.textContent = `${mins}:${secs}`;
    }, 1000);

    // Break one string every 7 seconds (7000ms) until exactly 1 remains
    state.breakTimer = setInterval(() => {
        if (state.activeStrings.length > 1) {
            breakOneRandomString();
        } else {
            clearInterval(state.breakTimer);
            state.breakTimer = null;
        }
    }, CONFIG.breakInterval);

    logTerminal("[SYS_EXEC] Acoustic tracking session initialized. Real-time vector integrity monitor active.");
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
        const badge = statusItem.querySelector('.st-badge');
        if (badge) {
            badge.textContent = 'SNAPPED';
            badge.className = 'st-badge snapped';
        }
    }

    const remainingCount = state.activeStrings.length;
    DOM.sessionStringsCount.textContent = `${remainingCount} / 6`;
    const integrityPct = Math.round((remainingCount / 6) * 100);
    DOM.dispIntegrity.textContent = `${integrityPct} %`;
    DOM.barIntegrity.style.width = `${integrityPct}%`;

    updateSystemWarningState(remainingCount);
}

/* --------------------------------------------------------------------------
   8. DEADPAN MEME FAILURE PROGRESSION (NO POOKIE / NO EMOJI SPAM)
   -------------------------------------------------------------------------- */
function updateSystemWarningState(count) {
    const msg = WARNING_MESSAGES[count] || WARNING_MESSAGES[6];
    
    DOM.statusTitleText.textContent = msg.title;
    DOM.statusSubText.textContent = msg.sub;
    DOM.sessionMode.textContent = msg.mode;
    if (DOM.metaModeText) DOM.metaModeText.textContent = msg.meta;
    logTerminal(msg.log);

    // Clean any prior failure classes
    document.body.classList.remove('state-3-strings', 'state-2-strings', 'state-1-strings');

    // 3 STRINGS — SUBTLE SIGNS OF TROUBLE
    if (count === 3) {
        document.body.classList.add('state-3-strings');
        DOM.statusIcon.textContent = '⚠️';
        if (DOM.predictiveVal) DOM.predictiveVal.textContent = 'QUESTIONABLE';
        if (DOM.predictiveSub) DOM.predictiveSub.textContent = 'Acceptable tolerances becoming theoretical';
    }
    
    // 2 STRINGS — SYSTEM IS CLEARLY LOSING IT
    if (count === 2) {
        document.body.classList.add('state-2-strings');
        DOM.statusIcon.textContent = '🚨';
        if (DOM.predictiveVal) DOM.predictiveVal.textContent = 'PREDICTED';
        if (DOM.predictiveSub) DOM.predictiveSub.textContent = 'Acoustic engineer consensus: Not great';
    }

    // 1 STRING REMAINING — MAXIMUM CONTROLLED MEME CHAOS
    if (count === 1) {
        document.body.classList.add('state-1-strings');
        DOM.statusIcon.textContent = '🛑';
        if (DOM.predictiveVal) DOM.predictiveVal.textContent = 'HELP';
        if (DOM.predictiveSub) DOM.predictiveSub.textContent = 'Operating on pure hopes and prayers';
        
        const finalStringNum = state.activeStrings[0];
        const stringLine = document.getElementById(`string-line-${finalStringNum}`);
        if (stringLine) {
            stringLine.style.stroke = '#ffaa33';
            stringLine.style.filter = 'drop-shadow(0 0 16px #ff7722) drop-shadow(0 0 6px #ffffff)';
        }

        spawnSpotlightAroundString(finalStringNum);
    }
}

function spawnSpotlightAroundString(stringNum) {
    if (!DOM.spotlightLayer) return;
    DOM.spotlightLayer.innerHTML = '';
    
    const spotlight = document.createElement('div');
    spotlight.className = 'final-string-spotlight';
    
    // Calculate exact X percentage in 896-width geometry
    const stringX = STRING_X_COORDS[stringNum - 1] || 448;
    const xPct = (stringX / 896) * 100;
    
    spotlight.style.left = `calc(${xPct}% - 40px)`;
    DOM.spotlightLayer.appendChild(spotlight);
}

/* --------------------------------------------------------------------------
   9. FINAL STRING INTERACTION → REVEAL ARCHITECT POPUP
   -------------------------------------------------------------------------- */
function triggerFinalStringEnding(finalStringNum) {
    // 1. Play final note
    playStringSound(finalStringNum);
    
    // 2. Animate final dramatic snap
    const finalWrap = document.getElementById(`string-wrap-${finalStringNum}`);
    if (finalWrap) {
        finalWrap.classList.add('string-snapped');
    }
    
    state.activeStrings = [];
    DOM.sessionStringsCount.textContent = `0 / 6`;
    DOM.dispIntegrity.textContent = `0 %`;
    DOM.barIntegrity.style.width = `0%`;
    DOM.statusTitleText.textContent = "SYSTEM STATUS: UNMITIGATED CATASTROPHE";
    DOM.statusSubText.textContent = "Zero structural vectors remaining. System offline.";
    DOM.statusIcon.textContent = '💀';

    logTerminal("[CRITICAL] Final string snapped. Core structural matrix collapsed.");
    logTerminal("[STATUS] System has run out of strings. Terminating tracking cycle.");

    // 3. Cinematic pause, then reveal Mastermind Uncle Popup
    setTimeout(() => {
        openFinalUnclePopupTogether();
    }, 1000);
}

function openFinalUnclePopupTogether() {
    if (DOM.finalDialogueText) DOM.finalDialogueText.textContent = CONFIG.finalDialogue;
    if (DOM.finalUncleImg) DOM.finalUncleImg.src = CONFIG.finalImage;

    // Reveal Popup Modal
    if (DOM.finalModal) DOM.finalModal.classList.remove('hidden');

    // Trigger dialogue audio gracefully at moment of reveal
    const dialogueAudio = document.getElementById('dialogue-audio-player');
    if (dialogueAudio) {
        dialogueAudio.src = CONFIG.finalAudio;
        dialogueAudio.play().then(() => {
            console.log(`[AUDIO] Successfully playing final audio: ${CONFIG.finalAudio}`);
        }).catch((err) => {
            console.warn(`[WARNING] Failed to play audio asset '${CONFIG.finalAudio}'. Reason:`, err.message || err);
            logTerminal("[INFO] Mastermind audio transmission completed via visual transcript.");
        });
    }

    // Reveal Performance Report shortly after
    setTimeout(() => {
        if (DOM.finalReport) DOM.finalReport.classList.remove('hidden');
    }, 1100);
}

// Graceful fallback avatar for final architect image
function setupImageFallback() {
    if (!DOM.finalUncleImg) return;
    DOM.finalUncleImg.addEventListener('error', () => {
        console.warn(`[WARNING] Image asset '${CONFIG.finalImage}' failed to load. Displaying graceful architect avatar fallback.`);
        DOM.finalUncleImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'><rect width='300' height='300' fill='%23120d09'/><circle cx='150' cy='120' r='55' fill='%232e1e14' stroke='%23d97d27' stroke-width='3'/><circle cx='150' cy='110' r='38' fill='%23e0a060'/><path d='M115,115 Q150,155 185,115 Q175,175 150,175 Q125,175 115,115 Z' fill='%23120d09'/><path d='M135,135 Q150,145 165,135' stroke='%23f7f2ea' stroke-width='2' fill='none'/><circle cx='138' cy='105' r='4' fill='%23120d09'/><circle cx='162' cy='105' r='4' fill='%23120d09'/><path d='M80,260 C80,200 220,200 220,260 Z' fill='%232e1e14' stroke='%23d97d27' stroke-width='2'/><text x='150' y='285' text-anchor='middle' fill='%23d97d27' font-family='monospace' font-size='11' letter-spacing='1'>CHIEF ACOUSTIC ARCHITECT</text></svg>";
    });
    DOM.finalUncleImg.addEventListener('load', () => {
        if (!DOM.finalUncleImg.src.startsWith('data:')) {
            console.log(`[IMAGE] Successfully loaded image asset: ${CONFIG.finalImage}`);
        }
    });
}

// In-Memory Clean System Reset (Smooth restart without hard page refresh)
function resetSystem() {
    // 1. Clear timers
    if (state.breakTimer) clearInterval(state.breakTimer);
    if (state.sessionTimer) clearInterval(state.sessionTimer);
    state.breakTimer = null;
    state.sessionTimer = null;
    state.secondsElapsed = 0;
    state.hasStartedTimer = false;
    state.activeStrings = [1, 2, 3, 4, 5, 6];

    // 2. Reset UI elements
    DOM.sessionTime.textContent = "00:00";
    DOM.sessionStringsCount.textContent = "6 / 6";
    DOM.dispIntegrity.textContent = "100 %";
    DOM.barIntegrity.style.width = "100%";
    if (DOM.guitarHint) DOM.guitarHint.classList.remove('hidden');

    // 3. Reset string DOM visuals
    DOM.stringWrappers.forEach(wrapper => {
        wrapper.classList.remove('string-snapped');
        const line = wrapper.querySelector('.string-line');
        if (line) {
            line.classList.remove('vibrating');
            line.style.stroke = '';
            line.style.filter = '';
        }
    });

    // 4. Reset checklist
    document.querySelectorAll('.string-status-item').forEach(item => {
        item.classList.remove('broken');
        const badge = item.querySelector('.st-badge');
        if (badge) {
            badge.textContent = 'ONLINE';
            badge.className = 'st-badge active';
        }
    });

    // 5. Reset warning state and spotlight
    document.body.classList.remove('state-3-strings', 'state-2-strings', 'state-1-strings');
    if (DOM.spotlightLayer) DOM.spotlightLayer.innerHTML = '';
    updateSystemWarningState(6);

    // 6. Reset modals
    if (DOM.finalModal) DOM.finalModal.classList.add('hidden');
    if (DOM.finalReport) DOM.finalReport.classList.add('hidden');
    if (DOM.restoreError) DOM.restoreError.classList.add('hidden');

    logTerminal("[SYS_RESET] System rebooted. Transducer matrix recalibrated to 6 strings.");
}

/* --------------------------------------------------------------------------
   10. ACOUSTIC WAVEFORM CANVASES
   -------------------------------------------------------------------------- */
function initCanvases() {
    if (DOM.heroCanvas) state.heroCanvasCtx = DOM.heroCanvas.getContext('2d');
    if (DOM.oscCanvas) state.oscCanvasCtx = DOM.oscCanvas.getContext('2d');
    
    if (state.heroCanvasCtx) drawHeroWaveform();
    if (state.oscCanvasCtx) drawOscilloscope();
}

function drawHeroWaveform() {
    const ctx = state.heroCanvasCtx;
    const width = DOM.heroCanvas.width;
    const height = DOM.heroCanvas.height;
    let step = 0;

    function render() {
        ctx.clearRect(0, 0, width, height);

        // Layer 1: Ambient Studio Baffle Wave (Soft Cream/Amber)
        ctx.beginPath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(217, 125, 39, 0.22)';
        for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin((x + step * 0.7) * 0.02) * 20;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Layer 2: Master Resonance Curve
        ctx.beginPath();
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = '#d97d27';
        for (let x = 0; x < width; x++) {
            const reactiveAmp = 16 + (state.waveformEnergy * Math.sin(x * 0.045));
            const y = height / 2 + 
                Math.sin((x + step) * 0.032) * reactiveAmp + 
                Math.cos((x - step) * 0.014) * 7;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Smoothly decay pluck energy
        if (state.waveformEnergy > 0) {
            state.waveformEnergy *= 0.94;
        }

        step += 2.2;
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
        
        // Color shifts from warm amber to alert orange-red as strings fail
        ctx.strokeStyle = state.activeStrings.length <= 2 ? '#e04747' : '#d97d27';

        for (let x = 0; x < width; x++) {
            const amp = 8 + (state.waveformEnergy * 0.45);
            const y = height / 2 + Math.sin((x + step) * 0.085) * amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        step += 3.2;
        state.animFrameOsc = requestAnimationFrame(render);
    }
    render();
}

/* --------------------------------------------------------------------------
   11. HELPER & TERMINAL LOGS
   -------------------------------------------------------------------------- */
function logTerminal(msg) {
    if (!DOM.terminalLog) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = msg;
    DOM.terminalLog.appendChild(entry);
    DOM.terminalLog.scrollTop = DOM.terminalLog.scrollHeight;
}

function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    container.innerHTML = '';
    
    // Create 32 subtle atmospheric dust motes
    for (let i = 0; i < 32; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 3 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.animationDuration = `${Math.random() * 10 + 12}s`;
        p.style.animationDelay = `${Math.random() * 6}s`;
        container.appendChild(p);
    }
}
