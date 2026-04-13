---
title: "iOS 앱 개발 스택 (2025)"
description: "SwiftUI를 기본값으로 선택하는 이유와 2025년 기준 현재 사용 스택"
tags: ["iOS", "SwiftUI", "개발"]
publishDate: 2026-03-15
updatedDate: 2026-04-13
sources: ["blog:on-building-ios-apps"]
draft: false
---

## SwiftUI가 기본값인 이유

2025년 기준 SwiftUI는 충분히 성숙해서 UIKit fallback 없이 실제 앱을 만들 수 있다. 2019년 출시 초기와 달리 edge case에서 UIKit으로 내려가는 일이 거의 없다.

## 현재 스택

| 레이어 | 선택 | 용도 |
|--------|------|------|
| UI | SwiftUI | 모든 UI |
| 비동기 | Swift Concurrency (async/await) | 네트워킹, 백그라운드 작업 |
| 영속성 | SwiftData | Core Data가 과할 때 |
| CI | Xcode Cloud | 빌드·배포 자동화 |

## 변하지 않는 원칙

- 사용자가 중시하는 것: 속도, 신뢰성, 방해받지 않는 경험
- 출시하지 않은 기능 = 고칠 필요 없는 버그
- 복잡한 스택은 숨겨진 비용 — 최소화

## 관련

- 블로그: [[on-building-ios-apps]] 원문 글
