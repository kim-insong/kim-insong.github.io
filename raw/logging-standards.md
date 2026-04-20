# 옵저버빌리티 & 로깅 표준

Claude Code 환경에서 스크립트, 테스트, 훅이 생성하는 로그의 포맷과 규율.

## 로그 포맷

모든 스크립트/테스트/훅 출력은 아래 포맷을 따른다:

```
[HH:MM:SS] [LEVEL] [component] message
```

레벨: `INFO`, `WARN`, `ERROR`, `DEBUG`

예시: `[14:32:01] [ERROR] [build] swiftc: 3 warnings, 1 error`

## 플랫폼별 컨벤션

### Shell 스크립트

```bash
set -euo pipefail  # 파일 상단에 항상 추가

log() { echo "[$(date +%H:%M:%S)] [$1] [${COMPONENT:-script}] $2"; }
log INFO "starting deploy"
```

### Node.js 훅

stdout은 훅 프로토콜 채널 — 로그는 반드시 stderr 사용:

```js
const log = (level, component, msg) =>
  process.stderr.write(`[${new Date().toTimeString().slice(0,8)}] [${level}] [${component}] ${msg}\n`);
```

### Swift / XCUITest

시뮬레이터 로그를 grep 가능하게 모든 테스트 액션/어서션에 prefix:

```swift
print("[ACTION] tap loginButton")
print("[ASSERT] expects errorBanner visible")
```

## 로그 저장 위치

| 컨텍스트 | 위치 |
|---------|------|
| Shell task 실행 | `/tmp/claude-<task>-<YYYY-MM-DD>.log` |
| Node 훅 | stderr (Claude Code가 자동 캡처 — redirect 불필요) |
| 테스트 실행 | `test-results/`, `*.junit.xml`, `*.log` 확인 |

로그 파일 생성 패턴:
```bash
some-command 2>&1 | tee /tmp/claude-<task>-$(date +%F).log
```

## 로그 읽기 규율

아래 상황에서 Claude는 exit code만 믿지 않고 **로그 내용을 반드시 읽어야 한다**:

1. **테스트 실행 후** — `FAIL`, `ERROR`, `error:` grep 후 통과 선언
2. **빌드 후** — `warning:` 라인 확인; 0이 아니면 에스컬레이션
3. **훅 실행 후** — stderr 출력으로 훅이 올바르게 동작했는지 확인
4. **Shell 스크립트 실행 후** — stdout/stderr에 내용이 있으면 읽기; `$? == 0`만으로 성공 추론 금지

## 이상 탐지 규칙

명령 실행 후 로그에 `ERROR`, `FAIL`, `error:`, `WARN`이 포함된 줄이 있으면:

1. 멈춘다. 다음 단계로 진행하지 않는다.
2. 전후 ≥5줄 context를 읽는다.
3. false positive 여부 판단 (문자열 리터럴, 테스트 픽스처 이름 등).
4. 실제 이슈이면 수정 후 진행.
5. 로그가 깨끗하거나 이상이 명시적으로 triaged된 후에만 계속.
