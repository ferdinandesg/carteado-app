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
| pre-push   | `npm test`                     |

---

## Validar antes de PR

```bash
npm run validate
```

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
