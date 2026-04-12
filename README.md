# 🕹️ HTML5 기술 보고서: GAME UNIVERSE 엔진 분석

> **본 문서는 GAME UNIVERSE 플랫폼과 Infinity Blocks 게임의 설계 아키텍처 및 핵심 알고리즘에 대한 기술적 분석을 담고 있습니다.**

---

## 🏗️ 플랫폼 아키텍처 (Platform Architecture)

### 1. 실시간 데이터 동기화 및 썸네일 프로세싱
플랫폼 코어(`platform.js`)는 Firebase Firestore와 Storage를 결합하여 데이터의 실시간성과 영속성을 보장합니다.
- **CORS 및 성능 최적화**: 외부 이미지 URL 사용 시 발생하는 보안 정책 및 용량 문제를 해결하기 위해, 브라우저 내 **Canvas API**를 활용한 클라이언트 사이드 리사이징 및 JPEG 압축(0.7 Quality) 후 Base64로 인코딩하여 저장합니다.
- **Real-time Pub/Sub**: `onSnapshot` 리스너를 통해 게임 라이브러리의 상태 변화를 감지하고, 비동기적으로 UI Grid를 재렌더링하여 데이터 일치성을 유지합니다.

---

## 🎮 핵심 게임 엔진 분석: Infinity Blocks

### 1. 절차적 계단 생성 알고리즘 (Procedural Stair Generation)
무한히 이어지는 게임 세계를 구현하기 위해 **결정론적 랜덤(Deterministic Random)** 로직을 기반으로 계단을 생성합니다.

```javascript
// 레벨에 따른 가동 범위 계산 로직 (main.js)
getColRange(level) {
    if (playerCount >= 3) return { min: 4, max: 6 }; // 멀티플레이 난이도 고정
    let min = 2, max = 8;
    let extra = Math.floor(level / 15); // 15단계마다 가동 범위 확장
    for (let i = 1; i <= extra; i++) {
        if (i % 2 === 1) max = Math.min(10, max + 1);
        else min = Math.max(0, min - 1);
    }
    return { min, max };
}
```
- **난이도 설계**: 점수가 높아질수록 `getColRange`가 반환하는 범위가 넓어지며, 이는 플레이어의 시각적 탐색 비용을 증가시켜 자연스러운 난이도 상승을 유도합니다.

### 2. 무의식적 잔상 학습 엔진 (Subliminal Learning Engine)
플레이어의 몰입(Flow)을 방해하지 않으면서 교육적 효과를 극대화하기 위해 **Alpha Blending** 기반의 시각 시스템을 도입했습니다.

- **FloatingText 클래스**: 각 텍스트 객체는 독립적인 가속도(`vx`, `vy`)와 생명주기를 가집니다.
- **인지 부하 제어**: 텍스트의 불투명도를 `0.05~0.1` 사이로 제한하여 시각적 노이즈를 최소화하고, 점프 이펙트 시점에만 간헐적으로 노출하여 '무의식적 각인'을 유도합니다.

### 3. 고성능 Canvas 렌더링 파이프라인
안정적인 60FPS 환경을 위해 캔버스 렌더링 과정을 계층화(Layering)하여 관리합니다.

1. **Background Layer**: 은은하게 흐르는 잔상 텍스트가 먼저 그려집니다 (`globalAlpha` 제어).
2. **Dynamic World Layer**: 플레이어 위치에 따른 카메라 트래킹(`cameraY`)이 적용된 계단 객체들이 렌더링됩니다.
3. **Player & FX Layer**: 점프 애니메이션의 이징(Easing) 수식과 `shockwaves` 이펙트가 최단 시간 프레임 내에 처리됩니다.

---

## 💡 주요 기술 구현 상세

### 🛠️ 프레임 기반 애니메이션 및 동기화
`requestAnimationFrame` 루프 내에서 가변적인 `deltaTime`을 계산하여, 기기 사양에 관계없이 일관된 게임 속도를 유지합니다.
- **Jump Easing**: 단순한 직선 이동이 아닌, `Math.pow` 기반의 완화 함수를 적용하여 포물선 점프의 물리적 느낌을 재현합니다.
- **Time Gauge Logic**: 점수가 올라갈수록 시간 감소율(`TIME_DECREASE_RATE`)이 선형적으로 증가하도록 설계하여 하이 레벨에서의 긴장감을 고조시킵니다.

### 🛠️ 데이터 지속성 전략 (Hybrid Persistence)
데이터의 특성에 따라 서로 다른 저장 기술을 선택적으로 적용합니다.
- **LocalStorage**: 최고 기록(`bestScore`) 및 학습 진척도와 같이 즉각적인 접근이 필요한 개인화 데이터 관리.
- **Firebase Firestore**: 전역 랭킹 및 대결 기록과 같이 데이터 무결성이 중요한 데이터의 원격 저장 및 공유.

---

## 📝 기술적 문제 해결 (Troubleshooting Case)

### ⚠️ 반응형 캔버스 좌표 동기화 이슈
- **문제**: 브라우저 리사이징 시 CSS 레이아웃 변경으로 인해 마우스/터치 좌표와 캔버스 내부 논리 좌표 간의 불일치 발생.
- **해결**: `getBoundingClientRect()`를 통해 캔버스의 실제 렌더링 크기를 구한 뒤, 고정 논리 해상도(`1800x1000`)에 대한 배율을 계산하여 좌표를 실시간 보정하는 매핑 함수를 구축하여 해결했습니다.

### ⚠️ 이미지 업로드 시 CORS 및 메모리 누수
- **문제**: 외부 URL 사용 시 캔버스 오염(Tainted Canvas) 문제로 인한 이미지 처리 불가 현상.
- **해결**: 이미지 로딩 전 `crossOrigin = "Anonymous"` 설정을 선행하고, 리사이징 처리 직후 메모리 점유를 해제하기 위해 `FileReader`와 임시 캔버스 객체를 명시적으로 가비지 컬렉팅하여 성능을 최적화했습니다.

---

© 2026 GAME UNIVERSE Project.
