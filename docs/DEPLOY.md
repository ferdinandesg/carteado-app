# Deploy e ambientes — Carteado App

## Pré-requisitos

- **Node 24.14.0** (`.nvmrc` + CI)
- Docker e Docker Compose
- `.env` na raiz (ver `.env.example` e [GETTING_STARTED.md](./GETTING_STARTED.md))

---

## Validação local

```bash
npm run validate
```

Lint → typecheck → testes → build (`shared` antes de `backend` / `frontend`).

---

## Desenvolvimento local (recomendado)

```bash
npm run dev:services   # Mongo + Redis
npm run dev            # backend :4000 + frontend :3000
```

Alternativas:

| Comando              | Uso                                                |
| -------------------- | -------------------------------------------------- |
| `npm run dev:safe`   | `validate` + `dev`                                 |
| `npm run deploy:dev` | Stack inteira em Docker (`docker/compose.dev.yml`) |

### Variáveis (dev híbrido — app no host)

Além de `JWT_SECRET_KEY`, `NEXTAUTH_SECRET`, Google:

- `NEXTAUTH_URL=http://localhost:3000`
- `API_URL=http://localhost:4000/api/v1` (SSR NextAuth → backend)
- `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`
- `NEXT_PUBLIC_SOCKET_URL=http://localhost:4000`

Socket: path `/carteado_socket`, namespace `/room`.

---

## Produção local (Docker)

```bash
npm run deploy:prod:local
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Health: http://localhost:4000/api/v1/health

`.env` na raiz com `JWT_SECRET_KEY`, `GOOGLE_ID`, `GOOGLE_SECRET` (dummies ok para smoke test).

---

## Produção (GCP VM + CI)

### CI/CD (`push` em `master` ou `workflow_dispatch`)

Workflow `.github/workflows/ci-cd.yml` (Node **24.14.0**):

1. Lint e testes
2. Build e push imagens Docker Hub
3. SCP de `deploy/` para a VM
4. `docker compose pull` + `up -d`

### Manual na VM

```bash
npm run ssh
cd ~/deploy
docker compose -f docker-compose-prod.yml pull
docker compose -f docker-compose-prod.yml up -d
```

### Portas e segredos

- Mongo (27017), Redis (6379), backend (4000) e frontend (3000) publicam **só em `127.0.0.1`** na VM. O acesso público é pelo nginx (80/443), que fala com os containers pela rede `app_network`.
- Acesso ao Mongo da sua máquina: `npm run ssh:tunnel` (encaminha `localhost:27017` da VM).
- `NEXTAUTH_SECRET` é obrigatório (sem fallback para `JWT_SECRET_KEY`). O backend loga um aviso se `JWT_SECRET_KEY` tiver menos de 32 caracteres.

### Rotação da senha do Mongo

`MONGO_INITDB_ROOT_*` (`MONGO_ROOT_USERNAME` / `MONGO_ROOT_PASSWORD` no `.env` da VM) só valem na criação do volume. Com o volume já existente:

1. `docker exec -it mongodb mongosh admin -u root -p <senha-atual> --eval 'db.changeUserPassword("root", "<nova>")'`
2. Atualizar o secret `DATABASE_URL` no GitHub (senha percent-encoded) e `MONGO_ROOT_PASSWORD` no `.env` da VM.
3. Re-rodar o deploy (`workflow_dispatch`).

### Rollback

```bash
docker compose -f docker-compose-prod.yml down
# Usar tag de imagem anterior em vez de :latest
docker compose -f docker-compose-prod.yml up -d
```

---

## Comandos úteis

| Comando                     | Descrição                       |
| --------------------------- | ------------------------------- |
| `npm run validate`          | Lint + typecheck + test + build |
| `npm run dev:services`      | Só Mongo + Redis                |
| `npm run dev`               | Backend + frontend              |
| `npm run deploy:dev`        | Docker dev completo             |
| `npm run deploy:prod:local` | Simula prod local               |
| `npm run deploy:prod`       | Compose prod (VM)               |
