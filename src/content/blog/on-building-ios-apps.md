---
title: "On Building iOS Apps in 2025"
description: "What's changed, what hasn't, and why SwiftUI is finally the right default."
publishDate: 2026-03-15
tags: ["iOS", "SwiftUI", "development"]
---

SwiftUI has come a long way.

When it launched in 2019, it was exciting but incomplete — you'd hit a wall every few screens and have to drop down to UIKit.
In 2025, that's rarely the case. The framework is mature enough that I default to SwiftUI for everything new.

## What I build with now

- **SwiftUI** for all UI
- **Swift Concurrency** (async/await) for networking and background work
- **SwiftData** for persistence when Core Data would be overkill
- **Xcode Cloud** for CI

The stack is boring in the best way. No surprises, no glue code, just building the actual product.

## What still hasn't changed

Users still care about the same things: speed, reliability, and not being annoyed.
Good software gets out of your way. Every feature you don't ship is a bug you don't have to fix.
