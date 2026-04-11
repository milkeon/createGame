# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/entry_verification.spec.js >> 메뉴 및 게임 진입 무결성 검증 >> 1. 메인 메뉴 -> 난이도 선택 -> 하드모드 시작 및 메뉴 은폐 확인
- Location: tests/entry_verification.spec.js:10:9

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
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
          - generic: /
          - generic: ←
          - generic: →
        - generic: "0"
      - generic:
        - generic: P1 LIFE
        - generic: ❤️❤️❤️
  - generic [ref=e3]:
    - button "◀ F2" [ref=e4] [cursor=pointer]:
      - generic [ref=e5]:
        - generic [ref=e6]: ◀
        - generic [ref=e7]: F2
    - generic [ref=e8]:
      - generic [ref=e9]: PYTHON ALGORITHM
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e13]: 변수와 문자열
          - generic [ref=e14]:
            - generic [ref=e15]: 문자열 출력
            - generic [ref=e17]: print("Hello world!")
        - generic [ref=e18]:
          - generic [ref=e20]: 변수와 문자열
          - generic [ref=e21]:
            - generic [ref=e22]: 변수 할당
            - generic [ref=e24]: msg = "Hello world!"
        - generic [ref=e25]:
          - generic [ref=e27]: 변수와 문자열
          - generic [ref=e28]:
            - generic [ref=e29]: f-문자열 결합
            - generic [ref=e31]: "f\"{first} {last}\""
        - generic [ref=e32]:
          - generic [ref=e34]: 리스트 (List)
          - generic [ref=e35]:
            - generic [ref=e36]: 리스트 생성
            - generic [ref=e38]: bikes = ['trek', 'giant']
        - generic [ref=e39]:
          - generic [ref=e41]: 리스트 (List)
          - generic [ref=e42]:
            - generic [ref=e43]: 요소 추가
            - generic [ref=e45]: bikes.append('redline')
        - generic [ref=e46]:
          - generic [ref=e48]: 리스트 (List)
          - generic [ref=e49]:
            - generic [ref=e50]: 인덱스 접근
            - generic [ref=e52]: first = bikes[0]
        - generic [ref=e53]:
          - generic [ref=e55]: 리스트 (List)
          - generic [ref=e56]:
            - generic [ref=e57]: 마지막 요소
            - generic [ref=e59]: last = bikes[-1]
        - generic [ref=e60]:
          - generic [ref=e62]: 조건문 (if 문)
          - generic [ref=e63]:
            - generic [ref=e64]: 단순 if 테스트
            - generic [ref=e66]: "if age >= 18:"
        - generic [ref=e67]:
          - generic [ref=e69]: 조건문 (if 문)
          - generic [ref=e70]:
            - generic [ref=e71]: if-elif-else
            - generic [ref=e73]: "elif age < 21:"
        - generic [ref=e74]:
          - generic [ref=e76]: 조건문 (if 문)
          - generic [ref=e77]:
            - generic [ref=e78]: 불리언 값
            - generic [ref=e80]: game_active = True
        - generic [ref=e81]:
          - generic [ref=e83]: 딕셔너리
          - generic [ref=e84]:
            - generic [ref=e85]: 딕셔너리 생성
            - generic [ref=e87]: "alien = {'color': 'green'}"
        - generic [ref=e88]:
          - generic [ref=e90]: 딕셔너리
          - generic [ref=e91]:
            - generic [ref=e92]: 값 접근
            - generic [ref=e94]: print(alien['color'])
        - generic [ref=e95]:
          - generic [ref=e97]: 딕셔너리
          - generic [ref=e98]:
            - generic [ref=e99]: 키-값 추가
            - generic [ref=e101]: alien['points'] = 5
        - generic [ref=e102]:
          - generic [ref=e104]: 사용자 입력 (Input)
          - generic [ref=e105]:
            - generic [ref=e106]: 이름 입력 받기
            - generic [ref=e108]: name = "Eric"
        - generic [ref=e109]:
          - generic [ref=e111]: 사용자 입력 (Input)
          - generic [ref=e112]:
            - generic [ref=e113]: 나이 입력 받기
            - generic [ref=e115]: age = 25
        - generic [ref=e116]:
          - generic [ref=e118]: 사용자 입력 (Input)
          - generic [ref=e119]:
            - generic [ref=e120]: 문자열 출력
            - generic [ref=e122]: "print(f\"Hello, {name}!\")"
  - generic [ref=e124]:
    - generic [ref=e125]:
      - heading "명예의 전당" [level=3] [ref=e126]
      - generic [ref=e127]:
        - heading "1인용 기록" [level=4] [ref=e128]
        - generic [ref=e129]:
          - generic [ref=e130]: 1등
          - generic [ref=e131]: dusdn
          - generic [ref=e132]: "524"
        - generic [ref=e133]:
          - generic [ref=e134]: 2등
          - generic [ref=e135]: dusdn
          - generic [ref=e136]: "522"
        - generic [ref=e137]:
          - generic [ref=e138]: 3등
          - generic [ref=e139]: 동희
          - generic [ref=e140]: "519"
      - generic [ref=e141]:
        - heading "2인용 기록" [level=4] [ref=e142]
        - generic [ref=e143]:
          - generic [ref=e144]: 1등
          - generic [ref=e145]: 미르
          - generic [ref=e146]: "418"
        - generic [ref=e147]:
          - generic [ref=e148]: 2등
          - generic [ref=e149]: jik
          - generic [ref=e150]: "341"
        - generic [ref=e151]:
          - generic [ref=e152]: 3등
          - generic [ref=e153]: 밀컨
          - generic [ref=e154]: "226"
    - generic [ref=e156]:
      - button "공부 중 (F3)" [ref=e157] [cursor=pointer]
      - heading "인피니티 스텝 3K" [level=1] [ref=e158]
      - generic [ref=e159]:
        - generic [ref=e160]: 숫자를 눌러 시작하세요
        - generic [ref=e161]:
          - button "1 1인용" [ref=e162] [cursor=pointer]:
            - generic [ref=e163]: "1"
            - generic [ref=e164]: 1인용
          - button "2 2인용" [ref=e165] [cursor=pointer]:
            - generic [ref=e166]: "2"
            - generic [ref=e167]: 2인용
      - generic [ref=e168]:
        - generic [ref=e169]:
          - generic [ref=e170]: 1P 조작
          - generic [ref=e171]:
            - generic [ref=e172]: A
            - generic [ref=e173]: D
            - text: 또는 방향키
        - generic [ref=e174]:
          - generic [ref=e175]: 2P 조작
          - generic [ref=e176]:
            - generic [ref=e177]: ←
            - generic [ref=e178]: →
            - text: 방향키 조작
    - generic [ref=e179]:
      - heading "내 최고 기록" [level=3] [ref=e180]
      - generic [ref=e181]:
        - generic [ref=e182]: 1인용 기록
        - generic [ref=e183]: "-"
        - generic [ref=e184]: "0"
      - generic [ref=e185]:
        - generic [ref=e186]: 2인용 기록
        - generic [ref=e187]: "-"
        - generic [ref=e188]: "0"
```