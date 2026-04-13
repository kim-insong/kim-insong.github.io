---
title: "게임 서버 로직에 요청 컨텍스트를 흘려보내는 법"
description: "패킷, 운영툴, 자동 이벤트 — 진입점마다 ID를 발급하고 처리 흐름 전체에 전달하면 로깅이 달라진다."
publishDate: 2026-04-13
tags: ["game-dev", "server", "logging", "architecture"]
draft: false
---

게임 서버 로그를 뒤지다 보면 같은 문제를 반복하게 된다. 로그가 쌓여 있는데, 어떤 요청에서 나온 건지 모른다. 같은 시각에 여러 플레이어가 동시에 처리됐고, 로그가 뒤섞여 있다. 타임스탬프로 좁혀봐도 확신이 없다.

원인은 단순하다. 요청이 시작될 때 아무런 식별자를 달지 않았기 때문이다.

## 게임 서버의 진입점은 세 군데다

일반적인 웹 서버는 HTTP 요청 하나가 진입점이다. 게임 서버는 다르다.

- **패킷 수신** — 클라이언트가 보낸 요청
- **운영툴 명령** — GM이 관리 도구에서 내린 명령
- **자동 이벤트** — 타이머, 스케줄러, 조건 트리거로 서버 내부에서 발생한 처리

세 경로는 성격이 전혀 다르다. 패킷에는 플레이어가 있고, 운영툴 명령에는 GM이 있고, 자동 이벤트에는 발신자 자체가 없다. 그래서 하나의 방식으로 묶지 않고, 각 진입점에서 각자의 방식으로 ID를 발급한다.

## 진입점에서 ID를 발급하고 끝까지 들고 간다

각 진입점에서 요청 ID를 하나 만든다. UUID든, 서버 시각 기반 시퀀스든, 형식은 중요하지 않다. 이 ID를 그 요청이 처리되는 모든 함수에 넘긴다.

```cpp
// 패킷 수신 시점
void OnReceivePacket(PlayerId player, PacketType type, Buffer& buf) {
    RequestContext ctx = RequestContext::FromPacket(player, type);
    HandlePacket(ctx, buf);
}

// 운영툴 명령 수신 시점
void OnGMCommand(GmId gm, CommandType cmd, Params& params) {
    RequestContext ctx = RequestContext::FromGMCommand(gm, cmd);
    HandleGMCommand(ctx, params);
}

// 자동 이벤트 트리거 시점
void OnScheduledEvent(EventType event) {
    RequestContext ctx = RequestContext::FromEvent(event);
    HandleScheduledEvent(ctx);
}
```

이후 어디서든 `ctx.requestId`를 로그에 찍으면, 같은 ID를 가진 로그 전부가 하나의 요청 흐름이다.

## ID만으론 부족하다 — 컨텍스트 구조체로 설계한다

ID 하나만 들고 다니면 추적은 되지만, 로그에서 볼 수 있는 정보가 너무 적다. 어떤 플레이어인지, 어떤 명령인지, 어느 서버에서 처리됐는지 — 이 정보들이 로그 한 줄에 같이 찍혀야 실제로 쓸 수 있다.

그래서 ID를 단독으로 전달하는 게 아니라, 관련 정보를 담은 구조체로 묶는다.

```cpp
struct RequestContext {
    RequestId   requestId;    // 요청 고유 ID
    RequestType type;         // PACKET / GM_COMMAND / SCHEDULED_EVENT
    PlayerId    playerId;     // 관련 플레이어 (없으면 invalid)
    GmId        gmId;         // GM 명령이면 발급자
    Timestamp   issuedAt;     // 진입점 기준 시각
    ServerId    serverId;     // 처리 서버 식별자

    static RequestContext FromPacket(PlayerId player, PacketType type);
    static RequestContext FromGMCommand(GmId gm, CommandType cmd);
    static RequestContext FromEvent(EventType event);
};
```

로그를 찍는 쪽에서는 `ctx`를 넘겨받아 필요한 필드를 꺼내 쓴다. 진입점 종류에 따라 어떤 필드는 비어있을 수 있고, 그 자체가 정보가 된다. GM 명령인데 `playerId`가 찍혀 있으면 "어떤 플레이어에게 작용한 명령"이라는 걸 바로 알 수 있다.

## 컨텍스트는 흘러가면서 쌓인다

진입점에서 만든 컨텍스트가 끝까지 고정된 채로 전달되는 건 아니다. 함수 호출이 이어지는 중간중간에 새로운 정보가 계속 추가될 수 있다.

예를 들어, 패킷을 처음 받은 시점에는 플레이어 ID와 요청 종류밖에 모른다. 처리가 진행되면서 플레이어가 속한 길드를 조회하고, 어떤 아이템에 관한 요청인지 파악하고, 대상 NPC가 어떤 존에 있는지 알게 된다. 이 정보를 그냥 지역 변수에만 두면 로그에 남지 않는다.

```cpp
struct RequestContext {
    RequestId   requestId;
    RequestType type;
    PlayerId    playerId;
    GmId        gmId;
    Timestamp   issuedAt;
    ServerId    serverId;

    // 처리 중간에 채워지는 필드들
    GuildId     guildId;      // 길드 조회 후 세팅
    ItemId      itemId;       // 아이템 특정 후 세팅
    ZoneId      zoneId;       // 존 진입 후 세팅

    static RequestContext FromPacket(PlayerId player, PacketType type);
    static RequestContext FromGMCommand(GmId gm, CommandType cmd);
    static RequestContext FromEvent(EventType event);
};
```

각 처리 단계에서 알게 된 정보를 `ctx`에 바로 기록한다.

```cpp
void HandleItemUse(RequestContext& ctx, ItemId item) {
    ctx.itemId = item;  // 이 시점부터 로그에 itemId가 찍힘

    auto guild = GetPlayerGuild(ctx.playerId);
    ctx.guildId = guild.id;

    // 이후 모든 로그에 requestId + itemId + guildId가 함께 나온다
    ProcessItemEffect(ctx, item);
}
```

이렇게 하면 흐름의 어느 시점에서든 로그를 봤을 때, 그 시점까지 파악된 모든 맥락이 한 줄에 담긴다. 어디서 무엇을 처리하다 문제가 생겼는지 로그 하나로 파악할 수 있다.

## 로깅 작업이 뒤가 아니라 앞에서 끝난다

이 구조를 처음부터 잡아두면, 나중에 로깅을 추가할 때 할 일이 단순해진다. 어디서 로그를 찍든 `ctx`가 있으니 ID와 맥락 정보를 쓰면 된다. 로그 집계 도구에서 `requestId`로 필터링하면 하나의 요청 흐름을 전부 뽑을 수 있다.

반대로 이 구조 없이 로깅을 나중에 추가하려 하면, 함수 시그니처를 다 뜯어야 한다. 컨텍스트를 전달할 통로가 없으니까. 설계 초반에 `RequestContext`를 진입점에서 만들고 흘려보내는 것을 습관으로 잡는 게, 나중 작업을 제일 많이 줄이는 방법이다.
