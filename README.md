<h1 align="center">Carteado App 👋</h1>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0-blue.svg?cacheSeconds=2592000" />
</p>

> Jogo de cartas Carteado – projeto full-stack (Next.js + Express) com Socket.io, Redis e MongoDB.

## Instalação

```bash
npm install
cp .env.example .env   # edite com suas credenciais
nvm use                # ou nvm install se 20.15.1 não estiver instalado
```

**Requisitos:** Node 20+ (use `nvm use` com o `.nvmrc`), Docker para MongoDB e Redis.

---

## Rodar localmente

### Desenvolvimento rápido

```bash
# 1. Subir MongoDB e Redis (Docker)
npm run dev:services

# 2. Subir backend e frontend
npm run dev
```

Aplicação em http://localhost:3000.

### Desenvolvimento com validação antes

```bash
npm run dev:safe
```

Executa lint, typecheck, testes e build antes de iniciar. Útil antes de commits ou deploy.

### Simular produção local (Docker)

```bash
npm run deploy:prod:local
```

Build completo + stack Docker (nginx, frontend, backend, mongo, redis).

---

## Comandos principais

| Comando                     | Descrição                       |
| --------------------------- | ------------------------------- |
| `npm run dev`               | Backend + Frontend (dev rápido) |
| `npm run dev:safe`          | Validate + dev                  |
| `npm run dev:services`      | Sobe MongoDB e Redis (Docker)   |
| `npm run dev:services:down` | Para MongoDB e Redis            |
| `npm run validate`          | Lint + typecheck + test + build |
| `npm run test`              | Testes (backend + frontend)     |
| `npm run deploy:dev`        | Stack dev completa em Docker    |

---

## Documentação

- [Deploy e ambientes](docs/DEPLOY.md)
- [Docker – análise e estrutura](docs/DOCKER_ANALISE.md)
- [Plano de melhorias DX](docs/PLANO_DX_REFACTORS.md)

---

## Arquitetura

### Stack

- **Frontend:** Next.js 15, React 19, Tailwind, Socket.io client
- **Backend:** Express 5, Socket.io, Prisma (MongoDB)
- **Shared:** Lógica e tipos de jogo compartilhados entre front e back

### Data Stores

- **MongoDB:** Persistência (profiles, rooms, histórico)
- **Redis:** Estado efêmero em tempo real, pub/sub para o jogo

### Configuração

- Variáveis validadas no startup com Zod (`backend/src/config/env.ts`)
- `.env` na raiz – ver `.env.example`

---

## Autor

👤 **Ferdinandes Guimaraes**

- Website: [ferdinandes.com.br](https://ferdinandes.com.br)
- Github: [@ferdinandesg](https://github.com/ferdinandesg)
- LinkedIn: [@ferdinandes-nascimento](https://linkedin.com/in/ferdinandes-nascimento)

## Show your support

Give a ⭐️ if this project helped you!
