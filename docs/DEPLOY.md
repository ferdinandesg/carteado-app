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

| Comando | Uso |
|---------|-----|
| `npm run dev:safe` | `validate` + `dev` |
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

### Rollback

```bash
docker compose -f docker-compose-prod.yml down
# Usar tag de imagem anterior em vez de :latest
docker compose -f docker-compose-prod.yml up -d
```

---

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `npm run validate` | Lint + typecheck + test + build |
| `npm run dev:services` | Só Mongo + Redis |
| `npm run dev` | Backend + frontend |
| `npm run deploy:dev` | Docker dev completo |
| `npm run deploy:prod:local` | Simula prod local |
| `npm run deploy:prod` | Compose prod (VM) |
