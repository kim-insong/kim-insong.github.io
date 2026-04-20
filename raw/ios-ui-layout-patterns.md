# iOS SwiftUI UI 레이아웃 패턴

SwiftUI 앱에서 iPhone과 iPad UI를 설계할 때의 레이아웃 패턴 및 판단 기준.

## iPhone 레이아웃 원칙

- **NavigationStack** 기반
- 편집 UI는 `.sheet`으로 표시 (인라인 편집 지양)
- bottomBar toolbar: 핵심 액션만 (잠금, Undo/Redo, 삭제, 추가)
- **Portrait lock** — landscape 미지원 (`UIInterfaceOrientationMask.portrait`)
- 작은 화면에서 컬럼이 좁아지면 `minColumnWidth: 44pt` 보장 필수

### 제스처 시스템 패턴

- **Long press (0.2s)**: 편집 모드 진입 또는 빈 영역에 새 항목 생성
- **Pan**: 이동 (day+time) 또는 resize (상/하단 핸들)
- **Tap**: floating button 토글 / 편집 모드 종료
- Resize handle: outerSize=20pt (블록 바깥), innerSize=min(33, blockHeight/3)

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
- **Edit panel**: 360pt 고정, 화면 너비 ≥ 700pt일 때만 표시
  - 700pt 미만이면 sheet으로 폴백
- **Keyboard**: Cmd+Z (Undo), Cmd+Shift+Z (Redo)

### iPad에서 숨길 것들

```swift
.toolbar(.hidden, for: .bottomBar)       // 하단 툴바
.toolbar(.hidden, for: .navigationBar)   // 네비게이션 바
// 편집 모드 툴바 (theme/preset 버튼들) → EmptyView()
// floating button → EmptyView()
```

### Multitasking 대응

- Split View, Slide Over에서 줄어든 너비 처리
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
| **방향 네비게이션만** | `chevron.right` (push navigation 전용) |
| 범례/개요 패널 | `list.bullet`, `rectangle.3.group.fill` |
| 펼침/접힘 토글 | `chevron.down` / `chevron.up` / `xmark` |
| 테마/외관 | `paintbrush` |

`chevron.right`는 push navigation에만 사용 — "무언가 열기"에 오용하지 않는다.

## XCUITest 주의사항

- normalized offset 금지 (`withNormalizedOffset` → absolute frame + offset 계산)
- accessibility ID 사용 (안정적인 selector)
- `UIScrollView` 내부 탭은 반드시 절대 좌표 기반

---

## 키보드 회피 Overlay 배치

`.ignoresSafeArea(.keyboard, edges: .bottom)`이 적용된 뷰 **내부**의 `.overlay(alignment: .bottom)`는 키보드 뒤에 숨는다. 키보드 위에 떠야 하는 overlay(플로팅 툴바, 프리뷰 에디터 등)는 `.ignoresSafeArea` **바깥** 레벨에 배치한다.

```swift
// 올바른 패턴
NavigationStack {
    content
        .ignoresSafeArea(.keyboard, edges: .bottom)
}
.overlay(alignment: .bottom) { keyboardFloatingBar }  // NavigationStack 바깥 → 키보드 위
```

임베드된 자식 뷰에서는 `showOverlay: Binding<Bool>`을 init 파라미터로 받아 부모 outer overlay에서 렌더링. optional Binding 패턴으로 standalone/embedded 모드 모두 지원:

```swift
private var externalShowOverlay: Binding<Bool>?
@State private var localShowOverlay = false
private var effectiveShowOverlay: Binding<Bool> { externalShowOverlay ?? $localShowOverlay }
```

## 키보드 Input UX 규칙

**Rule 1 — `.numberPad` / `.decimalPad`에는 항상 "완료" 툴바 버튼 추가**

```swift
.toolbar {
    ToolbarItemGroup(placement: .keyboard) {
        Spacer()
        Button("완료") { focusedField = nil }
    }
}
```

**Rule 2 — 대시 등 비숫자 문자가 포함되면 `.asciiCapable` 사용**
예: `12345-67` 형식 → `.keyboardType(.asciiCapable)` + `.autocorrectionDisabled()`

**Rule 3 — 고정 목록에서 선택할 때는 Picker, raw text input 금지**

**Rule 4 — "추가" 플로우에서 inline 편집 가능한 속성은 수집하지 않는다**
예: 종목 추가 시 비율은 목록 행에서 직접 편집 — add 시점에 묻지 않는다.

## SwiftUI Sheet Presentation 패턴

### `isPresented`를 `withAnimation`으로 감싸지 말 것

SwiftUI `.sheet` / `.fullScreenCover`는 자체 시스템 애니메이션을 사용한다. `withAnimation(...)` 안에서 `isPresented`를 변경하면 이중 슬라이드 글리치 발생.

```swift
// BAD
func show() { withAnimation(.easeOut(duration: 0.2)) { isPresented = true } }

// GOOD — 직접 할당
func show() { isPresented = true }
```

