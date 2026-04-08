// Game Universe Platform Logic

const DEFAULT_THUMB = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop';
const KEY_GAMES = 'GAMES_LIST';

// 초기 데이터
const INITIAL_GAMES = [
    {
        id: Date.now(),
        title: 'INFINITY STEP',
        url: 'game.html',
        thumb: 'thumb_infinity.png'
    }
];

let games = [];

// 초기화
function init() {
    const savedGames = localStorage.getItem(KEY_GAMES);
    if (savedGames) {
        games = JSON.parse(savedGames);
    } else {
        games = INITIAL_GAMES;
        saveGames();
    }
    renderGames();
    setupEventListeners();
}

function saveGames() {
    localStorage.setItem(KEY_GAMES, JSON.stringify(games));
}

function renderGames() {
    const grid = document.getElementById('game-grid');
    if (!grid) return;

    grid.innerHTML = '';
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.onclick = () => location.href = game.url;
        
        card.innerHTML = `
            <div class="thumb-container">
                <img src="${game.thumb || DEFAULT_THUMB}" alt="${game.title}" onerror="this.src='${DEFAULT_THUMB}'">
            </div>
            <div class="card-info">
                <h4>${game.title}</h4>
                <div class="enter-hint">CLICK TO ENTER <span class="arrow">→</span></div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 모달 제어
function openModal() {
    const modal = document.getElementById('add-modal');
    modal.classList.remove('hidden');
    // 제목 입력 필드에 자동 포커스
    setTimeout(() => {
        document.getElementById('game-title').focus();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('add-modal');
    modal.classList.add('hidden');
    // 입력 필드 초기화
    document.getElementById('game-title').value = '';
    document.getElementById('game-url').value = '';
    document.getElementById('game-thumb').value = '';
}

// 새 게임 추가
function addNewGame() {
    const titleVal = document.getElementById('game-title').value.trim();
    const urlVal = document.getElementById('game-url').value.trim();
    const thumbVal = document.getElementById('game-thumb').value.trim();

    if (!titleVal || !urlVal) {
        showToast('게임 제목과 URL을 입력해주세요!', 'error');
        return;
    }

    const newGame = {
        id: Date.now(),
        title: titleVal.toUpperCase(),
        url: urlVal,
        thumb: thumbVal || DEFAULT_THUMB
    };

    games.push(newGame);
    saveGames();
    renderGames();
    closeModal();
    showToast(`"${titleVal}" 게임이 추가되었습니다!`, 'success');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // Esc 키로 모달 닫기
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // 엔터 키 대응
    const inputs = ['game-title', 'game-url', 'game-thumb'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addNewGame();
            });
        }
    });
}

// 토스트 메시지
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-msg">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', init);
