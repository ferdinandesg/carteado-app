# Começando — Carteado App

Node **24.14.0**, monorepo npm (`shared` → `backend` / `frontend`).

## Pré-requisitos

| Ferramenta     | Versão                  |
| -------------- | ----------------------- |
| Node.js        | **24.14.0** (`nvm use`) |
| npm            | 10+                     |
| Docker Desktop | MongoDB + Redis         |

### Windows: `npm.ps1` bloqueado

```powershell
npm.cmd install
# ou: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

---

## Setup (uma vez)

```bash
git pull && nvm use
npm install
cp .env.example .env   # Windows: copy .env.example .env
```

`.env` mínimo: `JWT_SECRET_KEY`, `NEXTAUTH_SECRET`, Google OAuth, URLs `localhost:3000` / `4000`.

`postinstall` roda `prisma generate`. Se falhar: `npm run prisma:generate -w backend`.

---

## Dia a dia

```bash
npm run dev:services   # Docker: Mongo + Redis
npm run dev            # shared (tsc -w) + backend + frontend
```

| URL                                 | Serviço  |
| ----------------------------------- | -------- |
| http://localhost:3000               | Frontend |
| http://localhost:4000               | API      |
| http://localhost:4000/api/v1/health | Health   |

Isolado: `dev:backend` | `dev:frontend` | `dev:shared` (com `build:shared` se o back estiver sozinho).

---

## Comandos na raiz (único lugar que importa)

| Comando                | Quando                            |
| ---------------------- | --------------------------------- |
| `dev` / `dev:services` | Desenvolver                       |
| `precommit`            | Testar hook (= commit)            |
| `check`                | lint + typecheck (+ build shared) |
| `validate`             | check + test + build back/front   |
| `test`                 | Jest (todos os pacotes)           |
| `format`               | Prettier no repo inteiro          |

Config na raiz: `eslint.node.mjs` (back/shared), `frontend/eslint.config.mjs` (Next), `lint-staged` no `package.json`.

### Git

| Hook       | Roda                           |
| ---------- | ------------------------------ |
| pre-commit | `precommit` (silencioso se ok) |
| pre-push   | `npm run check`                |

---

## Testes (camadas)

| Camada     | Comando                                       | Precisa de                                                                            |
| ---------- | --------------------------------------------- | ------------------------------------------------------------------------------------- |
| Unit       | `npm test` (ou `npx jest caminho/do/arquivo`) | nada; Redis/Prisma mockados em `backend/jest.setup.ts`                                |
| Cobertura  | `npm test -- --coverage`                      | idem; falha se cair abaixo do threshold                                               |
| Integração | `npm run test:integration`                    | Docker (Testcontainers) ou `npm run dev:services`                                     |
| E2E        | `npm run test:e2e -w frontend`                | `npm run dev:services`; o Playwright sobe backend e frontend se não estiverem rodando |

- Os testes também passam por typecheck (`tsconfig.test.json`) e lint (`jest/recommended`).
- Thresholds de cobertura ficam em `jest.config.ts` (raiz), por workspace. É um ratchet: subir quando a cobertura subir, **nunca** baixar para passar o CI.
- Integração sem Docker: com `DATABASE_URL` e `REDIS_URL` no ambiente, o `globalSetup` usa os serviços locais em vez de containers.
- E2E pela primeira vez: `npx playwright install chromium` dentro de `frontend/`.

---

## Validar antes de PR

```bash
npm run validate
npm run test:integration
```

No GitHub, o workflow `CI` roda `validate:ci` (com cobertura) e integração em todo PR; o `Playwright E2E` roda em paralelo. A regra de `master` exige os três checks (`validate`, `integration`, `e2e`).

PRs do Dependabot: `dependabot-automerge.yml` aprova e liga o auto-merge só no grupo `minor-and-patch` e nas GitHub Actions sem major; o merge (e o deploy) acontece quando os três checks passam. Majors ficam manuais — testar localmente antes do merge. Majors de `next`, `react`, `next-auth`, `prisma` e `@types/node` nem são abertos.

---

## Problemas comuns

| Sintoma                         | Solução                              |
| ------------------------------- | ------------------------------------ |
| Socket / HTTP 401               | Login de novo; `JWT_SECRET_KEY`      |
| `ERR_PACKAGE_PATH_NOT_EXPORTED` | `npm run build:shared`               |
| Prisma EPERM no install         | Pare o backend (nodemon)             |
| Docker / WSL                    | Subir Docker Desktop + virtualização |
| Commit falhou                   | `npm run precommit`                  |

Deploy: [DEPLOY.md](./DEPLOY.md).
