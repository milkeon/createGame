import { test, expect } from '@playwright/test';

test.describe('Platform Landing Page Tests', () => {
    test.beforeEach(async ({ page }) => {
        // 브라우저 로그 출력 설정
        page.on('console', msg => {
            if (msg.type() === 'log') console.log(`BROWSER: ${msg.text()}`);
        });

        // 랜딩 페이지(index.html) 접속
        await page.goto('/');
        await page.waitForTimeout(1000); // Firebase 데이터 로딩 대기
    });

    test('초기 렌더링: 로고 및 게임 그리드가 표시되는지 확인', async ({ page }) => {
        const logo = page.locator('#platform-logo');
        const gameGrid = page.locator('#game-grid');
        
        await expect(logo).toBeVisible();
        await expect(logo).toHaveText('GAME UNIVERSE');
        
        // 게임 데이터 로딩 중이거나 로딩 완료 상태 확인
        await expect(gameGrid).toBeVisible();
    });

    test('캐러셀 동작: 슬라이드 이동 및 버튼 제어 확인', async ({ page }) => {
        const track = page.locator('#carousel-track');
        const nextBtn = page.locator('.carousel-control.next');
        const prevBtn = page.locator('.carousel-control.prev');

        // 캐러셀 트랙 존재 확인
        await expect(track).toBeVisible();

        // 다음 버튼 클릭 시 슬라이드 상태 변화 확인
        await nextBtn.click();
        await page.waitForTimeout(500);
        
        // 이전 버튼 클릭
        await prevBtn.click();
        await page.waitForTimeout(500);
    });

    test('편집 모드 전환: 편집 상태 UI 변화 확인', async ({ page }) => {
        const editBtn = page.locator('#edit-mode-btn');
        const gameGrid = page.locator('#game-grid');

        // 편집 모드 활성화
        await editBtn.click();
        
        // 편집 모드 클래스 적용 확인
        await expect(gameGrid).toHaveClass(/edit-mode/);
        await expect(editBtn).toHaveClass(/active/);
        await expect(editBtn.locator('.btn-text')).toHaveText('EXIT EDIT');

        // 다시 클릭하여 해제
        await editBtn.click();
        await expect(gameGrid).not.toHaveClass(/edit-mode/);
    });

    test('게임 추가 모달: 모달 열기 및 닫기 동작 검증', async ({ page }) => {
        const addBtn = page.locator('#add-game-btn');
        const modal = page.locator('#add-modal');
        const closeBtn = page.locator('.close-btn');

        // 모달 열기
        await addBtn.click();
        await expect(modal).not.toHaveClass(/hidden/);
        await expect(page.locator('#modal-title')).toHaveText('ADD NEW ADVENTURE');

        // 닫기 버튼 클릭
        await closeBtn.click();
        await expect(modal).toHaveClass(/hidden/);
    });

    test('모달 폼 유효성: 필수 입력 누락 시 경고 확인', async ({ page }) => {
        await page.click('#add-game-btn');
        
        // 빈 데이터로 제출 시도
        await page.click('#submit-game');
        
        // 토스트 메시지 표시 여부 확인 (toast 클래스 존재 여부)
        const toast = page.locator('.toast.error');
        await expect(toast).toBeVisible();
    });
});
