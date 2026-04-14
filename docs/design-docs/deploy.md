# Deployment (GitHub Pages)

Automated build and deploy to GitHub Pages via GitHub Actions, with a custom domain.

## Key Files

| File | Role |
|------|------|
| .github/workflows/deploy.yml | CI/CD pipeline — build on push to `main`, deploy to Pages |
| public/CNAME | Custom domain declaration (`insong.net`) |
| astro.config.mjs | `site: 'https://insong.net'` for canonical URL generation |

## Core Concepts

- Deploys automatically on every push to `main`; can also be triggered manually via `workflow_dispatch`.
- Build job: Node 22, `npm install --include=dev`, `npm run build` → uploads `dist/` as Pages artifact.
- Deploy job depends on build; uses the official `actions/deploy-pages@v4` action.
- `concurrency.cancel-in-progress: false` — in-flight deploys are never cancelled (safe for sequential releases).
- `public/CNAME` contains a single line `insong.net` — GitHub Pages reads this to route the custom domain.
- Required repo settings: GitHub Pages source set to **GitHub Actions** (not a branch).

## Diagram

```mermaid
graph LR
  push[push to main] --> build[build job\nnpm run build]
  build --> artifact[upload dist/ artifact]
  artifact --> deploy[deploy job\ndeploy-pages]
  deploy --> live[insong.net live]
```
