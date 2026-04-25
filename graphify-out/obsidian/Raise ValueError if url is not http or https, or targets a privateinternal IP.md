---
source_file: "tools/graphify/security.py"
type: "rationale"
community: "URL Ingest Pipeline"
location: "L27"
tags:
  - graphify/rationale
  - graphify/EXTRACTED
  - community/URL_Ingest_Pipeline
---

# Raise ValueError if *url* is not http or https, or targets a private/internal IP

## Connections
- [[validate_url()]] - `rationale_for` [EXTRACTED]

#graphify/rationale #graphify/EXTRACTED #community/URL_Ingest_Pipeline