`withAnimation`은 시트 *내부* 뷰 상태 변화에만 사용.

### 시트 `onAppear`에서 `@State` 초기화는 `.task` 사용

`.onAppear`는 슬라이드 애니메이션 도중 동기 실행 → 레이아웃 재계산 글리치 발생.

```swift
// BAD
.onAppear { items = store.sortedItems }

// GOOD — 애니메이션 이후 비동기 처리
.task { items = store.sortedItems }
```

## 레이아웃 안정성 (State 변화 시 흔들림 방지)

주변 뷰가 있는 콘텐츠를 토글할 때 `if/else` 대신 `.opacity` 사용.

```swift
// BAD — 토글 시 형제 뷰 이동
if !session.isPaused { Text(completionTime) }

// GOOD — 레이아웃 높이 유지
Text(completionTime).opacity(session.isPaused ? 0 : 1)
```

`if/else`는 스택 맨 아래 콘텐츠, 또는 숨겨진 콘텐츠가 접근성에서 제외되어야 할 때만.

## NavigationStack 내 중첩 ScrollView Safe Area

```swift
// BAD — iOS 17/18에서 container safe area 잔여
ScrollView(.vertical) { content }
    .contentMargins(.top, 0, for: .scrollContent)

// GOOD
ScrollView(.vertical) { content }
    .ignoresSafeArea(.container, edges: .top)
```

중첩이 깊을수록 safe area가 누적 → `.ignoresSafeArea`가 더 안전.

## ScrollView 인디케이터와 `clipShape`

iOS 17+에서 스크롤 인디케이터는 `UIScrollView` bounds 외부에 렌더링될 수 있다. 부모 ZStack의 `.clipShape`가 인디케이터를 잘라낸다.

```swift
// BAD — ZStack clipShape가 인디케이터 잘라냄
ZStack { ScrollView { content } }
.clipShape(RoundedRectangle(cornerRadius: 16))

// GOOD — ScrollView에 직접 clipShape, ZStack은 무클립
ZStack {
    ScrollView { content }
        .clipShape(RoundedRectangle(cornerRadius: 16))
    overlays
}
.overlay(RoundedRectangle(cornerRadius: 16).stroke(...))
```

## 홈 화면 Identity

앱 루트 화면에는 반드시 앱 제목(브랜딩)을 표시한다. 조건이 모두 해당될 때:
- 내비게이션 스택의 루트 화면
- `.navigationTitle("")` 또는 비어있는 타이틀
- 화면 상단에 바로 선택 UI 시작

```swift
// 콘텐츠 영역 최상단
Text(appName).font(.largeTitle).fontWeight(.bold)
Text(tagline).font(.subheadline).foregroundStyle(.secondary)  // 선택적
```

`.navigationTitle`은 내비 바 버튼 레이아웃 용도로만 — 브랜딩용 금지.

## 미완성 Draft 상태 패턴

폼 필드가 많고 완성에 노력이 필요한 경우, 저장은 허용하되 사용은 차단.

```swift
var canSave: Bool { !name.isEmpty }          // Save 버튼 활성화 조건
var isComplete: Bool { canSave && abs(total - 100) < 0.01 }  // 선택 가능 조건

// 목록 행에 badge
if !item.isValid {
    Text("미완성").font(.caption2)
        .padding(.horizontal, 6).background(.orange).clipShape(Capsule())
}

// Downstream picker — valid만 노출
ForEach(items.filter { $0.isValid }) { ... }
```

## Drag Handle / Slider UX

- 드래그 핸들은 트랙 **아래** 배치 (≥20pt offset) — 손가락이 트랙을 가리지 않도록
- 트랙 위에는 작은 cursor indicator (10–12pt) 표시 (제스처 없음, 표시 전용)
- 최솟값 레이블은 커서가 실제로 그 위치에 도달할 수 없더라도 항상 표시 (직관적 범위 전달)
- 현재 값 레이블은 트랙 위 (y: centerY - 16)에 인라인 배치 — 헤더 텍스트로 분리 금지

## Stats / 데이터 테이블 레이아웃

여러 행이 하나의 논리적 테이블을 구성할 때, List row를 여러 개로 나누지 않는다. 하나의 row에 VStack으로 묶는다 (각 List row는 기본 ~44pt 최소 높이 소모).

```swift
Section("통계") {
    VStack(alignment: .leading, spacing: 6) {
        // 전체 합계 행
        // Divider()
        // ForEach 유형별 행
    }
    .padding(.vertical, 4)
}
```

타이트한 공간에서 `Label("\(n)", systemImage: "...")`은 텍스트 줄바꿈 위험 → explicit `HStack { Image; Text }.lineLimit(1)` 사용.

## Minimum Sheet Depth 원칙

단일 액션 또는 단일 항목만 담는 시트는 만들지 않는다. 부모 시트에서 직접 액션을 트리거.

나쁜 예: SheetA → SheetB (항목 1개) → SheetC  
좋은 예: SheetA → SheetC (직접)
