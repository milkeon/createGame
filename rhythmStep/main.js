// rhythmStep - Master Composer (Gaming & Custom Edition)
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 900;
const TILE_SIZE = 100;
const ORBIT_RADIUS = 200; 

const BPM = 126; 
let currentBpm = 126;
let BEAT_DURATION = 60 / currentBpm; 

const COLOR_FIRE = '#ff3300';
const COLOR_ICE = '#00e1ff';
const COLOR_TILE = '#0a0a0a';
const COLOR_PERFECT = '#ffffff';

// 기본 프리셋 맵 (사용자가 커스텀 맵이 없을 때 사용)
const DEFAULT_NOTES = [
    { f: 493, d: 0.25 }, { f: 440, d: 0.25 }, { f: 415, d: 0.25 }, { f: 440, d: 0.25 },
    { f: 523, d: 1.0 }, { f: 0, d: 0.5 },
    { f: 523, d: 0.25 }, { f: 493, d: 0.25 }, { f: 466, d: 0.25 }, { f: 493, d: 0.25 },
    { f: 587, d: 1.0 }
];

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const comboEl = document.getElementById('current-combo');
const perfectEl = document.getElementById('perfect-count');
const menuOverlay = document.getElementById('menu-overlay');
const startButton = document.getElementById('start-button');
const btnGaming = document.getElementById('btn-gaming');
const btnCustom = document.getElementById('btn-custom');
const editorGuide = document.getElementById('editor-guide');

let gameState = 'READY'; // READY, PLAYING, EDITING, GAMEOVER
let currentMode = 'GAMING'; // GAMING, CUSTOM
let combo = 0; let perfects = 0; let lastTimestamp = 0;
let audioCtx = null;
let nextNoteTime = 0; let noteIdx = 0;
let camera = { x: 400, y: 450 };
let tiles = []; let activeNodeIdx = 0;
let shockwaves = [];
let shake = 0;
let gameStartTime = 0;
let currentDirection = 'Right'; // Right, Up, Down, Left
let musicSource = null;
let customAudioBuffer = null;
let customAudioSource = null;
let ytPlayer = null;
let isYTApiReady = false;

// 유튜브 IFrame API 로드
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = () => { isYTApiReady = true; };

let pivotIndex = 0; 
let balls = [
    { x: 300, y: 450, color: COLOR_FIRE, angle: 0, trail: [] },
    { x: 500, y: 450, color: COLOR_ICE, angle: 0, trail: [] }
];

function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function stopAllAudio() {
    if (musicSource) { try { musicSource.stop(); } catch(e) {} }
    if (customAudioSource) { try { customAudioSource.stop(); } catch(e) {} }
    if (ytPlayer && typeof ytPlayer.stopVideo === 'function') ytPlayer.stopVideo();
}

function loadYoutubeVideo(url) {
    const videoId = extractVideoId(url);
    if (!videoId) return;
    
    const container = document.getElementById('yt-player-container');
    if (container) container.classList.add('visible');
    
    if (ytPlayer) {
        ytPlayer.loadVideoById(videoId);
    } else {
        ytPlayer = new YT.Player('yt-player', {
            height: '100%', width: '100%',
            videoId: videoId,
            playerVars: { 'autoplay': 1, 'controls': 0, 'disablekb': 1, 'modestbranding': 1 },
            events: { 'onReady': (e) => e.target.playVideo() }
        });
    }
}

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

async function loadMusic(file) {
    const arrayBuffer = await file.arrayBuffer();
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    customAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
}

function playNote(freq, dur, time) {
    if (!audioCtx) return;
    if (freq === 0) return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(time); osc.stop(time + dur);
}

function playHitSound() {
    if (!audioCtx) return;
    const time = audioCtx.currentTime;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(1100, time);
    osc.frequency.exponentialRampToValueAtTime(550, time + 0.05);
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(time); osc.stop(time + 0.05);
}

