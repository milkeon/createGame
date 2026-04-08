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

const THEME_COLORS = [
    '#00eeffff', '#ff00ff', '#39ff14', '#ffff00', '#bc13fe', '#ff4400'
];

function getThemeColor(s) {
    const idx = Math.floor(s / 20) % THEME_COLORS.length;
    return THEME_COLORS[idx];
}

const PYTHON_CONCEPTS = {
    "변수와 문자열": [
        { id: "var_print", title: "문자열 출력", content: "print(\"Hello world!\")" },
        { id: "var_assign", title: "변수 할당", content: "msg = \"Hello world!\"" },
        { id: "var_fstring", title: "f-문자열 결합", content: "f\"{first} {last}\"" }
    ],
    "리스트 (List)": [
        { id: "list_init", title: "리스트 생성", content: "bikes = ['trek', 'giant']" },
        { id: "list_append", title: "요소 추가", content: "bikes.append('redline')" },
        { id: "list_index", title: "인덱스 접근", content: "first = bikes[0]" },
        { id: "list_negative", title: "마지막 요소", content: "last = bikes[-1]" }
    ],
    "조건문 (if 문)": [
        { id: "if_simple", title: "단순 if 테스트", content: "if age >= 18:" },
        { id: "if_elif", title: "if-elif-else", content: "elif age < 21:" },
        { id: "if_bool", title: "불리언 값", content: "game_active = True" }
    ],
    "딕셔너리": [
        { id: "dict_init", title: "딕셔너리 생성", content: "alien = {'color': 'green'}" },
        { id: "dict_access", title: "값 접근", content: "print(alien['color'])" },
        { id: "dict_add", title: "키-값 추가", content: "alien['points'] = 5" }
    ],
    "사용자 입력 (Input)": [
        { id: "input_name", title: "이름 입력 받기", content: "name = \"Eric\"" },
        { id: "input_age", title: "나이 입력 받기", content: "age = 25" },
        { id: "input_fstring", title: "문자열 출력", content: "print(f\"Hello, {name}!\")" }
    ]
};

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const bestScoreEl = document.getElementById('best-score');
const menuOverlay = document.getElementById('menu-overlay');
const menuTitle = document.getElementById('menu-title');
const toastContainer = document.getElementById('toast-container');
const uiOverlay = document.getElementById('ui-overlay');
const pauseOverlay = document.getElementById('pause-overlay');

let bestScore = localStorage.getItem('bestScore') || 0;
let lastTimestamp = 0;
let instances = [];
let playerCount = 1;
let isPaused = false;

// 학습 진척도 관리 (localStorage 활용)
function getLearnedConcepts() {
    const data = localStorage.getItem('learned_concepts');
    return data ? JSON.parse(data) : [];
}

function saveLearnedConcept(id) {
    const learned = getLearnedConcepts();
    if (!learned.includes(id)) {
        learned.push(id);
        localStorage.setItem('learned_concepts', JSON.stringify(learned));
    }
}

window.toggleLearningPanel = function () {
    const drawer = document.getElementById('learning-drawer');
    if (drawer) drawer.classList.toggle('open');
};

function togglePause() {
    if (!document.getElementById('app').classList.contains('playing')) return;
    isPaused = !isPaused;
    if (isPaused) {
        pauseOverlay.classList.remove('hidden');
    } else {
        pauseOverlay.classList.add('hidden');
    }
}

window.quitToHome = function() {
    isPaused = false;
    pauseOverlay.classList.add('hidden');
    document.getElementById('app').classList.remove('playing');
    instances.forEach(inst => inst.gameState = 'READY');
    menuTitle.textContent = '인피니티 스텝 3K';
    menuOverlay.classList.add('visible');
    const panel = document.getElementById('learning-info');
    if (panel) panel.classList.remove('hidden'); // 히든 제거하여 내용이 보이게 함
    
    // 게임 모드 해제 및 드로어 복구
    const drawer = document.getElementById('learning-drawer');
    if (drawer) {
        drawer.classList.remove('game-mode');
        drawer.style.display = 'flex';
    }
    
    renderLandingLearningList(); // 홈으로 올 때 리스트 갱신
}

/**
 * 랜딩 페이지용 전체 학습 리스트 렌더링 (진척도에 따라 색상 분기)
 */
