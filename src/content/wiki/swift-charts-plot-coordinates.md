---
title: "Swift Charts 탭 좌표계"
description: "chartOverlay는 그래프 전체 좌표, proxy.value(atX:)는 플롯 영역 좌표. 변환을 빼먹으면 축 라벨 폭만큼 어긋난다"
tags: ["swiftui", "swift-charts", "ios"]
publishDate: 2026-09-20
updatedDate: 2026-09-20
sources: ["blog:swift-charts-plot-coordinates"]
draft: false
---

## 좌표계 두 개

| API | 좌표계 | 포함 영역 |
|-----|--------|----------|
| `chartOverlay { proxy in ... }` 안의 뷰 | 그래프 전체 | 플롯 + 축 라벨 + 여백 |
| `chartBackground { proxy in ... }` 안의 뷰 | 그래프 전체 | 위와 같음 |
| `proxy.value(atX:)` / `value(atY:)` | 플롯 영역 | 마크가 그려지는 안쪽 사각형만 |
| `proxy.position(forX:)` / `position(forY:)` | 플롯 영역 | 위와 같음 |

둘을 잇는 유일한 다리는 `proxy.plotFrame`(Anchor)을 `GeometryProxy` 로 해석한 값이다.

```swift
guard let plotFrame = proxy.plotFrame else { return }
let plot = geo[plotFrame]                    // 오버레이 좌표계의 플롯 사각형
let inPlot = CGPoint(x: overlayPoint.x - plot.origin.x,
                     y: overlayPoint.y - plot.origin.y)
```

## 증상

`proxy.value(atX:)` 는 잘못된 좌표를 받아도 **에러를 내지 않고 옆 값을 돌려준다**.

| 축 설정 | 오프셋 | 겉으로 보이는 증상 |
|---------|--------|-------------------|
| `chartYAxis(.hidden)` | 0 | 없음 — 나중에 축을 켜는 순간 조용히 어긋난다 |
| leading y축 라벨(`100%`/`50%`/`0%`) | 20~30pt | 막대 한 칸 폭과 비슷 → "누른 것보다 한 칸 왼쪽"이 골라진다 |

오프셋이 마크 간격과 비슷하면 "한 칸 옆"이라는 규칙성조차 눈에 안 띈다.

## 규칙

- 변환은 **탭을 받는 컴포넌트 한 곳**에만 둔다. 호출부마다 `geo[proxy.plotFrame!].origin` 을 빼게 하면 다음 그래프가 같은 실수를 반복한다.
- `plot.contains(location)` 이 아닌 탭은 **버린다**. 축 라벨을 눌렀을 때 가장자리 마크가 골라지는 건 좌표를 고쳐도 남는 별개 문제다.
- 축 라벨이 없어도 처음부터 변환을 끼운다. 나중에 축을 켜면 무증상으로 어긋난다.

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

## 관련 함정

- `chartXSelection(value:)` 는 손을 떼면 선택이 사라진다 — "눌러서 고정" 이 필요하면 `chartOverlay` + `SpatialTapGesture` 를 쓴다.
- 그래프 위 여백은 `chartPlotStyle { $0.padding(.top:) }` 이 아니라 `Chart` **바깥** `.padding(.top:)`. 전자는 축을 두고 마크 레이어만 밀어 막대가 0선 아래로 삐져나온다.
- `BarMark` 의 x 는 문자열 범주 + 명시적 `chartXScale(domain:)`. 숫자 축이면 칸 폭을 못 정해 막대가 안 그려지고, 문자열만 주면 사전순(`"10" < "2"`)이 된다.

## 표적 크기와 토글 규칙

좌표 버그와 별개로, **좁은 마크에 "다시 누르면 닫힘" 을 걸지 않는다.**

| 표적 | 손가락 영역 | 재탭 규칙 |
|------|------------|----------|
| 오선 지도의 점 | 칸 폭 28pt 전체 | 토글(다시 누르면 닫힘) — 넓고 상세와 1:1 |
| 막대 그래프의 막대 | 칸의 60%, 8개가 한 화면 | **여는 것만** — 닫는 길은 별도 버튼/제스처 |

빗맞은 탭이 곧 닫힘이 되면 조작 비용이 크다. 화면 간 일관성보다 오조작 비용이 먼저다.

## 관련

- 블로그: [[swift-charts-plot-coordinates]] 원문 글