function init() {
    canvas.width = CANVAS_WIDTH; canvas.height = CANVAS_HEIGHT;
    
    // 에디터 내 음악 로드 (로컬 파일)
    const editorMusicInput = document.getElementById('music-upload-editor') || document.getElementById('music-upload');
    if (editorMusicInput) {
        editorMusicInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = await file.arrayBuffer();
            customAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            showToast(`'${file.name}' 장전 완료!`);
        });
    }

    // 에디터 내 재생/정지 제어
    const btnPlay = document.getElementById('btn-editor-play');
    if (btnPlay) {
        btnPlay.addEventListener('click', () => {
            const ytUrlInput = document.getElementById('youtube-url-editor') || document.getElementById('youtube-url');
            const ytUrl = ytUrlInput ? ytUrlInput.value : '';
            if (ytUrl) loadYoutubeVideo(ytUrl);
            startEditing();
        });
    }

    const btnStop = document.getElementById('btn-editor-stop');
    if (btnStop) {
        btnStop.addEventListener('click', () => {
            stopAllAudio();
            gameState = 'READY';
            showToast("녹음 일시 정지");
        });
    }

    window.setModeAndStart = (mode) => {
        currentMode = mode;
        if (mode === 'CUSTOM') {
            startEditing();
        } else startGame();
    };

    window.addEventListener('keydown', handleInput);
    window.addEventListener('mousedown', handleInput);
    
    resetGame();
    loadCustomMapUI();
    requestAnimationFrame(gameLoop);
}

function loadCustomMapUI() {
    const savedData = localStorage.getItem('rhythm_custom_map');
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.ytUrl) {
            const ytInput = document.getElementById('youtube-url') || document.getElementById('youtube-url-editor');
            if (ytInput) ytInput.value = data.ytUrl;
        }
        if (data.bpm) {
            const bpmInput = document.getElementById('input-bpm') || document.getElementById('input-bpm-editor');
            if (bpmInput) bpmInput.value = data.bpm;
        }
    }
}

function resetGame() {
    combo = 0; perfects = 0; activeNodeIdx = 0; pivotIndex = 0; shake = 0;
    if (comboEl) comboEl.textContent = '0';
    if (perfectEl) perfectEl.textContent = '0';
    shockwaves = []; tiles = [];
    balls.forEach(b => b.trail = []);
    
    tiles.push({ x: 400, y: 450, time: 0 });
    
    if (currentMode === 'GAMING') {
        const savedData = localStorage.getItem('rhythm_custom_map');
        if (savedData) {
            const data = JSON.parse(savedData);
            tiles = data.tiles || [];
            currentBpm = data.bpm || 126;
            BEAT_DURATION = 60 / currentBpm;
            showToast("저장된 커스텀 음악과 맵을 불러왔습니다!");
        } else {
            loadDefaultMap();
            currentBpm = 126;
            BEAT_DURATION = 60 / currentBpm;
            showToast("기본 프리셋 곡을 로드했습니다.");
        }
    } else {
        showToast("REC 모드: 박자에 맞춰 키를 누르세요!");
    }
    
    balls[0].x = tiles[0].x; balls[0].y = tiles[0].y;
    balls[1].x = tiles[0].x + ORBIT_RADIUS; balls[1].y = tiles[0].y;
    balls[1].angle = 0;
    camera.x = tiles[0].x; camera.y = tiles[0].y;
}

