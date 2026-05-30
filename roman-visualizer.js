// roman-visualizer.js
const canvas = document.getElementById('castrumCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('castrum-status');

// Explicitly set internal canvas system resolution coordinates
canvas.width = 800;
canvas.height = 500;

const GRID_SIZE = 20; 
const COLS = canvas.width / GRID_SIZE; // 40 columns
const ROWS = canvas.height / GRID_SIZE; // 25 rows

const PHASES = {
    MARCH: 'MARCHING TO SITE',
    SURVEY: 'SURVEYING GRID',
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

// Initialize data structure maps immediately on boot
function initGrid() {
    grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    buildSequence = [];
    buildIndex = 0;
    luggageTrain = [];
    particles = [];

    const midRow = Math.floor(ROWS / 2);
    const midCol = Math.floor(COLS / 2);
    
    const startRow = 4, endRow = ROWS - 5;
    const startCol = 8, endCol = COLS - 9;

    // 1. Queue perimeter defensive works
    for(let c = startCol; c <= endCol; c++) {
        if(c === midCol) continue; 
        buildSequence.push({r: startRow, c, type: 'wall'});
        buildSequence.push({r: endRow, c, type: 'wall'});
    }
    for(let r = startRow; r <= endRow; r++) {
        if(r === midRow) continue; 
        buildSequence.push({r, c: startCol, type: 'wall'});
        buildSequence.push({r, c: endCol, type: 'wall'});
    }

    // 2. Queue Central Command Structures
    buildSequence.push({r: midRow, c: midCol, type: 'hq'});
    buildSequence.push({r: midRow-1, c: midCol, type: 'hq'});

    // 3. Queue Barracks grid arrays (Tentoria)
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
        
        if (phaseTimer === 1) {
            luggageTrain = [];
            for(let i = 0; i < 20; i++) {
                luggageTrain.push({ x: -i * 20 - 20, y: Math.floor(ROWS/2) * GRID_SIZE + 7, color: '#e74c3c' });
            }
        }
        
        let allLeft = true;
        luggageTrain.forEach(unit => {
            unit.x += 3;
            if (unit.x < canvas.width + 20) allLeft = false;
        });
        
        if (allLeft && phaseTimer > 100) {
            currentPhase = PHASES.SURVEY;
            phaseTimer = 0;
        }
    } 
    else if (currentPhase === PHASES.SURVEY) {
        statusText.innerText = currentPhase;
        statusText.style.color = '#f1c40f';
        if (phaseTimer > 90) { 
            currentPhase = PHASES.BUILD;
            phaseTimer = 0;
        }
    } 
    else if (currentPhase === PHASES.BUILD) {
        statusText.innerText = currentPhase;
        statusText.style.color = '#e67e22';
        
        // Construct 2 assets per frame cycle
        for(let i = 0; i < 2; i++) {
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

        // Animate drifting camp smoke particles
        if(Math.random() < 0.15) {
            const midRow = Math.floor(ROWS / 2);
            const midCol = Math.floor(COLS / 2);
            particles.push({
                x: (midCol + (Math.random() > 0.5 ? 4 : -4)) * GRID_SIZE + 10,
                y: (midRow + (Math.random() > 0.5 ? 2 : -3)) * GRID_SIZE + 10,
                r: Math.random() * 3 + 1,
                alpha: 1
            });
        }
        particles.forEach((p, idx) => {
            p.y -= 0.4;
            p.alpha -= 0.015;
            if(p.alpha <= 0) particles.splice(idx, 1);
        });

        if (phaseTimer > 300) { 
            currentPhase = PHASES.DEMOLISH;
            phaseTimer = 0;
            
            // Spawn baggage column moving outward
            luggageTrain = [];
            const midRow = Math.floor(ROWS / 2);
            const midCol = Math.floor(COLS / 2);
            for(let i = 0; i < 15; i++) {
                luggageTrain.push({
                    x: midCol * GRID_SIZE + 7, 
                    y: (midRow + 3) * GRID_SIZE + (i * 15), 
                    color: '#f39c12' 
                });
            }
        }
    } 
    else if (currentPhase === PHASES.DEMOLISH) {
        statusText.innerText = currentPhase;
        statusText.style.color = '#e74c3c';

        // Fast clean teardown loops
        for(let i = 0; i < 3; i++) {
            if(buildIndex > 0) {
                buildIndex--;
                const item = buildSequence[buildIndex];
                grid[item.r][item.c] = 0;
            }
        }
        
        luggageTrain.forEach(unit => {
            if(unit.y > Math.floor(ROWS/2) * GRID_SIZE + 7) unit.y -= 2; 
            else unit.x += 3; 
        });

        if(buildIndex === 0 && (luggageTrain.length === 0 || luggageTrain[luggageTrain.length - 1].x > canvas.width)) {
            currentPhase = PHASES.MARCH;
            phaseTimer = 0;
            initGrid();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Deep slate background color matching your screenshot
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const midRow = Math.floor(ROWS / 2);
    const midCol = Math.floor(COLS / 2);

    // Draw main axes layout roadways (Cardo and Decumanus)
    if(currentPhase !== PHASES.MARCH) {
        ctx.fillStyle = '#2c3a47'; // Roadway fill lane
        ctx.fillRect(0, midRow * GRID_SIZE + 2, canvas.width, GRID_SIZE - 4);
        ctx.fillRect(midCol * GRID_SIZE + 2, 0, GRID_SIZE - 4, canvas.height);
    }

    // Render Grid Objects
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

    // Draw particles
    particles.forEach(p => {
        ctx.fillStyle = `rgba(211, 214, 219, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw marching unit positions
    if(currentPhase === PHASES.MARCH || currentPhase === PHASES.DEMOLISH) {
        luggageTrain.forEach(unit => {
            ctx.fillStyle = unit.color;
            ctx.fillRect(unit.x, unit.y, 6, 6);
        });
    }
}

function loop() {
    const section = document.getElementById('roman-section');
    
    // Explicit visibility state validation checking 
    if (section && (section.style.display === 'block' || section.style.display === '')) {
        update();
        draw();
    }
    requestAnimationFrame(loop);
}

// Initial bootstrap execution triggers
initGrid();
loop();