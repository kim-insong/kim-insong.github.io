# iOS SwiftUI 디자인 토큰 & 컴포넌트 패턴

SwiftUI 앱에서 일관된 UI를 만들기 위한 공유 디자인 토큰.
같은 역할의 UI는 항상 같은 토큰/패턴을 사용한다.

## GridLayout 상수 (iPhone / iPad)

| 속성 | iPhone | iPad |
|------|--------|------|
| timeHeaderWidth | 48pt | 60pt |
| dayHeaderHeight | 36pt | 48pt |
| baseMinuteHeight | 1.2 | 1.6 |
| minColumnWidth | 44pt | 80pt |
| fontSize scale | 1.0x | 1.2x |

## 애니메이션 패턴

| 사용처 | 값 |
|--------|-----|
| 기본 전환 | `.easeInOut(duration: 0.2)` |
| 화면 전환 | `.easeInOut(duration: 0.3)` |
| Floating button / handles | `.spring(response: 0.4, dampingFraction: 0.7)` |
| Sub-toolbar | `.easeInOut(duration: 0.2)` + `.opacity.combined(with: .scale(scale: 0.95))` |
| Edit panel slide | `.easeInOut(duration: 0.25)` + `.move(edge: .trailing).combined(with: .opacity)` |

## 간격 스케일

4, 8, 12, 16, 20, 24, 28pt 단위만 사용. 중간값 혼용 금지.

- 섹션 간 간격: 24pt
- 카드 내부 패딩: horizontal 16pt, vertical 12pt
- 버튼 vertical padding: 16pt
- 아이콘-텍스트 간격: 12pt

## 컴포넌트 패턴

### Toolbar Icon Button
```swift
Image(systemName: icon)
    .font(.system(size: 18))
    .frame(width: 36, height: 36)
    .background(RoundedRectangle(cornerRadius: 8).fill(
        isActive ? Color.accentColor.opacity(0.15) : .clear
    ))
```

### Action CTA Button (전체 너비)
```swift
Text(label)
    .font(.title2.bold())
    .frame(maxWidth: .infinity)
    .padding(.vertical, 16)
    .background(color)
    .foregroundStyle(.white)
    .clipShape(RoundedRectangle(cornerRadius: 14))
    .buttonStyle(.plain)   // List 안에서 이중 탭 방지
```
- cornerRadius: 14pt 고정
- 긍정 CTA: `.blue`, 위험/중지: `.red`

### Sub-toolbar Chip Button
```swift
HStack(spacing: 5) {
    Circle().fill(color).frame(width: 12, height: 12)
    Text(title)
}
.padding(.horizontal, 10).padding(.vertical, 6)
.background(RoundedRectangle(cornerRadius: 8).fill(
    isSelected ? Color.accentColor.opacity(0.2) : Color(.systemGray5).opacity(0.6)
))
.overlay(RoundedRectangle(cornerRadius: 8).stroke(
    isSelected ? Color.accentColor : .clear, lineWidth: 1.5
))
```

### Sheet 표준 설정
```swift
.presentationDetents([.medium])          // 단순 확인용
.presentationDetents([.medium, .large])  // 내용이 길어질 수 있을 때
.presentationBackground(.thinMaterial)
.presentationDragIndicator(.visible)
// 반드시 NavigationStack 래핑
```

### Card List Row
```swift
.listStyle(.plain)
.listRowSeparator(.hidden)
.listRowBackground(Color.clear)
.listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
// 카드 배경: Color(.systemGray6), cornerRadius: 14pt
```

### FAB (Floating Action Button)
```swift
ZStack {
    listContent
    if editMode == .inactive {
        VStack {
            Spacer()
            Button(action: action) { /* Capsule 스타일 */ }
                .padding(.bottom, 32)
        }
        .transition(.opacity.combined(with: .scale(scale: 0.9, anchor: .bottom)))
    }
}
// List 마지막 행: Color.clear.frame(height: 80) — FAB 가림 방지
```

### Circular Progress Ring (타이머 앱)
- ring lineWidth: 18pt, 화면 너비의 72% 크기
- track: `accentColor.opacity(0.15)`, progress: `accentColor`, lineCap `.round`
- 12시 방향에서 반시계로 줄어듦
- 숫자: 64pt bold monospaced, `.contentTransition(.numericText(countsDown: true))`
- 5% 미만이면 강제 `.red` 전환

## 스플래시 스크린 패턴 (2-layer)

```
Layer 1: LaunchScreen.storyboard (시스템 launch, 정적)
Layer 2: SwiftUI SplashView (앱 로드 후, 애니메이션)
```

**LaunchScreen.storyboard 스펙:**
- 타이틀: centerY multiplier=0.45
- 하단: bottom = 40pt
- 배경: systemBackgroundColor
- 폰트: AppleSystemUIFont-Semibold 28pt

**SplashView 타이밍:**
- 타이틀 + 하단 fade-in: 0.5s easeOut
- 요소 버블: staggered 0.12s, spring animation
- 전체 duration: ~1.46s

**App.swift 패턴:**
```swift
ZStack {
    Color(UIColor.systemBackground)
    ContentView().opacity(showSplash ? 0 : 1)
    if showSplash { SplashView() }
}
.task {
    try? await Task.sleep(for: .seconds(1.4))
    showSplash = false
}
```

## 컬러 팔레트 인덱스 관례

테마 컬러는 0–29, 3개 tone 그룹 (dark 0–9, medium 10–19, light 20–29):

- 3-dot preview: indices **[4, 14, 24]** — 각 tone 그룹 중간값
- 5-dot preview: indices **[2, 7, 14, 19, 24]**

비슷한 색조가 몰리지 않도록 전체 tone spectrum을 표현하는 선택.

## 디자인 원칙

- **Consistency**: 같은 역할 UI = 같은 토큰/패턴
- **Platform-native**: SwiftUI 네이티브 컴포넌트 우선, 커스텀은 꼭 필요할 때만
- **Adaptive**: `horizontalSizeClass` 또는 `UIDevice`로 iPhone/iPad 분기
- **Accessibility**: Dynamic Type 지원, 최소 탭 영역 44pt, VoiceOver 레이블
