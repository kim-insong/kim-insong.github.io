# Community: iOS / Apple 개발

Community ID: `ios` | Nodes: 6 | Source: `src/content/wiki/ios-app-development.md`

## Overview

2025년 기준 insong의 iOS 앱 개발 스택. SwiftUI를 기본값으로 선택하는 이유와 현재 사용하는 도구들.

---

## 2025 iOS 개발 스택

| 레이어 | 선택 | 비고 |
|--------|------|------|
| UI | SwiftUI | UIKit은 마지막 수단 |
| 비동기 | Swift Concurrency (async/await) | |
| 영속성 | SwiftData | Core Data는 복잡도가 과할 때 패스 |
| CI/CD | Xcode Cloud | 빌드·배포 자동화 |

---

## 핵심 개념

### SwiftUI
- Apple의 선언형 UI 프레임워크
- 2025년 기준 UIKit fallback 없이 실제 앱 개발 가능
- 부족한 API는 UIKit wrapper로 브릿지하되, SwiftUI가 기본값

### Swift Concurrency
- `async/await` 기반 비동기 처리
- 네트워킹, 백그라운드 작업에 사용
- SwiftUI와 자연스럽게 통합 (`.task {}` modifier 등)

### SwiftData
- Core Data 위에 얹은 Swift-native 영속성 레이어
- 모델 정의가 단순하고 SwiftUI 바인딩이 쉬움
- Core Data가 과할 때 (간단한 로컬 저장) 선택

### Xcode Cloud
- Apple 자체 CI/CD 서비스
- TestFlight 배포 자동화
- PR 단위 빌드 검증 가능

---

## 설계 원칙

1. SwiftUI를 기본값으로 — UIKit은 SwiftUI가 해결 못 하는 API에만
2. 비동기는 Combine 대신 async/await (Swift Concurrency)
3. 영속성은 SwiftData부터 시작, 복잡해지면 Core Data 고려

---

## Source

- Blog: `src/content/blog/on-building-ios-apps.md`
- Wiki: `src/content/wiki/ios-app-development.md`
