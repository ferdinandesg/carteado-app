<h1 align="center">Carteado App 👋</h1>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0-blue.svg?cacheSeconds=2592000" />
</p>

> Jogo de cartas Carteado – projeto full-stack (Next.js + Express) com Socket.io, Redis e MongoDB.

## Instalação

```bash
npm install          # Windows PowerShell bloqueado? use: npm.cmd install
cp .env.example .env # edite com suas credenciais
nvm use              # Node 24.14.0 (.nvmrc)
```

**Requisitos:** Node **24+**, Docker para MongoDB e Redis.

No **Windows**, se `npm` falhar por política de execução do PowerShell, veja [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md#windows-erro-ao-rodar-npm-i-no-powershell).

---

## Rodar localmente

```bash
npm run dev:services   # 1. Mongo + Redis (Docker)
npm run dev            # 2. Backend :4000 + Frontend :3000
```

Aplicação: http://localhost:3000

```bash
npm run dev:safe       # validate + dev (antes de commit/deploy)
npm run deploy:prod:local   # stack Docker simulando prod
```

---

## Comandos principais

| Comando                     | Descrição                       |
| --------------------------- | ------------------------------- |
| `npm run dev`               | Backend + Frontend              |
| `npm run dev:safe`          | Validate + dev                  |
| `npm run dev:services`      | Mongo + Redis (Docker)          |
| `npm run dev:services:down` | Para infra Docker               |
| `npm run validate`          | Lint + typecheck + test + build |
| `npm run deploy:dev`        | Stack dev completa em Docker    |

---

## Documentação

- [Começando / re-rodar o projeto](docs/GETTING_STARTED.md)
- [Deploy e ambientes](docs/DEPLOY.md)

---

## Arquitetura

- **Frontend:** Next.js 15, React 19, NextAuth, Socket.io client
- **Backend:** Express 5, Socket.io, Prisma (MongoDB), Redis
- **Shared:** Tipos e regras de jogo isomórficas

**Auth:** JWT assinado no backend (`JWT_SECRET_KEY`); NextAuth repassa `accessToken` na sessão.

**Config:** `.env` na raiz — `backend/src/config/env.ts` valida env no startup.

---

## Autor

👤 **Ferdinandes Guimaraes**

- Website: [ferdinandes.com.br](https://ferdinandes.com.br)
- Github: [@ferdinandesg](https://github.com/ferdinandesg)
- LinkedIn: [@ferdinandes-nascimento](https://linkedin.com/in/ferdinandes-nascimento)
