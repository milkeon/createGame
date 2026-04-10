import { test, expect } from '@playwright/test';

test.describe('Infinity Stairs 3K Enhanced Logic Tests', () => {
    test.beforeEach(async ({ page }) => {
        // 브라우저 로그를 터미널로 전달
        page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));

        try {
            await page.goto('http://localhost:5173/game.html');
        } catch (e) {
            await page.goto('http://localhost:5174/game.html');
        }
        await page.waitForTimeout(500);
    });

    test('UI 전환: 1인용 클릭 시 난이도 선택 메뉴가 나타나는지 확인', async ({ page }) => {
        const landingMenu = page.locator('#landing-menu');
        const modeSelectMenu = page.locator('#mode-select-menu');

        // 초기 상태 확인
        await expect(landingMenu).toBeVisible();
        await expect(modeSelectMenu).not.toBeVisible();

        // 1인용 버튼 클릭
        await page.click('#start-button-1p');

        // 전환 상태 확인
        await expect(landingMenu).not.toBeVisible();
        await expect(modeSelectMenu).toBeVisible();
        await expect(page.locator('button:has-text("Normal")')).toBeVisible();
        await expect(page.locator('button:has-text("Hard")')).toBeVisible();
    });

    test('디자인: 닉네임 유채색 그라데이션 스타일 적용 확인', async ({ page }) => {
        // 랭킹 요소가 렌더링될 때까지 대기 (데이터 로딩 모의)
        await page.evaluate(() => {
            const el = document.createElement('div');
            el.className = 'rank-name';
            el.innerText = 'TestUser';
            document.body.appendChild(el);
        });

        const rankName = page.locator('.rank-name').first();
        const style = await rankName.evaluate((el) => {
            const s = window.getComputedStyle(el);
            return {
                backgroundClip: s.backgroundClip || s.webkitBackgroundClip,
                textFillColor: s.webkitTextFillColor,
                backgroundImage: s.backgroundImage
            };
        });

        // 그라데이션 및 텍스트 채우기 효과 검증
        expect(style.backgroundImage).toContain('linear-gradient');
        expect(style.backgroundClip).toBe('text');
    });

    test('물리 엔진: 하드모드 30계단 주기(100, 130, 160...) 분기/합류 확인', async ({ page }) => {
        await page.evaluate(() => {
            window.setPlayerAndStart(1, 'hard');
            const inst = window.instances[0];
            
            // 100계단까지 생성 (분기 시작 지점)
            while(inst.stairs[inst.stairs.length-1].y < 100 * 40) inst.generateStair();
        });

        const checkCycle = async (targetLevel) => {
            return await page.evaluate((lvl) => {
                const inst = window.instances[0];
                const targetY = lvl * 160;
                while (Math.round(Math.max(...inst.stairs.map(s => s.y)) / 160) < lvl + 5) {
                    inst.generateStair();
                }
                // 부동 소수점 오차 대비 (1px 미만 허용)
                const stairsAtY = inst.stairs.filter(s => Math.abs(s.y - targetY) < 1);
                if (stairsAtY.length === 0) {
                    const lastStairs = inst.stairs.slice(-10).map(s => `Y:${s.y.toFixed(2)}`).join(', ');
                    console.log(`DEBUG: Last 10 stairs: ${lastStairs}. Looking for Y:${targetY}`);
                }
                console.log(`Testing Level ${lvl} (Y=${targetY}): Found ${stairsAtY.length} stairs.`);
                return { count: stairsAtY.length };
            }, targetLevel);
        };

        const state100 = await checkCycle(101); 
        expect(state100.count).toBe(2);

        const state130 = await checkCycle(131); 
        expect(state130.count).toBe(1);

        const state160 = await checkCycle(161); 
        expect(state160.count).toBe(2);
    });

    test('F3 기능: 배경 학습 패널(display: none) 실제 은폐 확인', async ({ page }) => {
        // 초기 상태: 드로어가 존재함 (1인용 시작 필요)
        await page.evaluate(() => window.setPlayerAndStart(1));
        const drawer = page.locator('#learning-drawer');
        
        // F3 키 입력
        await page.keyboard.press('F3');
        
        // display: none 적용 여부 확인
        const displayStyle = await drawer.evaluate(el => window.getComputedStyle(el).display);
        expect(displayStyle).toBe('none');

        // 다시 F3 입력 시 복구 확인
        await page.keyboard.press('F3');
        const restoredStyle = await drawer.evaluate(el => window.getComputedStyle(el).display);
        expect(restoredStyle).not.toBe('none');
    });

    test('2인용: 시작부터 5칸 범위(min:3, max:7) 고정 확인', async ({ page }) => {
        await page.evaluate(() => window.setPlayerAndStart(2));
        
        const checkRange = await page.evaluate(() => {
            const range1 = window.instances[0].getColRange(1);
            const range50 = window.instances[0].getColRange(50);
            return { range1, range50 };
        });

        expect(checkRange.range1.min).toBe(3);
        expect(checkRange.range1.max).toBe(7);
        expect(checkRange.range50.min).toBe(3);
        expect(checkRange.range50.max).toBe(7);
    });
});
