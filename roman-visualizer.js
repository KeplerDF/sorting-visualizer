const canvas = document.getElementById('castrumCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('castrum-status');

canvas.width = 800;
canvas.height = 500;

const GRID_SIZE = 20; 
const COLS = canvas.width / GRID_SIZE; 
const ROWS = canvas.height / GRID_SIZE; 

const PHASES = {
    MARCH_IN: 'LEGION MARCHING IN',
    SURVEY: 'SURVEYING GRID',
    BUILD: 'CONSTRUCTING CASTRUM (ORGANIC QUEUE)',
    LIVE: 'ESTABLISHED CAMP LIFE (DYNAMIC PATROLS)',
    DEMOLISH: 'CHAOTIC DECONSTRUCTION (VAS VASA)'
};

const REGIONS = [
    { name: "BRITTANIA", bg: "#1e3f20", road: "#574028", wall: "#705335", wallStroke: "#543e26", customType: "tower", customColor: "#9c88ff" },
    { name: "HISPANIA",  bg: "#8a7355", road: "#c2b280", wall: "#9a8873", wallStroke: "#7a6a57", customType: "granary", customColor: "#f5cd79" },
    { name: "AEGYPTUS",  bg: "#c2a661", road: "#57534e", wall: "#d4b270", wallStroke: "#b09154", customType: "praetorium", customColor: "#e66767" },
    { name: "GERMANIA",  bg: "#142416", road: "#3d2b1f", wall: "#4a3319", wallStroke: "#302110", customType: "fabrica", customColor: "#f78fb3" }
];

const TENT_COLORS = ['#d35400', '#e67e22', '#ba7c4a', '#d9ad7c', '#a04000'];

let currentRegionIndex = 0; 
let currentPhase = PHASES.MARCH_IN;
let phaseTimer = 0;

let grid = [];
let particles = [];
let legionUnits = [];
let workers = [];
let patrols = []; 
let activeBlueprints = [];

const WORKER_COUNT = 6;       
const CAMP_LIVE_DURATION = 1000; 

function initGrid() {
    grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    let rawSequence = [];
    activeBlueprints = [];
    particles = [];
    workers = [];
    patrols = [];

    const midRow = Math.floor(ROWS / 2);
    const midCol = Math.floor(COLS / 2);
    const startRow = 4, endRow = ROWS - 5;
    const startCol = 8, endCol = COLS - 9;
    const currentRegion = REGIONS[currentRegionIndex];

    // 1. Plan Defensive Outer Walls
    for(let c = startCol; c <= endCol; c++) {
        if(c === midCol) continue; 
        // Randomized build difficulty thresholds per tile (between 25 and 65 work frames)
        const diff1 = Math.floor(Math.random() * 40) + 25;
        const diff2 = Math.floor(Math.random() * 40) + 25;
        rawSequence.push({r: startRow, c, type: 'wall', progress: 0, required: diff1, built: false});
        rawSequence.push({r: endRow, c, type: 'wall', progress: 0, required: diff2, built: false});
    }
    for(let r = startRow; r <= endRow; r++) {
        if(r === midRow) continue; 
        const diff1 = Math.floor(Math.random() * 40) + 25;
        const diff2 = Math.floor(Math.random() * 40) + 25;
        rawSequence.push({r, c: startCol, type: 'wall', progress: 0, required: diff1, built: false});
        rawSequence.push({r, c: endCol, type: 'wall', progress: 0, required: diff2, built: false});
    }

    // 2. Plan Central Command Headquarters (Principia)
    rawSequence.push({r: midRow, c: midCol, type: 'hq', progress: 0, required: 50, built: false});
    rawSequence.push({r: midRow-1, c: midCol, type: 'hq', progress: 0, required: 50, built: false});

    // 3. Plan Regional Custom Structural Node
    rawSequence.push({r: midRow - 1, c: midCol - 2, type: currentRegion.customType, progress: 0, required: 60, built: false});
    rawSequence.push({r: midRow, c: midCol - 2, type: currentRegion.customType, progress: 0, required: 60, built: false});

    // 4. Plan Soldier Quarter Barracks (Tents)
    for(let r = startRow + 2; r < endRow - 1; r += 2) {
        if(r === midRow || r === midRow - 1) continue;
        for(let c = startCol + 2; c < endCol - 1; c++) {
            if(c === midCol || c === midCol - 1 || c === midCol + 1 || c === midCol - 2) continue;
            
            const randomColor = TENT_COLORS[Math.floor(Math.random() * TENT_COLORS.length)];
            const randomDifficulty = Math.floor(Math.random() * 30) + 20;
            rawSequence.push({r, c, type: 'tent', progress: 0, required: randomDifficulty, built: false, color: randomColor});
        }
    }

    // Shuffle layout plan completely using Fisher-Yates
    while (rawSequence.length > 0) {
        const randomIndex = Math.floor(Math.random() * rawSequence.length);
        activeBlueprints.push(rawSequence.splice(randomIndex, 1)[0]);
    }
}

function spawnWorkers() {
    const midRow = Math.floor(ROWS / 2);
    const midCol = Math.floor(COLS / 2);
    for(let i = 0; i < WORKER_COUNT; i++) {
        workers.push({
            x: midCol * GRID_SIZE + 10,
            y: midRow * GRID_SIZE + 10,
            target: null,
            speed: 1.2 + Math.random() * 1.2, // Unpredictable speeds per builder entity
            color: '#3498db' 
        });
    }
}

// Generates dynamic, roving guards that choose random quadrant map waypoints
function spawnPatrols() {
    for (let i = 0; i < 3; i++) { // Increased guard count to 3
        patrols.push({
            x: (8 + Math.floor(Math.random() * 12)) * GRID_SIZE,
            y: (4 + Math.floor(Math.random() * 10)) * GRID_SIZE,
            targetX: null,
            targetY: null,
            pauseTicks: 0,
            speed: 0.6 + Math.random() * 0.6
        });
    }
}

function update() {
    phaseTimer++;
    const currentRegion = REGIONS[currentRegionIndex];

    if (currentPhase === PHASES.MARCH_IN) {
        statusText.innerText = `[LOCATION: ${currentRegion.name}] ${currentPhase}`;
        statusText.style.color = '#3498db';
        
        if (phaseTimer === 1) {
            legionUnits = [];
            for(let i = 0; i < 35; i++) {
                legionUnits.push({ 
                    x: -i * 14 - 20, 
                    y: Math.floor(ROWS/2) * GRID_SIZE + 7, 
                    color: '#e74c3c' 
                });
            }
        }
        
        legionUnits.forEach(unit => {
            if (unit.x < (canvas.width / 2) - 50) {
                unit.x += 2.2;
            } else if (unit.y < (canvas.height / 2) + 60) {
                unit.y += 0.5;
                unit.x += 0.5;
            }
        });
        
        if (phaseTimer > 320) {
            currentPhase = PHASES.SURVEY;
            phaseTimer = 0;
        }
    } 
    else if (currentPhase === PHASES.SURVEY) {
        statusText.innerText = `[LOCATION: ${currentRegion.name}] ${currentPhase}`;
        statusText.style.color = '#f1c40f';
        
        if (phaseTimer > 100) { 
            initGrid();
            spawnWorkers();
            currentPhase = PHASES.BUILD;
            phaseTimer = 0;
        }
    } 
    else if (currentPhase === PHASES.BUILD) {
        statusText.innerText = `[LOCATION: ${currentRegion.name}] ${currentPhase}`;
        statusText.style.color = '#e67e22';
        
        let componentsRemaining = false;

        workers.forEach(w => {
            if (!w.target) {
                w.target = activeBlueprints.find(b => !b.built && !b.assigned);
                if (w.target) w.target.assigned = true;
            }

            if (w.target) {
                componentsRemaining = true;
                const targetX = w.target.c * GRID_SIZE + 10;
                const targetY = w.target.r * GRID_SIZE + 10;
                
                const dx = targetX - w.x;
                const dy = targetY - w.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 3) {
                    w.x += (dx / distance) * w.speed;
                    w.y += (dy / distance) * w.speed;
                } else {
                    w.target.progress++;
                    
                    if (Math.random() < 0.2) {
                        particles.push({
                            x: w.x + (Math.random() * 6 - 3),
                            y: w.y + (Math.random() * 6 - 3),
                            r: Math.random() * 1.5 + 0.5,
                            alpha: 0.8,
                            decay: 0.04,
                            color: currentRegion.wallStroke
                        });
                    }

                    // Checks customized individual variable difficulty thresholds
                    if (w.target.progress >= w.target.required) {
                        w.target.built = true;
                        grid[w.target.r][w.target.c] = { 
                            type: w.target.type, 
                            color: w.target.color || null 
                        }; 
                        w.target = null; 
                    }
                }
            } else {
                const homeX = (canvas.width / 2);
                const homeY = (canvas.height / 2);
                const dx = homeX - w.x;
                const dy = homeY - w.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 10) {
                    w.x += (dx / dist) * w.speed;
                    w.y += (dy / dist) * w.speed;
                }
            }
        });

        particles.forEach((p, idx) => {
            p.alpha -= p.decay;
            if(p.alpha <= 0) particles.splice(idx, 1);
        });

        if (!componentsRemaining) {
            currentPhase = PHASES.LIVE;
            phaseTimer = 0;
            workers = []; 
            legionUnits = []; 
            spawnPatrols(); 
        }
    } 
    else if (currentPhase === PHASES.LIVE) {
        statusText.innerText = `[LOCATION: ${currentRegion.name}] ${currentPhase}`;
        statusText.style.color = '#2ecc71';

        // Update fully unpredictable autonomous guards
        patrols.forEach(p => {
            if (p.pauseTicks > 0) {
                p.pauseTicks--;
                return;
            }

            if (p.targetX === null || p.targetY === null) {
                // Select an entirely random node coordinate inside the perimeter map profile
                p.targetX = (8 + Math.floor(Math.random() * 23)) * GRID_SIZE + 10;
                p.targetY = (4 + Math.floor(Math.random() * 16)) * GRID_SIZE + 10;
            }

            let dx = p.targetX - p.x;
            let dy = p.targetY - p.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 4) {
                p.x += (dx / distance) * p.speed;
                p.y += (dy / distance) * p.speed;
            } else {
                // Arrived at destination. Pause unpredictably to stand guard before rolling next target.
                p.targetX = null;
                p.targetY = null;
                p.pauseTicks = Math.floor(Math.random() * 120) + 30; // 0.5 to 2.5 second standby
            }
        });

        // Procedural atmospheric cooking flare up and decay
        if(Math.random() < 0.25) {
            const midRow = Math.floor(ROWS / 2);
            const midCol = Math.floor(COLS / 2);
            particles.push({
                x: (midCol + (Math.random() > 0.5 ? (Math.floor(Math.random() * 6) + 2) : -(Math.floor(Math.random() * 6) + 2))) * GRID_SIZE + 10,
                y: (midRow + (Math.random() > 0.5 ? Math.floor(Math.random() * 4) : -Math.floor(Math.random() * 4))) * GRID_SIZE + 10,
                r: Math.random() * 3.5 + 1,
                alpha: 0.9,
                decay: 0.008 + Math.random() * 0.01,
                color: Math.random() > 0.85 ? '#e67e22' : '#bdc3c7' // Embers pop up occasionally inside grey clouds
            });
        }
        
        particles.forEach((p, idx) => {
            p.y -= 0.25;
            p.x += Math.sin(phaseTimer / 12 + p.y) * 0.15; // Swirling heat wave distortions
            p.alpha -= p.decay;
            if(p.alpha <= 0) particles.splice(idx, 1);
        });

        if (phaseTimer > CAMP_LIVE_DURATION) { 
            currentPhase = PHASES.DEMOLISH;
            phaseTimer = 0;
            patrols = []; 
            
            legionUnits = [];
            const midRow = Math.floor(ROWS / 2);
            const midCol = Math.floor(COLS / 2);
            for(let i = 0; i < 20; i++) {
                legionUnits.push({
                    x: midCol * GRID_SIZE + 7, 
                    y: (midRow + 3) * GRID_SIZE + (i * 15), 
                    color: '#f39c12' 
                });
            }
        }
    } 
    else if (currentPhase === PHASES.DEMOLISH) {
        statusText.innerText = `[LOCATION: ${currentRegion.name}] ${currentPhase}`;
        statusText.style.color = '#e74c3c';

        // --- SCATTERED DECONSTRUCTION UPGRADE ---
        // Tear down cells entirely at random index positions rather than standard queue regression loops
        if (phaseTimer % 2 === 0) {
            let standingStructures = activeBlueprints.filter(b => b.built);
            if (standingStructures.length > 0) {
                let targetStructure = standingStructures[Math.floor(Math.random() * standingStructures.length)];
                targetStructure.built = false;
                grid[targetStructure.r][targetStructure.c] = 0;
            }
        }
        
        let unitsLeft = false;
        legionUnits.forEach(unit => {
            if(unit.y > Math.floor(ROWS/2) * GRID_SIZE + 7) {
                unit.y -= 1.5; 
                unitsLeft = true;
            } else {
                unit.x += 2.5; 
                if (unit.x < canvas.width + 10) unitsLeft = true;
            }
        });

        if (!unitsLeft && phaseTimer > 180) {
            currentRegionIndex = (currentRegionIndex + 1) % REGIONS.length;
            currentPhase = PHASES.MARCH_IN;
            phaseTimer = 0;
            grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentRegion = REGIONS[currentRegionIndex];

    ctx.fillStyle = currentRegion.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const midRow = Math.floor(ROWS / 2);
    const midCol = Math.floor(COLS / 2);

    if(currentPhase !== PHASES.MARCH_IN) {
        ctx.fillStyle = currentRegion.road; 
        ctx.fillRect(0, midRow * GRID_SIZE + 2, canvas.width, GRID_SIZE - 4);
        ctx.fillRect(midCol * GRID_SIZE + 2, 0, GRID_SIZE - 4, canvas.height);
    }

    if (currentPhase === PHASES.BUILD) {
        activeBlueprints.forEach(b => {
            if (!b.built) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.lineWidth = 1;
                ctx.strokeRect(b.c * GRID_SIZE + 3, b.r * GRID_SIZE + 3, GRID_SIZE - 6, GRID_SIZE - 6);
                
                if (b.progress > 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                    // Proportional scaling for randomized build heights
                    const fillHeight = (b.progress / b.required) * (GRID_SIZE - 6);
                    ctx.fillRect(b.c * GRID_SIZE + 4, b.r * GRID_SIZE + 4, GRID_SIZE - 8, fillHeight);
                }
            }
        });
    }

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = grid[r][c];
            if (!cell) continue;

            const x = c * GRID_SIZE;
            const y = r * GRID_SIZE;
            const type = cell.type;

            if (type === 'wall') {
                ctx.fillStyle = currentRegion.wall;
                ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
                ctx.strokeStyle = currentRegion.wallStroke;
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
            } 
            else if (type === 'tent') {
                ctx.fillStyle = cell.color; 
                ctx.beginPath();
                ctx.moveTo(x + 10, y + 3);
                ctx.lineTo(x + 17, y + 17);
                ctx.lineTo(x + 3, y + 17);
                ctx.closePath();
                ctx.fill();
            } 
            else if (type === 'hq') {
                ctx.fillStyle = '#c0392b';
                ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
                ctx.strokeStyle = '#f1c40f';
                ctx.strokeRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
            }
            else if (type === currentRegion.customType) {
                ctx.fillStyle = currentRegion.customColor;
                ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 4, y + 4, GRID_SIZE - 8, GRID_SIZE - 8);
                
                if (type === 'tower') {
                    ctx.beginPath(); ctx.moveTo(x+4,y+4); ctx.lineTo(x+16,y+16); ctx.moveTo(x+16,y+4); ctx.lineTo(x+4,y+16); ctx.stroke();
                } else if (type === 'granary') {
                    ctx.beginPath(); ctx.moveTo(x+10,y+4); ctx.lineTo(x+10,y+16); ctx.stroke();
                }
            }
        }
    }

    particles.forEach(p => {
        ctx.fillStyle = p.color || '#fff';
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });

    if(currentPhase === PHASES.MARCH_IN || currentPhase === PHASES.DEMOLISH) {
        legionUnits.forEach(unit => {
            ctx.fillStyle = unit.color;
            ctx.fillRect(unit.x, unit.y, 6, 6);
        });
    }

    if (currentPhase === PHASES.BUILD) {
        workers.forEach(w => {
            ctx.fillStyle = w.color;
            ctx.beginPath(); ctx.arc(w.x, w.y, 4, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.stroke();
        });
    }

    if (currentPhase === PHASES.LIVE) {
        patrols.forEach(p => {
            ctx.fillStyle = '#9b59b6'; 
            ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
            
            ctx.strokeStyle = 'rgba(155, 89, 182, 0.25)';
            ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, Math.PI * 2); ctx.stroke();
        });
    }
}

function loop() {
    const section = document.getElementById('roman-section');
    if (section && (section.style.display === 'block' || section.style.display === '')) {
        update();
        draw();
    }
    requestAnimationFrame(loop);
}

// Initial bootstrap triggers
initGrid(); // Calls layout generator safely on engine mount
loop();