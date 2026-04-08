import { db, storage } from './firebase-config.js';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const DEFAULT_THUMB = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop';

let games = [];
let isEditMode = false;
let currentEditingId = null;
let selectedFile = null;

// 초기화
function init() {
    setupFirestoreRealtime();
    setupEventListeners();
}

// Firestore 실시간 리스너 설정
function setupFirestoreRealtime() {
    const gamesRef = collection(db, "games");
    const q = query(gamesRef, orderBy("createdAt", "desc"));

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
    
    if (games.length === 0) {
        grid.innerHTML = '<div class="no-games">게임을 불러오고 있습니다...</div>';
    }

    if (isEditMode) {
        grid.classList.add('edit-mode');
    } else {
        grid.classList.remove('edit-mode');
    }

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.onclick = () => {
            if (isEditMode) {
                openEditModal(game);
            } else {
                location.href = game.url;
            }
        };
        
        card.innerHTML = `
            <div class="thumb-container">
                <img src="${game.thumb || DEFAULT_THUMB}" alt="${game.title}" onerror="this.src='${DEFAULT_THUMB}'">
            </div>
            <div class="card-info">
                <h4>${game.title}</h4>
                <div class="enter-hint">
                    ${isEditMode ? 'CLICK TO EDIT' : 'CLICK TO ENTER <span class="arrow">→</span>'}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 에디트 모드 토글
window.toggleEditMode = function() {
    isEditMode = !isEditMode;
    const btn = document.getElementById('edit-mode-btn');
    if (isEditMode) {
        btn.classList.add('active');
        btn.querySelector('.btn-text').innerText = 'EXIT EDIT';
        showToast('편집 모드가 활성화되었습니다. 카드를 클릭해 수정하세요.', 'info');
    } else {
        btn.classList.remove('active');
        btn.querySelector('.btn-text').innerText = 'EDIT MODE';
    }
    renderGames();
}

// 썸네일 미리보기
window.previewThumb = function(input) {
    if (input.files && input.files[0]) {
        selectedFile = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('thumb-preview');
            const img = document.getElementById('preview-img');
            img.src = e.target.result;
            preview.classList.remove('hidden');
            // URL 입력창 비우기
            document.getElementById('game-thumb').value = '';
        }
        reader.readAsDataURL(selectedFile);
    }
}

window.clearThumb = function() {
    selectedFile = null;
    document.getElementById('game-thumb-file').value = '';
    document.getElementById('thumb-preview').classList.add('hidden');
    document.getElementById('preview-img').src = '';
}

// 모달 제어
window.openModal = function() {
    currentEditingId = null;
    window.clearThumb();
    document.getElementById('modal-title').innerText = 'ADD NEW ADVENTURE';
    document.getElementById('submit-game').innerText = 'SAVE GAME';
    
    const modal = document.getElementById('add-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('game-title').focus();
    }, 100);
}

window.openEditModal = function(game) {
    currentEditingId = game.id;
    window.clearThumb();
    document.getElementById('modal-title').innerText = 'EDIT ADVENTURE';
    document.getElementById('submit-game').innerText = 'UPDATE GAME';

    document.getElementById('game-title').value = game.title;
    document.getElementById('game-url').value = game.url;
    document.getElementById('game-thumb').value = game.thumb === DEFAULT_THUMB ? '' : game.thumb;

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
    window.clearThumb();
    currentEditingId = null;
}

// 이미지 리사이징 및 Base64 변환 함수 (CORS 이슈 해결용)
async function processImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400; // 썸네일 적정 해상도로 제한
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // 용량을 줄이기 위해 jpeg 포맷과 0.7 압축률 사용
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// 게임 추가 또는 수정 처리
window.handleGameSubmit = async function() {
    const titleVal = document.getElementById('game-title').value.trim();
    const urlVal = document.getElementById('game-url').value.trim();
    let thumbVal = document.getElementById('game-thumb').value.trim();

    if (!titleVal || !urlVal) {
        showToast('게임 제목과 URL을 입력해주세요!', 'error');
        return;
    }

    try {
        const btn = document.getElementById('submit-game');
        btn.disabled = true;
        btn.innerText = 'PROCESSING...';

        // 파일이 선택된 경우 Base64로 변환 (스토리지 CORS 우회)
        if (selectedFile) {
            thumbVal = await processImage(selectedFile);
        }

        const gameData = {
            title: titleVal.toUpperCase(),
            url: urlVal,
            thumb: thumbVal || DEFAULT_THUMB
        };

        btn.innerText = 'SAVING...';

        if (currentEditingId) {
            const gameRef = doc(db, "games", currentEditingId);
            await updateDoc(gameRef, gameData);
            showToast(`"${titleVal}" 정보가 수정되었습니다!`, 'success');
        } else {
            gameData.createdAt = serverTimestamp();
            await addDoc(collection(db, "games"), gameData);
            showToast(`"${titleVal}" 게임이 추가되었습니다!`, 'success');
        }

        window.closeModal();
    } catch (e) {
        console.error("Submit error:", e);
        showToast("데이터 저장 중 오류가 발생했습니다.", "error");
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
                if (e.key === 'Enter') window.handleGameSubmit();
            });
        }
    });
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
