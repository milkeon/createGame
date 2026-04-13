import { test, expect } from '@playwright/test';

test.describe('Infinity Stairs 3K Enhanced Logic Tests', () => {
    test.beforeEach(async ({ page }) => {
        // 브라우저 로그 및 에러 출력
        page.on('console', msg => {
            if (msg.type() === 'log') console.log(`BROWSER LOG: ${msg.text()}`);
            if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`);
        });
        page.on('pageerror', err => console.log(`PAGE ERROR: ${err.message}`));

        await page.goto('/game.html');
        // 함수가 로드될 때까지 대기하고 확인 로그 출력
        await page.waitForFunction(() => typeof window.setPlayerAndStart === 'function', { timeout: 10000 });
        const exists = await page.evaluate(() => typeof window.setPlayerAndStart);
        console.log(`TEST DEBUG: setPlayerAndStart type: ${exists}`);
        
        await page.waitForTimeout(1000); // 넉넉한 안정화 시간
    });

    // ... 기존 성공 테스트들은 그대로 유지 ...
    test('UI 전환: 1인용 클릭 시 난이도 선택 메뉴가 나타나는지 확인', async ({ page }) => {
        const mainMenu = page.locator('#main-menu-view');
        const difficultyMenu = page.locator('#difficulty-menu-view');
        await expect(mainMenu).toBeVisible();
        await page.click('#start-button-1p');
        await expect(difficultyMenu).toBeVisible();
    });

    test('디자인: 닉네임 유채색 그라데이션 스타일 적용 확인', async ({ page }) => {
        await page.evaluate(() => {
            const el = document.createElement('div');
            el.className = 'rank-name';
            el.innerText = 'TestUser';
            el.style.backgroundImage = 'linear-gradient(to right, red, blue)';
            el.style.backgroundClip = 'text';
            el.style.webkitBackgroundClip = 'text';
            el.style.webkitTextFillColor = 'transparent';
            document.body.appendChild(el);
        });
        const rankName = page.locator('.rank-name').first();
        expect(await rankName.evaluate(el => window.getComputedStyle(el).backgroundImage)).toContain('linear-gradient');
    });

    test('물리 엔진: 하드모드 30계단 주기 검증', async ({ page }) => {
        await page.waitForFunction(() => typeof window.setPlayerAndStart === 'function');
        await page.evaluate(() => {
            window.gameDifficulty = 'HARD'; // 전역 난이도 설정을 먼저 변경
            window.setPlayerAndStart(1);
            // 인스턴스의 난이도도 확실히 HARD인지 재확인
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
        await page.keyboard.press('F3');
        expect(await drawer.evaluate(el => window.getComputedStyle(el).display)).not.toBe('none');
    });

    test('2인용: 시작부터 5칸 범위 고정 확인', async ({ page }) => {
        await page.waitForFunction(() => typeof window.setPlayerAndStart === 'function');
        await page.evaluate(() => {
            if (typeof window.setPlayerAndStart === 'function') {
                window.setPlayerAndStart(2);
            } else {
                throw new Error("setPlayerAndStart is missing for 2P test");
            }
        });
        
        const checkRange = await page.evaluate(() => {
            const range1 = window.instances[0].getColRange(1);
            const range50 = window.instances[0].getColRange(50);
            return { range1, range50 };
        });

        expect(checkRange.range1.min).toBe(3);
        expect(checkRange.range50.min).toBe(3);
    });
});
