// roman-visualizer.js
const canvas = document.getElementById('castrumCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('castrum-status');

canvas.width = 800;
canvas.height = 500;

const GRID_SIZE = 20; 
const COLS = canvas.width / GRID_SIZE; 
const ROWS = canvas.height / GRID_SIZE; 

const PHASES = {
    MARCH_IN: 'LEGION MARCHING INTO AREA',
    SURVEY: 'SURVEYING GRID (CARDO & DECUMANUS)',
    BUILD: 'CONSTRUCTING CASTRUM (WORKERS ACTIVE)',
    LIVE: 'ESTABLISHED CAMP LIFE',
    DEMOLISH: 'PACKING BAGGAGE (VAS VASA)'
};

let currentPhase = PHASES.MARCH_IN;
let phaseTimer = 0;
let grid = [];
let particles = [];
let legionUnits = [];
let workers = [];
let buildSequence = [];
let activeBlueprints = [];

// Configuration Variables to control speed and duration
const WORKER_COUNT = 6;       // Number of little builder dots
const BUILD_WORK_REQUIRED = 45; // Frames a worker must "work" on a tile to build it (higher = slower build)
const CAMP_LIVE_DURATION = 900; // Frames camp stays alive (~15 seconds at 60fps)

function initGrid() {
    grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    buildSequence = [];
    activeBlueprints = [];
    particles = [];
    workers = [];

    const midRow = Math.floor(ROWS / 2);
    const midCol = Math.floor(COLS / 2);
    const startRow = 4, endRow = ROWS - 5;
    const startCol = 8, endCol = COLS - 9;

    // 1. Plan Defensive Perimeter (Walls)
    for(let c = startCol; c <= endCol; c++) {
        if(c === midCol) continue; 
        buildSequence.push({r: startRow, c, type: 'wall', progress: 0, built: false});
        buildSequence.push({r: endRow, c, type: 'wall', progress: 0, built: false});
    }
    for(let r = startRow; r <= endRow; r++) {
        if(r === midRow) continue; 
        buildSequence.push({r, c: startCol, type: 'wall', progress: 0, built: false});
        buildSequence.push({r, c: endCol, type: 'wall', progress: 0, built: false});
    }

    // 2. Plan Central Command Structures (Principia)
    buildSequence.push({r: midRow, c: midCol, type: 'hq', progress: 0, built: false});
    buildSequence.push({r: midRow-1, c: midCol, type: 'hq', progress: 0, built: false});

    // 3. Plan Soldier Barracks (Tents)
    for(let r = startRow + 2; r < endRow - 1; r += 2) {
        if(r === midRow || r === midRow - 1) continue;
        for(let c = startCol + 2; c < endCol - 1; c++) {
            if(c === midCol || c === midCol - 1 || c === midCol + 1) continue;
            buildSequence.push({r, c, type: 'tent', progress: 0, built: false});
        }
    }

    // Pass the plan to the active blueprints array
    activeBlueprints = [...buildSequence];
}

// Helper to spawn workers at the center intersection
function spawnWorkers() {
    const midRow = Math.floor(ROWS / 2);
    const midCol = Math.floor(COLS / 2);
    for(let i = 0; i < WORKER_COUNT; i++) {
        workers.push({
            x: midCol * GRID_SIZE + 10,
            y: midRow * GRID_SIZE + 10,
            target: null,
            speed: 1.8,
            color: '#3498db' // Blue dots for workers
        });
    }
}

function update() {
    phaseTimer++;

    // --- PHASE 1: MARCH IN ---
    if (currentPhase === PHASES.MARCH_IN) {
        statusText.innerText = currentPhase;
        statusText.style.color = '#3498db';
        
        if (phaseTimer === 1) {
            legionUnits = [];
            // Stream rows of soldiers single file into the center of the screen
            for(let i = 0; i < 40; i++) {
                legionUnits.push({ 
                    x: -i * 14 - 20, 
                    y: Math.floor(ROWS/2) * GRID_SIZE + 7, 
                    color: '#e74c3c' // Red dots for legionaries
                });
            }
        }
        
        legionUnits.forEach(unit => {
            // March into the center area, then turn and form up in the middle ground
            if (unit.x < (canvas.width / 2) - 50) {
                unit.x += 2;
            } else if (unit.y < (canvas.height / 2) + 60) {
                unit.y += 0.5;
                unit.x += 0.5;
            }
        });
        
        // Wait until everyone has arrived and settled down
        if (phaseTimer > 350) {
            currentPhase = PHASES.SURVEY;
            phaseTimer = 0;
        }
    } 
    // --- PHASE 2: SURVEY ---
    else if (currentPhase === PHASES.SURVEY) {
        statusText.innerText = currentPhase;
        statusText.style.color = '#f1c40f';
        
        if (phaseTimer > 120) { 
            spawnWorkers();
            currentPhase = PHASES.BUILD;
            phaseTimer = 0;
        }
    } 
    // --- PHASE 3: CONSTRUCTING ---
    else if (currentPhase === PHASES.BUILD) {
        statusText.innerText = currentPhase;
        statusText.style.color = '#e67e22';
        
        let componentsRemaining = false;

        workers.forEach(w => {
            // Find a blueprint that needs work if worker has no current assignment
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
                    // Move towards the target cell
                    w.x += (dx / distance) * w.speed;
                    w.y += (dy / distance) * w.speed;
                } else {
                    // Arrived! Do work on it
                    w.target.progress++;
                    
                    // Create little sawdust/dirt particles while building
                    if (Math.random() < 0.2) {
                        particles.push({
                            x: w.x + (Math.random() * 6 - 3),
                            y: w.y + (Math.random() * 6 - 3),
                            r: Math.random() * 1.5 + 0.5,
                            alpha: 0.8,
                            decay: 0.04,
                            color: '#f1c40f'
                        });
                    }

                    if (w.target.progress >= BUILD_WORK_REQUIRED) {
                        w.target.built = true;
                        grid[w.target.r][w.target.c] = w.target.type; // Commit to the layout grid
                        w.target = null; // Free up worker
                    }
                }
            } else {
                // Idle behavior: walk back toward the center roadway if no tasks left
                const homeX = (canvas.width / 2);
                const homeY = (canvas.height / 2);
                const dx = homeX - w.x;
                const dy = homeY - w.y;
                const dist = Math.sqrt(dx * dx + dy * dist);
                if (dist > 10) {
                    w.x += (dx / dist) * w.speed;
                    w.y += (dy / dist) * w.speed;
                }
            }
        });

        // Update dust particles
        particles.forEach((p, idx) => {
            p.alpha -= p.decay;
            if(p.alpha <= 0) particles.splice(idx, 1);
        });

        // Switch phase when all scheduled blueprints are complete
        if (!componentsRemaining) {
            currentPhase = PHASES.LIVE;
            phaseTimer = 0;
            workers = []; // Clear builders
            legionUnits = []; // Dissolve incoming regiment formation to mingle into tents
        }
    } 
    // --- PHASE 4: CAMP LIFE ---
    else if (currentPhase === PHASES.LIVE) {
        statusText.innerText = currentPhase;
        statusText.style.color = '#2ecc71';

        // Continuous cooking fire smoke updates over the tents
        if(Math.random() < 0.15) {
            const midRow = Math.floor(ROWS / 2);
            const midCol = Math.floor(COLS / 2);
            particles.push({
                x: (midCol + (Math.random() > 0.5 ? 4 : -4)) * GRID_SIZE + 10,
                y: (midRow + (Math.random() > 0.5 ? 2 : -3)) * GRID_SIZE + 10,
                r: Math.random() * 3 + 1,
                alpha: 1,
                decay: 0.012,
                color: '#bdc3c7'
            });
        }
        
        particles.forEach((p, idx) => {
            p.y -= 0.3;
            p.x += Math.sin(phaseTimer / 15) * 0.1;
            p.alpha -= p.decay;
            if(p.alpha <= 0) particles.splice(idx, 1);
        });

        if (phaseTimer > CAMP_LIVE_DURATION) { 
            currentPhase = PHASES.DEMOLISH;
            phaseTimer = 0;
            
            // Spawn baggage column inside camp preparing to move out
            legionUnits = [];
            const midRow = Math.floor(ROWS / 2);
            const midCol = Math.floor(COLS / 2);
            for(let i = 0; i < 20; i++) {
                legionUnits.push({
                    x: midCol * GRID_SIZE + 7, 
                    y: (midRow + 3) * GRID_SIZE + (i * 15), 
                    color: '#f39c12' // Golden brown baggage train color
                });
            }
        }
    } 
    // --- PHASE 5: PACK UP & DEPART ---
    else if (currentPhase === PHASES.DEMOLISH) {
        statusText.innerText = currentPhase;
        statusText.style.color = '#e74c3c';

        // Tear down step loop backwards smoothly
        if (phaseTimer % 3 === 0) {
            let itemRemoved = false;
            for (let i = activeBlueprints.length - 1; i >= 0; i--) {
                if (activeBlueprints[i].built) {
                    activeBlueprints[i].built = false;
                    grid[activeBlueprints[i].r][activeBlueprints[i].c] = 0;
                    itemRemoved = true;
                    break;
                }
            }
        }
        
        // Move columns up to center artery road and right out the eastern boundary
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

        if (!unitsLeft && phaseTimer > 200) {
            currentPhase = PHASES.MARCH_IN;
            phaseTimer = 0;
            initGrid(); // Regenerate and clear framework structure maps safely for next layout
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Deep canvas background slate tone
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const midRow = Math.floor(ROWS / 2);
    const midCol = Math.floor(COLS / 2);

    // Render underlying military transit roadways
    if(currentPhase !== PHASES.MARCH_IN) {
        ctx.fillStyle = '#2c3a47'; 
        ctx.fillRect(0, midRow * GRID_SIZE + 2, canvas.width, GRID_SIZE - 4);
        ctx.fillRect(midCol * GRID_SIZE + 2, 0, GRID_SIZE - 4, canvas.height);
    }

    // Render Blueprint Foundations during construction phase
    if (currentPhase === PHASES.BUILD) {
        activeBlueprints.forEach(b => {
            if (!b.built) {
                ctx.strokeStyle = 'rgba(241, 196, 15, 0.25)';
                ctx.lineWidth = 1;
                ctx.strokeRect(b.c * GRID_SIZE + 3, b.r * GRID_SIZE + 3, GRID_SIZE - 6, GRID_SIZE - 6);
                
                // Draw tiny partial construction fill bar
                if (b.progress > 0) {
                    ctx.fillStyle = 'rgba(230, 126, 34, 0.4)';
                    const fillHeight = (b.progress / BUILD_WORK_REQUIRED) * (GRID_SIZE - 6);
                    ctx.fillRect(b.c * GRID_SIZE + 4, b.r * GRID_SIZE + 4, GRID_SIZE - 8, fillHeight);
                }
            }
        });
    }

    // Render Completed Structural Cells
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = grid[r][c];
            if (!cell) continue;

            const x = c * GRID_SIZE;
            const y = r * GRID_SIZE;

            if (cell === 'wall') {
                ctx.fillStyle = '#7f8c8d';
                ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
                ctx.strokeStyle = '#d2dae2';
                ctx.strokeRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
            } 
            else if (cell === 'tent') {
                ctx.fillStyle = '#e67e22';
                ctx.beginPath();
                ctx.moveTo(x + 10, y + 3);
                ctx.lineTo(x + 17, y + 17);
                ctx.lineTo(x + 3, y + 17);
                ctx.closePath();
                ctx.fill();
            } 
            else if (cell === 'hq') {
                ctx.fillStyle = '#c0392b';
                ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
                ctx.strokeStyle = '#f1c40f';
                ctx.strokeRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
            }
        }
    }

    // Render Active Working Particles & Smoke
    particles.forEach(p => {
        ctx.fillStyle = p.color || '#fff';
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset canvas context opacity
    });

    // Render Active Column Formations (Soldiers or Baggage carts)
    if(currentPhase === PHASES.MARCH_IN || currentPhase === PHASES.DEMOLISH) {
        legionUnits.forEach(unit => {
            ctx.fillStyle = unit.color;
            ctx.fillRect(unit.x, unit.y, 6, 6);
        });
    }

    // Render Individual Dynamic Worker Dots
    if (currentPhase === PHASES.BUILD) {
        workers.forEach(w => {
            ctx.fillStyle = w.color;
            ctx.beginPath();
            ctx.arc(w.x, w.y, 4, 0, Math.PI * 2);
            ctx.fill();
            // Tiny highlight circle ring around builders
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
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