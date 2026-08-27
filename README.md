# 📚 Flashcards de Estudo

Site pessoal para estudar através de cards de pergunta/resposta/explicação, com minigames de revisão. Uso pessoal e de amigos, sem fins comerciais — 100% gratuito, rodando no Vercel.

## ✨ Funcionalidades

- Cards com pergunta, resposta, explicação, analogia e imagem opcional
- Decks/categorias livres — qualquer usuário pode criar os próprios cards, sobre qualquer assunto
- Conteúdo inicial (seed) com temas de computação: SOLID, Clean Code, Design Patterns, API REST, cache, containers, Kubernetes, criptografia, entre outros
- **Minigame "segura e responde"**: um dispositivo, uma pessoa mostra os cards e marca acertou/errou
- **Minigame solo estilo Kahoot**: múltipla escolha com tempo e pontuação
- Conta admin: edita título da home, textos e cor de fundo do site
- Cada usuário pode customizar a cor tema da própria conta

## 🏗️ Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + Hono (serverless, `/api`) |
| Frontend | React + Vite + TypeScript |
| Banco de dados | Postgres via [Neon](https://neon.tech) |
| Design system | [shadcn/ui](https://ui.shadcn.com) (Radix + Tailwind) |
| Autenticação | JWT próprio (argon2id + [jose](https://github.com/panva/jose)) |
| Upload de imagens | Vercel Blob |
| Rate limiting | Upstash Redis |
| Testes | Vitest, `hono/testing`, Playwright (E2E crítico) |
| Deploy | Vercel |
| CI/CD | GitHub Actions |

Detalhes completos de arquitetura, modelo de dados e decisões estão em [`especificacao-flashcards-app.md`](./especificacao-flashcards-app.md).

## 🌿 Estratégia de branches

- **`prod`** — protegida, reflete o que está em produção no Vercel. Sem commit direto.
- **`develop`** — branch de trabalho do dia a dia. Todo o desenvolvimento acontece aqui (ou em branches de feature a partir dela).
- Merge para `prod` só via PR, quando `develop` estiver estável.

```
feature/xyz → develop → prod
```

## 🚀 Rodando localmente

Pré-requisitos: Node.js (ou Bun para dev), Docker, uma conta Neon (ou Postgres local via Docker).

```bash
# instalar dependências
bun install   # ou npm install

# copiar variáveis de ambiente
cp .env.example .env

# subir em modo dev
bun run dev   # ou npm run dev
```

### Variáveis de ambiente

```env
DATABASE_URL=            # connection string do Neon (com pooler)
JWT_SECRET=
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
BLOB_READ_WRITE_TOKEN=   # Vercel Blob
```

## 🧪 Testes

```bash
bun run test        # Vitest (unitário + lógica)
bun run test:api    # testes de API via hono/testing
bun run test:e2e    # Playwright (fluxos críticos)
```

## 📦 Deploy

Deploy automático no Vercel a partir da branch `prod`, disparado via GitHub Actions após os testes passarem.

## 📋 Modelo de dados (resumo)

```
users, decks, cards, site_settings, game_sessions (opcional)
```

Ver detalhamento completo na especificação técnica.

## 📝 Roadmap / decisões já fechadas

- [x] Site (não app nativo)
- [x] Node.js + Hono no lugar de FastAPI
- [x] Repo único, sem monorepo tooling pesado
- [x] Neon como Postgres
- [x] shadcn/ui no lugar de Ant Design
- [x] JWT próprio no lugar de Auth0
- [x] Vitest + Playwright no lugar de Cypress
- [ ] Schema definitivo (Drizzle/Prisma)
- [ ] Implementação da autenticação
- [ ] Implementação dos minigames