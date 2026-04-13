---
title: "게임 서버 요청 컨텍스트 패턴"
description: "게임 서버 진입점에서 RequestContext를 발급하고 전파하는 설계 패턴"
tags: ["game-dev", "server", "logging", "architecture"]
publishDate: 2026-04-13
updatedDate: 2026-04-13
sources: ["blog:game-server-request-context"]
draft: false
---

## 진입점 분류

| 진입점 | 발신자 | 예시 |
|--------|--------|------|
| 패킷 수신 | 클라이언트 플레이어 | 이동, 공격, 구매 |
| 운영툴 명령 | GM / 관리자 | 아이템 지급, 강제 이동 |
| 자동 이벤트 | 서버 내부 | 타이머, 스케줄러, 조건 트리거 |

각 진입점에서 `RequestContext`를 발급하고, 이후 모든 처리 함수에 전달한다.

## RequestContext 구조

```cpp
struct RequestContext {
    RequestId   requestId;    // 요청 고유 ID (UUID 또는 시퀀스)
    RequestType type;         // PACKET / GM_COMMAND / SCHEDULED_EVENT
    PlayerId    playerId;     // 관련 플레이어 (없으면 invalid)
    GmId        gmId;         // GM 명령이면 발급자
    Timestamp   issuedAt;     // 진입점 기준 시각
    ServerId    serverId;     // 처리 서버 식별자

    // 처리 중간에 채워지는 필드들
    GuildId     guildId;      // 길드 조회 후 세팅
    ItemId      itemId;       // 아이템 특정 후 세팅
    ZoneId      zoneId;       // 존 진입 후 세팅

    static RequestContext FromPacket(PlayerId, PacketType);
    static RequestContext FromGMCommand(GmId, CommandType);
    static RequestContext FromEvent(EventType);
};
```

## 발급 패턴

```cpp
// 패킷 진입점
void OnReceivePacket(PlayerId player, PacketType type, Buffer& buf) {
    RequestContext ctx = RequestContext::FromPacket(player, type);
    HandlePacket(ctx, buf);
}

// 운영툴 진입점
void OnGMCommand(GmId gm, CommandType cmd, Params& params) {
    RequestContext ctx = RequestContext::FromGMCommand(gm, cmd);
    HandleGMCommand(ctx, params);
}

// 자동 이벤트 진입점
void OnScheduledEvent(EventType event) {
    RequestContext ctx = RequestContext::FromEvent(event);
    HandleScheduledEvent(ctx);
}
```

## 컨텍스트 누적 패턴

진입점 컨텍스트는 고정되지 않는다. 처리 흐름 중 파악되는 정보를 즉시 `ctx`에 기록한다.

```cpp
void HandleItemUse(RequestContext& ctx, ItemId item) {
    ctx.itemId = item;  // 이 시점부터 로그에 itemId가 찍힘

    auto guild = GetPlayerGuild(ctx.playerId);
    ctx.guildId = guild.id;

    // 이후 모든 로그에 requestId + itemId + guildId가 함께 나온다
    ProcessItemEffect(ctx, item);
}
```

- 각 처리 단계에서 알게 된 정보를 `ctx`에 바로 기록
- 로그를 볼 때 그 시점까지 파악된 모든 맥락이 한 줄에 담김

## 설계 원칙

- **진입점에서만 발급** — 중간 함수에서 새로 만들지 않는다
- **전파는 명시적으로** — 스레드 로컬이나 글로벌 상태 대신 파라미터로 전달
- **없는 필드는 invalid** — `playerId`가 없는 이벤트에서 invalid값을 그대로 두면 진입점 타입이 암묵적으로 드러남
- **로그는 ctx 단위** — `requestId`로 집계 도구에서 필터링 가능

## 관련

- 블로그: [[game-server-request-context]] 원문 글
