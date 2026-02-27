# Plano de Melhorias — Carteado App

Este documento organiza as melhorias em fases executáveis, priorizando **npm workspaces**, **deduplicação**, **validação local** e **deploy simples**.

---

## Princípios do Plano

1. **Um único `npm install`** — Todas as dependências resolvidas a partir da raiz.
2. **Build local = build em produção** — O que passa localmente deve passar no CI e no deploy.
3. **Deploy em um comando** — Script único ou fluxo claro para produção.
4. **Zero duplicação** — Shared, tipos e ferramentas centralizados.

---

## Fase 1: Fundação (Workspaces e Build Local)

**Objetivo:** Consistência no monorepo e validação completa sem deploy.

### 1.1 Deduplicação via workspaces

| Ação                                    | Onde                            | Descrição                                                                                                                                                                            |
| --------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mover dependências duplicadas para raiz | `package.json` raiz             | `jest`, `typescript`, `@types/node`, `eslint`, `prettier`, etc. já estão na raiz; garantir que backend e frontend usem via hoisting e removam suas próprias versões quando possível. |
| Garantir `shared` como workspace        | `package.json` backend/frontend | Manter `"shared": "workspace:*"` ou `"file:../shared"`; npm workspaces já resolvem isso.                                                                                             |
| Adicionar `.nvmrc` / `engines`          | Raiz                            | Fixar Node 20 para evitar "funciona na minha máquina". Ex: `20` no `.nvmrc` e `"engines": { "node": ">=20" }` no `package.json`.                                                     |

### 1.2 Scripts de validação local

Criar um script `npm run validate` (e variantes) que rode **localmente** tudo que o CI faria:

```
validate     → lint + typecheck + test + build (na ordem)
validate:ci  → mesma coisa, mas com flags de CI (ex: coverage, exit codes)
```

**Scripts sugeridos para o `package.json` raiz:**

```json
{
  "scripts": {
    "validate": "npm run lint && npm run typecheck && npm run test && npm run build",
    "validate:ci": "npm run lint && npm run typecheck && npm run test -- --ci --coverage && npm run build",
    "typecheck": "npm run ts-check -ws --if-present",
    "build:order": "npm run build -w shared && npm run build -w backend && npm run build -w frontend"
  }
}
```

- **`typecheck`:** Cada workspace deve ter `ts-check` ou equivalente; a raiz orquestra.
- **`build:order`:** Ordem explícita: shared → backend, shared → frontend (backend e frontend podem rodar em paralelo depois do shared).

**Checkpoint:** `npm run validate` deve passar 100% localmente antes de confiar no CI.

### 1.3 Ordem de build e dependências

| Pacote   | Depende de | Build                                   |
| -------- | ---------- | --------------------------------------- |
| shared   | —          | `tsc`                                   |
| backend  | shared     | `prisma generate` → `tsc` → `tsc-alias` |
| frontend | shared     | `next build`                            |

Garantir que `npm run build -ws` respeite essa ordem (npm já resolve via workspaces). Se necessário, usar `build:order` acima.

### 1.4 Docker local (simular produção)

Objetivo: **testar as imagens de produção localmente** antes de subir para o GCP.

- Criar `deploy/docker-compose.local.yml` (ou similar) que:
  - Use as imagens locais (build) em vez de Docker Hub.
  - Inclua mongodb, redis, backend, frontend.
  - Opcional: nginx simplificado ou acesso direto às portas.

- Script sugerido: `npm run docker:prod:local`:
  - Build das imagens (backend e frontend) a partir da raiz.
  - `docker compose -f deploy/docker-compose.local.yml up --build`
  - Permite validar o fluxo completo sem Google.

**Checkpoint:** Subir `docker:prod:local`, abrir `http://localhost:3000` e validar que a aplicação responde.

---

## Fase 2: Testes e CI Alinhados

**Objetivo:** CI = cópia fiel do que você roda localmente.

### 2.1 Testes no CI

| Ação                                  | Onde                          | Descrição                                                                                   |
| ------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| Adicionar `npm run test` no job setup | `.github/workflows/ci-cd.yml` | Após `npm run lint`, rodar `npm run test`. Se falhar, o pipeline para.                      |
| Manter cobertura opcional             | CI                            | `--coverage` pode gerar relatório; não bloquear inicialmente, só garantir que testes rodem. |

### 2.2 Playwright corrigido

| Ação                                   | Onde                                        | Descrição                                                                                                                               |
| -------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Rodar Playwright no workspace frontend | `frontend/.github/workflows/playwright.yml` | Trocar `npx playwright test` por `npm run test:playwright -w frontend` ou `cd frontend && npx playwright test`.                         |
| Subir app antes dos e2e                | Playwright workflow                         | Adicionar passo para subir backend + frontend (ex: `npm run dev` em background ou `docker-compose` minimal) antes de `playwright test`. |
| Ajustar path do artifact               | Playwright workflow                         | Se o report ficar em `frontend/playwright-report/`, usar esse path no `upload-artifact`.                                                |

### 2.3 shared no paths-filter do CI

| Ação                | Onde                          | Descrição                                                                                                                                                |
| ------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Incluir `shared/**` | `.github/workflows/ci-cd.yml` | Quando `shared` mudar, considerar que `backend` e `frontend` devem ser buildados. Ex: `shared: - 'shared/**'` e usar `backend: backend/** OR shared/**`. |

### 2.4 Testes no pacote shared