function renderLandingLearningList() {
    const content = document.getElementById('learning-content');
    if (!content) return;
    
    content.innerHTML = '';
    const learned = getLearnedConcepts();
    
    for (const category in PYTHON_CONCEPTS) {
        PYTHON_CONCEPTS[category].forEach(concept => {
            const isFinished = learned.includes(concept.id);
            const card = document.createElement('div');
            // 완료된 카드면 .landing-item(회색) 클래스를 뺌
            card.className = `learning-card ${isFinished ? '' : 'landing-item'}`;
            
            card.innerHTML = `
                <div class="learning-header">
                    <span class="learning-category">${category}</span>
                </div>
                <div class="learning-body">
                    <div class="snippet-title">${concept.title}</div>
                    <div class="snippet-box">
                        <span class="gathered-text">${concept.content}</span>
                    </div>
                </div>
            `;
            content.appendChild(card);
        });
    }
}

class GameInstance {
    constructor(id) {
        this.id = id;
        this.reset();
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.time = INITIAL_TIME;
        this.cameraY = 0;
        this.gameState = 'READY';
        this.direction = (Math.random() > 0.5 ? 1 : -1); // 1: Right, -1: Left
        this.player = { col: 5, y: 0, prevCol: 5, prevY: 0, jumpStartTime: performance.now() };
        this.stairs = [{ col: 5, y: 0, char: '' }];
        this.shockwaves = [];
        this.fallState = { vx: 0, vy: 0, worldX: 0, worldY: 0, rotation: 0, scale: 1, startTime: 0 };
        this.respawnTimer = 0;
        this.blinkTimer = 0;

        // 1인용 전용 학습 모드 초기화
        if (playerCount === 1) this.initLearning();

        for (let i = 1; i < 50; i++) this.generateStair();
        this.updateUI();
    }

    initLearning() {
        const categories = Object.keys(PYTHON_CONCEPTS);
        this.currentCategory = categories[Math.floor(Math.random() * categories.length)];
        this.conceptIndex = 0;
        this.gatheredText = "";

        const panel = document.getElementById('learning-info');
        const content = document.getElementById('learning-content');
        if (panel && content) {
            content.innerHTML = ''; // 초기화
            panel.classList.remove('hidden');
        }
        this.startNextConcept();
    }

    startNextConcept() {
        const concepts = PYTHON_CONCEPTS[this.currentCategory];
        if (this.conceptIndex >= concepts.length) {
            this.conceptIndex = 0;
            const categories = Object.keys(PYTHON_CONCEPTS);
            this.currentCategory = categories[(categories.indexOf(this.currentCategory) + 1) % categories.length];
        }

        this.currentConcept = PYTHON_CONCEPTS[this.currentCategory][this.conceptIndex];
        this.gatheredText = "";
        this.targetSnippet = this.currentConcept.content;
        this.snippetPointer = 0;

        // [중요] 앞으로 밟을 계단들에 새 문장 글자들을 즉시 주입
        for (let i = this.score + 1; i < this.stairs.length; i++) {
            if (this.snippetPointer < this.targetSnippet.length) {
                this.stairs[i].char = this.targetSnippet[this.snippetPointer];
                this.snippetPointer++;
            } else {
                this.stairs[i].char = '';
            }
        }
        this.snippetPointer = 0; // generateStair를 위해 리셋

        // 새로운 학습 카드 생성 및 추가
        const content = document.getElementById('learning-content');
        if (content) {
            const card = document.createElement('div');
            card.className = 'learning-card'; // 게임 내에서는 본래 색상 사용
            card.innerHTML = `
                <div class="learning-header">
                    <span class="learning-category">${this.currentCategory}</span>
                    <span class="completion-stamp">COMPLETED!</span>
                </div>
                <div class="learning-body">
                    <div class="snippet-title">${this.currentConcept.title}</div>
                    <div class="snippet-box">
                        <span class="gathered-text"></span><span class="snippet-cursor"></span>
                    </div>
                </div>
            `;
            content.prepend(card);
            this.currentCard = card;

            if (content.children.length > 4) content.removeChild(content.lastChild);
        }
    }

    updateUI() {
        const prefix = `p${this.id + 1}`;
        const scoreEl = document.getElementById(`current-score-${prefix}`);
        const heartsEl = document.getElementById(`hearts-${prefix}`);
        if (scoreEl) scoreEl.textContent = this.score;
        if (heartsEl) heartsEl.textContent = '❤️'.repeat(this.lives) + '🖤'.repeat(3 - this.lives);
    }

