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

import { db } from './firebase-config.js';
import { collection, addDoc, query, orderBy, limit, getDocs, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const menuOverlay = document.getElementById('menu-overlay');
const menuTitle = document.getElementById('menu-title');
const toastContainer = document.getElementById('toast-container');
const uiOverlay = document.getElementById('ui-overlay');
const pauseOverlay = document.getElementById('pause-overlay');

let lastTimestamp = 0;
let isBackgroundStudyHidden = false; // [New] 1인용 플레이 시 배경 공부창 노출 여부
let instances = [];
let playerCount = 1;
let isPaused = false;

let currentMenuState = 'MAIN'; // 'MAIN' or 'DIFFICULTY_SELECT'
let gameDifficulty = 'NORMAL'; // 'NORMAL' or 'HARD'

function showDifficultySelect() {
    currentMenuState = 'DIFFICULTY_SELECT';
    document.getElementById('main-menu-view').classList.add('hidden');
    document.getElementById('difficulty-menu-view').classList.remove('hidden');
}

function goBackToMainMenu() {
    currentMenuState = 'MAIN';
    document.getElementById('main-menu-view').classList.remove('hidden');
    document.getElementById('difficulty-menu-view').classList.add('hidden');
}

function selectDifficulty(diff) {
    gameDifficulty = diff;
    setPlayerAndStart(1);
}

window.showDifficultySelect = showDifficultySelect;
window.selectDifficulty = selectDifficulty;
window.goBackToMainMenu = goBackToMainMenu;

// [New] 글로벌 및 로컬 랭킹 상태 관리 (1P 노말/하드 분리)
let globalRankings = { "1P_NORMAL": [], "1P_HARD": [], "2P": [] };
let localBest = {
    "1P_NORMAL": [],
    "1P_HARD": [],
    "2P": []
};

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

window.toggleLearningMode = function () {
    isBackgroundStudyHidden = !isBackgroundStudyHidden;
    const drawer = document.getElementById('learning-drawer');
    const panel = document.getElementById('learning-info');
    const statusText = document.getElementById('study-status-text');

    // UI 텍스트 업데이트
    if (statusText) statusText.textContent = `배경 공부창: ${isBackgroundStudyHidden ? '끔' : '켬'}`;

    // 게임 플레이 중(1인용)인 경우 즉시 반영
    if (playerCount === 1) {
        const isPlaying = document.getElementById('app').classList.contains('playing');
        if (isPlaying && drawer && panel) {
            if (isBackgroundStudyHidden) {
                drawer.style.setProperty('display', 'none', 'important');
                panel.classList.add('hidden');
            } else {
                drawer.style.setProperty('display', 'flex', 'important');
                panel.classList.remove('hidden');
            }
        }
        showToast(`배경 공부창 ${isBackgroundStudyHidden ? '비활성화' : '활성화'}`, isBackgroundStudyHidden ? "warning" : "success");
    } else {
        showToast(`배경 공부창 설정: ${isBackgroundStudyHidden ? '끔' : '켬'}`, "info");
    }
};

window.toggleLearningPanel = function () {
    const drawer = document.getElementById('learning-drawer');
    // 플레이 중이 아닐 때만 사이드바 열기/닫기 작동
    if (drawer && !document.getElementById('app').classList.contains('playing')) {
        drawer.classList.toggle('open');
    }
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

window.quitToHome = function () {
    isPaused = false;
    pauseOverlay.classList.add('hidden');
    document.getElementById('app').classList.remove('playing');
    instances.forEach(inst => inst.gameState = 'READY');
    menuTitle.textContent = '인피니티 블럭스'; // 제목 변경 반영
    document.getElementById('menu-result-area').innerHTML = ''; // 결과 영역 초기화
    menuOverlay.classList.add('visible');
    goBackToMainMenu(); // 메뉴 상태 리셋
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

// [New] 글로벌 랭킹 데이터 가져오기 (Top 3)
async function fetchGlobalRankings() {
    try {
        const modes = ["1P_NORMAL", "1P_HARD", "2P"];
        for (const mode of modes) {
            try {
                let q;
                if (mode === "1P_NORMAL") {
                    // 구버전(1P)과 신버전(1P_NORMAL) 기록을 모두 가져옴
                    q = query(
                        collection(db, "scores"),
                        where("gameMode", "in", ["1P", "1P_NORMAL"]),
                        orderBy("score", "desc"),
                        limit(3)
                    );
                } else {
                    q = query(
                        collection(db, "scores"),
                        where("gameMode", "==", mode),
                        orderBy("score", "desc"),
                        limit(3)
                    );
                }
                const querySnapshot = await getDocs(q);
                globalRankings[mode] = querySnapshot.docs.map(doc => doc.data());
            } catch (err) {
                console.warn(`[Index Required] Fetching global ranks for ${mode} failed.`, err);
                globalRankings[mode] = [];
            }
        }
        renderLeaderboards();
    } catch (e) {
        console.error("Critical fetch rank error:", e);
        renderLeaderboards(); 
    }
}

// [New] 로컬 최고점 초기화 및 로드
function loadLocalBest() {
    const saved = localStorage.getItem('infinity_step_local_best');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            
            // 기존 "1P" 데이터를 "1P_NORMAL"로 마이그레이션
            if (parsed["1P"] && !parsed["1P_NORMAL"]) {
                parsed["1P_NORMAL"] = parsed["1P"];
                delete parsed["1P"];
            }

            const modes = ["1P_NORMAL", "1P_HARD", "2P"];
            modes.forEach(mode => {
                if (Array.isArray(parsed[mode])) {
                    localBest[mode] = parsed[mode];
                }
            });
        } catch (e) {
            console.warn("LocalBest parse error, resetting...", e);
        }
    }
}

// [New] 최고점 저장 (로컬 + 파이어베이스)
async function saveRecord(mode, score, name) {
    if (score <= 0) return;
    if (mode === '3P') return; 

    // 1인용이면 난이도에 따라 모드명 세분화
    let finalMode = mode;
    if (mode === '1P') {
        finalMode = gameDifficulty === 'HARD' ? '1P_HARD' : '1P_NORMAL';
    }

    // 로컬 업데이트 (상위 3위 유지)
    if (!localBest[finalMode]) localBest[finalMode] = [];
    localBest[finalMode].push({ score, name });
    localBest[finalMode].sort((a, b) => b.score - a.score);
    localBest[finalMode] = localBest[finalMode].slice(0, 3);

    localStorage.setItem('infinity_step_local_best', JSON.stringify(localBest));

    // 파이어베이스 저장
    try {
        await addDoc(collection(db, "scores"), {
            playerName: name || "Anonymous", 
            score: score,
            gameMode: finalMode,
            timestamp: serverTimestamp()
        });
        showToast("명예의 전당에 기록되었습니다!", "success");
        fetchGlobalRankings(); 
    } catch (e) {
        console.error("Error saving record:", e);
    }
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
        this.player = { col: 5, y: 0, prevCol: 5, prevY: 0, jumpStartTime: performance.now() };
        this.stairs = [{ col: 5, y: 0, char: '' }];
        this.shockwaves = [];
        this.fallState = { vx: 0, vy: 0, worldX: 0, worldY: 0, rotation: 0, scale: 1, startTime: 0 };
        this.respawnTimer = 0;
        this.blinkTimer = 0;
        this.difficulty = (playerCount === 1) ? gameDifficulty : 'NORMAL';
        
        // 하드 모드용 다중 경로 관리 (컬럼 번호들의 배열)
        this.pathCols = [5]; 

        // 1인용 전용 학습 모드 초기화 (반드시 stairs 생성 후 호출)
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
            // [Fix] 배경 공부창 숨김 설정이 되어 있으면 hidden 클래스 유지
            if (isBackgroundStudyHidden) {
                panel.classList.add('hidden');
            } else {
                panel.classList.remove('hidden');
            }
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
        const lastStairY = this.stairs[this.stairs.length - 1].y;
        const nextY = lastStairY + STAIR_HEIGHT_STEP;
        const level = Math.round(nextY / STAIR_HEIGHT_STEP);
        const range = this.getColRange(level);

        // 하드 모드 분기/결합 판정 (100층부터 30층 주기)
        let isSplitMode = false;
        if (this.difficulty === 'HARD' && level >= 100) {
            const cycle = Math.floor((level - 100) / 30);
            if (cycle % 2 === 0) isSplitMode = true; // 0~29, 60~89... 층은 분기 모드
        }

        let newPathCols = [];

        if (isSplitMode && this.pathCols.length === 1) {
            // [분기 시작] 1 -> 2 (양 옆 대각선으로 갈라짐)
            const base = this.pathCols[0];
            let nextL = base - 1;
            let nextR = base + 1;
            
            // 경계 처리: 한쪽이 막히면 다른 쪽으로 더 벌리거나 가능한 쪽만 생성
            if (nextL < range.min) { nextL = base + 1; nextR = base + 3; }
            if (nextR > range.max) { nextR = base - 1; nextL = base - 3; }
            
            newPathCols.push(nextL, nextR);
        } else if (!isSplitMode && this.pathCols.length > 1) {
            // [결합 시도] 2 -> 1
            const L = this.pathCols[0];
            const R = this.pathCols[1];
            if (Math.abs(L - R) === 2) {
                // 거리가 정확히 2일 때만 그 사이(중앙)로 완벽하게 합체
                newPathCols.push((L + R) / 2);
            } else if (Math.abs(L - R) < 2) {
                // 너무 가까우면(거리 1) 서로 엇갈리게 이동하여 대각선 유지
                newPathCols.push(L + (L < R ? -1 : 1));
                newPathCols.push(R + (R < L ? -1 : 1));
            } else {
                // 멀면 서로를 향해 1칸씩 다가오기 (대각선 유지)
                newPathCols.push(L + (L < R ? 1 : -1));
                newPathCols.push(R + (R < L ? 1 : -1));
            }
        } else {
            // [기존 유지] (분기 유지 또는 단일 경로 유지)
            this.pathCols.forEach((col, idx) => {
                let nextCol = col + (Math.random() > 0.5 ? 1 : -1);
                
                // 경계선 튕기기 (수직 이동 방지)
                if (nextCol < range.min) nextCol = col + 1;
                if (nextCol > range.max) nextCol = col - 1;

                // 분기 유지 중에는 서로 너무 겹치지 않게 제어
                if (this.pathCols.length > 1) {
                    if (idx === 0) nextCol = Math.min(nextCol, this.pathCols[1] - 1);
                    else nextCol = Math.max(nextCol, this.pathCols[0] + 1);
                }
                
                // 최종 안전장치: 어떤 이유로든 제자리라면 강제 이동
                if (nextCol === col) {
                    nextCol = col + (col <= range.min ? 1 : -1);
                }
                newPathCols.push(nextCol);
            });
        }

        // 전체 컬럼 범위 제한 및 중복 제거
        this.pathCols = [...new Set(newPathCols)].map(c => Math.max(range.min, Math.min(range.max, c)));

        // 실제 계단 객체 생성 및 알파벳 심기
        this.pathCols.forEach((col, idx) => {
            let stairChar = '';
            // 문자는 첫 번째 길(주 경로)에만 배치
            if (idx === 0 && playerCount === 1 && this.targetSnippet) {
                if (this.snippetPointer < this.targetSnippet.length) {
                    stairChar = this.targetSnippet[this.snippetPointer];
                    this.snippetPointer++;
                }
            }
            this.stairs.push({ col, y: nextY, char: stairChar });
        });
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
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('contextmenu', (e) => {
        if (!menuOverlay.classList.contains('visible') && playerCount === 3) e.preventDefault();
    });
    const panel = document.getElementById('learning-info');
    if (panel) panel.classList.remove('hidden'); // 초기 상태에서도 내용이 보이도록 히든 제거
    renderLandingLearningList(); // 초기 리스트 렌더링 (회색)

    // [New] 랭킹 데이터 초기화
    loadLocalBest();
    fetchGlobalRankings();

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
            drawer.classList.add('game-mode');
            drawer.classList.remove('open');
            if (isBackgroundStudyHidden) {
                drawer.style.setProperty('display', 'none', 'important');
                panel.classList.add('hidden');
            } else {
                drawer.style.setProperty('display', 'flex', 'important');
                panel.classList.remove('hidden');
            }
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
    if (e.code === 'Escape') {
        const nameModal = document.getElementById('name-input-modal');
        const isModalOpen = nameModal && !nameModal.classList.contains('hidden');

        if (isModalOpen) {
            hideNameModal();
            return;
        }

        const isMenuVisible = menuOverlay.classList.contains('visible');
        const resultsArea = document.getElementById('menu-result-area');
        const isResultShown = resultsArea && resultsArea.innerHTML.trim() !== "";

        if (isMenuVisible && isResultShown) {
            quitToHome();
            return;
        }

        // 일시정지 된 상태에서 Esc를 누르면 홈으로
        if (isPaused) {
            quitToHome();
            return;
        }

        // 게임 중일 때 Esc를 누르면 일시정지 토글
        if (document.getElementById('app').classList.contains('playing')) {
            togglePause();
            return;
        }
    }

    if (e.code === 'F2') {
        e.preventDefault();
        toggleLearningPanel();
        return;
    }

    if (e.code === 'F3') {
        e.preventDefault();
        toggleLearningMode();
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

    if (menuOverlay.classList.contains('visible')) {
        const nameModal = document.getElementById('name-input-modal');
        const isModalOpen = nameModal && !nameModal.classList.contains('hidden');

        if (!isModalOpen) {
            if (currentMenuState === 'MAIN') {
                if (e.key === '1') showDifficultySelect();
                if (e.key === '2') setPlayerAndStart(2);
                if (e.key === '3') setPlayerAndStart(3);
            } else if (currentMenuState === 'DIFFICULTY_SELECT') {
                if (e.key === '1') selectDifficulty('NORMAL');
                if (e.key === '2') selectDifficulty('HARD');
                if (e.key === 'Escape') goBackToMainMenu();
            }
        }
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
        menuTitle.innerHTML = `<span style="color:var(--neon-magenta)">${playerCount > 1 ? '대결 종료' : '게임 종료'}</span><br><small style="font-size:0.5em; opacity:0.7">인피니티 블럭스</small>`;

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
        goBackToMainMenu(); // 메뉴 상태를 메인(인원 선택)으로 리셋

        // [New] Firebase에 점수 저장
        // [New] 랭킹 체크 및 UI 업데이트 로직 (이후 UI 작업에서 상세 구현)
        handleRankingAtGameOver(results);

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

// [New] 랭킹 처리 통합 함수
async function handleRankingAtGameOver(results) {
    if (playerCount === 3) return;

    // 상세 모드 결정 (1P 노말/하드 분리)
    let modeKey = playerCount === 1 ? (gameDifficulty === 'HARD' ? '1P_HARD' : '1P_NORMAL') : "2P";
    const topResult = results[0];

    // 로컬 상위 3위 이내에 진출했는지 확인
    const currentRecords = localBest[modeKey] || [];
    const isTop3 = currentRecords.length < 3 || topResult.score > currentRecords[currentRecords.length - 1].score;

    if (isTop3) {
        showHighScoreInput(modeKey, topResult.score);
    } else {
        await saveRecord(modeKey, topResult.score, "Anonymous");
    }
}

// [New] 이름 입력 UI 노출 (모달 방식)
function showHighScoreInput(mode, score) {
    const modal = document.getElementById('name-input-modal');
    const scoreDisplay = document.getElementById('modal-score-display');
    const input = document.getElementById('player-name-input');
    const saveBtn = document.getElementById('modal-save-btn');

    if (!modal || !scoreDisplay || !input || !saveBtn) return;

    scoreDisplay.textContent = score;
    input.value = ""; // 초기화
    modal.classList.remove('hidden');

    // 이벤트 리스너 재설정 (클론 사용으로 중복 방지)
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

    newSaveBtn.onclick = () => submitRecord(mode, score);

    // 포커스 강제 (사용자 규칙: 인풋 있으면 항상 기본으로 커서가 잡히게)
    setTimeout(() => {
        input.focus();
        input.onkeypress = (e) => {
            if (e.key === 'Enter') submitRecord(mode, score);
        };
    }, 100);
}

window.hideNameModal = function () {
    const modal = document.getElementById('name-input-modal');
    if (modal) modal.classList.add('hidden');
};

window.submitRecord = function (mode, score) {
    const input = document.getElementById('player-name-input');
    const name = input ? input.value.trim() : "";
    if (!name) {
        showToast("이름을 입력해주세요!", "warning");
        return;
    }
    saveRecord(mode, score, name);
    hideNameModal();
};

// [New] 랭킹 보드 렌더링
function renderLeaderboards() {
    const globalBoard = document.getElementById('global-leaderboard');
    const localBoard = document.getElementById('local-best-board');
    if (!globalBoard || !localBoard) return;

    const displayModes = [
        { key: "1P_NORMAL", title: "1인용 (노멀)" },
        { key: "1P_HARD", title: "1인용 (하드)" },
        { key: "2P", title: "2인용 기록" }
    ];

    // 글로벌 랭킹 렌더링
    let globalHtml = '<h3>명예의 전당</h3>';
    displayModes.forEach(mode => {
        globalHtml += `<div class="mode-rank-group"><h4>${mode.title}</h4>`;
        const ranks = globalRankings[mode.key];
        if (ranks && ranks.length > 0) {
            ranks.forEach((res, i) => {
                const displayName = res.playerName || res.name || 'Anonymous';
                globalHtml += `
                    <div class="rank-item">
                        <span class="m">${i + 1}위</span>
                        <span class="n">${displayName}</span>
                        <span class="s">${res.score}</span>
                    </div>
                `;
            });
        } else {
            globalHtml += `<div class="no-data">기록 없음</div>`;
        }
        globalHtml += `</div>`;
    });
    globalBoard.innerHTML = globalHtml;

    // 로컬 최고점 렌더링
    let localHtml = '<h3>내 최고 기록</h3>';
    displayModes.forEach(mode => {
        localHtml += `<div class="mode-rank-group"><h4>${mode.title}</h4>`;
        const records = localBest[mode.key] || [];

        if (records.length > 0) {
            records.forEach((best, idx) => {
                localHtml += `
                    <div class="local-item">
                        <span class="m">${idx + 1}위</span>
                        <span class="n">${best.name || 'User'}</span>
                        <span class="s">${best.score || 0}</span>
                    </div>
                `;
            });
        } else {
            localHtml += `<div class="no-data">기록 없음</div>`;
        }
        localHtml += `</div>`;
    });
    localBoard.innerHTML = localHtml;
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

// [New] BGM 오디오 제어 엔진
function initBGM() {
    const bgmAudio = document.getElementById('bgm-audio');
    const bgmToggle = document.getElementById('bgm-toggle');
    const bgmStatusIcon = document.getElementById('bgm-status-icon');
    const bgmContainer = document.getElementById('bgm-container');

    if (!bgmAudio || !bgmToggle) return;

    // 로컬 스토리지에서 이전 상태 로드 (기본값: 재생)
    const savedBgmState = localStorage.getItem('infinity_blocks_bgm_state');
    let isMuted = savedBgmState === 'muted';

    const updateUI = () => {
        if (isMuted) {
            bgmAudio.muted = true;
            bgmStatusIcon.textContent = '🔇';
            bgmContainer.classList.remove('bgm-playing');
        } else {
            bgmAudio.muted = false;
            bgmStatusIcon.textContent = '🔊';
            if (!bgmAudio.paused) bgmContainer.classList.add('bgm-playing');
        }
    };

    const tryPlay = () => {
        if (isMuted) return;
        bgmAudio.play().then(() => {
            bgmContainer.classList.add('bgm-playing');
            updateUI();
        }).catch(err => {
            console.log("Autoplay blocked. Waiting for user interaction.");
        });
    };

    // 토글 버튼 클릭 이벤트
    bgmToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // 메인 메뉴 키 이벤트 방해 금지
        isMuted = !isMuted;
        localStorage.setItem('infinity_blocks_bgm_state', isMuted ? 'muted' : 'playing');
        
        if (!isMuted && bgmAudio.paused) {
            bgmAudio.play().then(() => bgmContainer.classList.add('bgm-playing'));
        }
        updateUI();
    });

    // 브라우저 정책 대응: 모든 종류의 상호작용 시 자동 재생 트리거
    const startAudioOnFirstInteraction = () => {
        if (!isMuted && bgmAudio.paused) {
            tryPlay();
        }
        // 한 번 실행 후 모든 리스너 제거
        const events = ['click', 'keydown', 'mousedown', 'mousemove', 'touchstart'];
        events.forEach(evt => document.removeEventListener(evt, startAudioOnFirstInteraction));
    };

    const events = ['click', 'keydown', 'mousedown', 'mousemove', 'touchstart'];
    events.forEach(evt => document.addEventListener(evt, startAudioOnFirstInteraction, { once: true }));

    // 초기 실행
    updateUI();
    tryPlay();
}

// 초기화 시 호출
document.addEventListener('DOMContentLoaded', () => {
    initBGM();
});
