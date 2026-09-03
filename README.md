# 📚 Lumora — Flashcards de Estudo

Site pessoal para estudar através de cards de pergunta/resposta/explicação, com minigames de revisão. Uso pessoal e de amigos, sem fins comerciais — 100% gratuito.

## ✨ Funcionalidades

- Cards com pergunta, resposta, explicação, analogia e imagem opcional
- Decks livres — qualquer usuário pode criar os próprios decks/cards, sobre qualquer assunto
- **Categorias**: categoria principal + categorias adicionais por deck, listadas em ordem alfabética
- **Explorar**: página pública com todos os decks marcados como públicos, com filtro por categoria e dificuldade
- **Decks salvos**: qualquer usuário pode salvar um deck público de outra pessoa e jogá-lo a partir do próprio Dashboard, com o nome do criador visível
- **Minigame "Segura e Responde"**: um dispositivo, uma pessoa mostra os cards (flip card) e marca acertou/errou
- **Minigame "Quiz"**: múltipla escolha, com tempo por questão e pontuação (funciona também combinando múltiplos decks)
- Cadastro em 2 etapas: e-mail/senha e depois nome de exibição/ocupação
- Conta admin: gerencia usuários e configurações gerais do site
- Cada usuário pode customizar a cor tema da própria conta

## 🏗️ Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + Hono (`/api`), rodando via `tsx` |
| Frontend | React + Vite + TypeScript |
| Banco de dados | PostgreSQL (via Docker Compose em dev) |
| ORM | Drizzle ORM (`drizzle-kit push` para sincronizar schema) |
| Design system | [shadcn/ui](https://ui.shadcn.com) (Radix + Tailwind) |
| Autenticação | JWT próprio (argon2id + [jose](https://github.com/panva/jose)); access token em `sessionStorage`, refresh token em cookie httpOnly |
| Estado servidor | TanStack Query |
| Testes | Vitest (unitário/API), Playwright (E2E crítico) |
| Containers | Docker Compose (app + Postgres) |

Detalhes completos de arquitetura, modelo de dados e decisões estão em [`especificacao-flashcards-app.md`](./especificacao-flashcards-app.md).

## 🌿 Estratégia de branches

- **`main`** — protegida, reflete o que está estável/publicado. Sem commit direto.
- **`develop`** — branch de trabalho do dia a dia. Todo o desenvolvimento acontece aqui (ou em branches de feature a partir dela).
- Merge para `main` só via PR, quando `develop` estiver estável.

```
feature/xyz → develop → main
```

## 🚀 Rodando localmente

### Opção A — Docker Compose (recomendado)

Sobe o Postgres e a aplicação (API + Vite dev server) juntos, com hot reload.

```bash
docker compose up -d
```

- Frontend: http://localhost:5173
- API: http://localhost:3001
- Postgres: localhost:5432 (`postgres` / `postgres`, banco `study_center`)

O schema é sincronizado automaticamente (`db:push`) toda vez que o container `app` sobe.

Para popular o banco com dados de exemplo:

```bash
docker compose exec app npm run db:seed
```

Para derrubar tudo (incluindo o volume do banco):

```bash
docker compose down -v
```

### Opção B — Node local

Pré-requisitos: Node.js 22+, um Postgres acessível (local ou Docker só para o `db`).

```bash
# instalar dependências
npm install

# copiar variáveis de ambiente
cp .env.example .env

# criar/sincronizar o schema e popular dados de exemplo
npm run db:push
npm run db:seed

# subir API + frontend em modo dev (com hot reload)
npm run dev
```

### Variáveis de ambiente

Ver [`.env.example`](./.env.example) para a lista completa. As essenciais para rodar localmente:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/study_center?sslmode=disable
ACCESS_TOKEN_SECRET=   # openssl rand -base64 64
REFRESH_TOKEN_SECRET=  # openssl rand -base64 64
FRONTEND_URL=http://localhost:5173
```

## 🧪 Testes

```bash
npm run test        # Vitest (unitário + lógica)
npm run test:e2e    # Playwright (fluxos críticos)
npm run typecheck   # checagem de tipos TypeScript
```

## 📦 Build

```bash
npm run build     # tsc -b && vite build
npm run preview   # servir o build localmente
```

## 📋 Modelo de dados (resumo)

```
users, refresh_tokens, decks, cards, saved_decks, site_settings, game_sessions
```

- `decks.category` (principal) + `decks.extra_categories` (array) — categorização múltipla
- `saved_decks` — relação N:N entre usuários e decks públicos salvos
- `game_sessions` — histórico de partidas (quiz / segura e responde) por deck

Ver detalhamento completo na especificação técnica ([`especificacao-flashcards-app.md`](./especificacao-flashcards-app.md)) e no schema Drizzle ([`api/_db/schema.ts`](./api/_db/schema.ts)).

## 📝 Roadmap / decisões já fechadas

- [x] Site (não app nativo)
- [x] Node.js + Hono no lugar de FastAPI
- [x] Repo único, sem monorepo tooling pesado
- [x] Postgres via Docker Compose em dev
- [x] shadcn/ui no lugar de Ant Design
- [x] JWT próprio no lugar de Auth0
- [x] Vitest + Playwright no lugar de Cypress
- [x] Schema definitivo (Drizzle)
- [x] Implementação da autenticação (incluindo cadastro em 2 etapas)
- [x] Implementação dos minigames (Quiz e Segura e Responde)
- [x] Categorias múltiplas e página de exploração pública
- [x] Decks salvos (bookmark de decks de outros usuários)