    generateStair() {
        const lastStair = this.stairs[this.stairs.length - 1];
        const nextY = lastStair.y + STAIR_HEIGHT_STEP;
        const level = Math.round(nextY / STAIR_HEIGHT_STEP);
        const range = this.getColRange(level);
        let nextCol = lastStair.col + (Math.random() > 0.5 ? 1 : -1);
        if (nextCol < range.min) nextCol = range.min + 1;
        if (nextCol > range.max) nextCol = range.max - 1;
        if (nextCol === lastStair.col) nextCol = lastStair.col + (lastStair.col <= range.min ? 1 : -1);

        // 계단에 알파벳 심기 (1인용 전용)
        let stairChar = '';
        if (playerCount === 1 && this.targetSnippet) {
            if (this.snippetPointer < this.targetSnippet.length) {
                stairChar = this.targetSnippet[this.snippetPointer];
                this.snippetPointer++;
            }
        }

        this.stairs.push({ col: nextCol, y: nextY, char: stairChar });
    }

    getColRange(level) {
        if (playerCount >= 3) return { min: 4, max: 6 };
        if (playerCount === 2) return { min: 3, max: 7 };

        let min = 2, max = 8;
        let extra = Math.floor(level / 15);
        for (let i = 1; i <= extra; i++) {
            if (i % 2 === 1) max = Math.min(10, max + 1);
            else min = Math.max(0, min - 1);
        }
        return { min, max };
    }

    jump(targetCol) {
        if (this.gameState !== 'PLAYING') return;

        const nextY = (this.score + 1) * STAIR_HEIGHT_STEP;
        const hit = this.stairs.find(s => s.y === nextY && s.col === targetCol);

        if (!hit) {
            this.handleMistake(targetCol);
            return;
        }

        this.player.prevCol = this.player.col;
        this.player.prevY = this.player.y;
        this.player.jumpStartTime = performance.now();
        this.score++;
        this.player.col = targetCol;
        this.player.y = nextY;
        this.time = Math.min(INITIAL_TIME, this.time + 12);

        // 글자 수집 처리 (현재 활성화된 카드에 주입)
        if (playerCount === 1 && hit.char && this.currentCard) {
            this.gatheredText += hit.char;
            const textEl = this.currentCard.querySelector('.gathered-text');
            if (textEl) textEl.textContent = this.gatheredText;

            if (this.gatheredText.length >= this.targetSnippet.length) {
                this.handleConceptCompletion();
            }
        }

        this.updateUI();

        if (this.score > bestScore) {
            bestScore = this.score;
            bestScoreEl.textContent = bestScore;
            localStorage.setItem('bestScore', bestScore);
        }

        this.generateStair();
        this.createShockwave(this.player.col, this.player.y);
    }

    handleConceptCompletion() {
        if (!this.currentCard) return;

        // 진척도 저장
        if (this.currentConcept && this.currentConcept.id) {
            saveLearnedConcept(this.currentConcept.id);
        }

        const stamp = this.currentCard.querySelector('.completion-stamp');
        if (stamp) stamp.classList.add('show');

        this.currentCard.classList.add('completed');
        this.conceptIndex++;

        // 0.8초 후 다음 개념 카드 생성 (이전 카드는 위로 밀려남)
        setTimeout(() => {
            if (this.gameState === 'PLAYING') this.startNextConcept();
        }, 800);
    }

    handleMistake(targetCol) {
        this.lives--;
        this.updateUI();
        this.startFallAnimation(targetCol, this.lives <= 0);
    }

    startFallAnimation(targetCol, isFinal) {
        this.gameState = isFinal ? 'GAMEOVER_FALLING' : 'FALLING';
        const nextY = (this.score + 1) * STAIR_HEIGHT_STEP;
        this.fallState = {
            worldX: targetCol * COLUMN_WIDTH + STAIR_SIZE / 2,
            worldY: nextY + STAIR_SIZE / 2,
            vx: (targetCol - this.player.col) * 8,
            vy: -12,
            rotation: 0,
            scale: 1,
            startTime: performance.now()
        };
        showToast(`P${this.id + 1} ${isFinal ? '탈락!' : '실수!'}`, isFinal ? "error" : "warning");
    }

