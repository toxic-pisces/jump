import { Platform } from '../entities/Platform.js';
import { CrumblingPlatform } from '../entities/CrumblingPlatform.js';
import { GluePlatform } from '../entities/GluePlatform.js';
import { BlinkingPlatform } from '../entities/BlinkingPlatform.js';
import { Turret } from '../entities/Turret.js';

export class LevelEditor {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        this.ctx = canvas.getContext('2d');

        this.isActive = false;
        this.isTesting = false; // Track if we're testing a level
        this.currentTool = 'platform';
        this.gridSize = 20;

        // All element arrays
        this.platforms = [];
        this.gluePlatforms = [];
        this.crumblingPlatforms = [];
        this.blinkingPlatforms = [];
        this.spikes = [];
        this.movingSpikes = [];
        this.turrets = [];
        this.blackHoles = [];

        this.start = { x: 50, y: 600, width: 80, height: 100 };
        this.goal = { x: 1070, y: 50, width: 80, height: 100 };

        this.isDragging = false;
        this.dragStart = null;
        this.currentShape = null;
        this.hoveredElement = null;
        this.selectedElement = null;
        this.draggedElement = null; // Track which element is being dragged
        this.dragOffset = { x: 0, y: 0 }; // Offset from element corner to mouse

        this.mouseHandler = null;
        this.moveHandler = null;
        this.upHandler = null;

        this.currentWorld = 1;
        this.currentLevelNumber = null;
        this.levelName = 'Custom Level';
        this.threeStarTime = 10;
        this.twoStarTime = 15;

        this.listenersSetup = false; // Track if listeners are already set up

        // Store original canvas size for scaling
        this.originalWidth = 1200;
        this.originalHeight = 700;
        this.editorScale = 0.65; // Scale down to 65% when editing

