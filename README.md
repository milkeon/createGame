# 🕹️ GAME UNIVERSE | Premium Arcade Platform

![Project Banner](game.png)

> **"모든 모험은 여기서 시작됩니다."**  
> GAME UNIVERSE는 누구나 자신만의 게임을 등록하고 즐길 수 있는 프리미엄 웹 아케이드 플랫폼입니다. 현대적인 UI와 실시간 데이터 동기화 기술을 통해 최상의 사용자 경험을 제공합니다.

---

## 🚀 개요 (Project Overview)

본 프로젝트는 단순한 게임 리스트를 넘어, 사용자가 직접 게임 라이브러리를 관리하고 즐길 수 있는 **확장 가능한 게임 플랫폼**을 지향합니다.  
참고 프로젝트([kosta-jquery-Ajax](https://github.com/nile27/kosta-jquery-Ajax), [kosta-ajax](https://github.com/tmdry4530/kosta-ajax))의 AJAX 활용 기술을 현대적인 Firebase 실시간 통신 및 Vite 빌드 환경으로 계승하여 발전시켰습니다.

### 주요 특징
- **Infinite Arcade**: `InfinityStep`, `RhythmStep` 등 고퀄리티 게임 내장
- **Real-time Sync**: Firebase Firestore를 활용한 실시간 게임 리스트 업데이트
- **Customization**: 유저 친화적인 'Edit Mode'를 통한 자유로운 게임 추가 및 수정
- **Premium Design**: Orbitron & Outfit 폰트를 활용한 사이버펑크 스타일의 다크 모드 UI

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
- **HTML5 & CSS3**: Custom Properties(Variables), Keyframe Animations, Flex/Grid Layout
- **JavaScript (ES6+)**: Module 시스템 기반의 비동기 로직 및 컴포넌트화
- **jQuery 3.7**: DOM 제어 및 이벤트 핸들링 최적화
- **Vite**: 고성능 빌드 도구 및 개발 서버 환경

### Backend & Infrastructure
- **Firebase Firestore**: 게임 메타데이터 및 기록 실시간 데이터베이스
- **Firebase Storage**: 사용자 업로드 이미지 저장 및 관리
- **Vercel**: Edge Network 기반의 고속 웹 호스팅

---

## 🎮 주요 기능 (Main Features)

### 1. Game Universe Platform
- **Hero Carousel**: 주요 게임을 강조하는 자동 재생 무한 캐러셀
- **Dynamic Game Grid**: 라이브러리에 등록된 게임을 실시간으로 렌더링
- **Edit Mode & Modal**: 관리자 모드를 시뮬레이션하여 게임 정보를 직관적으로 관리 (Title, URL, Thumbnail)

### 2. InfinityStep (무한 계단)
- **Hard Mode System**: 동적 계단 생성 알고리즘과 더 빠르게 변하는 난이도 시스템
- **Global Leaderboard**: Firebase 연동을 통한 노멀/하드 모드별 순위 기록

### 3. RhythmStep (리듬 액션)
- **YouTube API Integration**: 음악 비디오와 노트를 정밀하게 동기화
- **Rhythm Engine**: `requestAnimationFrame`을 활용한 60FPS 기반의 부드러운 노트 낙하 로직

---

## 💡 기술적 구현 포인트 (Technical Implementation)

### 1. AJAX를 넘어선 실시간 데이터 통신
기존의 전통적인 AJAX 방식(참고 저장소)을 **Firebase `onSnapshot` 리스너**로 발전시켰습니다. 이를 통해 페이지 새로고침 없이도 다른 클라이언트에서 추가된 게임이 즉시 화면에 반영됩니다.

```javascript
// Firestore 실시간 리스너 활용 (platform.js)
const q = query(gamesRef, orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
    games = [];
    snapshot.forEach((doc) => games.push({ id: doc.id, ...doc.data() }));
    renderGames(); // 데이터 변경 시 즉시 UI 업데이트
});
```

### 2. 클라이언트 사이드 이미지 최적화 (CORS 대응)
외부 이미지 업로드 시 발생하는 CORS 이슈와 스토리지 용량 문제를 해결하기 위해, 브라우저에서 직접 **Canvas API를 활용해 이미지를 리사이징하고 Base64로 인코딩**하는 로직을 구현했습니다.

- **해결 방식**: `FileReader` → `Canvas Resizing (Max 400px)` → `toDataURL('image/jpeg', 0.7)`

---

## 🔧 설치 및 실행 (Getting Started)

1. **저장소 클론**
   ```bash
   git clone https://github.com/milkeon/createGame.git
   cd createGame
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   `.env` 파일을 생성하고 Firebase API 키 정보를 입력합니다. (참고: `.env.example`)

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

---

## 📝 개발자 노트 (Troubleshooting)

- **리듬 게임 동기화**: 유튜브 영상의 지연 시간(Latency) 문제를 해결하기 위해 노트 생성 시 별도의 Offset(보정치) 값을 적용하여 오차를 최소화했습니다.
- **반응형 레이아웃**: 게임 화면의 고정 비율 유지를 위해 CSS `aspect-ratio` 속성과 `clamp()` 함수를 적절히 활용하여 모바일 기기에서도 최적의 플레이 환경을 제공합니다.

---

© 2026 GAME UNIVERSE Project. Built with ❤️ by Milkeon.