    createShockwave(col, stepY) {
        this.shockwaves.push({
            col: col, stepY: stepY, radius: 30, maxRadius: 200,
            life: 1.0, decay: 0.04, color: getThemeColor(this.score)
        });
    }

    update(deltaTime) {
        if (this.gameState === 'PLAYING') {
            this.time -= TIME_DECREASE_RATE * (1 + this.score / 150);
            if (this.time <= 0) {
                this.time = 0;
                this.lives = 0; // 타임오버 시 즉시 탈락 처리
                this.updateUI();
                this.startFallAnimation(this.player.col, true);
            }

            const timeGauge = document.getElementById(`time-gauge-p${this.id + 1}`);
            if (timeGauge) timeGauge.style.width = `${this.time}%`;

            this.cameraY += (this.player.y - this.cameraY) * SCROLL_SPEED;
        } else if (this.gameState === 'FALLING') {
            this.fallState.vy -= 0.8;
            this.fallState.worldX += this.fallState.vx;
            this.fallState.worldY += this.fallState.vy;
            this.fallState.rotation += 0.15;
            this.fallState.scale *= 0.98;
            if (performance.now() - this.fallState.startTime > 800) {
                this.gameState = 'RESPAWNING';
                this.respawnTimer = performance.now();
            }
        } else if (this.gameState === 'GAMEOVER_FALLING') {
            this.fallState.vy -= 0.5;
            this.fallState.worldX += this.fallState.vx;
            this.fallState.worldY += this.fallState.vy;
            this.fallState.rotation += 0.1;
            this.cameraY += (this.fallState.worldY - (CANVAS_HEIGHT * 0.4) - this.cameraY) * 0.05;
            if (performance.now() - this.fallState.startTime > 2000) this.finish();
        } else if (this.gameState === 'RESPAWNING') {
            this.blinkTimer += deltaTime;
            this.cameraY += (this.player.y - this.cameraY) * SCROLL_SPEED;
            if (performance.now() - this.respawnTimer > 1500) {
                this.gameState = 'PLAYING';
                this.time = Math.min(INITIAL_TIME, this.time + 15);
            }
        }

        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += (sw.maxRadius - sw.radius) * 0.2;
            sw.life -= sw.decay;
            if (sw.life <= 0) this.shockwaves.splice(i, 1);
        }
    }

    finish() {
        this.gameState = 'GAMEOVER';

        // 게임 종료 시 학습 드로어 숨기기
        const drawer = document.getElementById('learning-drawer');
        const panel = document.getElementById('learning-info');
        if (drawer) {
            drawer.classList.remove('open');
            drawer.style.display = 'none';
        }
        if (panel) panel.classList.add('hidden');

        checkAllGameOver();
    }

    draw(ctx, vWidth, xOffset) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(xOffset, 0, vWidth, CANVAS_HEIGHT); // 뷰포트 클리핑
        ctx.clip();

        // 중앙 정렬 로직 수정: 화면을 플레이어 위치에 따라 움직이지 않고, 그리드를 중앙에 고정
        // 월드 좌표의 중심 컬럼(5번)을 뷰포트의 중앙에 위치시킴
        const centerXOffset = xOffset + vWidth / 2 - (5 * COLUMN_WIDTH + STAIR_SIZE / 2);
        const currentThemeColor = getThemeColor(this.score);

        // 계단 그리기
        const nextY = (this.score + 1) * STAIR_HEIGHT_STEP;
        this.stairs.forEach((stair) => {
            const isNext = stair.y === nextY;
            const drawX = centerXOffset + stair.col * COLUMN_WIDTH;
            const drawY = CANVAS_HEIGHT - START_Y_OFFSET - (stair.y - this.cameraY);
            if (drawY > -STAIR_HEIGHT_STEP && drawY < CANVAS_HEIGHT + 200) {
                this.drawStair(ctx, drawX, drawY, STAIR_SIZE, isNext, currentThemeColor, stair.char);
            }
        });

        // 캐릭터 그리기
        let charX, charY;
        if (this.gameState === 'FALLING' || this.gameState === 'GAMEOVER_FALLING') {
            charX = centerXOffset + this.fallState.worldX;
            charY = CANVAS_HEIGHT - START_Y_OFFSET - (this.fallState.worldY - this.cameraY);
            ctx.save();
            ctx.translate(charX, charY); ctx.rotate(this.fallState.rotation); ctx.scale(this.fallState.scale, this.fallState.scale);
            this.drawCharacter(ctx, 0, 0, currentThemeColor);
            ctx.restore();
        } else {
            const isBlinking = this.gameState === 'RESPAWNING' && (Math.floor(this.blinkTimer / 100) % 2 === 0);
            if (!isBlinking) {
                const now = performance.now();
                const t = Math.min(1, (now - this.player.jumpStartTime) / JUMP_DURATION);
                const easeT = t >= 1 ? 1 : (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

                const curCol = (this.gameState !== 'PLAYING') ? this.player.col : (this.player.prevCol + (this.player.col - this.player.prevCol) * easeT);
                charX = centerXOffset + curCol * COLUMN_WIDTH + STAIR_SIZE / 2;

                const jumpY = (this.gameState !== 'PLAYING') ? this.player.y : (this.player.prevY + (this.player.y - this.player.prevY) * easeT);
                charY = (CANVAS_HEIGHT - START_Y_OFFSET - (jumpY - this.cameraY)) + STAIR_SIZE / 2 - (this.gameState === 'PLAYING' ? Math.sin(t * Math.PI) * 80 : 0);

                this.drawCharacter(ctx, charX, charY, currentThemeColor);
            }
        }
        ctx.restore();
    }

    drawCharacter(ctx, x, y, color) {
        ctx.save();
        ctx.shadowBlur = 40; ctx.shadowColor = color;
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 35, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    drawStair(ctx, x, y, size, isNext, themeColor, char) {
        ctx.save();
        ctx.shadowBlur = isNext ? 30 : 10;
        ctx.shadowColor = isNext ? themeColor : 'rgba(255,255,255,0.1)';
        ctx.beginPath(); ctx.roundRect(x, y, size, size, 20);
        const grad = ctx.createLinearGradient(x, y, x + size, y + size);
        grad.addColorStop(0, '#333'); grad.addColorStop(1, '#111');
        ctx.fillStyle = grad; ctx.fill();
        ctx.strokeStyle = isNext ? themeColor : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = isNext ? 5 : 2; ctx.stroke();

        // 알파벳 그리기 (1인용 전용)
        if (playerCount === 1 && char) {
            ctx.fillStyle = '#ffd600';
            ctx.font = 'bold 45px "Outfit"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = '#ffd600';
            ctx.shadowBlur = 15;
            ctx.fillText(char, x + size / 2, y + size / 2);
        }
        ctx.restore();
    }
}

