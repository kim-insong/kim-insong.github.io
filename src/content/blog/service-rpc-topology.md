---
title: "서버 간 RPC 연결을 수동으로 엮지 않는 법"
description: "Service마다 필요한 ServerType Pair를 Attribute로 선언하면, Coordinator가 인스턴스 간 Session을 자동으로 구성한다."
publishDate: 2026-04-21
tags: ["game-dev", "server", "architecture", "rpc"]
draft: false
---

게임 서버를 여러 종류로 쪼개다 보면, 결국 어느 서버가 어느 서버에게 RPC를 걸어야 하는지를 누군가 관리해야 한다. Gateway는 Game에 붙어야 하고, Game은 Match와 Chat에 붙어야 하고, Rank는 Game에서만 쏘면 되고... 이 매트릭스를 머리로 들고 다니다가 배포 설정에서 실수하는 건 시간 문제다.

이걸 코드가 스스로 계산하게 했더니 상당히 편해졌다.

## 서버가 늘어나면 연결을 엮는 일이 병목이 된다

Service 하나를 새로 만든다고 치자. 이 Service는 Gateway가 받은 요청을 Match에 넘기고 결과를 Game에 쏘는 흐름이다. 그러면 어디를 건드려야 하나.

- Gateway 인스턴스의 Coordinator 설정에 Match 연결을 추가한다
- Match 인스턴스에 Gateway를 받는 쪽도 열어준다
- Game 인스턴스에 Match로부터 받는 설정을 추가한다

설정 파일 세 군데를 건드리는 사이, Service가 요구하는 통신 구조는 코드 어디에도 명시되지 않는다. "이 Service가 왜 Gateway-Match-Game 사이에 연결을 필요로 하는지"는 설계자 머릿속에만 있다. 다른 사람이 봤을 때, 저 연결 설정 중 하나를 지워도 되는 건지 알 방법이 없다.

## ServerType으로 역할을 먼저 나눈다

출발점은 서버 역할을 enum으로 명시하는 것이다.

```csharp
public enum ServerType {
    Gateway,
    Game,
    Match,
    Chat,
    Rank,
}
```

ServerType은 **역할**이지 **배포 단위**가 아니다. 하나의 프로세스가 여러 ServerType을 담을 수 있다. 개발 환경에서는 Gateway + Game + Chat을 한 프로세스에 몰아 넣고, 운영 환경에서는 각각 따로 띄울 수도 있다.

## Service에 필요한 RPC 쌍을 Attribute로 선언한다

Service를 만들 때, 이 Service가 동작하려면 어떤 ServerType들 사이에 RPC 채널이 있어야 하는지를 Attribute로 붙인다.

```csharp
[RpcPair(ServerType.Gateway, ServerType.Match)]
[RpcPair(ServerType.Match, ServerType.Game)]
public class BattleEntryService : Service {
    // Gateway가 받은 요청을 Match에 넘기고,
    // Match가 매칭 결과를 Game에 통보한다
}
```

Attribute 하나가 방향 있는 통신 요구사항 하나다. 여러 개 붙이면 된다.

이 방식의 진짜 이점은 코드가 줄어드는 게 아니다. **Service를 작성하는 사람이 통신 구조를 먼저 설계하게 된다**는 것이다. Attribute를 붙이는 순간 "이 Service가 어떤 서버끼리 오가야 하는 로직인가"를 명시적으로 정의하는 셈이 된다. 대충 구현하다가 "어, 여기서 Chat 서버도 필요하네" 하고 뒤늦게 깨닫는 일이 줄어든다.

## 서버 인스턴스는 어떤 ServerType을 담는지만 말한다

인스턴스는 자기가 어떤 역할을 담당하는지만 선언한다. 누구랑 연결되는지는 신경 쓰지 않는다.

```csharp
[ContainsServerType(ServerType.Gateway)]
[ContainsServerType(ServerType.Chat)]
public class EdgeNode : ServerInstance { }

[ContainsServerType(ServerType.Game)]
[ContainsServerType(ServerType.Match)]
public class CoreNode : ServerInstance { }
```

EdgeNode는 Gateway와 Chat을 담는다. CoreNode는 Game과 Match를 담는다. 이게 전부다. "EdgeNode는 CoreNode에 연결해야 한다"는 말은 어디에도 없다.

## Coordinator가 필요한 Session만 준비한다

이제 Coordinator가 할 일은 단순하다. 등록된 모든 Service의 `RpcPair`를 모아서 필요한 ServerType 연결 집합을 만들고, 각 인스턴스가 담고 있는 ServerType들로 어떤 인스턴스 쌍이 실제 Session을 맺어야 하는지 역산한다.

```
필요한 RpcPair (Service 전수 조사):
  Gateway → Match
  Match   → Game
  Gateway → Chat   (ChatService에서)

인스턴스 구성:
  EdgeNode = { Gateway, Chat }
  CoreNode = { Game, Match }

→ EdgeNode.Gateway ↔ CoreNode.Match   (BattleEntryService)
→ CoreNode.Match   ↔ CoreNode.Game    (같은 프로세스 내부 — 실제 네트워크 Session 불필요)
→ EdgeNode.Gateway ↔ EdgeNode.Chat    (같은 프로세스)
```

중요한 건 **필요한 쌍만** Session을 준비한다는 것이다. Rank 서버가 아무 Service의 `RpcPair`에 등장하지 않으면 아무도 Rank에 Session을 열지 않는다. 사용하지 않는 연결을 미리 열어두거나, 불필요한 health check를 주고받는 낭비가 사라진다.

같은 프로세스 안의 ServerType끼리는 in-process 호출로 처리되고, 진짜 네트워크 Session이 필요한 경우만 남는다. 개발 환경에서 모든 ServerType을 한 프로세스에 몰아넣어도 코드를 고칠 필요가 없는 이유다.

## Attribute는 그 자체로 설계 문서다

이 구조가 가져다주는 부수 효과는 **설계 문서화를 따로 하지 않아도 된다는 점**이다. Service 파일을 열면 최상단의 `[RpcPair]` 목록이 곧 그 기능의 통신 구조도다. 다이어그램을 별도로 그릴 필요가 없다.

수정할 때도 마찬가지다. Service 로직을 고치면서 통신 요구사항이 바뀌면 Attribute를 수정한다. 배포 설정을 따로 만질 필요가 없다. Service가 요구하는 대로 Coordinator가 알아서 Session 집합을 다시 계산한다.

반대 방향으로도 검증된다. 어떤 연결이 왜 필요한지를 추적하고 싶으면 `RpcPair(Gateway, Match)`를 grep하면 그걸 요구하는 Service들이 나온다. 설정에서 "이 연결 지워도 되나?"를 묻는 대신, 코드에서 **그 연결을 요구하는 Service가 아직 있는가**를 확인할 수 있다.

## Takeaway

서버 아키텍처가 복잡해질수록, 연결 구성을 **인스턴스 쪽에서 선언하면** 매트릭스가 N² 로 폭발한다. Service 쪽에서 필요한 ServerType 쌍을 선언하고, 인스턴스는 자기가 담는 역할만 말하면, Coordinator가 교집합만 연결한다.

Service를 추가할 때마다 통신 설계를 먼저 하게 되고, 배포 설정을 수작업으로 맞출 일이 사라진다. 서버 종류가 늘어날수록 이 구조의 이득이 커진다.