| Ação                          | Onde                                           | Descrição                                                                    |
| ----------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Configurar Jest no shared     | `shared/package.json`, `shared/jest.config.ts` | Adicionar `jest` e script `test` que rode os testes do shared.               |
| Incluir shared no `jest` root | `jest.config.ts` raiz                          | Adicionar `shared` aos `projects` para que `npm run test` na raiz rode tudo. |

**Checkpoint:** Push para uma branch e verificar que lint → test → build rodam no CI e passam.

---

## Fase 3: Deploy Simples

**Objetivo:** Deploy = um comando ou fluxo claro, sem surpresas.

### 3.1 Scripts de deploy na raiz

| Script              | Descrição                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `deploy:dev`        | Docker dev local (já existe; ajustar se necessário para usar `docker-compose-dev.yml`).                               |
| `deploy:prod:local` | Build das imagens + `docker compose` local para simular produção (novo).                                              |
| `deploy:prod`       | Corrigir para apontar ao `deploy/` quando fizer sentido (ex: `docker compose -f deploy/docker-compose-prod.yml ...`). |

Como o deploy real é feito via GitHub Actions (push em `master` ou `workflow_dispatch`), o script `deploy:prod` na raiz pode ser usado para **simular** ou para **executar manualmente** na VM (via SSH). Ajuste conforme seu fluxo:

- Se for só CI: `deploy:prod` pode ser removido ou documentado como "uso manual na VM".
- Se quiser rodar local: `deploy:prod:local` com compose que usa imagens locais.

### 3.2 Healthchecks no docker-compose de produção

Adicionar `healthcheck` nos serviços para o Compose esperar que MongoDB, Redis e apps estejam prontos:

```yaml
# Exemplo para backend
backend:
  healthcheck:
    test:
      ["CMD", "wget", "-q", "--spider", "http://localhost:4000/api/v1/health"]
    interval: 10s
    timeout: 5s
    retries: 3
```

Isso exige um endpoint `/api/v1/health` no backend (retornando 200 quando app + DB + Redis estão ok).

### 3.3 Documentação do fluxo de deploy

Criar `docs/DEPLOY.md` com:

1. Pré-requisitos (Node 20, Docker, variáveis de ambiente).
2. Validação local: `npm run validate` e `npm run docker:prod:local`.
3. Deploy via CI: push para `master` ou `workflow_dispatch`.
4. Deploy manual na VM (se aplicável): comandos SSH e docker compose.
5. Rollback: como voltar para a imagem anterior (ex: tag `:previous` ou último commit).

---

## Fase 4: Dockerfiles de Desenvolvimento (Opcional)

Os Dockerfiles de dev hoje copiam `shared` para dentro de cada serviço, mas o `package.json` usa `file:../shared`. Para dev com Docker:

- **Opção A:** Usar o compose de dev a partir da raiz, com `context: .` e volumes que montam o código (incluindo `shared`), para que o workspace funcione como em localhost.
- **Opção B:** Ajustar os Dockerfiles de dev para refletir a estrutura esperada (ex: `shared` em `../shared` em relação ao backend/frontend no container).

Se o uso principal for `npm run dev` local (sem Docker), essa fase pode ser baixa prioridade.

---

## Resumo de Scripts (package.json raiz)

```json
{
  "scripts": {
    "prepare": "husky install",
    "clean": "git clean -fdX -- ./backend/dist ./frontend/.next ./frontend/out ./shared/dist || exit 0",
    "lint": "npm run lint -ws --if-present",
    "typecheck": "npm run ts-check -ws --if-present",
    "test": "jest",
    "test:backend": "npm test --workspace=backend",
    "test:frontend": "npm test --workspace=frontend",
    "build": "npm run build -ws",
    "validate": "npm run lint && npm run typecheck && npm run test && npm run build",
    "validate:ci": "npm run lint && npm run typecheck && npm run test -- --ci --coverage && npm run build",
    "dev": "npm run dev --workspace=backend & npm run dev --workspace=frontend",
    "deploy:dev": "docker-compose -f docker-compose-dev.yml up --build",
    "deploy:prod:local": "npm run build && docker compose -f deploy/docker-compose.prod.local.yml up --build",
    "deploy:prod": "docker compose -f deploy/docker-compose-prod.yml up --build",
    "ssh": "...",
    "ssh:tunnel": "..."
  }
}
```

---

## Ordem de Execução Recomendada

1. **Semana 1:** Fase 1.1 e 1.2 — `.nvmrc`, `validate`, `typecheck`, `build:order`.
2. **Semana 1:** Fase 2.1 e 2.3 — testes e shared no CI.
3. **Semana 2:** Fase 1.4 e 3.1 — `docker:prod:local`, correção de scripts de deploy.
4. **Semana 2:** Fase 2.2 — Playwright.
5. **Semana 3:** Fase 2.4 — testes no shared.
6. **Semana 3:** Fase 3.2 e 3.3 — healthchecks e docs.

---

## Checklist Final

- [ ] `npm run validate` passa localmente
- [ ] `npm run deploy:prod:local` sobe a stack e a app responde
- [ ] CI roda lint + test + build antes de qualquer deploy
- [ ] `shared` no paths-filter; mudanças em shared disparam build de backend/frontend
- [ ] Playwright roda no workspace frontend com app disponível
- [ ] Script `deploy:prod` aponta para o compose correto
- [ ] Healthchecks nos serviços principais
- [ ] `docs/DEPLOY.md` descreve o fluxo completo