function init() {
    canvas.width = CANVAS_WIDTH; canvas.height = CANVAS_HEIGHT;
    bestScoreEl.textContent = bestScore;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('contextmenu', (e) => {
        if (!menuOverlay.classList.contains('visible') && playerCount === 3) e.preventDefault();
    });
    const panel = document.getElementById('learning-info');
    if (panel) panel.classList.remove('hidden'); // 초기 상태에서도 내용이 보이도록 히든 제거
    renderLandingLearningList(); // 초기 리스트 렌더링 (회색)
    requestAnimationFrame(gameLoop);
}

window.setPlayerAndStart = function (count) {
    playerCount = count;
    instances = [];
    for (let i = 0; i < count; i++) instances.push(new GameInstance(i));

    uiOverlay.className = count === 3 ? 'three-player' : (count === 2 ? 'two-player' : 'single-player');
    document.getElementById('p2-ui').classList.toggle('hidden', count < 2);
    document.getElementById('p3-ui').classList.toggle('hidden', count < 3);

    document.getElementById('app').classList.add('playing');
    menuOverlay.classList.remove('visible');

    // 시작 시 학습 드로어 노출 정책: 1인용일 때만 활성화
    const drawer = document.getElementById('learning-drawer');
    const panel = document.getElementById('learning-info');

    if (drawer && panel) {
        if (count === 1) {
            panel.classList.remove('hidden');
            drawer.style.display = 'flex';
            drawer.classList.add('game-mode'); // 게임 중에는 배경 모드
            drawer.classList.remove('open');
        } else {
            panel.classList.add('hidden');
            drawer.style.display = 'none';
        }
    }

    instances.forEach(inst => { inst.reset(); inst.gameState = 'PLAYING'; });
    isPaused = false;
    pauseOverlay.classList.add('hidden');
};

