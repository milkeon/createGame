import { db } from './firebase-config.js';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const DEFAULT_THUMB = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop';

let games = [];

// 초기화
function init() {
    setupFirestoreRealtime();
    setupEventListeners();
}

// Firestore 실시간 리스너 설정
function setupFirestoreRealtime() {
    const gamesRef = collection(db, "games");
    const q = query(gamesRef, orderBy("createdAt", "desc"));

    // 실시간 데이터 구독
    onSnapshot(q, (snapshot) => {
        games = [];
        snapshot.forEach((doc) => {
            games.push({ id: doc.id, ...doc.data() });
        });
        renderGames();
    }, (error) => {
        console.error("Firestore Error:", error);
        showToast("데이터를 불러오는 중 오류가 발생했습니다.", "error");
    });
}

function renderGames() {
    const grid = document.getElementById('game-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    // 기본 게임이 하나도 없는 경우를 방지 (첫 렌더링 시 데모 데이터)
    if (games.length === 0) {
        grid.innerHTML = '<div class="no-games">게임을 불러오고 있습니다...</div>';
    }

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
window.openModal = function() {
    const modal = document.getElementById('add-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('game-title').focus();
    }, 100);
}

window.closeModal = function() {
    const modal = document.getElementById('add-modal');
    modal.classList.add('hidden');
    document.getElementById('game-title').value = '';
    document.getElementById('game-url').value = '';
    document.getElementById('game-thumb').value = '';
}

// 새 게임 추가
window.addNewGame = async function() {
    const titleVal = document.getElementById('game-title').value.trim();
    const urlVal = document.getElementById('game-url').value.trim();
    const thumbVal = document.getElementById('game-thumb').value.trim();

    if (!titleVal || !urlVal) {
        showToast('게임 제목과 URL을 입력해주세요!', 'error');
        return;
    }

    try {
        const btn = document.getElementById('submit-game');
        btn.disabled = true;
        btn.innerText = 'SAVING...';

        await addDoc(collection(db, "games"), {
            title: titleVal.toUpperCase(),
            url: urlVal,
            thumb: thumbVal || DEFAULT_THUMB,
            createdAt: serverTimestamp()
        });

        window.closeModal();
        showToast(`"${titleVal}" 게임이 추가되었습니다!`, 'success');
    } catch (e) {
        console.error("Add error:", e);
        showToast("서버 저장 중 오류가 발생했습니다.", "error");
    } finally {
        const btn = document.getElementById('submit-game');
        if (btn) {
            btn.disabled = false;
            btn.innerText = 'SAVE GAME';
        }
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeModal();
    });

    const inputs = ['game-title', 'game-url', 'game-thumb'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') window.addNewGame();
            });
        }
    });

    // 전역 함수 등록 (HTML onclick 대응)
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-msg">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', init);
