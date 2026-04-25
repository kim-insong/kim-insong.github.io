---
source_file: "tools/graphify/security.py"
type: "code"
community: "URL Ingest Pipeline"
location: "L26"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/URL_Ingest_Pipeline
---

# validate_url()

## Connections
- [[.redirect_request()]] - `calls` [EXTRACTED]
- [[Raise ValueError if url is not http or https, or targets a privateinternal IP]] - `rationale_for` [EXTRACTED]
- [[ingest()]] - `calls` [INFERRED]
- [[safe_fetch()]] - `calls` [EXTRACTED]
- [[security.py]] - `contains` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/URL_Ingest_Pipeline