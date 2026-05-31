(function() {
    const canvas = document.getElementById('castrumCanvas');
    if (!canvas) return; // Prevent crashing if canvas hasn't loaded yet

    const ctx = canvas.getContext('2d');
    const statusText = document.getElementById('castrum-status');

    canvas.width = 800;
    canvas.height = 500;

    const GRID_SIZE = 20; 
    const COLS = canvas.width / GRID_SIZE; 
    const ROWS = canvas.height / GRID_SIZE; 

    const PHASES = {
        WORLD_MARCH: 'CAMPAIGN MARCH (TRAVERSING WILD FRONTIERS)',
        BUILD: 'OUTPOST DISCOVERED: CONSTRUCTING CASTRUM',
        LIVE: 'ESTABLISHED CAMP LIFE (PATROLS ACTIVE)',
        DEMOLISH: 'BREAKING CAMP (PACKING BAGGAGE TRAIN)'
    };

    const REGIONS = [
        { name: "BRITTANIA FOREST", bg: "#1e3f20", road: "#574028", wall: "#705335", wallStroke: "#543e26", customType: "tower", customColor: "#9c88ff" },
        { name: "HISPANIA OUTBACK", bg: "#8a7355", road: "#c2b280", wall: "#9a8873", wallStroke: "#7a6a57", customType: "granary", customColor: "#f5cd79" },
        { name: "AEGYPTUS DUNES",   bg: "#c2a661", road: "#57534e", wall: "#d4b270", wallStroke: "#b09154", customType: "praetorium", customColor: "#e66767" },
        { name: "GERMANIA WILDWOOD", bg: "#142416", road: "#3d2b1f", wall: "#4a3319", wallStroke: "#302110", customType: "fabrica", customColor: "#f78fb3" }
    ];

    const TENT_COLORS = ['#d35400', '#e67e22', '#ba7c4a', '#d9ad7c', '#a04000'];

    let currentPhase = PHASES.WORLD_MARCH;
    let phaseTimer = 0;
    let activeRegionIndex = 0;

    let biomeGrid = [];
    let riverTiles = [];
    let townTiles = [];
    let campCenter = { r: 12, c: 20 }; 

    let grid = [];
    let particles = [];
    let legionCohort = [];
    let workers = [];
    let patrols = []; 
    let activeBlueprints = [];

    const COHORT_SIZE = 30;
    const WORKER_COUNT = 6;       
    const CAMP_LIVE_DURATION = 800; 

    function generateWorldMap() {
        biomeGrid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
        riverTiles = [];
        townTiles = [];
        
        activeRegionIndex = Math.floor(Math.random() * REGIONS.length);
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let drift = Math.sin(r * 0.5) * 2 + Math.cos(c * 0.5) * 2;
                if (c + drift < COLS * 0.45) {
                    biomeGrid[r][c] = activeRegionIndex;
                } else {
                    biomeGrid[r][c] = (activeRegionIndex + 1) % REGIONS.length;
                }
            }
        }

        let startC = Math.floor(Math.random() * (COLS - 10)) + 5;
        for (let r = 0; r < ROWS; r++) {
            let curveOffset = Math.floor(Math.sin(r * 0.4) * 3);
            let targetC = startC + curveOffset;
            if (targetC >= 0 && targetC < COLS) {
                riverTiles.push({ r, c: targetC });
                riverTiles.push({ r, c: targetC + 1 });
            }
        }

        let townClustersCount = Math.floor(Math.random() * 3) + 2;
        for (let k = 0; k < townClustersCount; k++) {
            let centerR = Math.floor(Math.random() * (ROWS - 6)) + 3;
            let centerC = Math.floor(Math.random() * (COLS - 6)) + 3;
            if (riverTiles.some(t => Math.abs(t.r - centerR) < 2 && Math.abs(t.c - centerC) < 2)) continue;

            for (let i = 0; i < 4; i++) {
                let offsetR = Math.floor(Math.random() * 3) - 1;
                let offsetC = Math.floor(Math.random() * 3) - 1;
                townTiles.push({ r: centerR + offsetR, c: centerC + offsetC });
            }
        }

        let possibleCampFound = false;
        while (!possibleCampFound) {
            let checkR = Math.floor(Math.random() * (ROWS - 12)) + 6;
            let checkC = Math.floor(Math.random() * (COLS - 16)) + 8;
            let riverCollision = riverTiles.some(t => Math.abs(t.r - checkR) < 5 && Math.abs(t.c - checkC) < 6);
            let townCollision = townTiles.some(t => Math.abs(t.r - checkR) < 4 && Math.abs(t.c - checkC) < 5);
            
            if (!riverCollision && !townCollision) {
                campCenter = { r: checkR, c: checkC };
                possibleCampFound = true;
            }
        }
    }

    function initCampBlueprints() {
        grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
        let rawSequence = [];
        activeBlueprints = [];
        particles = [];
        workers = [];
        patrols = [];

        const midRow = campCenter.r;
        const midCol = campCenter.c;
        const startRow = midRow - 4, endRow = midRow + 4;
        const startCol = midCol - 6, endCol = midCol + 6;
        const currentRegion = REGIONS[biomeGrid[midRow][midCol]];

        for(let c = startCol; c <= endCol; c++) {
            if(c === midCol) continue; 
            rawSequence.push({r: startRow, c, type: 'wall', progress: 0, required: Math.floor(Math.random() * 30)+20, built: false});
            rawSequence.push({r: endRow, c, type: 'wall', progress: 0, required: Math.floor(Math.random() * 30)+20, built: false});
        }
        for(let r = startRow; r <= endRow; r++) {
            if(r === midRow) continue; 
            rawSequence.push({r, c: startCol, type: 'wall', progress: 0, required: Math.floor(Math.random() * 30)+20, built: false});
            rawSequence.push({r, c: endCol, type: 'wall', progress: 0, required: Math.floor(Math.random() * 30)+20, built: false});
        }

        rawSequence.push({r: midRow, c: midCol, type: 'hq', progress: 0, required: 45, built: false});
        rawSequence.push({r: midRow-1, c: midCol, type: 'hq', progress: 0, required: 45, built: false});
        rawSequence.push({r: midRow - 1, c: midCol - 2, type: currentRegion.customType, progress: 0, required: 50, built: false});
        rawSequence.push({r: midRow, c: midCol - 2, type: currentRegion.customType, progress: 0, required: 50, built: false});

        for(let r = startRow + 2; r < endRow - 1; r += 2) {
            if(r === midRow || r === midRow - 1) continue;
            for(let c = startCol + 2; c < endCol - 1; c++) {
                if(c === midCol || c === midCol - 1 || c === midCol + 1 || c === midCol - 2) continue;
                const randomColor = TENT_COLORS[Math.floor(Math.random() * TENT_COLORS.length)];
                rawSequence.push({r, c, type: 'tent', progress: 0, required: Math.floor(Math.random() * 25)+20, built: false, color: randomColor});
            }
        }

        while (rawSequence.length > 0) {
            const randomIndex = Math.floor(Math.random() * rawSequence.length);
            activeBlueprints.push(rawSequence.splice(randomIndex, 1)[0]);
        }
    }

    function spawnCohort() {
        legionCohort = [];
        for(let i = 0; i < COHORT_SIZE; i++) {
            legionCohort.push({
                x: -i * 15 - 30,
                y: Math.floor(ROWS / 2) * GRID_SIZE + 10,
                color: '#e74c3c',
                history: []
            });
        }
    }

    function spawnWorkers() {
        for(let i = 0; i < WORKER_COUNT; i++) {
            workers.push({
                x: campCenter.c * GRID_SIZE + 10,
                y: campCenter.r * GRID_SIZE + 10,
                target: null,
                speed: 1.2 + Math.random() * 1.1,
                color: '#3498db'
            });
        }
    }

    function spawnPatrols() {
        const midRow = campCenter.r;
        const midCol = campCenter.c;
        for (let i = 0; i < 3; i++) {
            patrols.push({
                x: midCol * GRID_SIZE + 10,
                y: midRow * GRID_SIZE + 10,
                targetX: null,
                targetY: null,
                pauseTicks: 0,
                speed: 0.6 + Math.random() * 0.7
            });
        }
    }

    function update() {
        phaseTimer++;

        if (currentPhase === PHASES.WORLD_MARCH) {
            if (statusText) {
                statusText.innerText = currentPhase;
                statusText.style.color = '#3498db';
            }

            if (phaseTimer === 1) {
                generateWorldMap();
                spawnCohort();
            }

            const targetX = campCenter.c * GRID_SIZE + 10;
            const targetY = campCenter.r * GRID_SIZE + 10;

            let leader = legionCohort[0];
            let dx = targetX - leader.x;
            let dy = targetY - leader.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            leader.history.unshift({ x: leader.x, y: leader.y });
            if (leader.history.length > 500) leader.history.pop();

            if (distance > 5) {
                let isSteppingOnWater = riverTiles.some(t => Math.floor(leader.y / GRID_SIZE) === t.r && Math.floor(leader.x / GRID_SIZE) === t.c);
                let pace = isSteppingOnWater ? 0.9 : 1.8;

                leader.x += (dx / distance) * pace;
                leader.y += (dy / distance) * pace;
            }

            for (let i = 1; i < legionCohort.length; i++) {
                let follower = legionCohort[i];
                let delayIndex = i * 8;
                if (leader.history[delayIndex]) {
                    follower.x = leader.history[delayIndex].x;
                    follower.y = leader.history[delayIndex].y;
                }
            }

            if (distance <= 5 && phaseTimer > 200) {
                currentPhase = PHASES.BUILD;
                phaseTimer = 0;
                initCampBlueprints();
                spawnWorkers();
            }
        }
        else if (currentPhase === PHASES.BUILD) {
            if (statusText) {
                statusText.innerText = currentPhase;
                statusText.style.color = '#e67e22';
            }
            
            let componentsRemaining = false;

            workers.forEach(w => {
                if (!w.target) {
                    w.target = activeBlueprints.find(b => !b.built && !b.assigned);
                    if (w.target) w.target.assigned = true;
                }

                if (w.target) {
                    componentsRemaining = true;
                    const tx = w.target.c * GRID_SIZE + 10;
                    const ty = w.target.r * GRID_SIZE + 10;
                    
                    const dx = tx - w.x;
                    const dy = ty - w.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > 3) {
                        w.x += (dx / dist) * w.speed;
                        w.y += (dy / dist) * w.speed;
                    } else {
                        w.target.progress++;
                        if (Math.random() < 0.15) {
                            particles.push({
                                x: w.x, y: w.y, r: Math.random() * 1.5 + 0.5,
                                alpha: 0.8, decay: 0.05, color: '#fff'
                            });
                        }

                        if (w.target.progress >= w.target.required) {
                            w.target.built = true;
                            grid[w.target.r][w.target.c] = { type: w.target.type, color: w.target.color || null }; 
                            w.target = null; 
                        }
                    }
                } else {
                    const dx = (campCenter.c * GRID_SIZE + 10) - w.x;
                    const dy = (campCenter.r * GRID_SIZE + 10) - w.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 5) {
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
                legionCohort = []; 
                spawnPatrols(); 
            }
        } 
        else if (currentPhase === PHASES.LIVE) {
            if (statusText) {
                statusText.innerText = currentPhase;
                statusText.style.color = '#2ecc71';
            }

            patrols.forEach(p => {
                if (p.pauseTicks > 0) {
                    p.pauseTicks--;
                    return;
                }

                if (p.targetX === null || p.targetY === null) {
                    p.targetX = (campCenter.c - 6 + Math.floor(Math.random() * 13)) * GRID_SIZE + 10;
                    p.targetY = (campCenter.r - 4 + Math.floor(Math.random() * 9)) * GRID_SIZE + 10;
                }

                let dx = p.targetX - p.x;
                let dy = p.targetY - p.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 4) {
                    p.x += (dx / dist) * p.speed;
                    p.y += (dy / dist) * p.speed;
                } else {
                    p.targetX = null;
                    p.targetY = null;
                    p.pauseTicks = Math.floor(Math.random() * 100) + 40; 
                }
            });

            if(Math.random() < 0.2) {
                particles.push({
                    x: (campCenter.c + (Math.random() > 0.5 ? 2 : -2)) * GRID_SIZE + 10,
                    y: (campCenter.r + (Math.random() > 0.5 ? 1 : -2)) * GRID_SIZE + 10,
                    r: Math.random() * 3 + 1, alpha: 0.9, decay: 0.01,
                    color: Math.random() > 0.9 ? '#e67e22' : '#bdc3c7'
                });
            }
            
            particles.forEach((p, idx) => {
                p.y -= 0.3; p.x += Math.sin(phaseTimer / 10 + p.y) * 0.15;
                p.alpha -= p.decay;
                if(p.alpha <= 0) particles.splice(idx, 1);
            });

            if (phaseTimer > CAMP_LIVE_DURATION) { 
                currentPhase = PHASES.DEMOLISH;
                phaseTimer = 0;
                patrols = []; 
                spawnCohort();
                legionCohort.forEach(u => { u.x = campCenter.c * GRID_SIZE + 10; u.y = campCenter.r * GRID_SIZE + 10; });
            }
        } 
        else if (currentPhase === PHASES.DEMOLISH) {
            if (statusText) {
                statusText.innerText = currentPhase;
                statusText.style.color = '#e74c3c';
            }

            if (phaseTimer % 2 === 0) {
                let standing = activeBlueprints.filter(b => b.built);
                if (standing.length > 0) {
                    let target = standing[Math.floor(Math.random() * standing.length)];
                    target.built = false;
                    grid[target.r][target.c] = 0;
                }
            }
            
            let cohortMoving = false;
            legionCohort.forEach(unit => {
                if (unit.x < canvas.width + 50) {
                    unit.x += 2.0;
                    cohortMoving = true;
                }
            });

            if (!cohortMoving && phaseTimer > 150) {
                currentPhase = PHASES.WORLD_MARCH;
                phaseTimer = 0;
                grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (biomeGrid.length > 0) {
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    ctx.fillStyle = REGIONS[biomeGrid[r][c]].bg;
                    ctx.fillRect(c * GRID_SIZE, r * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                }
            }
        }

        ctx.fillStyle = '#2980b9';
        riverTiles.forEach(t => {
            ctx.fillRect(t.c * GRID_SIZE, t.r * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        });

        ctx.fillStyle = '#9e7a56';
        townTiles.forEach(t => {
            let x = t.c * GRID_SIZE;
            let y = t.r * GRID_SIZE;
            ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
            ctx.strokeStyle = '#5c432b';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
        });

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = grid[r][c];
                if (!cell) continue;

                const x = c * GRID_SIZE;
                const y = r * GRID_SIZE;
                const type = cell.type;
                const currentRegion = REGIONS[biomeGrid[r][c]];

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
                    ctx.moveTo(x + 10, y + 3); ctx.lineTo(x + 17, y + 17); ctx.lineTo(x + 3, y + 17);
                    ctx.closePath(); ctx.fill();
                } 
                else if (type === 'hq') {
                    ctx.fillStyle = '#c0392b'; ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
                    ctx.strokeStyle = '#f1c40f'; ctx.strokeRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
                }
                else if (type === currentRegion.customType) {
                    ctx.fillStyle = currentRegion.customColor;
                    ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
                    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
                    ctx.strokeRect(x + 4, y + 4, GRID_SIZE - 8, GRID_SIZE - 8);
                }
            }
        }

        if (currentPhase === PHASES.BUILD) {
            activeBlueprints.forEach(b => {
                if (!b.built) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.strokeRect(b.c * GRID_SIZE + 3, b.r * GRID_SIZE + 3, GRID_SIZE - 6, GRID_SIZE - 6);
                    if (b.progress > 0) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                        const h = (b.progress / b.required) * (GRID_SIZE - 6);
                        ctx.fillRect(b.c * GRID_SIZE + 4, b.r * GRID_SIZE + 4, GRID_SIZE - 8, h);
                    }
                }
            });
        }

        particles.forEach(p => {
            ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1.0;
        });

        if (currentPhase === PHASES.WORLD_MARCH || currentPhase === PHASES.DEMOLISH) {
            legionCohort.forEach((unit, idx) => {
                ctx.fillStyle = idx === 0 ? '#f1c40f' : unit.color; 
                ctx.fillRect(unit.x - 3, unit.y - 3, 6, 6);
                ctx.fillStyle = '#962d22';
                ctx.fillRect(unit.x + 2, unit.y - 2, 2, 4);
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
                ctx.strokeStyle = '#fff'; ctx.stroke();
                ctx.strokeStyle = 'rgba(155, 89, 182, 0.2)';
                ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, Math.PI * 2); ctx.stroke();
            });
        }
    }

    function loop() {
        const section = document.getElementById('roman-section');
        // Only consume requestAnimationFrame compute ticks if the tab section is visible
        if (section && (section.style.display === 'block' || section.style.display === '')) {
            update();
            draw();
        }
        requestAnimationFrame(loop);
    }

    // Fire off initialization on compile wrapper step
    loop();
})();