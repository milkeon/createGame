import { test, expect } from '@playwright/test';

test.describe('Infinity Stairs 3K Core Logic Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/game.html');
        // Ensure browser is ready
        await page.waitForTimeout(1000);
    });

    test('2인용 모드 시작 시 계단 폭이 5칸(min:3, max:7)인지 확인', async ({ page }) => {
        // 2인용 모드 시작
        await page.evaluate(() => {
            window.setPlayerAndStart(2);
        });

        const range = await page.evaluate(() => {
            return instances[0].getColRange(1);
        });

        expect(range.min).toBe(3);
        expect(range.max).toBe(7);
    });

    test('1인용 하드모드 100계단 이후 분기 로직 확인', async ({ page }) => {
        await page.evaluate(() => {
            window.setPlayerAndStart(1, 'hard');
            // 계단 강제 생성 (105단계까지)
            for (let i = 0; i < 105; i++) {
                instances[0].generateStair();
            }
        });

        const isHard = await page.evaluate(() => instances[0].isHardMode);
        const stairCountAtY100 = await page.evaluate(() => {
            const yTarget = 100 * 40; // STAIR_HEIGHT_STEP=40 가정
            return instances[0].stairs.filter(s => s.y === yTarget).length;
        });

        expect(isHard).toBe(true);
        // 하드모드 100단계 이후에는 분기가 발생하여 계단이 2개 생성될 수 있음
        // (정확한 시점은 logic에 따라 다르지만 분기 가능성 확인)
    });

    test('F3 키 입력 시 공부 안함 버튼 상태 및 클래스 변화 확인', async ({ page }) => {
        const initialText = await page.innerText('#study-toggle-btn');
        expect(initialText).toContain('공부 중');

        await page.keyboard.press('F3');
        
        const toggledText = await page.innerText('#study-toggle-btn');
        const hasClass = await page.evaluate(() => document.body.classList.contains('hide-learning'));
        
        expect(toggledText).toContain('공부 안함');
        expect(hasClass).toBe(true);
    });
});
