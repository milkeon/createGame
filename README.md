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
- **Style**: CSS3 Custom Properties & Keyframe Animation (사이버펑크 테마)
- **Backend**: Firebase Firestore (실시간 리더보드 동기화)

---

## 🎮 주요 기능 (Main Features)

### 1. Game Universe (Simple Platform)
- 직관적인 카드 기반의 게임 진입로 제공.
- HTML5 시맨틱 태그를 활용한 미니멀한 레이아웃 설계.
- 플랫폼 내 게임 추가/삭제/수정을 지원하는 동적 DOM 제어 시스템.

### 2. Infinity Blocks (Primary Game)
- **Infinite Generation**: 플레이어의 조작에 맞춰 실시간으로 계단을 생성하는 절차적 알고리즘.
- **Learning Mode**: 계단을 오르며 파이썬 알고리즘 스니펫을 수집하는 교육용 모드 구현.
- **Multiplayer Support**: 한 화면에서 최대 3인까지 동시 플레이 가능한 뷰포트 분할 시스템.

---

## 💡 핵심 기술 구현 (Technical Implementation)

### 🛠️ 1. 고성능 Canvas 렌더링 엔진
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

### 🛠️ 2. Web Storage 기반 데이터 영속성
서버 통신 이전에 브라우저 내 **LocalStorage API**를 활용하여 데이터 접근 속도를 극대화했습니다. 
- 사용자 최고 기록(`bestScore`) 관리.
- 학습 진척도(`learned_concepts`)를 JSON 문자열로 직렬화하여 영구 저장.

### 🛠️ 3. Procedural Path-finding Algorithm
무한히 생성되는 계단 경로가 화면 밖을 벗어나지 않으면서도 적절한 난이도(좌측/우측 확률 조절)를 유지할 수 있도록 하는 랜덤 경로 생성 로직을 설계했습니다.

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
