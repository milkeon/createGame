// Game Constants & Configuration
const STAIR_SIZE = 100;
const GAP_X = 60;
const GAP_Y = 60;
const COLUMN_WIDTH = STAIR_SIZE + GAP_X;
const STAIR_HEIGHT_STEP = STAIR_SIZE + GAP_Y;
const CANVAS_WIDTH = 1800; 
const CANVAS_HEIGHT = 1000; 
const START_Y_OFFSET = 250;

const INITIAL_TIME = 100;
const TIME_DECREASE_RATE = 0.25;
const JUMP_DURATION = 150; 
const SCROLL_SPEED = 0.2; 

const COLOR_PRIMARY = '#00f3ff';
const COLOR_STAIR = '#1a1a1a';

// 20계단마다 바뀌는 네온 컬러 팔레트
const THEME_COLORS = [
    '#00eeffff', // 시안 (기본)
    '#ff00ff',   // 마젠타
    '#39ff14',   // 네온 그린
    '#ffff00',   // 네온 옐로
    '#bc13fe',   // 네온 퍼플
    '#ff4400'    // 네온 레드
];

function getThemeColor(s) {
    const idx = Math.floor(s / 20) % THEME_COLORS.length;
    return THEME_COLORS[idx];
}

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('current-score');
const bestScoreEl = document.getElementById('best-score');
const timeGaugeEl = document.getElementById('time-gauge');
const menuOverlay = document.getElementById('menu-overlay');
const menuTitle = document.getElementById('menu-title');
const menuSubtitle = document.getElementById('menu-subtitle');
const startButton = document.getElementById('start-button');
const toastContainer = document.getElementById('toast-container');

let gameState = 'READY';
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let time = INITIAL_TIME;
let stairs = [];
let player = { col: 5, y: 0, prevCol: 5, prevY: 0, jumpStartTime: performance.now() };
let cameraY = 0;
let lastTimestamp = 0;
let shockwaves = []; 

function init() {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    bestScoreEl.textContent = bestScore;
    resetGameData();
    startButton.addEventListener('click', startGame);
    window.addEventListener('keydown', handleKeyDown);
    window.focus();
}

function getColRange(level) {
    let min = 4, max = 6; 
    let extra = Math.floor(level / 10);
    for (let i = 1; i <= extra; i++) {
        if (i % 2 === 1) max = Math.min(10, max + 1);
        else min = Math.max(0, min - 1);
    }
    return { min, max };
}

function resetGameData() {
    score = 0; time = INITIAL_TIME; cameraY = 0; shockwaves = [];
    player = { col: 5, y: 0, prevCol: 5, prevY: 0, jumpStartTime: performance.now() };
    stairs = [];
    stairs.push({ col: 5, y: 0 }); 
    for (let i = 1; i < 50; i++) generateStair();
}

function startGame() {
    if (gameState === 'PLAYING') return;
    resetGameData();
    gameState = 'PLAYING';
    menuOverlay.classList.remove('visible');
    currentScoreEl.textContent = score;
}

function generateStair() {
    const lastStair = stairs[stairs.length - 1];
    const nextY = lastStair.y + STAIR_HEIGHT_STEP;
    const level = Math.round(nextY / STAIR_HEIGHT_STEP);
    const range = getColRange(level);
    let nextCol = lastStair.col + (Math.random() > 0.5 ? 1 : -1);
    if (nextCol < range.min) nextCol = range.min + 1;
    if (nextCol > range.max) nextCol = range.max - 1;
    if (nextCol === lastStair.col) nextCol = lastStair.col + (lastStair.col <= range.min ? 1 : -1);
    stairs.push({ col: nextCol, y: nextY });
}

function handleKeyDown(e) {
    if (e.key === 'Enter' && gameState !== 'PLAYING') startGame();
    if (gameState !== 'PLAYING') return;
    if (e.key === 'ArrowLeft') jump(player.col - 1);
    else if (e.key === 'ArrowRight') jump(player.col + 1);
}

function createShockwave(col, stepY) {
    shockwaves.push({
        col: col,
        stepY: stepY,
        radius: 30, maxRadius: 200,
        life: 1.0, decay: 0.04,
        color: getThemeColor(score) // 생성 시점의 테마 컬러 저장
    });
}

