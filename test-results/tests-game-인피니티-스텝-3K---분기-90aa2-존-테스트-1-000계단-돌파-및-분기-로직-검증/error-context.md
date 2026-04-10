# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/game.spec.js >> 인피니티 스텝 3K - 분기 시스템(Branching) 검증 >> 장거리 생존 테스트: 1,000계단 돌파 및 분기 로직 검증
- Location: tests/game.spec.js:9:7

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: page.click: Test timeout of 180000ms exceeded.
Call log:
  - waiting for locator('button:has-text("1인용")')
    - locator resolved to <button id="start-button-1p" onclick="showModeSelect()">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <canvas width="1800" height="1000" id="game-canvas"></canvas> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <canvas width="1800" height="1000" id="game-canvas"></canvas> intercepts pointer events
    - retrying click action
      - waiting 100ms
    332 × waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <canvas width="1800" height="1000" id="game-canvas"></canvas> intercepts pointer events
      - retrying click action
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner
  - generic:
    - generic:
      - generic:
        - generic:
          - text: P1 SCORE
          - generic: A
          - generic: D
        - generic: "0"
      - generic:
        - generic: P1 LIFE
        - generic: ❤️❤️❤️
  - generic [ref=e3]:
    - button [ref=e4] [cursor=pointer]
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e9]: 변수와 문자열
        - generic [ref=e10]:
          - generic [ref=e11]: 문자열 출력
          - generic [ref=e13]: print("Hello world!")
      - generic [ref=e14]:
        - generic [ref=e16]: 변수와 문자열
        - generic [ref=e17]:
          - generic [ref=e18]: 변수 할당
          - generic [ref=e20]: msg = "Hello world!"
      - generic [ref=e21]:
        - generic [ref=e23]: 변수와 문자열
        - generic [ref=e24]:
          - generic [ref=e25]: f-문자열 결합
          - generic [ref=e27]: "f\"{first} {last}\""
      - generic [ref=e28]:
        - generic [ref=e30]: 리스트 (List)
        - generic [ref=e31]:
          - generic [ref=e32]: 리스트 생성
          - generic [ref=e34]: bikes = ['trek', 'giant']
      - generic [ref=e35]:
        - generic [ref=e37]: 리스트 (List)
        - generic [ref=e38]:
          - generic [ref=e39]: 요소 추가
          - generic [ref=e41]: bikes.append('redline')
      - generic [ref=e42]:
        - generic [ref=e44]: 리스트 (List)
        - generic [ref=e45]:
          - generic [ref=e46]: 인덱스 접근
          - generic [ref=e48]: first = bikes[0]
      - generic [ref=e49]:
        - generic [ref=e51]: 리스트 (List)
        - generic [ref=e52]:
          - generic [ref=e53]: 마지막 요소
          - generic [ref=e55]: last = bikes[-1]
      - generic [ref=e56]:
        - generic [ref=e58]: 조건문 (if 문)
        - generic [ref=e59]:
          - generic [ref=e60]: 단순 if 테스트
          - generic [ref=e62]: "if age >= 18:"
      - generic [ref=e63]:
        - generic [ref=e65]: 조건문 (if 문)
        - generic [ref=e66]:
          - generic [ref=e67]: if-elif-else
          - generic [ref=e69]: "elif age < 21:"
      - generic [ref=e70]:
        - generic [ref=e72]: 조건문 (if 문)
        - generic [ref=e73]:
          - generic [ref=e74]: 불리언 값
          - generic [ref=e76]: game_active = True
      - generic [ref=e77]:
        - generic [ref=e79]: 딕셔너리
        - generic [ref=e80]:
          - generic [ref=e81]: 딕셔너리 생성
          - generic [ref=e83]: "alien = {'color': 'green'}"
      - generic [ref=e84]:
        - generic [ref=e86]: 딕셔너리
        - generic [ref=e87]:
          - generic [ref=e88]: 값 접근
          - generic [ref=e90]: print(alien['color'])
      - generic [ref=e91]:
        - generic [ref=e93]: 딕셔너리
        - generic [ref=e94]:
          - generic [ref=e95]: 키-값 추가
          - generic [ref=e97]: alien['points'] = 5
      - generic [ref=e98]:
        - generic [ref=e100]: 사용자 입력 (Input)
        - generic [ref=e101]:
          - generic [ref=e102]: 이름 입력 받기
          - generic [ref=e104]: name = "Eric"
      - generic [ref=e105]:
        - generic [ref=e107]: 사용자 입력 (Input)
        - generic [ref=e108]:
          - generic [ref=e109]: 나이 입력 받기
          - generic [ref=e111]: age = 25
      - generic [ref=e112]:
        - generic [ref=e114]: 사용자 입력 (Input)
        - generic [ref=e115]:
          - generic [ref=e116]: 문자열 출력
          - generic [ref=e118]: "print(f\"Hello, {name}!\")"
  - generic [ref=e120]:
    - generic [ref=e121]:
      - heading "명예의 전당 (Global)" [level=3] [ref=e122]
      - generic [ref=e123]:
        - heading "1인용 TOP 3" [level=4] [ref=e124]
        - generic [ref=e125]:
          - generic [ref=e126]: 1등 dusdn
          - generic [ref=e127]: 524점
        - generic [ref=e128]:
          - generic [ref=e129]: 2등 dusdn
          - generic [ref=e130]: 522점
        - generic [ref=e131]:
          - generic [ref=e132]: 3등 동희
          - generic [ref=e133]: 519점
      - generic [ref=e134]:
        - heading "2인용 TOP 3" [level=4] [ref=e135]
        - generic [ref=e136]:
          - generic [ref=e137]: 1등 미르
          - generic [ref=e138]: 418점
        - generic [ref=e139]:
          - generic [ref=e140]: 2등 jik
          - generic [ref=e141]: 341점
        - generic [ref=e142]:
          - generic [ref=e143]: 3등 밀컨
          - generic [ref=e144]: 226점
    - generic [ref=e146]:
      - button "공부 중 (F3)" [ref=e147] [cursor=pointer]
      - heading "인피니티 스텝 3K" [level=1] [ref=e148]
      - generic [ref=e149]:
        - generic [ref=e150]: 숫자를 눌러 시작하세요
        - generic [ref=e151]:
          - button "1 1인용" [ref=e152] [cursor=pointer]:
            - generic [ref=e153]: "1"
            - generic [ref=e154]: 1인용
          - button "2 2인용" [ref=e155] [cursor=pointer]:
            - generic [ref=e156]: "2"
            - generic [ref=e157]: 2인용
      - generic [ref=e159]:
        - generic [ref=e160]: 조작키
        - generic [ref=e161]:
          - generic [ref=e162]: A
          - generic [ref=e163]: D
          - text: 또는 방향키
    - generic [ref=e164]:
      - heading "내 최고 기록 (Local)" [level=3] [ref=e165]
      - generic [ref=e166]:
        - generic [ref=e167]: 1인용 개인 최고
        - generic [ref=e168]:
          - generic [ref=e169]: "-"
          - generic [ref=e170]: 0점
      - generic [ref=e171]:
        - generic [ref=e172]: 2인용 대결 최고
        - generic [ref=e173]:
          - generic [ref=e174]: "-"
          - generic [ref=e175]: 0점
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('인피니티 스텝 3K - 분기 시스템(Branching) 검증', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await page.goto('http://localhost:5173/game.html');
  7  |   });
  8  | 
  9  |   test('장거리 생존 테스트: 1,000계단 돌파 및 분기 로직 검증', async ({ page }) => {
  10 |     test.setTimeout(180000); // 분기가 많으므로 3분 넉넉히
  11 | 
> 12 |     await page.click('button:has-text("1인용")');
     |                ^ Error: page.click: Test timeout of 180000ms exceeded.
  13 |     
  14 |     // AI 자동 플레이 (분기 대응 로직 포함)
  15 |     const finalScore = await page.evaluate(async () => {
  16 |       const wait = (ms) => new Promise(res => setTimeout(res, ms));
  17 |       
  18 |       for (let i = 0; i < 5000; i++) {
  19 |         const p1 = window.instances ? window.instances[0] : null;
  20 |         if (!p1 || p1.gameState !== 'PLAYING') {
  21 |           await wait(100);
  22 |           continue;
  23 |         }
  24 |         
  25 |         if (p1.score >= 1000) break;
  26 |         
  27 |         const nextY = (p1.score + 1) * 160; 
  28 |         // 현재 위치에서 닿을 수 있는(거리 1 이내) 계단 찾기
  29 |         const reachable = p1.stairs.filter(s => s.y === nextY && Math.abs(s.col - p1.player.col) <= 1);
  30 |         
  31 |         if (reachable.length > 0) {
  32 |           // 분기 시 아무 길이나 선택 (첫 번째 계단)
  33 |           p1.jump(reachable[0].col);
  34 |         } else {
  35 |           const atNextY = p1.stairs.filter(s => s.y === nextY);
  36 |           console.log(`[BOT STUCK] Score: ${p1.score}, PlayerCol: ${p1.player.col}, Stairs at NextY(${nextY}):`, atNextY.map(s => s.col));
  37 |           // 계단이 아직 생성 안 되었을 수 있으므로 대기
  38 |           await wait(100);
  39 |           continue;
  40 |         }
  41 |         await wait(15); 
  42 |       }
  43 |       return window.instances[0].score;
  44 |     });
  45 | 
  46 |     console.log(`Branching test reached score: ${finalScore}`);
  47 |     expect(finalScore).toBeGreaterThanOrEqual(1000);
  48 |   });
  49 | 
  50 |   test('분기 데이터 검증: 동일 높이에 두 개의 계단 존재 확인', async ({ page }) => {
  51 |     await page.click('button:has-text("1인용")');
  52 |     
  53 |     // 150점까지 빠르게 스킵 (분기 발생 영역)
  54 |     await page.evaluate(async () => {
  55 |       const p1 = window.instances[0];
  56 |       while(p1.score < 150) {
  57 |         const nextY = (p1.score + 1) * 160;
  58 |         const s = p1.stairs.find(s => s.y === nextY && Math.abs(s.col - p1.player.col) <= 1);
  59 |         if(s) p1.jump(s.col);
  60 |       }
  61 |     });
  62 | 
  63 |     // 100~200 구간 중에 동일한 Y 좌표에 계단이 2개인 지점이 있는지 체크
  64 |     const hasBranch = await page.evaluate(() => {
  65 |       const p1 = window.instances[0];
  66 |       const yMap = {};
  67 |       p1.stairs.forEach(s => {
  68 |         if (s.y >= 100 * 160) {
  69 |           yMap[s.y] = (yMap[s.y] || 0) + 1;
  70 |         }
  71 |       });
  72 |       return Object.values(yMap).some(count => count >= 2);
  73 |     });
  74 | 
  75 |     expect(hasBranch).toBe(true);
  76 |   });
  77 | 
  78 | });
  79 | 
```