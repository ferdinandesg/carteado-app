# Responsabilidades do docker-compose-dev

Objetivo: subir o **ambiente de desenvolvimento completo** com um comando (`npm run deploy:dev`). O desenvolvedor não precisa instalar MongoDB, Redis ou configurar nada além de Docker e `.env`.

---

## 1. Serviços que DEVE incluir

| Serviço      | Responsabilidade                    | Já existe?       |
| ------------ | ----------------------------------- | ---------------- |
| **Frontend** | App Next.js em modo dev             | ✅               |
| **Backend**  | API Express + Socket.io em modo dev | ✅               |
| **MongoDB**  | Persistência (Prisma)               | ✅ (via include) |
| **Redis**    | Cache, sessões, jogos em tempo real | ✅ (via include) |

MongoDB e Redis estão no compose unificado na raiz (`docker-compose-dev.yml`).

---

## 2. Responsabilidades por serviço

### Frontend

- Build a partir de `frontend/Dockerfile.dev`
- Porta 3000 exposta
- Env: `NEXT_PUBLIC_API_URL`, `NEXTAUTH_URL`, etc.
- Depende do backend estar up
- **Futuro:** volumes para hot reload (`./frontend/src:/app/frontend/src`)

### Backend

- Build a partir de `backend/Dockerfile.dev`
- Porta 4000 exposta
- Env: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET_KEY`, etc.
- Depende de MongoDB e Redis prontos (com healthcheck)
- **Futuro:** volumes para hot reload (`./backend/src:/app/backend/src`)

### MongoDB

- Replica set (Prisma + MongoDB usam)
- Volumes para persistência
- Healthcheck para o backend só subir quando o Mongo estiver pronto
- **Problema atual:** `context: ../mongodb_rs` está errado — o Mongo fica em `deploy/mongodb_rs`

### Redis

- `keyspace-events` Ex (para funcionalidades de jogo)
- Volumes para persistência
- Healthcheck
- **Problema atual:** `--requirepass ${REDIS_PASSWORD}` exige senha; o backend precisa de `REDIS_URL` com senha e `.env` precisa definir `REDIS_PASSWORD`

---

## 3. O que falta ou está incorreto

| Item                    | Problema                                                             | Ajuste                                                                           |
| ----------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Path do MongoDB**     | `backend/docker-compose-dev.yml` usa `context: ../mongodb_rs`        | Deveria ser `../deploy/mongodb_rs` (o Mongo está dentro de `deploy/`)            |
| **Path do .env**        | O include está em `backend/`; `env_file: .env` usa `backend/.env`    | O `.env` costuma ficar na raiz; usar `../.env` ou centralizar no compose da raiz |
| **Redis sem senha**     | Se `REDIS_PASSWORD` não estiver no `.env`, o comando do Redis quebra | Opção A: Redis sem senha em dev. Opção B: `REDIS_PASSWORD` obrigatório no `.env` |
| **Healthchecks**        | Backend sobe antes do MongoDB/Redis estarem prontos                  | Adicionar `depends_on` com `condition: service_healthy`                          |
| **Fragmentação**        | MongoDB e Redis em arquivo separado                                  | Unificar em `docker-compose-dev.yml` na raiz (opcional, mas facilita manutenção) |
| **Volumes para código** | Cada mudança exige rebuild                                           | Montar `./backend/src`, `./frontend/src`, `./shared` para hot reload             |

---

## 4. Estrutura recomendada

```
docker-compose-dev.yml (raiz)
├── frontend
├── backend
├── mongodb    ← unificar aqui
├── redis      ← unificar aqui
└── networks + volumes
```

- Um único arquivo, tudo na raiz, sem `include`
- Contextos e paths relativos à raiz
- Healthchecks em MongoDB e Redis
- `depends_on` com `condition: service_healthy` no backend

---

## 5. Variáveis de ambiente esperadas

| Variável              | Onde     | Uso                                                              |
| --------------------- | -------- | ---------------------------------------------------------------- |
| `DATABASE_URL`        | Backend  | `mongodb://mongodb:27017/carteado` (ou com auth se Mongo exigir) |
| `REDIS_URL`           | Backend  | `redis://redis:6379` (sem senha) ou `redis://:senha@redis:6379`  |
| `JWT_SECRET_KEY`      | Backend  | Assinatura de tokens                                             |
| `REDIS_PASSWORD`      | Redis    | Só se Redis usar `--requirepass`                                 |
| `NEXT_PUBLIC_API_URL` | Frontend | `http://localhost:4000/api/v1` (browser acessa o host)           |
| `NEXTAUTH_URL`        | Frontend | `http://localhost:3000` (callbacks do NextAuth)                  |

---

## 6. Resumo: checklist do docker-compose-dev

- [x] Frontend, backend, MongoDB, Redis
- [x] Path correto para `deploy/mongodb_rs`
- [x] Healthchecks em MongoDB e Redis
- [x] `depends_on` com `condition: service_healthy` no backend
- [x] Redis em dev sem senha; `REDIS_URL=redis://redis:6379`
- [x] `.env` na raiz referenciado
- [ ] (Futuro) Volumes para hot reload