function startEditing() {
    stopAllAudio();
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // UI에서 현재 정보 가져오기
    const ytUrlInput = document.getElementById('youtube-url-editor') || document.getElementById('youtube-url');
    const ytUrl = ytUrlInput ? ytUrlInput.value : "";
    const bpmInput = document.getElementById('input-bpm-editor') || document.getElementById('input-bpm');
    const bpmVal = parseInt(bpmInput ? bpmInput.value : "126");

    currentBpm = bpmVal;
    BEAT_DURATION = 60 / currentBpm;

    // 즉시 로컬 저장 (유실 방지)
    const currentData = {
        tiles: [{ x: 400, y: 450, time: 0 }],
        ytUrl: ytUrl,
        bpm: currentBpm
    };
    localStorage.setItem('rhythm_custom_map', JSON.stringify(currentData));

    audioCtx.resume().then(() => {
        tiles = currentData.tiles;
        activeNodeIdx = 0; pivotIndex = 0;
        gameState = 'EDITING';
        gameStartTime = audioCtx.currentTime;
        
        // 유튜브 로드 (로컬 저장된 URL 우선)
        if (ytUrl) loadYoutubeVideo(ytUrl);

        if (customAudioBuffer) {
            customAudioSource = audioCtx.createBufferSource();
            customAudioSource.buffer = customAudioBuffer;
            customAudioSource.connect(audioCtx.destination);
            customAudioSource.start(0);
        }
        
        if (menuOverlay) menuOverlay.classList.remove('visible');
        if (editorGuide) editorGuide.classList.remove('hidden');
        showToast(`BPM ${currentBpm} 녹음 시작!`);
    });
}

function loadDefaultMap() {
    let curX = 400, curY = 450;
    let curAngle = 0;
    for (let i = 0; i < 500; i++) {
        const note = DEFAULT_NOTES[i % DEFAULT_NOTES.length];
        curAngle += note.d * Math.PI;
        if (note.f === 0) continue;
        const turn = (i % 8 === 0 && i !== 0) ? (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2) : 0;
        curX += Math.cos(curAngle + turn) * ORBIT_RADIUS;
        curY += Math.sin(curAngle + turn) * ORBIT_RADIUS;
        tiles.push({ x: curX, y: curY, time: curAngle / Math.PI * BEAT_DURATION });
    }
}

function startGame() {
    stopAllAudio();
    
    // 저장된 데이터에서 URL 로드
    const savedData = localStorage.getItem('rhythm_custom_map');
    let ytUrl = "";
    if (savedData) {
        const data = JSON.parse(savedData);
        ytUrl = data.ytUrl || "";
    } else {
        // 저장된 게 없으면 현재 인풋창 주소라도 시도
        ytUrl = document.getElementById('youtube-url')?.value || "";
    }

    if (ytUrl) loadYoutubeVideo(ytUrl);
    
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume().then(() => {
        resetGame();
        gameState = 'PLAYING';
        gameStartTime = audioCtx.currentTime;
        if (customAudioBuffer) {
            customAudioSource = audioCtx.createBufferSource();
            customAudioSource.buffer = customAudioBuffer;
            customAudioSource.connect(audioCtx.destination);
            customAudioSource.start(0);
        }
        if (menuOverlay) menuOverlay.classList.remove('visible');
        if (editorGuide) editorGuide.classList.add('hidden');
    });
}

