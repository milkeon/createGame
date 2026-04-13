import { test, expect } from '@playwright/test';

test.describe('Platform Landing Page Tests', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => {
            if (msg.type() === 'log') console.log(`BROWSER: ${msg.text()}`);
        });

        await page.goto('/');
        // 네트워크가 완전히 멈추길 기다리는 대신, 게임 카드가 최소 하나라도 나타날 때까지 대기
        await page.waitForSelector('.game-card', { timeout: 10000 });
        await page.waitForTimeout(1000); 
    });

    test('초기 렌더링: 로고 및 게임 그리드가 표시되는지 확인', async ({ page }) => {
        const logo = page.locator('#platform-logo');
        await expect(logo).toBeVisible();
        await expect(page.locator('.game-card').first()).toBeVisible();
    });

    test('캐러셀 동작: 슬라이드 이동 및 버튼 제어 확인', async ({ page }) => {
        const nextBtn = page.locator('.carousel-control.next');
        const slides = page.locator('.carousel-slide');
        
        await expect(slides.first()).toBeVisible();
        await nextBtn.click();
        
        // 애니메이션 완료 대기 없이 active 클래스 존재 여부만 체크
        await expect(page.locator('.carousel-slide.active')).toBeVisible();
    });

    test('편집 모드 전환: 편집 상태 UI 변화 확인', async ({ page }) => {
        const editBtn = page.locator('#edit-mode-btn');
        const gameGrid = page.locator('#game-grid');

        await editBtn.click();
        // 클래스 변화 대기
        await expect(gameGrid).toHaveClass(/edit-mode/);
        
        const deleteBtn = page.locator('.delete-card-btn').first();
        await expect(deleteBtn).toBeVisible();

        await editBtn.click();
        await expect(gameGrid).not.toHaveClass(/edit-mode/);
    });

    test('게임 추가 모달: 모달 열기 및 닫기 동작 검증', async ({ page }) => {
        const addBtn = page.locator('#add-game-btn');
        const modal = page.locator('#add-modal');
        const closeBtn = page.locator('.close-btn');

        await addBtn.click();
        await expect(modal).not.toHaveClass(/hidden/);

        await closeBtn.click();
        await expect(modal).toHaveClass(/hidden/);
    });

    test('모달 폼 유효성: 필수 입력 누락 시 경고 확인', async ({ page }) => {
        await page.click('#add-game-btn');
        await page.waitForTimeout(300);
        
        await page.click('#submit-game');
        
        // 토스트 메시지 대기
        const toast = page.locator('#toast-container .toast.error');
        await expect(toast).toBeVisible({ timeout: 5000 });
    });
});
