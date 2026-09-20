---
title: "그래프를 눌렀는데 옆 막대가 골라진 이유"
description: "Swift Charts의 chartOverlay는 그래프 전체 좌표를, proxy.value(atX:)는 플롯 영역 좌표를 쓴다. y축 라벨 폭만큼 어긋나면서 '시트가 간헐적으로 닫힌다'는 엉뚱한 증상으로 나타났다."
publishDate: 2026-09-20
tags: ["swiftui", "swift-charts", "ios", "debugging"]
draft: false
---

악보 읽기 연습 앱에 최근 세션 성적을 막대 그래프로 올렸다. 막대를 누르면 그 세션의 성적표가 아래에서 올라온다. 테스트하던 사람에게서 두 가지 보고가 왔다.

> 상세가 보인 상태에서 위 막대를 탭해도 시트가 **간헐적으로** 닫혀버리는 버그가 있어. 그리고 내가 선택한 세션이 아니라 **다른 세션**이 선택되기도 하는 것 같아.

버그 두 개로 읽었는데 하나였다.

## chartOverlay와 proxy.value(atX:)는 서로 다른 좌표계를 쓴다

탭을 받는 코드는 이렇게 생겼었다.

```swift
struct ChartTapCatcher: View {
    let onTap: (CGPoint) -> Void

    var body: some View {
        GeometryReader { _ in
            Rectangle()
                .fill(Color.clear)
                .contentShape(Rectangle())
                .gesture(SpatialTapGesture().onEnded { value in
                    onTap(value.location)
                })
        }
    }
}

// 호출부
.chartOverlay { proxy in
    ChartTapCatcher { location in
        guard let x: String = proxy.value(atX: location.x),
              let point = points.first(where: { String($0.index) == x }) else { return }
        selectedID = point.id
    }
}
```

읽으면 자연스럽다. 오버레이에서 탭 위치를 받아 `proxy.value(atX:)` 에 넣는다. 그런데 두 값의 기준이 다르다.

- `chartOverlay` 가 주는 좌표계는 **그래프 전체**다. 왼쪽 y축 라벨, 아래 x축 라벨까지 포함한 사각형.
- `proxy.value(atX:)` 가 받는 건 **플롯 영역** 좌표다. 축 라벨을 뺀, 마크가 실제로 그려지는 안쪽 사각형.

내 그래프는 y축에 `100%` / `50%` / `0%` 라벨이 왼쪽에 붙어 있었다. 폭이 20~30pt. 막대 한 칸이 딱 그 정도였다. 그래서 탭할 때마다 **누른 것보다 한 칸 왼쪽**이 골라졌다.

## "간헐적"이 아니라 "항상"이었다

좌표가 늘 한 칸씩 어긋나면 증상도 늘 나타나야 한다. 왜 간헐적으로 보였을까.

두 번째 요인이 겹쳐 있었다. 이 그래프에는 "이미 열려 있는 세션의 막대를 다시 누르면 닫힌다"는 토글 규칙이 있었다. 지도에서 같은 점을 다시 눌러 상세를 닫는 것과 맞추려던 규칙이다.

이제 합쳐 보면,

- 어긋난 탭이 **아무 세션**이나 가리키면 → "다른 세션이 선택된다"
- 어긋난 탭이 하필 **지금 열려 있는 세션**을 가리키면 → 토글이 발동해서 "시트가 닫힌다"

같은 오작동인데 무엇이 열려 있느냐에 따라 다른 증상으로 보였다. 보고자 입장에서는 버그 두 개고, 그중 하나는 "간헐적"이다.

## 변환은 탭을 받는 한 곳에만 둔다

고치는 건 세 줄이다. `plotFrame` 앵커를 오버레이 좌표계로 변환해서 원점을 빼면 된다.

```swift
struct ChartTapCatcher: View {
    let proxy: ChartProxy
    /// 플롯 좌표계의 탭 자리 — 그대로 proxy.value(atX:)에 넣을 수 있다
    let onTap: (CGPoint) -> Void

    var body: some View {
        GeometryReader { geo in
            Rectangle()
                .fill(Color.clear)
                .contentShape(Rectangle())
                .gesture(SpatialTapGesture().onEnded { value in
                    guard let plotFrame = proxy.plotFrame else { return }
                    let plot = geo[plotFrame]
                    guard plot.contains(value.location) else { return }
                    onTap(CGPoint(x: value.location.x - plot.origin.x,
                                  y: value.location.y - plot.origin.y))
                })
        }
    }
}
```

두 가지를 의도적으로 넣었다.

**변환을 호출부가 아니라 `ChartTapCatcher` 안에 뒀다.** 같은 앱에 그래프가 둘 있었는데(세션별 정답률, 문제별 걸린 시간) 둘 다 같은 실수를 하고 있었다. 호출부마다 `geo[proxy.plotFrame!].origin` 을 빼게 두면 세 번째 그래프가 또 틀린다.

**플롯 밖 탭은 아예 버린다.** `plot.contains` 가 없으면 축 라벨을 눌렀을 때 가장자리 막대가 골라진다. 이건 좌표를 고쳐도 남는 문제다.

## 좁은 표적에 "다시 누르면 닫힘"을 걸지 않는다

좌표를 고쳐도 토글 규칙은 그대로 위험했다.

같은 앱의 오선 지도에서는 점 하나가 칸 폭 28pt를 통째로 손가락 영역으로 쓴다. 표적이 넓고, 점 하나가 상세 하나와 1:1이라 "다시 누르면 닫힘"이 잘 맞는다.

막대는 다르다. 칸의 60%(`width: .ratio(0.6)`)이고 여덟 개가 한 화면에 선다. 옆 막대를 노린 손가락이 자주 빗맞는데, 빗맞은 탭이 곧 닫힘이 되면 조작이 무섭다. 그래서 막대 탭은 **여는 것만** 하게 바꿨다. 닫는 길은 패널 손잡이를 아래로 끌거나 닫기 버튼이다.

두 화면의 재탭 규칙이 달라진 셈인데, 그 근거가 "표적 크기"라는 걸 코드 주석에 적어 뒀다. 일관성보다 오조작 비용이 먼저다.

## 좌표계가 둘인 API는 의심부터 한다

`proxy.value(atX:)` 는 잘못된 좌표를 받아도 에러를 내지 않는다. 그냥 옆 값을 돌려준다. 오프셋이 마침 막대 한 칸과 비슷해서 "한 칸 옆"이라는 규칙성조차 눈에 안 띄었다.

Swift Charts에서 좌표를 다루는 코드를 쓸 때 확인할 것.

- `chartOverlay` / `chartBackground` 의 좌표계는 **그래프 전체**다
- `proxy.value(atX:)` · `proxy.position(forX:)` 는 **플롯 영역** 좌표다
- 둘을 잇는 다리는 `geo[proxy.plotFrame!]` 하나뿐이다

축 라벨이 없는 그래프(`chartYAxis(.hidden)`)에서는 오프셋이 0이라 이 버그가 안 보인다. 나중에 축을 켜는 순간 조용히 어긋난다. 라벨 유무와 상관없이 처음부터 변환을 끼워 두는 편이 싸다.