function handleInput(e) {
    if (e.repeat) return;
    
    const isMouseEvent = e.type === 'mousedown';
    const key = e.key;

    if (key === 'Escape') {
        if (ytPlayer) ytPlayer.stopVideo();
        const ytContainer = document.getElementById('yt-player-container');
        if (ytContainer) ytContainer.classList.remove('visible');
        
        stopAllAudio();
        if (gameState === 'EDITING') {
            // 통합 데이터 저장 (Tiles + YT URL + BPM)
            const ytUrl = document.getElementById('youtube-url-editor')?.value || document.getElementById('youtube-url')?.value || "";
            const bpm = parseInt(document.getElementById('input-bpm-editor')?.value || document.getElementById('input-bpm')?.value || "126");
            
            const mapData = {
                tiles: tiles,
                ytUrl: ytUrl,
                bpm: bpm
            };
            localStorage.setItem('rhythm_custom_map', JSON.stringify(mapData));
            showToast("음악 설정과 맵이 함께 저장되었습니다!");
        }
        gameState = 'READY';
        if (menuOverlay) menuOverlay.classList.add('visible');
        if (editorGuide) editorGuide.classList.add('hidden');
        return;
    }

    if (gameState === 'EDITING') {
        const functionalKeys = ['F12', 'F5'];
        if (functionalKeys.includes(key)) return;

        // 방향키는 방향 전환 + 타일 생성
        if (key === 'ArrowRight') currentDirection = 'Right';
        else if (key === 'ArrowUp') currentDirection = 'Up';
        else if (key === 'ArrowDown') currentDirection = 'Down';
        else if (key === 'ArrowLeft') currentDirection = 'Left';
        
        // 방향키를 포함한 모든 키(ESC 제외)로 타일 즉시 생성
        recordTile();
    } else if (gameState === 'PLAYING') {
        checkHit();
    } else if (gameState === 'READY' || gameState === 'GAMEOVER') {
        if (key === ' ' || key === 'Enter') {
            if (menuOverlay && menuOverlay.classList.contains('visible')) {
                setModeAndStart(currentMode);
            }
        }
    }
}

function recordTile() {
    if (!audioCtx) return;
    const time = audioCtx.currentTime - gameStartTime;
    const lastTile = tiles[tiles.length - 1];
    
    // 현재 회전 각도 계산 (BPM 기준)
    const angle = (time / BEAT_DURATION) * Math.PI;
    
    let nextX = lastTile.x, nextY = lastTile.y;
    // 방향키 설정에 따른 오프셋
    const dirMap = { 'Right': 0, 'Up': -Math.PI/2, 'Down': Math.PI/2, 'Left': Math.PI };
    const offsetAngle = dirMap[currentDirection];
    
    // 실제 타일 위치 계산
    nextX += Math.cos(angle + offsetAngle) * ORBIT_RADIUS;
    nextY += Math.sin(angle + offsetAngle) * ORBIT_RADIUS;
    
    tiles.push({ x: nextX, y: nextY, time: time });
    playHitSound();
    createShockwave(nextX, nextY, COLOR_FIRE);
    
    // 카메라가 항상 마지막 타일을 중앙에 두려고 노력함
    activeNodeIdx = tiles.length - 2;
    balls[pivotIndex].x = nextX;
    balls[pivotIndex].y = nextY;
}

function checkHit() {
    const targetTile = tiles[activeNodeIdx + 1];
    if (!targetTile) return;
    const orbitBall = balls[1 - pivotIndex];
    const dist = Math.sqrt(Math.pow(orbitBall.x - targetTile.x, 2) + Math.pow(orbitBall.y - targetTile.y, 2));
    
    if (dist < 120) {
        const isPerfect = dist < 55;
        if (isPerfect) { perfects++; if (perfectEl) perfectEl.textContent = perfects; }
        combo++; comboEl.textContent = combo;
        activeNodeIdx++; pivotIndex = 1 - pivotIndex;
        balls[pivotIndex].x = targetTile.x; balls[pivotIndex].y = targetTile.y;
        const other = balls[1 - pivotIndex];
        other.angle = Math.atan2(other.y - balls[pivotIndex].y, other.x - balls[pivotIndex].x);
        playHitSound();
        shake = isPerfect ? 12 : 6;
        createShockwave(targetTile.x, targetTile.y, isPerfect ? COLOR_PERFECT : balls[pivotIndex].color);
    } else {
        gameState = 'GAMEOVER'; if (menuOverlay) menuOverlay.classList.add('visible');
        showToast("아쉽네요! 다시 도전해보세요.");
    }
}

function createShockwave(x, y, color) {
    shockwaves.push({ x, y, r: 10, maxR: 350, life: 1, color });
}