        this.setupUI();
    }

    setupUI() {
        // Check if sidebar already exists
        let sidebar = document.getElementById('editor-sidebar');
        if (!sidebar) {
            sidebar = document.createElement('div');
            sidebar.id = 'editor-sidebar';
            sidebar.innerHTML = `
                <div class="editor-header">LEVEL EDITOR</div>

                <div class="editor-section">
                    <div class="section-title">LOAD LEVEL</div>
                    <select id="worldSelect" style="width: 100%; padding: 8px; margin-bottom: 8px; font-family: 'Press Start 2P'; font-size: 8px;">
                        <option value="0">New Level</option>
                        <option value="1">World 1</option>
                        <option value="2">World 2</option>
                        <option value="3">World 3</option>
                    </select>
                    <select id="levelSelect" style="width: 100%; padding: 8px; font-family: 'Press Start 2P'; font-size: 8px;">
                        <option value="0">Select Level...</option>
                    </select>
                    <button class="action-btn" id="loadLevelBtn" style="width: 100%; margin-top: 8px;">LOAD LEVEL</button>
                </div>

                <div class="editor-section">
                    <div class="section-title">TOOLS</div>
                    <button class="tool-btn active" data-tool="platform">Platform</button>
                    <button class="tool-btn" data-tool="gluePlatform">Glue Platform</button>
                    <button class="tool-btn" data-tool="crumblingPlatform">Crumbling</button>
                    <button class="tool-btn" data-tool="blinkingPlatform">Blinking</button>
                    <button class="tool-btn" data-tool="spike">Spike</button>
                    <button class="tool-btn" data-tool="movingSpike">Moving Spike</button>
                    <button class="tool-btn" data-tool="turret">Turret</button>
                    <button class="tool-btn" data-tool="blackHole">Black Hole</button>
                    <button class="tool-btn" data-tool="start">Start Position</button>
                    <button class="tool-btn" data-tool="goal">Goal Position</button>
                </div>

                <div class="editor-section" id="propertyPanel" style="display: none;">
                    <div class="section-title">PROPERTIES</div>
                    <div id="propertyContent"></div>
                </div>

                <div class="editor-section">
                    <div class="section-title">LEVEL SETTINGS</div>
                    <label>Level Name:
                        <input type="text" id="levelName" value="Custom Level" />
                    </label>
                    <label>3 Star Time (sec):
                        <input type="number" id="threeStarTime" value="10" min="1" />
                    </label>
                    <label>2 Star Time (sec):
                        <input type="number" id="twoStarTime" value="15" min="1" />
                    </label>
                </div>

                <div class="editor-section">
                    <div class="section-title">ACTIONS</div>
                    <button class="action-btn" id="testBtn">▶ Test Level</button>
                    <button class="action-btn primary" id="exportJsBtn">💾 Download .JS File</button>
                    <button class="action-btn" id="saveBtn">📦 Save as Custom</button>
                    <button class="action-btn" id="clearBtn" style="background: #FF6B6B;">🗑️ Clear All</button>
                </div>

                <div class="editor-section">
                    <div class="section-title">CONTROLS</div>
                    <div class="controls-text">
                        • Click & Drag to place<br>
                        • Click element to drag/select<br>
                        • Delete/Backspace to remove<br>
                        • ESC to close editor<br>
                        • Grid: ${this.gridSize}px
                    </div>
                </div>
            `;

            // Append to body instead of ui-overlay so it sits beside the game container
            document.body.appendChild(sidebar);
        }

        // Only setup listeners once
        if (!this.listenersSetup) {
            this.setupEventListeners();
            this.listenersSetup = true;
        }

        // Delete key handler (Delete or Backspace)
        if (!this.deleteKeyHandler) {
            this.deleteKeyHandler = (e) => {
                if (this.isActive && (e.code === 'Delete' || e.code === 'Backspace') && this.selectedElement) {
                    e.preventDefault(); // Prevent browser back navigation
                    this.deleteSelectedElement();
                }
            };
            window.addEventListener('keydown', this.deleteKeyHandler);
        }
    }

    setupEventListeners() {
        const sidebar = document.getElementById('editor-sidebar');
        if (!sidebar) return;

        // Tool buttons
        sidebar.querySelectorAll('.tool-btn').forEach(btn => {
            btn.onclick = () => {
                sidebar.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
                this.selectedElement = null;
                this.updatePropertyPanel();
            };
        });

        // World selection updates level dropdown - using onchange instead of addEventListener
        const worldSelect = document.getElementById('worldSelect');
        if (worldSelect) {
            worldSelect.onchange = (e) => {
                this.populateLevelDropdown(parseInt(e.target.value));
            };
        }

        // Action buttons - using onclick instead of addEventListener
        const loadBtn = document.getElementById('loadLevelBtn');
        const clearBtn = document.getElementById('clearBtn');
        const exportBtn = document.getElementById('exportJsBtn');
        const testBtn = document.getElementById('testBtn');
        const saveBtn = document.getElementById('saveBtn');

        if (loadBtn) loadBtn.onclick = () => this.loadSelectedLevel();
        if (clearBtn) clearBtn.onclick = () => this.clear();
        if (exportBtn) exportBtn.onclick = () => this.exportToJS();
        if (testBtn) testBtn.onclick = () => this.testLevel();
        if (saveBtn) saveBtn.onclick = () => this.saveLevel();
    }

    populateLevelDropdown(world) {
        const levelSelect = document.getElementById('levelSelect');
        if (!levelSelect) {
            console.error('levelSelect element not found!');
            return;
        }

        // Clear existing options
        levelSelect.innerHTML = '<option value="0">Select Level...</option>';

        if (world === 0) return;

        const levelCount = world === 3 ? 3 : 9; // World 3 nur 3 Level
        for (let i = 1; i <= levelCount; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = world === 1 ? `Level ${i}` : `World ${world}-${i}`;
            levelSelect.appendChild(option);
        }

        console.log(`Populated ${levelCount} levels for World ${world}`);
    }

    loadSelectedLevel() {
        const world = parseInt(document.getElementById('worldSelect').value);
        const levelNum = parseInt(document.getElementById('levelSelect').value);

        if (world === 0 || levelNum === 0) {
            alert('Please select a world and level!');
            return;
        }

        this.currentWorld = world;
        this.currentLevelNumber = levelNum;

        // Get level class
        let LevelClass;
        if (world === 1) {
            LevelClass = this.game.levelSelect.levelClasses[levelNum];
        } else if (world === 2) {
            LevelClass = this.game.levelSelect.world2LevelClasses[levelNum];
        } else if (world === 3) {
            LevelClass = this.game.levelSelect.world3LevelClasses[levelNum];
        }

        if (!LevelClass) {
            alert('Level not found!');
            return;
        }

        const level = new LevelClass();
        this.loadLevelData(level);

        alert(`Loaded: ${level.name}`);
    }

    loadLevelData(level) {
        // Clear existing
        this.platforms = [];
        this.gluePlatforms = [];
        this.crumblingPlatforms = [];
        this.blinkingPlatforms = [];
        this.spikes = [];
        this.movingSpikes = [];
        this.turrets = [];
        this.blackHoles = [];

        // Load level data
        this.levelName = level.name || 'Custom Level';
        this.threeStarTime = level.threeStarTime || 10;
        this.twoStarTime = level.twoStarTime || 15;
        this.start = { ...level.start };
        this.goal = { ...level.goal };

        // Load platforms
        if (level.platforms) {
            level.platforms.forEach(p => {
                this.platforms.push({ x: p.x, y: p.y, width: p.width, height: p.height });
            });
        }

        // Load glue platforms
        if (level.gluePlatforms) {
            level.gluePlatforms.forEach(p => {
                this.gluePlatforms.push({
                    x: p.x, y: p.y, width: p.width, height: p.height,
                    glueFactor: p.glueFactor || 0.4
                });
            });
        }

        // Load crumbling platforms
        if (level.crumblingPlatforms) {
            level.crumblingPlatforms.forEach(p => {
                this.crumblingPlatforms.push({ x: p.x, y: p.y, width: p.width, height: p.height });
            });
        }

        // Load blinking platforms
        if (level.blinkingPlatforms) {
            level.blinkingPlatforms.forEach(p => {
                this.blinkingPlatforms.push({
                    x: p.x, y: p.y, width: p.width, height: p.height,
                    interval: p.interval || 2.0,
                    startVisible: p.startVisible !== undefined ? p.startVisible : true
                });
            });
        }

        // Load spikes
        if (level.spikes) {
            this.spikes = level.spikes.map(s => ({ ...s }));
        }

        // Load moving spikes
        if (level.movingSpikes) {
            this.movingSpikes = level.movingSpikes.map(ms => ({ ...ms }));
        }

        // Load turrets
        if (level.turrets) {
            level.turrets.forEach(t => {
                this.turrets.push({
                    x: t.x, y: t.y, width: t.width || 40, height: t.height || 40,
                    shootDirection: t.shootDirection,
                    fireRate: t.fireRate
                });
            });
        }

        // Load black holes
        if (level.blackHoles) {
            this.blackHoles = level.blackHoles.map(bh => ({ ...bh }));
        }

        // Update UI
        document.getElementById('levelName').value = this.levelName;
        document.getElementById('threeStarTime').value = this.threeStarTime;
        document.getElementById('twoStarTime').value = this.twoStarTime;
    }

    setupMouseHandlers() {
        // Remove old handlers
        if (this.mouseHandler) {
            this.canvas.removeEventListener('mousedown', this.mouseHandler);
        }
        if (this.moveHandler) {
            this.canvas.removeEventListener('mousemove', this.moveHandler);
        }
        if (this.upHandler) {
            this.canvas.removeEventListener('mouseup', this.upHandler);
        }

        // New handlers
        this.mouseHandler = (e) => this.onMouseDown(e);
        this.moveHandler = (e) => this.onMouseMove(e);
        this.upHandler = (e) => this.onMouseUp(e);

        this.canvas.addEventListener('mousedown', this.mouseHandler);
        this.canvas.addEventListener('mousemove', this.moveHandler);
        this.canvas.addEventListener('mouseup', this.upHandler);
    }

    removeMouseHandlers() {
        if (this.mouseHandler) {
            this.canvas.removeEventListener('mousedown', this.mouseHandler);
        }
        if (this.moveHandler) {
            this.canvas.removeEventListener('mousemove', this.moveHandler);
        }
        if (this.upHandler) {
            this.canvas.removeEventListener('mouseup', this.upHandler);
        }
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        // Convert screen coordinates to canvas coordinates
        // Account for CSS scaling (canvas internal resolution vs display size)
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    getGridPos(x, y) {
        return {
            x: Math.floor(x / this.gridSize) * this.gridSize,
            y: Math.floor(y / this.gridSize) * this.gridSize
        };
    }

    findElementAtPosition(x, y) {
        const arrays = [
            { arr: this.platforms, type: 'platform' },
            { arr: this.gluePlatforms, type: 'gluePlatform' },
            { arr: this.crumblingPlatforms, type: 'crumblingPlatform' },
            { arr: this.blinkingPlatforms, type: 'blinkingPlatform' },
            { arr: this.spikes, type: 'spike' },
            { arr: this.movingSpikes, type: 'movingSpike' },
            { arr: this.turrets, type: 'turret' },
            { arr: this.blackHoles, type: 'blackHole' }
        ];

        for (const { arr, type } of arrays) {
            for (let i = arr.length - 1; i >= 0; i--) {
                if (this.isPointInRect(x, y, arr[i])) {
                    return { type, index: i, array: arr };
                }
            }
        }

        return null;
    }

    onMouseDown(e) {
        if (!this.isActive) return;

        const mousePos = this.getMousePos(e);
        const gridPos = this.getGridPos(mousePos.x, mousePos.y);

        const clickedElement = this.findElementAtPosition(mousePos.x, mousePos.y);

        // If clicking on an existing element, start dragging it
        if (clickedElement) {
            this.selectedElement = clickedElement;
            this.draggedElement = clickedElement;

            const el = clickedElement.array[clickedElement.index];
            this.dragOffset = {
                x: mousePos.x - el.x,
                y: mousePos.y - el.y
            };

            this.updatePropertyPanel();
            return;
        }

        this.selectedElement = null;
        this.updatePropertyPanel();

        // Place new elements
        if (this.currentTool === 'start') {
            this.start.x = gridPos.x;
            this.start.y = gridPos.y;
        } else if (this.currentTool === 'goal') {
            this.goal.x = gridPos.x;
            this.goal.y = gridPos.y;
        } else if (this.currentTool === 'turret') {
            this.turrets.push({
                x: gridPos.x,
                y: gridPos.y,
                width: 40,
                height: 40,
                shootDirection: 'right',
                fireRate: 2.5
            });
        } else if (this.currentTool === 'blackHole') {
            this.blackHoles.push({
                x: gridPos.x,
                y: gridPos.y,
                width: 60,
                height: 60,
                pullRadius: 350,
                pullStrength: 800,
                killRadius: 40
            });
        } else {
            // Creating new shape by dragging
            this.isDragging = true;
            this.dragStart = gridPos;
        }
    }

    onMouseMove(e) {
        if (!this.isActive) return;

        const mousePos = this.getMousePos(e);
        this.hoveredElement = this.findElementAtPosition(mousePos.x, mousePos.y);

        // Change cursor when hovering over elements
        this.canvas.style.cursor = this.hoveredElement ? 'move' : 'crosshair';

        // If dragging an existing element, move it
        if (this.draggedElement) {
            const el = this.draggedElement.array[this.draggedElement.index];
            const gridPos = this.getGridPos(mousePos.x - this.dragOffset.x, mousePos.y - this.dragOffset.y);
            el.x = gridPos.x;
            el.y = gridPos.y;

            // Update startX/endX for moving spikes
            if (this.draggedElement.type === 'movingSpike') {
                const deltaX = gridPos.x - el.x;
                el.startX = gridPos.x;
                el.endX += deltaX;
            }
            return;
        }

        // If creating a new shape by dragging
        if (!this.isDragging) return;

        const gridPos = this.getGridPos(mousePos.x, mousePos.y);

        const width = Math.max(this.gridSize, Math.abs(gridPos.x - this.dragStart.x) + this.gridSize);
        const height = Math.max(this.gridSize, Math.abs(gridPos.y - this.dragStart.y) + this.gridSize);
        const startX = Math.min(gridPos.x, this.dragStart.x);
        const startY = Math.min(gridPos.y, this.dragStart.y);

        this.currentShape = { x: startX, y: startY, width, height };
    }

    onMouseUp(e) {
        if (!this.isActive) return;

        // Stop dragging an element
        if (this.draggedElement) {
            this.draggedElement = null;
            this.updatePropertyPanel(); // Update property panel with new position
            return;
        }

        // Finish creating new shape
        if (!this.isDragging) return;
        this.isDragging = false;

        if (!this.currentShape) return;

        if (this.currentTool === 'platform') {
            this.platforms.push({ ...this.currentShape });
        } else if (this.currentTool === 'gluePlatform') {
            this.gluePlatforms.push({ ...this.currentShape, glueFactor: 0.4 });
        } else if (this.currentTool === 'crumblingPlatform') {
            this.crumblingPlatforms.push({ ...this.currentShape });
        } else if (this.currentTool === 'blinkingPlatform') {
            this.blinkingPlatforms.push({ ...this.currentShape, interval: 2.0, startVisible: true });
        } else if (this.currentTool === 'spike') {
            this.spikes.push({ ...this.currentShape });
        } else if (this.currentTool === 'movingSpike') {
            this.movingSpikes.push({
                ...this.currentShape,
                startX: this.currentShape.x,
                endX: this.currentShape.x + 200,
                speed: 150,
                direction: 1
            });
        }

        this.currentShape = null;
    }

    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }

    deleteSelectedElement() {
        if (!this.selectedElement) return;

        this.selectedElement.array.splice(this.selectedElement.index, 1);
        this.selectedElement = null;
        this.updatePropertyPanel();
    }

    updatePropertyPanel() {
        const panel = document.getElementById('propertyPanel');
        const content = document.getElementById('propertyContent');

        if (!this.selectedElement) {
            panel.style.display = 'none';
            return;
        }

        panel.style.display = 'block';
        const el = this.selectedElement.array[this.selectedElement.index];

        let html = `<div style="margin-bottom: 10px; color: #FFB3D9;">${this.selectedElement.type.toUpperCase()}</div>`;

        // Common properties
        html += `<label>X: <input type="number" id="prop-x" value="${Math.round(el.x)}" step="10" /></label>`;
        html += `<label>Y: <input type="number" id="prop-y" value="${Math.round(el.y)}" step="10" /></label>`;
        html += `<label>Width: <input type="number" id="prop-width" value="${el.width}" step="10" /></label>`;
        html += `<label>Height: <input type="number" id="prop-height" value="${el.height}" step="10" /></label>`;

        // Type-specific properties
        if (this.selectedElement.type === 'gluePlatform') {
            html += `<label>Glue Factor: <input type="number" id="prop-glueFactor" value="${el.glueFactor}" step="0.05" min="0" max="1" /></label>`;
        }

        if (this.selectedElement.type === 'blinkingPlatform') {
            html += `<label>Interval (s): <input type="number" id="prop-interval" value="${el.interval}" step="0.1" min="0.5" /></label>`;
            html += `<label>Start Visible: <input type="checkbox" id="prop-startVisible" ${el.startVisible ? 'checked' : ''} /></label>`;
        }

        if (this.selectedElement.type === 'turret') {
            html += `<label>Direction:
                <select id="prop-shootDirection">
                    <option value="left" ${el.shootDirection === 'left' ? 'selected' : ''}>Left</option>
                    <option value="right" ${el.shootDirection === 'right' ? 'selected' : ''}>Right</option>
                    <option value="up" ${el.shootDirection === 'up' ? 'selected' : ''}>Up</option>
                    <option value="down" ${el.shootDirection === 'down' ? 'selected' : ''}>Down</option>
                </select>
            </label>`;
            html += `<label>Fire Rate: <input type="number" id="prop-fireRate" value="${el.fireRate}" step="0.1" min="0.5" /></label>`;
        }

        if (this.selectedElement.type === 'blackHole') {
            html += `<label>Pull Radius: <input type="number" id="prop-pullRadius" value="${el.pullRadius}" step="10" /></label>`;
            html += `<label>Pull Strength: <input type="number" id="prop-pullStrength" value="${el.pullStrength}" step="50" /></label>`;
            html += `<label>Kill Radius: <input type="number" id="prop-killRadius" value="${el.killRadius}" step="5" /></label>`;
        }

        if (this.selectedElement.type === 'movingSpike') {
            html += `<label>Start X: <input type="number" id="prop-startX" value="${el.startX}" step="10" /></label>`;
            html += `<label>End X: <input type="number" id="prop-endX" value="${el.endX}" step="10" /></label>`;
            html += `<label>Speed: <input type="number" id="prop-speed" value="${el.speed}" step="10" /></label>`;
        }

        html += `<button class="action-btn" id="applyPropsBtn" style="width: 100%; margin-top: 10px;">APPLY</button>`;
        html += `<button class="action-btn" id="deleteElBtn" style="width: 100%; margin-top: 5px; background: #FF6B6B;">DELETE</button>`;

        content.innerHTML = html;

        // Apply button
        setTimeout(() => {
            document.getElementById('applyPropsBtn')?.addEventListener('click', () => {
                this.applyProperties();
            });
            document.getElementById('deleteElBtn')?.addEventListener('click', () => {
                this.deleteSelectedElement();
            });
        }, 0);
    }

    applyProperties() {
        if (!this.selectedElement) return;

        const el = this.selectedElement.array[this.selectedElement.index];

        el.x = parseFloat(document.getElementById('prop-x').value);
        el.y = parseFloat(document.getElementById('prop-y').value);
        el.width = parseFloat(document.getElementById('prop-width').value);
        el.height = parseFloat(document.getElementById('prop-height').value);

        if (this.selectedElement.type === 'gluePlatform') {
            el.glueFactor = parseFloat(document.getElementById('prop-glueFactor').value);
        }

        if (this.selectedElement.type === 'blinkingPlatform') {
            el.interval = parseFloat(document.getElementById('prop-interval').value);
            el.startVisible = document.getElementById('prop-startVisible').checked;
        }

        if (this.selectedElement.type === 'turret') {
            el.shootDirection = document.getElementById('prop-shootDirection').value;
            el.fireRate = parseFloat(document.getElementById('prop-fireRate').value);
        }

        if (this.selectedElement.type === 'blackHole') {
            el.pullRadius = parseFloat(document.getElementById('prop-pullRadius').value);
            el.pullStrength = parseFloat(document.getElementById('prop-pullStrength').value);
            el.killRadius = parseFloat(document.getElementById('prop-killRadius').value);
        }

        if (this.selectedElement.type === 'movingSpike') {
            el.startX = parseFloat(document.getElementById('prop-startX').value);
            el.endX = parseFloat(document.getElementById('prop-endX').value);
            el.speed = parseFloat(document.getElementById('prop-speed').value);
        }

        alert('Properties updated!');
    }

    clear() {
        if (confirm('Clear all elements?')) {
            this.platforms = [];
            this.gluePlatforms = [];
            this.crumblingPlatforms = [];
            this.blinkingPlatforms = [];
            this.spikes = [];
            this.movingSpikes = [];
            this.turrets = [];
            this.blackHoles = [];
            this.selectedElement = null;
            this.updatePropertyPanel();
        }
    }

    exportToJS() {
        const levelData = this.generateLevelObject();
        const world = this.currentWorld;
        const levelNum = this.currentLevelNumber || 'Custom';

        let code = this.generateJavaScriptCode(levelData, world, levelNum);

        // Download file
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = world === 1 ? `Level${levelNum}.js` : `World2Level${levelNum}.js`;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        alert(`✅ Exported: ${filename}\n\n📁 Replace the file in:\nsrc/levels/${filename}\n\nThen refresh the browser!`);
    }

    generateJavaScriptCode(level, world, levelNum) {
        let imports = [`import { Platform } from '../entities/Platform.js';`];

        if (level.gluePlatforms && level.gluePlatforms.length > 0) {
            imports.push(`import { GluePlatform } from '../entities/GluePlatform.js';`);
        }
        if (level.crumblingPlatforms && level.crumblingPlatforms.length > 0) {
            imports.push(`import { CrumblingPlatform } from '../entities/CrumblingPlatform.js';`);
        }
        if (level.turrets && level.turrets.length > 0) {
            imports.push(`import { Turret } from '../entities/Turret.js';`);
        }

        const className = world === 1 ? `Level${levelNum}` : `World2Level${levelNum}`;

        let code = imports.join('\n') + '\n\n';
        code += `export class ${className} {\n`;
        code += `    constructor() {\n`;
        code += `        this.name = "${level.name}";\n`;
        if (world === 2) {
            code += `        this.world = 2;\n`;
        }
        code += `        this.start = { x: ${level.start.x}, y: ${level.start.y}, width: ${level.start.width}, height: ${level.start.height} };\n`;
        code += `        this.goal = { x: ${level.goal.x}, y: ${level.goal.y}, width: ${level.goal.width}, height: ${level.goal.height} };\n\n`;
        code += `        this.threeStarTime = ${level.threeStarTime};\n`;
        code += `        this.twoStarTime = ${level.twoStarTime};\n\n`;

        // Platforms
        code += `        this.platforms = [\n`;
        level.platforms.forEach(p => {
            code += `            new Platform(${p.x}, ${p.y}, ${p.width}, ${p.height}),\n`;
        });
        code += `        ];\n\n`;

        // Glue Platforms
        code += `        this.gluePlatforms = [\n`;
        if (level.gluePlatforms && level.gluePlatforms.length > 0) {
            level.gluePlatforms.forEach(p => {
                code += `            new GluePlatform(${p.x}, ${p.y}, ${p.width}, ${p.height}, ${p.glueFactor}),\n`;
            });
        }
        code += `        ];\n\n`;

        // Crumbling Platforms
        code += `        this.crumblingPlatforms = [\n`;
        if (level.crumblingPlatforms && level.crumblingPlatforms.length > 0) {
            level.crumblingPlatforms.forEach(p => {
                code += `            new CrumblingPlatform(${p.x}, ${p.y}, ${p.width}, ${p.height}),\n`;
            });
        }
        code += `        ];\n\n`;

        // Blinking Platforms
        code += `        this.blinkingPlatforms = [\n`;
        if (level.blinkingPlatforms && level.blinkingPlatforms.length > 0) {
            level.blinkingPlatforms.forEach(p => {
                code += `            new BlinkingPlatform(${p.x}, ${p.y}, ${p.width}, ${p.height}, ${p.interval}, ${p.startVisible}),\n`;
            });
        }
        code += `        ];\n\n`;

        // Spikes
        code += `        this.spikes = [\n`;
        if (level.spikes) {
            level.spikes.forEach(s => {
                code += `            { x: ${s.x}, y: ${s.y}, width: ${s.width}, height: ${s.height} },\n`;
            });
        }
        code += `        ];\n\n`;

        // Black Holes
        code += `        this.blackHoles = [\n`;
        if (level.blackHoles && level.blackHoles.length > 0) {
            level.blackHoles.forEach(bh => {
                code += `            {\n`;
                code += `                x: ${bh.x},\n`;
                code += `                y: ${bh.y},\n`;
                code += `                width: ${bh.width},\n`;
                code += `                height: ${bh.height},\n`;
                code += `                pullRadius: ${bh.pullRadius},\n`;
                code += `                pullStrength: ${bh.pullStrength},\n`;
                code += `                killRadius: ${bh.killRadius}\n`;
                code += `            },\n`;
            });
        }
        code += `        ];\n\n`;

        // Turrets
        code += `        this.turrets = [\n`;
        if (level.turrets && level.turrets.length > 0) {
            level.turrets.forEach(t => {
                code += `            new Turret(${t.x}, ${t.y}, '${t.shootDirection}', ${t.fireRate}),\n`;
            });
        }
        code += `        ];\n\n`;

        // Moving Spikes
        code += `        this.movingSpikes = [\n`;
        if (level.movingSpikes) {
            level.movingSpikes.forEach(ms => {
                code += `            {\n`;
                code += `                x: ${ms.x},\n`;
                code += `                y: ${ms.y},\n`;
                code += `                width: ${ms.width},\n`;
                code += `                height: ${ms.height},\n`;
                code += `                startX: ${ms.startX},\n`;
                code += `                endX: ${ms.endX},\n`;
                code += `                speed: ${ms.speed},\n`;
                code += `                direction: ${ms.direction}\n`;
                code += `            },\n`;
            });
        }
        code += `        ];\n`;

        code += `    }\n`;
        code += `}\n`;

        return code;
    }

    testLevel() {
        const levelData = this.generateLevelObject();
        this.game.currentLevel = levelData;
        this.game.currentLevelNumber = 0;
        this.game.currentWorld = this.currentWorld;
        this.game.levelInfoElement.textContent = levelData.name;

        // Set theme
        document.body.className = this.currentWorld === 3 ? 'world-3' :
                                  this.currentWorld === 2 ? 'world-2' : 'world-1';

        // Restore original canvas size before testing
        this.canvas.width = this.originalWidth;
        this.canvas.height = this.originalHeight;
        this.canvas.style.width = `${this.originalWidth}px`;
        this.canvas.style.height = `${this.originalHeight}px`;

        // Restore body layout
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';

        // Restore container
        const container = document.getElementById('game-container');
        container.style.margin = '';
        container.style.marginRight = '';
        container.style.flexShrink = '';

        // Restore sidebar position
        const sidebar = document.getElementById('editor-sidebar');
        sidebar.style.position = 'absolute';
        sidebar.style.height = '100%';
        sidebar.style.maxHeight = '';
        sidebar.style.overflowY = '';

        this.game.reset();

        // Mark that we're in test mode (not fully closed editor)
        this.isActive = false;
        this.isTesting = true;
        document.getElementById('editor-sidebar').style.display = 'none';
        this.removeMouseHandlers();
    }

    saveLevel() {
        const levelData = this.generateLevelObject();
        const levelName = document.getElementById('levelName').value;

        // Save to browser localStorage
        const customLevels = JSON.parse(localStorage.getItem('customLevels') || '[]');
        const existingIndex = customLevels.findIndex(l => l.name === levelName);

        if (existingIndex >= 0) {
            if (confirm('Level with this name exists. Overwrite?')) {
                customLevels[existingIndex] = levelData;
            } else {
                return;
            }
        } else {
            customLevels.push(levelData);
        }

        localStorage.setItem('customLevels', JSON.stringify(customLevels));
        alert(`Level "${levelName}" saved to browser!`);
        this.close();
    }

    generateLevelObject() {
        // Create proper class instances for entities that need methods
        return {
            name: document.getElementById('levelName').value,
            world: this.currentWorld,
            start: { ...this.start },
            goal: { ...this.goal },
            threeStarTime: parseFloat(document.getElementById('threeStarTime').value),
            twoStarTime: parseFloat(document.getElementById('twoStarTime').value),
            platforms: this.platforms.map(p => new Platform(p.x, p.y, p.width, p.height)),
            gluePlatforms: this.gluePlatforms.map(p => new GluePlatform(p.x, p.y, p.width, p.height, p.glueFactor)),
            crumblingPlatforms: this.crumblingPlatforms.map(p => new CrumblingPlatform(p.x, p.y, p.width, p.height)),
            blinkingPlatforms: this.blinkingPlatforms.map(p => new BlinkingPlatform(p.x, p.y, p.width, p.height, p.interval, p.startVisible)),
            spikes: this.spikes.map(s => ({ ...s })),
            movingSpikes: this.movingSpikes.map(ms => ({ ...ms })),
            turrets: this.turrets.map(t => new Turret(t.x, t.y, t.shootDirection, t.fireRate)),
            blackHoles: this.blackHoles.map(bh => ({ ...bh }))
        };
    }

    open() {
        this.isActive = true;
        this.game.gameState = 'editor';
        document.getElementById('editor-sidebar').style.display = 'block';
        this.setupMouseHandlers();

        // Make body use flexbox layout to put canvas and sidebar side by side
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'flex-start';
        document.body.style.alignItems = 'flex-start';
        document.body.style.gap = '0';
        document.body.style.padding = '0';

        // Calculate size to fit beside sidebar (300px wide)
        const sidebarWidth = 300;
        const availableWidth = window.innerWidth - sidebarWidth - 40;
        const scale = Math.min(availableWidth / this.originalWidth, 0.7);

        // Keep canvas resolution but scale visually with CSS
        this.canvas.width = this.originalWidth;
        this.canvas.height = this.originalHeight;
        this.canvas.style.width = `${this.originalWidth * scale}px`;
        this.canvas.style.height = `${this.originalHeight * scale}px`;

        // Position container
        const container = document.getElementById('game-container');
        container.style.margin = '20px';
        container.style.marginRight = '0';
        container.style.flexShrink = '0';

        // Make sidebar position relative (not absolute) so it sits beside the canvas
        const sidebar = document.getElementById('editor-sidebar');
        sidebar.style.position = 'relative';
        sidebar.style.flexShrink = '0';
        sidebar.style.height = '100vh'; // Full viewport height
        sidebar.style.maxHeight = '100vh'; // Limit to viewport height
        sidebar.style.overflowY = 'auto'; // Enable scrolling

        // Initialize world dropdown to World 1 and populate levels
        const worldSelect = document.getElementById('worldSelect');
        if (worldSelect && worldSelect.value === '0') {
            worldSelect.value = '1';
            this.populateLevelDropdown(1);
        }
    }

    close() {
        this.isActive = false;
        document.getElementById('editor-sidebar').style.display = 'none';
        this.removeMouseHandlers();
        this.selectedElement = null;
        this.updatePropertyPanel();

        // Restore original canvas size
        this.canvas.width = this.originalWidth;
        this.canvas.height = this.originalHeight;
        this.canvas.style.width = `${this.originalWidth}px`;
        this.canvas.style.height = `${this.originalHeight}px`;

        // Restore body layout
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        document.body.style.gap = '';
        document.body.style.padding = '';

        // Restore container centering
        const container = document.getElementById('game-container');
        container.style.margin = '';
        container.style.marginRight = '';
        container.style.flexShrink = '';

        // Restore sidebar to absolute positioning
        const sidebar = document.getElementById('editor-sidebar');
        sidebar.style.position = 'absolute';
        sidebar.style.height = '100%';
        sidebar.style.maxHeight = '';
        sidebar.style.overflowY = '';

        this.game.showLevelSelect();
    }

    render() {
        if (!this.isActive) return;

        // Grid
        this.ctx.strokeStyle = '#dddddd';
        this.ctx.lineWidth = 0.5;
        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // Helper function for drawing elements
        const drawElement = (elements, type, color, hoverColor) => {
            elements.forEach((el, i) => {
                const isHovered = this.hoveredElement?.type === type && this.hoveredElement?.index === i;
                const isSelected = this.selectedElement?.type === type && this.selectedElement?.index === i;

                this.ctx.fillStyle = isHovered ? hoverColor : color;

                if (type === 'spike') {
                    this.ctx.beginPath();
                    this.ctx.moveTo(el.x, el.y + el.height);
                    this.ctx.lineTo(el.x + el.width / 2, el.y);
                    this.ctx.lineTo(el.x + el.width, el.y + el.height);
                    this.ctx.closePath();
                    this.ctx.fill();
                } else if (type === 'movingSpike') {
                    this.ctx.beginPath();
                    this.ctx.arc(el.x + el.width/2, el.y + el.height/2, el.width/2, 0, Math.PI * 2);
                    this.ctx.fill();

                    this.ctx.strokeStyle = '#FF8888';
                    this.ctx.setLineDash([5, 5]);
                    this.ctx.strokeRect(el.startX, el.y, el.endX - el.startX, el.height);
                    this.ctx.setLineDash([]);
                } else if (type === 'blackHole') {
                    this.ctx.fillStyle = '#1a1a1a';
                    this.ctx.beginPath();
                    this.ctx.arc(el.x + el.width/2, el.y + el.height/2, el.width/2, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Pull radius preview
                    this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(el.x + el.width/2, el.y + el.height/2, el.pullRadius, 0, Math.PI * 2);
                    this.ctx.stroke();
                } else if (type === 'turret') {
                    this.ctx.fillRect(el.x, el.y, el.width, el.height);

                    // Draw direction indicator
                    this.ctx.fillStyle = '#FF6B6B';
                    const centerX = el.x + el.width/2;
                    const centerY = el.y + el.height/2;
                    const arrowSize = 15;

                    this.ctx.save();
                    this.ctx.translate(centerX, centerY);

                    switch(el.shootDirection) {
                        case 'right':
                            this.ctx.fillRect(5, -arrowSize/2, 20, arrowSize);
                            break;
                        case 'left':
                            this.ctx.fillRect(-25, -arrowSize/2, 20, arrowSize);
                            break;
                        case 'up':
                            this.ctx.fillRect(-arrowSize/2, -25, arrowSize, 20);
                            break;
                        case 'down':
                            this.ctx.fillRect(-arrowSize/2, 5, arrowSize, 20);
                            break;
                    }
                    this.ctx.restore();
                } else {
                    this.ctx.fillRect(el.x, el.y, el.width, el.height);
                }

                if (isSelected) {
                    this.ctx.strokeStyle = '#00FF00';
                    this.ctx.lineWidth = 4;
                    this.ctx.strokeRect(el.x - 5, el.y - 5, el.width + 10, el.height + 10);
                } else if (isHovered) {
                    this.ctx.strokeStyle = '#FF6B6B';
                    this.ctx.lineWidth = 3;
                    this.ctx.strokeRect(el.x, el.y, el.width, el.height);
                }
            });
        };

        // Draw all elements
        drawElement(this.platforms, 'platform', '#000000', '#555555');
        drawElement(this.gluePlatforms, 'gluePlatform', '#4682B4', '#5FB3D6');
        drawElement(this.crumblingPlatforms, 'crumblingPlatform', '#CD853F', '#DEB887');
        drawElement(this.blinkingPlatforms, 'blinkingPlatform', '#FFD700', '#FFA500');
        drawElement(this.spikes, 'spike', '#DC143C', '#FF6B6B');
        drawElement(this.movingSpikes, 'movingSpike', '#DC143C', '#FF6B6B');
        drawElement(this.turrets, 'turret', '#2C5282', '#4682B4');
        drawElement(this.blackHoles, 'blackHole', '#1a1a1a', '#333333');

        // Start
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(this.start.x, this.start.y, this.start.width, this.start.height);

        // Goal
        this.ctx.fillStyle = '#FFB3D9';
        this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);

        // Current Shape
        if (this.currentShape) {
            this.ctx.fillStyle = 'rgba(0, 123, 255, 0.3)';
            this.ctx.fillRect(this.currentShape.x, this.currentShape.y, this.currentShape.width, this.currentShape.height);
            this.ctx.strokeStyle = '#007BFF';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(this.currentShape.x, this.currentShape.y, this.currentShape.width, this.currentShape.height);
        }
    }
}
