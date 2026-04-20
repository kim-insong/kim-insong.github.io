---
title: "서버 간 RPC 연결을 수동으로 엮지 않는 법"
description: "Service마다 필요한 ServerType Pair를 Attribute로 선언하면 Coordinator가 Session을 자동 구성한다. 선언 누락은 타입과 프로젝트 분리로 잡는다."
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

## 선언이 빠져도 배포 구성이 숨겨준다

이 구조에 함정이 하나 있다. `ServiceA`가 `[RpcPair(X, Y)]`를 선언해서 X-Y 연결이 이미 준비돼 있다고 하자. 나중에 `ServiceB`도 X-Y를 호출해야 하는데, 개발자가 깜빡하고 `RpcPair`를 안 붙였다.

현재 배포 구성에서는 아무 문제가 없다. X와 Y가 같은 인스턴스에 같이 올라와 있거나, `ServiceA` 덕분에 이미 열려 있는 Session을 `ServiceB`도 같이 써버리기 때문이다. 테스트는 통과하고 운영도 멀쩡하다.

문제는 배포 구성이 바뀔 때 터진다. X와 Y를 다른 인스턴스로 쪼개는 순간, 또는 `ServiceA`를 들어내는 순간, `ServiceB`의 호출이 조용히 실패한다. 선언이 빠져 있었다는 사실이 그제야 드러난다. 실제 구성을 건드려보기 전까지는 놓치기 쉬운 종류의 버그다.

## 검증하려면 RPC 함수에 방향이 박혀 있어야 한다

이걸 정적으로 잡으려면 RPC 함수 하나하나가 **어느 ServerType에서 어느 ServerType으로 가는 호출인지** 타입에 박혀 있어야 한다.

```csharp
// Match 서버에만 존재하는 RPC 인터페이스
[RpcTarget(ServerType.Match)]
public interface IMatchRpc {
    Task<MatchResult> RequestMatch(PlayerId player);
}

// Gateway 쪽 호출부
[CallerServerType(ServerType.Gateway)]
public class BattleEntryService : Service {
    async Task Handle(...) {
        var result = await _matchRpc.RequestMatch(player);
        // ← 이 호출이 Gateway → Match 방향이라는 사실이 타입으로 드러남
    }
}
```

이렇게 되면 Service가 사용한 RPC 호출을 훑기만 해도 실제로 필요한 ServerType 쌍이 자동으로 도출된다. `[RpcPair]` 선언과 실제 호출이 어긋나면 빌드 단계에서 잡을 수 있다. 선언을 빠뜨렸다가 배포 구성이 바뀔 때 처음 터지는 상황이 사라진다.

여기서 한 걸음 더. RPC 함수 내부에서 접근하는 함수와 변수가 정말 그 ServerType에 속한 것인지도 검증할 수 있어야 한다. Gateway에서 돌아야 할 로직이 Game 서버 전용 상태에 직접 손을 대고 있으면 경계가 깨진 것이다. 이걸 런타임에 발견하면 이미 늦다.

## ServerType 경계는 프로젝트 분리로 긋는 게 낫다

한 프로젝트 안에 전 ServerType 코드를 같이 넣고 기능 플래그로 켜고 끄는 방식도 가능은 하다. 내가 다녔던 곳에서도 그렇게 운영했다. 한동안은 굴러가지만 경계가 점점 흐려진다. `#if GAME_SERVER` 같은 플래그가 여기저기 섞이고, Gateway 코드에서 Game 전용 static 변수를 그냥 참조해버리는 일이 스며든다. 런타임에는 문제없이 돌기 때문에 잡기가 어렵다.

차라리 프로젝트 자체를 ServerType별로 쪼개는 편이 경계를 분명히 하는 데 낫다고 생각한다. 공통 코드는 별도 모듈, 각 ServerType은 자기 모듈만 참조. 다른 ServerType의 내부로 들어가는 유일한 길은 RPC 인터페이스가 된다. "이 ServerType에서 저 ServerType의 구현을 직접 건드릴 수 없다"는 제약이 컴파일러 수준에서 자동으로 강제된다.

ServerType별 로직 토글을 코드 한복판에 두고 규율로 버티는 것과, 프로젝트 경계로 물리적으로 갈라놓는 것은 장기적으로 완전히 다른 결과를 낳는다.

## Takeaway

`RpcPair` Attribute는 Service 추가 시 통신 설계를 강제하고, Coordinator가 필요한 Session만 자동으로 구성하게 만든다. 다만 **선언 자체를 빠뜨려도 현재 배포 구성이 숨겨주는 함정**이 있다. RPC 함수에 방향 타입을 박아 선언과 실제 호출이 어긋나는지 정적으로 검증하고, ServerType 경계는 프로젝트 분리로 긋자. 그러면 런타임에 처음 발견되는 경계 위반이 빌드 단계로 당겨진다.
