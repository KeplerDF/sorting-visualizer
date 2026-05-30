// roman-visualizer.js
const canvas = document.getElementById('castrumCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('castrum-status');

const GRID_SIZE = 20; // Size of each cell in pixels
const COLS = canvas.width / GRID_SIZE;
const ROWS = canvas.height / GRID_SIZE;

// Map States
const PHASES = {
    MARCH: 'MARCHING TO SITE',
    SURVEY: 'SURVEYING GRID (CARDO & DECUMANUS)',
    BUILD: 'CONSTRUCTING CASTRUM',
    LIVE: 'ESTABLISHED CAMP LIFE',
    DEMOLISH: 'PACKING BAGGAGE (VAS VASA)'
};

let currentPhase = PHASES.MARCH;
let phaseTimer = 0;
let grid = [];
let particles = [];
let luggageTrain = [];
let buildIndex = 0;
let buildSequence = [];

// Initialize data maps
function initGrid() {
    grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    buildSequence = [];
    buildIndex = 0;
    luggageTrain = [];
    particles = [];

    // Define standard Castrum cross layouts (Decumanus & Cardo)
    const midRow = Math.floor(ROWS / 2);
    const midCol = Math.floor(COLS / 2);
    
    // Boundary constraints for a rectangular Roman Camp
    const startRow = 4, endRow = ROWS - 5;
    const startCol = 8, endCol = COLS - 9;

    // 1. Order queue: Build walls & Gates first
    for(let c = startCol; c <= endCol; c++) {
        if(c === midCol) continue; // Leave gap for gate
        buildSequence.push({r: startRow, c, type: 'wall'});
        buildSequence.push({r: endRow, c, type: 'wall'});
    }
    for(let r = startRow; r <= endRow; r++) {
        if(r === midRow) continue; // Leave gap for gate
        buildSequence.push({r, c: startCol, type: 'wall'});
        buildSequence.push({r, c: endCol, type: 'wall'});
    }

    // 2. Order queue: HQ / Principia in center
    buildSequence.push({r: midRow, c: midCol, type: 'hq'});
    buildSequence.push({r: midRow-1, c: midCol, type: 'hq'});

    // 3. Order queue: Barracks rows (Tentoria)
    for(let r = startRow + 2; r < endRow - 1; r += 2) {
        if(r === midRow || r === midRow - 1) continue;
        for(let c = startCol + 2; c < endCol - 1; c++) {
            if(c === midCol || c === midCol - 1 || c === midCol + 1) continue;
            buildSequence.push({r, c, type: 'tent'});
        }
    }
}

function update() {
    phaseTimer++;

    if (currentPhase === PHASES.MARCH) {
        statusText.innerText = currentPhase;
        statusText.style.color = '#3498db';
        // Simulating single-file soldier march crossing screen
        if (phaseTimer === 1) {
            for(let i = 0; i < 25; i++) {
                luggageTrain.push({ x: -i * 15, y: canvas.height / 2, color: '#e74c3c' });
            }
        }
        luggageTrain.forEach(unit => unit.x += 2);
        
        if (luggageTrain[0].x > canvas.width + 50) {
            currentPhase = PHASES.SURVEY;
            phaseTimer = 0;
            initGrid();
        }
    } 
    else if (currentPhase === PHASES.SURVEY) {
        statusText.innerText = currentPhase;
        statusText.style.color = '#f1c40f';
        if (phaseTimer > 120) { // 2 seconds survey line render
            currentPhase = PHASES.BUILD;
            phaseTimer = 0;
        }
    } 
    else if (currentPhase === PHASES.BUILD) {
        statusText.innerText = currentPhase;
        statusText.style.color = '#e67e22';
        
        // Build 3 structures per frame step for dynamic feel
        for(let i=0; i<3; i++) {
            if(buildIndex < buildSequence.length) {
                const item = buildSequence[buildIndex];
                grid[item.r][item.c] = item.type;
                buildIndex++;
            } else {
                currentPhase = PHASES.LIVE;
                phaseTimer = 0;
                break;
            }
        }
    } 
    else if (currentPhase === PHASES.LIVE) {
        statusText.innerText = currentPhase;
        statusText.style.color = '#2ecc71';

        // Continuous cooking fire smoke updates
        if(Math.random() < 0.15) {
            const midRow = Math.floor(ROWS / 2);
            const midCol = Math.floor(COLS / 2);
            particles.push({
                x: (midCol + (Math.random() > 0.5 ? 3 : -3)) * GRID_SIZE + 10,
                y: (midRow + (Math.random() > 0.5 ? 2 : -2)) * GRID_SIZE + 10,
                r: Math.random() * 3 + 1,
                alpha: 1
            });
        }
        particles.forEach((p, idx) => {
            p.y -= 0.5;
            p.x += Math.sin(phaseTimer / 10) * 0.2;
            p.alpha -= 0.01;
            if(p.alpha <= 0) particles.splice(idx, 1);
        });

        if (phaseTimer > 400) { // Camp thrives for ~6-7 seconds
            currentPhase = PHASES.DEMOLISH;
            phaseTimer = 0;
            // Setup departure column packing out
            luggageTrain = [];
            const midRow = Math.floor(ROWS / 2);
            const midCol = Math.floor(COLS / 2);
            for(let i=0; i<20; i++) {
                luggageTrain.push({
                    x: midCol * GRID_SIZE + 10, 
                    y: midRow * GRID_SIZE + 10 + (i * 12), 
                    color: '#f39c12' 
                });
            }
        }
    } 
    else if (currentPhase === PHASES.DEMOLISH) {
        statusText.innerText = currentPhase;
        statusText.style.color = '#e74c3c';

        // Tear down step loop backwards
        for(let i=0; i<4; i++) {
            if(buildIndex > 0) {
                buildIndex--;
                const item = buildSequence[buildIndex];
                grid[item.r][item.c] = 0;
            }
        }
        
        // Animate the train out of the front gate down the main road axis
        luggageTrain.forEach(mule => {
            if(mule.y > canvas.height/2) mule.y -= 1.5; // Walk up to main avenue cross section
            else mule.x += 2; // Head out straight east out of gate boundary
        });

        if(buildIndex === 0 && luggageTrain[luggageTrain.length-1].x > canvas.width) {
            currentPhase = PHASES.MARCH;
            phaseTimer = 0;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render underlying dirt terrain
    ctx.fillStyle = '#2c3a47';
    ctx.fillRect(0,0, canvas.width, canvas.height);

    const midRow = Math.floor(ROWS / 2);
    const midCol = Math.floor(COLS / 2);

    // Draw Surveyor Cross-Axes Routes (Cardo & Decumanus) during survey/active camp phases
    if(currentPhase !== PHASES.MARCH) {
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.15)';
        ctx.lineWidth = 2;
        // Decumanus Maximus (Horizontal East-West Roadway)
        ctx.beginPath();
        ctx.moveTo(0, midRow * GRID_SIZE + 10);
        ctx.lineTo(canvas.width, midRow * GRID_SIZE + 10);
        ctx.stroke();
        // Cardo Maximus (Vertical North-South Roadway)
        ctx.beginPath();
        ctx.moveTo(midCol * GRID_SIZE + 10, 0);
        ctx.lineTo(midCol * GRID_SIZE + 10, canvas.height);
        ctx.stroke();
    }

    // Render Grid Asset structures
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = grid[r][c];
            if (!cell) continue;

            const x = c * GRID_SIZE;
            const y = r * GRID_SIZE;

            if (cell === 'wall') {
                ctx.fillStyle = '#7f8c8d';
                ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
                ctx.strokeStyle = '#95a5a6';
                ctx.strokeRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
            } 
            else if (cell === 'tent') {
                // Draw triangles representing leather tent profiles from top-down
                ctx.fillStyle = '#d35400';
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

    // Draw active particle nodes (Smoke effects)
    particles.forEach(p => {
        ctx.fillStyle = `rgba(189, 195, 199, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Column Unit Assemblies (Soldiers or Baggage Carts)
    if(currentPhase === PHASES.MARCH || currentPhase === PHASES.DEMOLISH) {
        luggageTrain.forEach(unit => {
            ctx.fillStyle = unit.color;
            ctx.fillRect(unit.x, unit.y, 6, 6);
        });
    }
}

function loop() {
    // Keep engine processing only if tab workspace window is explicitly viewed
    if(document.getElementById('roman-section').style.display !== 'none') {
        update();
        draw();
    }
    requestAnimationFrame(loop);
}

// Fire execution pipeline loop
loop();