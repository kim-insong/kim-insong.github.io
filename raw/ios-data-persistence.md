# iOS 데이터 영속성 패턴

SwiftUI 앱에서 저장 데이터를 구현하는 패턴. 버전 관리, 마이그레이션, 원자적 쓰기.

## 핵심 원칙

1. 저장 포맷은 항상 **JSON**
2. 모든 최상위 저장 struct에 **`saveVersion: Int`** 필드 필수
3. 추가된 필드는 **`decodeIfPresent`** 패턴으로 backward-compatible 디코딩
4. 파일 쓰기는 **원자적 패턴** (`.tmp` → rename)
5. 손상된 데이터 → 크래시 없이 리셋

## saveVersion 필드

```swift
struct MySaveData: Codable {
    static let currentVersion = 1   // breaking change마다 올린다
    var saveVersion: Int = currentVersion

    var someField: String
}
```

규칙:
- `saveVersion`은 **1**부터 시작 (0 = version 필드 없던 레거시)
- 필드 추가/변경/삭제 시 `currentVersion` 올리기
- 인코더가 항상 현재 버전을 씀 — 수동 오버라이드 금지

## Backward-Compatible 디코더 패턴

```swift
init(from decoder: Decoder) throws {
    let c = try decoder.container(keyedBy: CodingKeys.self)

    // 1. 버전 먼저 읽기 (없으면 0 = 레거시)
    let version = try c.decodeIfPresent(Int.self, forKey: .saveVersion) ?? 0

    // 2. 필드 디코딩 — 새 필드는 decodeIfPresent + 기본값
    someField    = try c.decode(String.self, forKey: .someField)
    newFieldName = try c.decodeIfPresent(String.self, forKey: .newFieldName) ?? "default"

    // 3. 버전 게이트 마이그레이션
    if version < 2 {
        // v1 → v2: oldFieldName이 newFieldName으로 이름 변경
        if let old = try c.decodeIfPresent(String.self, forKey: .oldFieldName) {
            newFieldName = old
        }
    }
    // if version < 3 { ... }
}
```

- 레거시 `CodingKeys` 항목은 `// legacy` 주석과 함께 유지
- 데이터를 조용히 버리지 않는다 — 항상 마이그레이션 또는 보존

## 버전 히스토리 인라인 문서화

```swift
// Save version history:
// v0 — pre-versioning (saveVersion 필드 없음)
// v1 — initial versioned save; saveVersion, someField 추가
// v2 — oldFieldName → newFieldName 이름 변경; newFieldName 추가
static let currentVersion = 2
```

## 파일 기반 DataStore 패턴

UserDefaults 대신 파일 저장 시 (데이터가 크거나 구조적이거나 원자적 쓰기 필요):

```swift
// Versioned envelope
struct ItemsFileData: Codable {
    let version: Int
    let savedAt: Date
    let timerItems: [TimerItem]
    static let currentVersion = 1
}

@Observable final class DataStore {
    static let shared = DataStore()
    var timerItems: [TimerItem] = []

    func load() {
        guard let data = try? Data(contentsOf: Self.fileURL) else { return }
        let decoder = JSONDecoder(); decoder.dateDecodingStrategy = .iso8601
        guard let envelope = try? decoder.decode(ItemsFileData.self, from: data) else {
            timerItems = []; save(); return   // 손상됨 — 리셋, 크래시 금지
        }
        timerItems = envelope.timerItems
    }

    func save() {
        let envelope = ItemsFileData(
            version: ItemsFileData.currentVersion,
            savedAt: Date(),
            timerItems: timerItems
        )
        atomicWrite(envelope, to: Self.fileURL)
    }

    private func atomicWrite<T: Encodable>(_ value: T, to url: URL) {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]  // git diff 안정성
        guard let data = try? encoder.encode(value) else { return }
        let tmp = url.appendingPathExtension("tmp")
        do {
            try data.write(to: tmp, options: .atomic)
            _ = try FileManager.default.replaceItemAt(url, withItemAt: tmp)
        } catch {
            try? data.write(to: url, options: .atomic)
            try? FileManager.default.removeItem(at: tmp)
        }
    }
}
```

## JSON 인코더 설정

```swift
let encoder = JSONEncoder()
encoder.dateEncodingStrategy = .iso8601    // 사람이 읽을 수 있는 날짜
encoder.outputFormatting = .sortedKeys     // git diff에서 안정적
```

## 필수 테스트 케이스

저장 데이터를 추가하거나 버전을 올릴 때마다 반드시 작성:

| 테스트 | 필수 여부 |
|--------|---------|
| 5a. JSON round-trip (현재 버전) | 항상 |
| 5b. saveVersion이 올바르게 기록되는지 | 항상 |
| 5c. 레거시 디코딩 (v0, version 필드 없음) | 항상 |
| 5d. 마이그레이션 테스트 (버전 올릴 때마다 1개씩) | 버전 변경 시 |
| 5e. 배열 컬렉션 round-trip | `[T]` 저장 시 |
| 5f. Storage layer isolation (UserDefaults) | UserDefaults 사용 시 |

테스트는 인라인 JSON 리터럴 사용 — fixture 파일 금지 (테스트 의도가 자기완결적이어야 함).

```swift
@Test func legacyDecode_v0() throws {
    let legacyJSON = """
    { "someField": "old value" }
    """.data(using: .utf8)!
    let decoded = try JSONDecoder().decode(MySaveData.self, from: legacyJSON)
    #expect(decoded.someField == "old value")
    #expect(decoded.newFieldName == "default")  // 기본값으로 폴백
}
```

## 버전 올릴 때 체크리스트

- [ ] 새 `CodingKey` 항목 추가
- [ ] `init(from:)`에 `decodeIfPresent` + 기본값 추가
- [ ] 필요 시 마이그레이션 블록 `if version < N { ... }` 추가
- [ ] `currentVersion` 올리기
- [ ] 버전 히스토리 주석 업데이트
- [ ] `legacyDecode_v<N>` 테스트 추가 (인라인 JSON)
- [ ] 기존 round-trip 테스트 통과 확인
