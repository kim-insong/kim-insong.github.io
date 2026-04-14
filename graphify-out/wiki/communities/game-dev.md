# Community: 게임 서버 / 아키텍처

Community ID: `game-dev` | Nodes: 15 | Source: `src/content/wiki/`

## Overview

insong의 게임 서버 개발 경험에서 나온 패턴들. 주로 C++ 서버, 언리얼 엔진, Redis를 사용하는 환경. 세 개의 독립적이지만 연결된 서브토픽을 다룸:
1. 요청 추적 (RequestContext)
2. 데이터 소유권 (기획데이터 독립성)
3. 실시간 랭킹 (Redis sorted set)

---

## 1. 게임 서버 요청 컨텍스트 패턴

**Source**: `src/content/wiki/game-server-request-context.md`

### 핵심 개념: RequestContext

모든 서버 진입점에서 발급하는 C++ 구조체.

```cpp
struct RequestContext {
    uint64_t request_id;    // 전역 유니크 ID (분산 트레이싱 가능)
    RequestType type;       // PACKET / GM_COMMAND / SCHEDULED_EVENT
    uint64_t player_id;     // 플레이어 (없으면 0)
    uint64_t gm_id;         // GM (없으면 0)
    std::string trigger;    // 이벤트명 (자동 이벤트)
    int64_t timestamp_ms;
};
```

### 진입점 분류

| 진입점 유형 | 예시 | actor 필드 |
|------------|------|-----------|
| 패킷 수신 | 이동, 공격, 아이템 구매 | player_id |
| 운영툴 명령 | 아이템 지급, 강제 이동 | gm_id |
| 자동 이벤트 | 타이머, 스케줄러, 조건 트리거 | trigger |

### 설계 원칙

- 진입점에서만 발급, 이후 전달만 함 (생성 금지)
- 핸들러 체인 전체를 관통 — 로그에는 항상 request_id 포함
- 컨텍스트 누적 패턴: 처리 중간에 player_id 확정되면 context에 추가

---

## 2. 게임 기획데이터 관리 원칙

**Source**: `src/content/wiki/design-data-in-engine.md`

### 문제: 순환 참조

클라이언트가 기획데이터 원본일 때:
```
서버 빌드 → 클라이언트 패키지 필요
클라이언트 빌드 → (서버 스키마 참조 시) 서버 필요
→ 순환
```

언리얼 에셋 Path 기반 참조는 파일 이동 시 redirector가 생겨 서버에서 경로 추적 어려움.

### 해결: 기획데이터 독립 레이어

```
[기획 툴] → [기획데이터 독립 레이어] → 클라이언트 / 서버
                                        (각자 읽기만)
```

차선책 (완전 분리 불가할 때): 스키마만 export해서 순환 의존 차단.

### enum 발급 원칙

| 케이스 | 발급 주체 |
|--------|----------|
| 기획표에 직접 등장하는 값 (몬스터 타입 등) | 기획데이터 |
| 클라·서버 공유 무관 값 | 서버 |
| 한쪽 전용 값 | 각자 |

---

## 3. Redis 랭킹과 스냅샷 패턴

**Sources**:
- `src/content/wiki/redis-leaderboard-snapshot.md`
- `src/content/wiki/leaderboard-snapshot.md`

### 실시간 랭킹 (Sorted Set)

```
ZADD live_ranking <score> <player_id>   # 점수 업데이트 O(log N)
ZREVRANK live_ranking <player_id>       # 내 순위 O(log N)
ZREVRANGE live_ranking 0 99 WITHSCORES # 상위 100명 O(log N + 100)
```

### 스냅샷 패턴 (복사 없이)

**문제**: `ZUNIONSTORE`로 복사하면 수백만 명 데이터에서 수십 초 걸림.

**해결: 이중 sorted set + A/B 교체**

```
평상시: live에만 쓰기
        + snapshot_A에도 동시 쓰기 (미래 스냅샷용)

스냅샷 시점:
  1. snapshot_A 쓰기 중단
  2. 현재 서비스 중인 snapshot을 B로 교체 → A 제공 시작
  3. snapshot_B 초기화 후 다시 live 따라가기 시작
```

복사 없음 → 딜레이 없음. 교체 순간 잠깐의 쓰기 중단만.

### 관련 패턴

- **게임 서버 요청 컨텍스트**: 랭킹 업데이트도 서버 진입점 → `RequestContext` 발급 대상 → `[[game-server-request-context]]` 참조

---

## Cross-Community Connections

- `wiki_redis_leaderboard_snapshot` → `game-server-request-context_wiki` (EXTRACTED, wikilink)
- `wiki_design_data_in_engine` ↔ `game-server-request-context_wiki` (INFERRED 0.75 — 둘 다 서버에서 데이터 소유권/흐름 설계)
