---
title: "iOS SwiftUI UI 레이아웃 패턴"
description: "iPhone/iPad SwiftUI 앱에서 레이아웃을 설계할 때의 패턴과 판단 기준"
publishDate: 2026-04-14
updatedDate: 2026-04-21
tags: ["iOS", "SwiftUI", "layout", "iPad", "iPhone"]
draft: false
sources: ["raw/ios-ui-layout-patterns.md"]
---

## iPhone 레이아웃 원칙

- `NavigationStack` 기반
- 편집 UI는 `.sheet`으로 표시 (인라인 편집 지양)
- bottomBar toolbar: 핵심 액션만 (잠금, Undo/Redo, 삭제, 추가)
- Portrait lock — landscape 미지원 (`UIInterfaceOrientationMask.portrait`)
- 좁은 화면에서 `minColumnWidth: 44pt` 보장 필수

### 제스처 시스템

| 제스처 | 동작 |
|--------|------|
| Long press (0.2s) | 편집 모드 진입 또는 빈 영역에 새 항목 생성 |
| Pan | 이동 (day+time) 또는 resize (상/하단 핸들) |
| Tap | floating button 토글 / 편집 모드 종료 |

Resize handle: outerSize=20pt (블록 바깥), innerSize=min(33, blockHeight/3)

### Sheet Detent 크기 공식

```
collapsedHeight = baseContentHeight + (footerButtonCount × 72)
expandedHeight  = collapsedHeight + pickerHeight  // picker rows = 180pt
```

- 풀너비 footer 버튼 1개 = 72pt
- delete만: +72pt / duplicate+delete: +144pt

## iPad 레이아웃 원칙

```
┌────────────────────────────────────────────────┐
│  [≡]     Title (center)                   [⋯] │  ← 메인 툴바
├────────────────────────────────────────────────┤
│  [🎨] [🕐] [📅] [⏰]                            │  ← 아이콘 툴바 (center)
│  [⟲][⟳]   [ Sub-toolbar (translucent) ]        │  ← Undo/Redo(left) + sub-toolbar(center)
├────────────────────────────┬───────────────────┤
│      ┌──────────────┐      │                   │
│      │   콘텐츠 그리드 │      │   Edit Panel      │  ← 항목 선택 시만 표시
│      │  (doc style) │      │    (360pt)        │
│      └──────────────┘      │                   │
└────────────────────────────┴───────────────────┘
```

- **Document-style grid**: `maxWidth = min(geometry.size.width * 0.82, 800)`, 중앙 정렬
- **Sub-toolbar**: 항상 52pt height 예약, 모드 선택 시만 UI 표시
- **Edit panel**: 360pt 고정, 화면 너비 ≥ 700pt일 때만 표시; 미만이면 sheet 폴백
- **Keyboard**: Cmd+Z (Undo), Cmd+Shift+Z (Redo)

### iPad에서 숨길 것들

```swift
.toolbar(.hidden, for: .bottomBar)
.toolbar(.hidden, for: .navigationBar)
// 편집 모드 툴바 → EmptyView()
// floating button → EmptyView()
```

### Multitasking 대응

- Split View / Slide Over에서 줄어든 너비 처리
- `GeometryReader`로 portrait/landscape 모두 대응
- edit panel은 너비 부족 시 sheet으로 자동 폴백

## Device 분기 패턴

```swift
UIDevice.current.userInterfaceIdiom == .pad
@Environment(\.horizontalSizeClass) var horizontalSizeClass
horizontalSizeClass == .regular  // iPad / 넓은 iPhone
```

## SF Symbol 선택 기준

| 컨텍스트 | 아이콘 |
|---------|------|
| 색상/프리셋 피커 열기 | `swatchpalette` |
| 목록/재정렬 피커 열기 | `list.bullet.rectangle`, `rectangle.3.group` |
| 편집/재정렬 | `pencil`, `arrow.up.arrow.down` |
| 방향 네비게이션만 | `chevron.right` (push navigation 전용) |
| 범례/개요 패널 | `list.bullet`, `rectangle.3.group.fill` |
| 펼침/접힘 토글 | `chevron.down` / `chevron.up` / `xmark` |
| 테마/외관 | `paintbrush` |

`chevron.right`는 push navigation에만 — "무언가 열기"에 오용하지 않는다.

## XCUITest 주의사항

- normalized offset 금지 (`withNormalizedOffset` → absolute frame + offset 계산)
- accessibility ID 사용 (안정적인 selector)
- `UIScrollView` 내부 탭은 반드시 절대 좌표 기반

## 관련

- [[ios-design-tokens]] — GridLayout 상수, 애니메이션 값, 컴포넌트 패턴
- [[ios-app-development]] — SwiftUI 스택 선택 기준
