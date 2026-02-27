# Deploy — Carteado App

## Pré-requisitos

- Node 20 (use `nvm use` ou `.nvmrc`)
- Docker e Docker Compose
- Variáveis de ambiente (veja `.env.example`)

---

## Validação local (antes de qualquer deploy)

```bash
npm run validate
```

Roda lint → typecheck → testes → build. Se passar, o que vai para o CI/deploy deve funcionar.

---

## Rodar o app localmente

### Modo desenvolvimento (recomendado para dev diário)

```bash
npm run dev
```

Sobe backend (porta 4000) e frontend (porta 3000). Acesso em http://localhost:3000.

**Requisitos:** MongoDB e Redis rodando localmente (ou via Docker).

### Modo desenvolvimento com validação antes

```bash
npm run dev:run
```

Executa `validate` e, se passar, inicia o modo desenvolvimento.

### Simular produção local (Docker)

```bash
npm run deploy:prod:local
```

Faz o build do monorepo, builda as imagens Docker e sobe a stack completa (frontend, backend, Redis, MongoDB).

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Health: http://localhost:4000/api/v1/health

Crie um `.env` na raiz com `JWT_SECRET_KEY`, `GOOGLE_ID` e `GOOGLE_SECRET` (ou use os valores dummy para teste).

---

## Deploy em produção (GCP VM)

### Via CI/CD (push em `master`)

1. Push para a branch `master`
2. O workflow `.github/workflows/ci-cd.yml`:
   - Roda lint e testes
   - Builda imagens Docker (backend e frontend)
   - Faz push para Docker Hub
   - SCP do `deploy/` para a VM
   - SSH na VM e executa `docker compose pull` + `up -d`

### Manual (na VM)

```bash
# Na máquina local
npm run ssh

# Na VM
cd ~/deploy
docker compose -f docker-compose-prod.yml pull
docker compose -f docker-compose-prod.yml up -d
```

### Rollback

```bash
# Na VM: usar imagem com tag anterior
docker compose -f docker-compose-prod.yml down
# Editar compose para usar tag :abc1234 em vez de :latest
docker compose -f docker-compose-prod.yml up -d
```

---

## Comandos úteis

| Comando                     | Descrição                                       |
| --------------------------- | ----------------------------------------------- |
| `npm run validate`          | Lint + typecheck + test + build                 |
| `npm run dev`               | Backend + Frontend em modo dev                  |
| `npm run dev:run`           | Validate + dev                                  |
| `npm run deploy:prod:local` | Build + Docker stack local                      |
| `npm run deploy:dev`        | Docker compose dev (usa docker-compose-dev.yml) |
| `npm run deploy:prod`       | Deploy prod (compose na VM)                     |
