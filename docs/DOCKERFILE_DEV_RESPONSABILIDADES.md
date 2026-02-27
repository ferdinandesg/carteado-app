# Responsabilidades do Dockerfile de Dev

Objetivo: preparar um **ambiente de execução** para desenvolvimento, não um artefato de build. O foco é **iteração rápida** e **paridade** com o que o desenvolvedor roda localmente.

---

## 1. Ambiente base

| Responsabilidade        | Detalhe                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| **Node**                | Versão alinhada com prod (Node 20). Evita "funciona no container, quebra no CI".                      |
| **Ferramentas nativas** | Apenas se algum pacote exigir (ex: `node-gyp`, `sharp`). Não incluir `python3, make, g++` por padrão. |
| **Sistema**             | Imagem leve (Alpine ou slim). OpenSSL se o Prisma precisar em runtime.                                |

---

## 2. Dependências

| Responsabilidade  | Detalhe                                                                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Todas as deps** | Incluir devDependencies (eslint, types, jest, nodemon, etc.).                                                                                                  |
| **Ordem**         | Copiar `package.json` e `package-lock.json` primeiro → `npm ci` → aproveitar cache de camadas.                                                                 |
| **Monorepo**      | Resolver `shared` corretamente via workspaces. O Dockerfile deve rodar a partir do contexto da **raiz** do monorepo para que `npm install` veja os workspaces. |

---

## 3. Código-fonte: NÃO fazer build

| Princípio             | Motivo                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Não copiar `src/`** | O código vem de **volume mount** no compose. Assim o hot reload funciona sem rebuild.                                              |
| **Copiar só configs** | `tsconfig`, `prisma/schema.prisma`, `next.config.js`, etc. São estáveis e raramente mudam.                                         |
| **Shared**            | Se usar volume para o monorepo inteiro, o shared já está montado. Se não, o `shared` precisa estar disponível (build ou montagem). |

---

## 4. Comando de entrada

| Responsabilidade | Backend                                | Frontend                 |
| ---------------- | -------------------------------------- | ------------------------ |
| **Comando**      | `npm run dev` (nodemon)                | `npm run dev` (next dev) |
| **Execução**     | Como usuário não-root quando possível. | Idem.                    |

---

## 5. O que o Dockerfile de dev NÃO deve fazer

| Evitar                        | Motivo                                                             |
| ----------------------------- | ------------------------------------------------------------------ |
| Build de produção             | Sem `tsc`, sem `next build`. O servidor de dev compila em memória. |
| Multi-stage complexo          | Um estágio é suficiente.                                           |
| Otimização de tamanho         | Não é prioridade em dev.                                           |
| Copiar todo o código no build | Quebra o hot reload e obriga rebuild a cada mudança.               |

---

## 6. Fluxo recomendado

```
Dockerfile.dev:
  1. FROM node:20-alpine
  2. WORKDIR /app
  3. COPY package*.json (raiz + workspace)
  4. COPY shared/package.json shared/ (só manifest para deps)
  5. RUN npm ci (ou npm install com workspaces)
  6. COPY configs (tsconfig, prisma schema, next.config)
  7. CMD ["npm", "run", "dev", "-w", "backend"] (ou frontend)

docker-compose-dev:
  - volumes: .:/app (ou ./backend:/app/backend, ./frontend:/app/frontend, ./shared:/app/shared)
  - O código montado sobrescreve o que foi copiado; hot reload funciona.
```

---

## 7. Problemas atuais nos Dockerfiles de dev

| Problema                | Onde                                                                                 | Ajuste                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Node 18 vs 20           | Backend e frontend                                                                   | Usar Node 20.                                                                |
| Shared mal resolvido    | Backend copia `shared/` para `backend/shared/` mas package.json usa `file:../shared` | Usar contexto da raiz e workspaces, ou manter estrutura consistente.         |
| Código copiado no build | Ambos copiam `backend/` e `frontend/` inteiros                                       | Trocar por volumes no compose; no Dockerfile, copiar só configs.             |
| Mongodb path quebrado   | `backend/docker-compose-dev.yml` usa `../mongodb_rs`                                 | O mongodb está em `deploy/mongodb_rs`; corrigir para `../deploy/mongodb_rs`. |
| Frontend "AS builder"   | Inútil com estágio único                                                             | Remover.                                                                     |
| `python3, make, g++`    | Frontend                                                                             | Só manter se algum pacote exigir compilação nativa.                          |

---

## 8. Resumo: checklist do Dockerfile de dev

- [ ] Node 20 (alinhado com `.nvmrc` e prod)
- [ ] Instalação de deps a partir da raiz do monorepo (workspaces)
- [ ] Código-fonte via volume no compose, não via COPY
- [ ] Apenas configs copiadas no build (tsconfig, prisma, next.config)
- [ ] CMD executa o dev server do workspace correto
- [ ] Sem build de produção (tsc, next build)