function handleKeyDown(e) {
    if (e.code === 'F2') {
        e.preventDefault();
        toggleLearningPanel();
        return;
    }

    if (isPaused) {
        if (e.code === 'Enter' || e.code === 'NumpadEnter') {
            togglePause();
        } else if (e.code === 'Escape') {
            quitToHome();
        }
        return;
    }

    if (e.code === 'Escape') {
        togglePause();
        return;
    }

    if (menuOverlay.classList.contains('visible')) {
        if (e.key === '1') setPlayerAndStart(1);
        if (e.key === '2') setPlayerAndStart(2);
        if (e.key === '3') setPlayerAndStart(3);
        return;
    }

    if (instances[0]) {
        // 1P: A(좌), D(우)
        if (e.code === 'KeyA') instances[0].jump(instances[0].player.col - 1);
        if (e.code === 'KeyD') instances[0].jump(instances[0].player.col + 1);

        if (playerCount === 1) {
            if (e.code === 'ArrowLeft') instances[0].jump(instances[0].player.col - 1);
            if (e.code === 'ArrowRight') instances[0].jump(instances[0].player.col + 1);
        }
    }
    if (instances[1]) {
        // 2P: ArrowLeft(좌), ArrowRight(우)
        if (e.code === 'ArrowLeft') instances[1].jump(instances[1].player.col - 1);
        if (e.code === 'ArrowRight') instances[1].jump(instances[1].player.col + 1);
    }
}

function handleMouseDown(e) {
    if (menuOverlay.classList.contains('visible') || isPaused) return;
    if (playerCount === 3 && instances[2]) {
        // 마우스 3P: 좌클릭(왼쪽 점프), 우클릭(오른쪽 점프)
        if (e.button === 0) instances[2].jump(instances[2].player.col - 1); // 좌클릭
        if (e.button === 2) instances[2].jump(instances[2].player.col + 1); // 우클릭
    }
}

function checkAllGameOver() {
    if (instances.every(inst => inst.gameState === 'GAMEOVER')) {
        document.getElementById('app').classList.remove('playing');
        menuTitle.textContent = playerCount > 1 ? '대결 종료' : '게임 종료';

        const results = [...instances].sort((a, b) => b.score - a.score);
        const winnerScore = results[0].score;

        let html = '';

        // 1위 영역 (상단)
        const first = results[0];
        const isFirstWinner = first.score > 0;
        html += `
            <div class="result-row top">
                <div class="result-card ${isFirstWinner ? 'winner' : ''}">
                    ${isFirstWinner ? '<div class="winner-badge">WINNER</div>' : '<div class="rank-badge">1위</div>'}
                    <div class="p-label">PLAYER ${first.id + 1}</div>
                    <div class="p-score">${first.score}</div>
                </div>
            </div>
        `;

        // 2, 3위 영역 (하단)
        if (results.length > 1) {
            html += `<div class="result-row bottom">`;
            for (let i = 1; i < results.length; i++) {
                const res = results[i];
                html += `
                    <div class="result-card">
                        <div class="rank-badge">${i + 1}위</div>
                        <div class="p-label">PLAYER ${res.id + 1}</div>
                        <div class="p-score">${res.score}</div>
                    </div>
                `;
            }
            html += `</div>`;
        }

        document.getElementById('menu-result-area').innerHTML = html;
        menuOverlay.classList.add('visible');

        // 게임 종료 후 랜딩 화면에서 학습 사이드바 다시 표시 (드로어 모드)
        const drawer = document.getElementById('learning-drawer');
        const panel = document.getElementById('learning-info');
        if (drawer && panel) {
            drawer.classList.remove('game-mode'); // 드로어 모드로 복구
            drawer.style.display = 'flex';
            panel.classList.remove('hidden');
            drawer.classList.remove('open'); // 닫힌 상태
            renderLandingLearningList(); // 게임 종료 후 리스트 갱신
        }
    }
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; }, 10);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 2000);
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTimestamp || 0;
    lastTimestamp = timestamp;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (instances.length > 0) {
        const vWidth = CANVAS_WIDTH / playerCount;
        instances.forEach((inst, idx) => {
            if (!isPaused) inst.update(deltaTime);
            inst.draw(ctx, vWidth, idx * vWidth);

            if (playerCount > 1 && idx > 0) {
                ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(idx * vWidth, 0); ctx.lineTo(idx * vWidth, CANVAS_HEIGHT); ctx.stroke();
            }
        });
    }
    requestAnimationFrame(gameLoop);
}

init();