function update(deltaTime) {
    if ((gameState !== 'PLAYING' && gameState !== 'EDITING') || !audioCtx) return;
    
    const elapsedTime = audioCtx.currentTime - gameStartTime;
    const orbit = balls[1 - pivotIndex];
    const pivot = balls[pivotIndex];
    
    orbit.angle = (elapsedTime / BEAT_DURATION) * Math.PI;
    orbit.x = pivot.x + Math.cos(orbit.angle) * ORBIT_RADIUS;
    orbit.y = pivot.y + Math.sin(orbit.angle) * ORBIT_RADIUS;
    
    balls.forEach(b => {
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 12) b.trail.shift();
    });
    
    camera.x += (pivot.x + 300 - camera.x) * 0.1;
    camera.y += (pivot.y - camera.y) * 0.1;
    shake *= 0.85; 
    
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.r += (sw.maxR - sw.r) * 0.18; sw.life -= 0.08;
        if (sw.life <= 0) shockwaves.splice(i, 1);
    }
}

function draw() {
    ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const offsetX = CANVAS_WIDTH / 2 - camera.x + (Math.random() - 0.5) * shake;
    const offsetY = CANVAS_HEIGHT / 2 - camera.y + (Math.random() - 0.5) * shake;

    let pulse = 1;
    if (audioCtx) {
        const beatProg = ((audioCtx.currentTime - gameStartTime) % BEAT_DURATION) / BEAT_DURATION;
        pulse = 1 + Math.max(0, 1 - beatProg * 5) * 0.05;
    }

    ctx.save();
    ctx.translate(CANVAS_WIDTH/2, CANVAS_HEIGHT/2); ctx.scale(pulse, pulse); ctx.translate(-CANVAS_WIDTH/2, -CANVAS_HEIGHT/2);

    // 경로 선
    ctx.beginPath(); ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < tiles.length - 1; i++) {
        ctx.moveTo(tiles[i].x + offsetX, tiles[i].y + offsetY);
        ctx.lineTo(tiles[i+1].x + offsetX, tiles[i+1].y + offsetY);
    }
    ctx.stroke();

    // 타일
    tiles.forEach((tile, i) => {
        const dx = tile.x + offsetX; const dy = tile.y + offsetY;
        if (dx > -200 && dx < CANVAS_WIDTH + 200) {
            ctx.save();
            const isTarget = i === activeNodeIdx + 1;
            if (i === 0) { ctx.fillStyle = '#0a2'; }
            else if (isTarget) { ctx.shadowBlur = 40; ctx.shadowColor = '#fff'; ctx.fillStyle = '#fff'; }
            else if (i <= activeNodeIdx) { ctx.fillStyle = '#333'; }
            else { ctx.fillStyle = '#111'; ctx.globalAlpha = 0.3; }
            ctx.beginPath(); ctx.roundRect(dx-TILE_SIZE/2, dy-TILE_SIZE/2, TILE_SIZE, TILE_SIZE, 30); ctx.fill();
            ctx.restore();
        }
    });

    // 공
    balls.forEach(ball => {
        ball.trail.forEach((t, i) => { ctx.globalAlpha = i/ball.trail.length * 0.3; ctx.fillStyle = ball.color; ctx.beginPath(); ctx.arc(t.x + offsetX, t.y + offsetY, 20, 0, Math.PI*2); ctx.fill(); });
        ctx.save(); ctx.shadowBlur = 40; ctx.shadowColor = ball.color; ctx.fillStyle = ball.color; ctx.beginPath(); ctx.arc(ball.x + offsetX, ball.y + offsetY, 38, 0, Math.PI*2); ctx.fill(); ctx.restore();
    });

    shockwaves.forEach(sw => { ctx.save(); ctx.globalAlpha = sw.life; ctx.strokeStyle = sw.color; ctx.lineWidth = 20 * sw.life; ctx.beginPath(); ctx.arc(sw.x + offsetX, sw.y + offsetY, sw.r, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); });
    ctx.restore();
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTimestamp || 0;
    lastTimestamp = timestamp; update(deltaTime); draw();
    requestAnimationFrame(gameLoop);
}
init();
