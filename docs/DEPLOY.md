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

Proxy (Traefik, TLS automático), MongoDB e a rede `edge` são da plataforma da VM, o repo **`ferdinandesg/vm-infra`**. Este repo sobe só `frontend`, `backend` e `redis`, e as rotas públicas são as **labels** do Traefik em `deploy/docker-compose-prod.yml`:

| Router         | Regra                                          | Porta         |
| -------------- | ---------------------------------------------- | ------------- |
| `carteado`     | `Host(carteado.ferdinandes.com.br)`            | frontend:3000 |
| `carteado-api` | o mesmo host + `/api/v1` ou `/carteado_socket` | backend:4000  |

Não há nginx, certbot nem certificado para gerenciar aqui. Para adicionar ou alterar uma rota, mude as labels; o Traefik aplica sozinho no deploy.

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

- Redis (6379), backend (4000) e frontend (3000) publicam **só em `127.0.0.1`** na VM. O acesso público é pelo Traefik (80/443) da `vm-infra`, que alcança frontend e backend pela rede `edge`. O Redis fica só na rede interna `app_network`.
- O Mongo (27017, também só em `127.0.0.1`) é o da `vm-infra`. O backend o acessa como `mongodb:27017` pela rede `edge`.
- Acesso ao Mongo da sua máquina: `npm run ssh:tunnel` (encaminha `localhost:27017` da VM).
- `NEXTAUTH_SECRET` é obrigatório (sem fallback para `JWT_SECRET_KEY`). O backend loga um aviso se `JWT_SECRET_KEY` tiver menos de 32 caracteres.

### Rotação da senha do Mongo

O Mongo agora é da `vm-infra`, e o root só é criado num volume novo (ver o README de lá). Para trocar a senha do usuário que o carteado usa:

1. `docker exec -it mongodb mongosh admin -u root -p --eval 'db.changeUserPassword("<usuario>", passwordPrompt())'`
2. Atualizar o secret `DATABASE_URL` no GitHub, com a senha percent-encoded.
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
