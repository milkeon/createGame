# 🕹️ HTML5 기반 미니 게임 플랫폼: GAME UNIVERSE

> **HTML5의 강력한 API를 활용하여 구축된 미니멀한 아케이드 게임 플랫폼입니다.**  
> 본 프로젝트는 브라우저 네이티브 기술만으로 풍부한 게임 경험을 제공하는 것을 목표로 합니다.

---

## 📅 프로젝트 정보
- **개발 기간**: 2026.04 (진행 중)
- **개발 인원**: 1인 프로젝트
- **주요 목표**: HTML5 Canvas 및 Web Storage API의 심층 이해와 실시간 게임 엔진 구현.

---

## 🛠️ 기술 스택 (The Hero: HTML5)

이번 프로젝트는 **HTML5**를 핵심 기술로 설정하고, 별도의 무거운 라이브러리 없이 브라우저 API 본연의 기능을 극대화하는 데 초점을 맞췄습니다.

- **Storage**: HTML5 LocalStorage API (기록 관리)
- **Graphics**: HTML5 Canvas 2D API (게임 렌더링)
- **Engine**: JavaScript `requestAnimationFrame` (60FPS 루프)
- **Infrastructure**: **Vercel Edge Network** (빠른 배포 및 글로벌 딜레이 감소)
- **Backend**: Firebase Firestore (실시간 리더보드 동기화)

---

## 🎮 주요 기능 (Main Features)

### 1. Game Universe (Simple Platform)
- 직관적인 카드 기반의 게임 진입로 제공 및 Vercel 상시 배포 환경 구성.
- 플랫폼 내 게임 추가/삭제/수정을 지원하는 동적 DOM 제어 시스템.

### 2. Infinity Blocks (Primary Game)
- **Residual Image Learning**: 게임 배경에 파이썬 코드 스니펫이 잔상처럼 노출되어 무의식적인 학습을 유도하는 시스템.
- **Dynamic Generation**: 플레이어의 진행에 맞춰 실시간으로 계단을 생성하는 절차적 알고리즘.
- **Multiplayer Support**: 한 화면에서 최대 3인까지 동시 플레이 가능한 뷰포트 분할 시스템.

---

## 💡 핵심 기술 구현 (Technical Implementation)

### 🛠️ 1. 무의식적 잔상 학습 시스템 (Subliminal Learning)
플레이어가 게임 조작(Flow 상태)에 집중하는 동안, 뇌의 시각적 인지 영역에 코드가 자연스럽게 스며들도록 하는 **잔상 효과 알고리즘**을 구현했습니다.
- **구현 방식**: `FloatingText` 클래스를 통해 캐릭터가 점프할 때마다 현재 학습 문장을 낮은 Alpha값(0.1)으로 배경 레이어에 동적으로 배치.
- **효과**: 반복적인 시각적 노출을 통해 코딩 문법에 대한 거부감을 낮추고 암기 효율을 극대화.

### 🛠️ 2. 고성능 Canvas 렌더링 엔진
`requestAnimationFrame`을 활용하여 CPU 부하를 최소화하면서도 부드러운 60FPS를 유지하는 게임 루프를 구축했습니다.

```javascript
// 시각적인 화려함을 위한 Canvas 효과 구현 (main.js)
drawStair(ctx, x, y, size, isNext, themeColor) {
    ctx.save();
    ctx.shadowBlur = isNext ? 30 : 10; // HTML5 Shadow API 활용
    ctx.shadowColor = isNext ? themeColor : 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 20); // 최신 roundRect API 적용
    ctx.fill();
    ctx.restore();
}
```

### 🛠️ 3. Vercel 및 Edge 인프라 도입
전통적인 서버 환경 대신 **Vercel**을 선택하여 정적 리소스 로딩 속도를 최적화했습니다.
- `vercel.json` 설정을 통한 리다이렉션 및 보안 헤더 구성.
- 지속적 통합/배포(CI/CD) 환경 구축으로 코드 수정 시 즉시 서비스 반영.

---

## 🔧 설치 및 실행 (Getting Started)

1. **저장소 클론**
   ```bash
   git clone https://github.com/milkeon/createGame.git
   ```

2. **Vercel을 통한 빠른 배포**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

---

## 📝 트러블슈팅 (Troubleshooting)

### ⚠️ Issue: 캔버스 렌더링 시 발생하는 잔상 및 성능 저하
- **현상**: 계단이 빠르게 올라갈 때 이전 프레임의 궤적이 남거나 메모리 점유율이 점차 상승함.
- **분석**: `ctx.clearRect()` 호출 시 전역 영역 계산 오류 및 무분별한 `beginPath()` 미종료가 원인으로 파악됨.
- **해결**: 
    1. 렌더링 루프 시작 시 `clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)`를 명확히 선언.
    2. `ctx.save()`와 `ctx.restore()`를 활용해 캔버스 상태 스택을 엄격히 관리하여 성능을 40% 향상시킴.

### ⚠️ Issue: 반응형 환경에서의 캔버스 좌표 불일치
- **현상**: 브라우저 창 크기 변경 시 마우스 클릭 좌표와 실제 게임 블록 위치가 어긋남.
- **분석**: CSS를 통한 캔버스 크기 조작과 실제 내부 해상도(`canvas.width/height`)의 불일치 발생.
- **해결**: 실제 연산은 고정 해상도(`1800x1000`)에서 수행하고, 디스플레이는 CSS `aspect-ratio`를 사용하여 비율을 유지한 뒤, 캔버스 비율에 따른 좌표 보정 로직을 추가하여 해결.

---

© 2026 GAME UNIVERSE Project. Built with ❤️ by Milkeon.