function jump(targetCol) {
    const nextY = (score + 1) * STAIR_HEIGHT_STEP;
    const range = getColRange(score + 1);
    if (targetCol < range.min || targetCol > range.max) { gameOver(); return; }
    const hit = stairs.find(s => s.y === nextY && s.col === targetCol);
    if (hit) {
        player.prevCol = player.col; player.prevY = player.y; player.jumpStartTime = performance.now();
        score++; player.col = targetCol; player.y = nextY;
        time = Math.min(INITIAL_TIME, time + 15);
        currentScoreEl.textContent = score;
        generateStair();
        // 절대 좌표 대신 계단 정보를 준다
        createShockwave(player.col, player.y);
        
        // 20계단마다 레벨업 효과 강조 (토스트)
        if (score > 0 && score % 20 === 0) {
            showToast(`Theme Changed!`, 'success');
        } else if (score > 0 && score % 10 === 0) {
            showToast(`Lv Up! 영역 확장`, 'info');
        }
    } else { gameOver(); }
}

function gameOver() {
    gameState = 'GAMEOVER';
    menuTitle.textContent = '게임 오버'; menuSubtitle.textContent = `최종 점수: ${score}`; menuOverlay.classList.add('visible');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div'); toast.className = `toast ${type}`; toast.textContent = message; toastContainer.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2000);
}

function update(deltaTime) {
    if (gameState !== 'PLAYING') return;
    time -= TIME_DECREASE_RATE * (1 + score / 150);
    if (time <= 0) { time = 0; gameOver(); }
    timeGaugeEl.style.width = `${time}%`;
    cameraY += (player.y - cameraY) * SCROLL_SPEED;
    
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.2;
        sw.life -= sw.decay;
        if (sw.life <= 0) shockwaves.splice(i, 1);
    }
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTimestamp || 0;
    lastTimestamp = timestamp;
    update(deltaTime); draw();
    requestAnimationFrame(gameLoop);
}

function drawStair(x, y, size, isNext, themeColor) {
    const radius = 25; 
    ctx.save();
    ctx.shadowBlur = isNext ? 40 : 15;
    ctx.shadowColor = isNext ? themeColor : 'rgba(0, 243, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
    const grad = ctx.createLinearGradient(x, y, x + size, y + size);
    grad.addColorStop(0, '#333'); grad.addColorStop(1, '#111');
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = isNext ? themeColor : COLOR_PRIMARY;
    ctx.lineWidth = isNext ? 6 : 2; ctx.stroke();
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const centerXOffset = (CANVAS_WIDTH - (11 * COLUMN_WIDTH)) / 2;
    const currentThemeColor = getThemeColor(score);

    // 계단
    const nextY = (score + 1) * STAIR_HEIGHT_STEP;
    stairs.forEach((stair) => {
        const isNext = stair.y === nextY;
        const drawX = centerXOffset + stair.col * COLUMN_WIDTH;
        const drawY = CANVAS_HEIGHT - START_Y_OFFSET - (stair.y - cameraY);
        if (drawY > -STAIR_HEIGHT_STEP && drawY < CANVAS_HEIGHT + 200) {
            drawStair(drawX, drawY, STAIR_SIZE, isNext, currentThemeColor);
        }
    });

    // 파동 (cameraY를 실시간 반영)
    shockwaves.forEach(sw => {
        const swX = centerXOffset + sw.col * COLUMN_WIDTH + STAIR_SIZE / 2;
        const swY = (CANVAS_HEIGHT - START_Y_OFFSET - (sw.stepY - cameraY)) + STAIR_SIZE / 2;
        ctx.save();
        ctx.globalAlpha = sw.life;
        ctx.shadowBlur = 50; ctx.shadowColor = sw.color;
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 20 * sw.life;
        ctx.beginPath(); ctx.arc(swX, swY, sw.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    });

    // 캐릭터
    const now = performance.now();
    const t = Math.min(1, (now - player.jumpStartTime) / JUMP_DURATION);
    const easeT = t >= 1 ? 1 : (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const vX = centerXOffset + (player.prevCol + (player.col - player.prevCol) * easeT) * COLUMN_WIDTH + STAIR_SIZE / 2;
    const vY = (CANVAS_HEIGHT - START_Y_OFFSET - (player.prevY + (player.y - player.prevY) * easeT - cameraY)) + (STAIR_SIZE / 2) - Math.sin(t * Math.PI) * 100;

    ctx.save();
    ctx.shadowBlur = 50; ctx.shadowColor = currentThemeColor;
    ctx.fillStyle = currentThemeColor; ctx.beginPath(); ctx.arc(vX, vY, 35, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(vX, vY, 12, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

init();
requestAnimationFrame(gameLoop);
