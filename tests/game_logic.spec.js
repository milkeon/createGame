import { test, expect } from '@playwright/test';

test.describe('Infinity Stairs 3K Enhanced Logic Tests', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => {
            if (msg.type() === 'log') console.log(`BROWSER LOG: ${msg.text()}`);
            if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`);
        });
        page.on('pageerror', err => console.log(`PAGE ERROR: ${err.message}`));

        await page.goto('/game.html');
        await page.waitForFunction(() => typeof window.setPlayerAndStart === 'function', { timeout: 10000 });
        await page.waitForTimeout(1000); 
    });

    test('UI 전환: 1인용 클릭 시 난이도 선택 메뉴가 나타나는지 확인', async ({ page }) => {
        const mainMenu = page.locator('#main-menu-view');
        const difficultyMenu = page.locator('#difficulty-menu-view');
        await expect(mainMenu).toBeVisible();
        await page.click('#start-button-1p');
        await expect(difficultyMenu).toBeVisible();
    });

    test('물리 엔진: 하드모드 30계단 주기 검증', async ({ page }) => {
        await page.evaluate(() => {
            window.gameDifficulty = 'HARD';
            window.setPlayerAndStart(1);
            window.instances[0].difficulty = 'HARD';
        });

        const checkCycleState = async (targetLevel) => {
            return await page.evaluate((lvl) => {
                const inst = window.instances[0];
                while (Math.round(inst.stairs[inst.stairs.length - 1].y / 160) < lvl) {
                    inst.generateStair();
                }
                return { pathCount: inst.pathCols.length };
            }, targetLevel);
        };

        const state110 = await checkCycleState(110); 
        expect(state110.pathCount).toBe(2);
        const state140 = await checkCycleState(140); 
        expect(state140.pathCount).toBe(1);
    });

    test('F3 기능: 배경 학습 패널 실제 은폐 확인', async ({ page }) => {
        await page.evaluate(() => window.setPlayerAndStart(1));
        const drawer = page.locator('#learning-drawer');
        await page.keyboard.press('F3');
        expect(await drawer.evaluate(el => window.getComputedStyle(el).display)).toBe('none');
    });

    test('데이터 연동: 게임 오버 시 랭킹 입력 모달 노출 확인', async ({ page }) => {
        await page.evaluate(() => {
            window.setPlayerAndStart(1);
            const inst = window.instances[0];
            inst.score = 100; // 고득점 시뮬레이션
            inst.gameState = 'GAMEOVER';
            // 실제 게임 오버 로직 강제 트리거
            window.handleRankingAtGameOver([{ id: 0, score: 100 }]);
        });

        const modal = page.locator('#name-input-modal');
        await expect(modal).not.toHaveClass(/hidden/);
        
        // 닉네임 입력 및 엔터 저장 흐름 테스트
        const input = page.locator('#player-name-input');
        await input.fill('TESTER');
        await page.keyboard.press('Enter');

        // 제출 후 모달이 닫혀야 함
        await expect(modal).toHaveClass(/hidden/);
    });

    test('학습 시스템: 개념 완료 시 저장 로직 호출 검증', async ({ page }) => {
        const hasSaveFunction = await page.evaluate(() => {
            return typeof window.saveLearnedConcept === 'function';
        });
        expect(hasSaveFunction).toBe(true);

        // 학습 완료 시뮬레이션 (함수 호출 시 에러가 없는지 확인)
        const errorOccurred = await page.evaluate(() => {
            try {
                window.saveLearnedConcept('python_basics_01');
                return false;
            } catch (e) {
                return true;
            }
        });
        expect(errorOccurred).toBe(false);
    });

    test('2인용: 시작부터 5칸 범위 고정 확인', async ({ page }) => {
        await page.evaluate(() => window.setPlayerAndStart(2));
        const checkRange = await page.evaluate(() => {
            const range1 = window.instances[0].getColRange(1);
            return { range1 };
        });
        expect(checkRange.range1.min).toBe(3);
        expect(checkRange.range1.max).toBe(7);
    });
});
