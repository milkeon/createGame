# 🕹️ GAME UNIVERSE | Simple Arcade Platform

![Project Banner](game.png)

> **GAME UNIVERSE**는 다양한 웹 게임들을 한데 모아 간편하게 즐길 수 있도록 구축된 아주 간단한 게임 플랫폼입니다.

---

## 🚀 개요 (Project Overview)

본 프로젝트는 사용자가 여러 아케이드 게임을 하나의 라이브러리에서 관리하고 플레이할 수 있는 미니멀한 플랫폼입니다.  
참고 프로젝트([kosta-jquery-Ajax](https://github.com/nile27/kosta-jquery-Ajax), [kosta-ajax](https://github.com/tmdry4530/kosta-ajax))의 AJAX 기술을 기반으로 하되, 현대적인 Firebase 실시간 통신 및 Vite 빌드 환경을 적용하여 효율적으로 구성되었습니다.

### 주요 특징
- **Game Library**: 간결한 UI를 통해 내부 게임으로 즉시 연결
- **Infinity Blocks**: 플랫폼의 메인 게임으로, 무한히 블록 계단을 오르는 아케이드 게임
- **Real-time Sync**: Firebase Firestore를 활용한 실시간 리스트 관리
- **Simple Edit Mode**: 간단한 인터페이스를 통한 게임 추가 및 정보 수정

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
- **HTML5 & CSS3**: Custom Properties, Animations, Responsive Layout
- **JavaScript (ES6+)**: 모듈 시스템 기반의 로직 및 컴포넌트화
- **jQuery 3.7**: 직관적인 DOM 제어 및 이벤트 처리
- **Vite**: 고성능 빌드 및 개발 서버 환경

### Backend & Infrastructure
- **Firebase Firestore**: 실시간 데이터베이스 관리
- **Firebase Storage**: 썸네일 이미지 최적화 저장

---

## 🎮 핵심 게임: Infinity Blocks

**Infinity Blocks**는 좌우 방향 조작을 통해 무한히 생성되는 블록 계단을 빠르게 올라가는 고전 아케이드 스타일의 게임입니다.

- **Dynamic Generation**: 플레이어의 진행에 맞춰 실시간으로 다음 블록 경로가 생성됩니다.
- **Hard Mode**: 진행 거리가 늘어날수록 블록 생성 패턴이 복잡해지고 속도가 빨라지는 난이도 시스템이 적용되어 있습니다.
- **Global Leaderboard**: Firebase 연동을 통해 전 세계 플레이어와 최고 기록을 겨룰 수 있습니다.

---

## 💡 기술적 구현 포인트 (Technical Implementation)

### 1. 실시간 데이터 동기화
참고 저장소의 전통적인 AJAX 방식을 발전시켜, Firebase의 `onSnapshot` 기능을 활용해 플랫폼에 등록된 게임 리스트를 실시간으로 동기화합니다. 사용자가 게임을 추가하거나 수정하는 즉시 모든 클라이언트의 화면에 반영됩니다.

### 2. 효율적인 리소스 관리
플랫폼의 가벼움을 유지하기 위해, 이미지 업로드 시 Canvas API를 이용해 자동으로 리사이징 및 압축 처리를 수행하여 스토리지 사용량을 최적화했습니다.

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

- **반응형 게임 레이아웃**: 게임 화면의 고정 비율 유지를 위해 CSS `aspect-ratio`를 활용하여 다양한 디바이스 환경에서도 일관된 게임 경험을 제공합니다.
- **상태 관리**: 플랫폼의 복잡도를 낮추기 위해 별도의 무거운 상태 관리 라이브러리 대신, Vanilla JS와 Firestore 리스너를 조합하여 미니멀한 아키텍처를 유지했습니다.

---

© 2026 GAME UNIVERSE Project. Built with ❤️ by Milkeon.
