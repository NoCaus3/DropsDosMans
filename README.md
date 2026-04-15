# Drops dos Mans

Paródia brasileira do [twitch.facepunch.com](https://twitch.facepunch.com/) — a página oficial dos Twitch Drops do Rust. A ideia é simples: copiar o esqueleto que a galera já conhece e adaptar pra cena BR, premiando viewer de acordo com o tempo que ele fica na live.

> Projeto de estudo, sem afiliação com a Facepunch Studios, Twitch ou Valve. Logos e assets de marca pertencem aos respectivos donos.

## Por que isso existe

Streamer pequeno BR sofre pra segurar viewer. Drop é um chamariz que funciona — você assiste, ganha skin, todo mundo feliz. Esse projeto é um esqueleto pronto pra qualquer streamer/comunidade fazer a própria campanha de drops sem depender de campanha oficial da Twitch (que é chata de ser aprovada e geralmente só rola pra jogo grande).

A premiação por tempo assistido é a parte interessante: a pessoa não precisa ficar refresh no chat torcendo pra ganhar sorteio — ela só assiste, e a recompensa cai sozinha.

## Como funciona

- Usuário entra em `/connect`
- Loga com Steam (OpenID 2.0) **ou** Twitch (OAuth 2.0) — ordem livre
- Depois loga com a outra conta — o sistema parea as duas no mesmo registro
- Clica em "Activate Drops" e tá pronto pra começar a acumular tempo
- (Próximo passo) Conforme assiste live(s) participantes, acumula tempo
- (Próximo passo) Atingiu X minutos → drop liberado pra resgatar

A parte de **tracking de tempo assistido** ainda não está implementada — só o fluxo de pareamento de contas e a UI espelhada do site original. Esse é o próximo passo (provavelmente heartbeat no embed do player + EventSub do chat pra confirmar presença).

## Estados do `/connect`

A página é um server component que resolve um discriminated union de 5 estados, cada um transcrito literalmente do HTML real do site da Facepunch:

- `logged-out` — Step 1 ativo com botões Steam/Twitch lado a lado
- `steam-only` — Step 1 marcado como completo, Step 2 pedindo Twitch
- `twitch-only` — Step 1 marcado como completo, Step 2 pedindo Steam
- `both-linked-not-activated` — Step 3 ativo com botão "Activate Drops"
- `both-linked-activated` — layout diferente, dois `account-box` lado a lado + botões Logout / Unlink Account / Check for Missing Drops

## Stack

- **Next.js 14** (App Router, Server Components)
- **Turso** (libSQL) pra persistência
- **jose** pra JWT assinado em cookie httpOnly
- **CSS original** importado direto do site real (clone fiel da UI; o objetivo aqui não é reinventar design, é replicar uma referência conhecida)

Sem Tailwind no final — comecei com ele mas troquei pelo CSS original importado pra evitar o trabalho infinito de tradução de classes pra Tailwind.

## Auth

| Fluxo | Endpoint inicial | Callback | Notas |
|---|---|---|---|
| Steam OpenID 2.0 | `/api/auth/steam` | `/signin-steam` | Mesma URL de login que o ASP.NET Core gera (Attribute Exchange + state em cookie) |
| Twitch OAuth 2.0 | `/api/auth/twitch` | `/signin-twitch` | Scope `user:read:email`. Token + refresh_token salvos no banco |
| Logout | `/api/auth/logout` | — | Soft-delete da row + clear cookie, redirect pra `/` |
| Unlink | `/api/auth/unlink` | — | Mesma coisa, redirect pra `/connect` (libera a tela pra reconectar) |
| Activate | `/api/auth/enable` | — | Marca `drops_enabled=1` (exige Steam + Twitch linkados) |

Sessão é um JWT HS256 com TTL 30 dias contendo só o `sid` (id da row em `user_links`). Cada request server-side faz um lookup no banco — sem cache.

## Banco

Tabela única `user_links` com **soft delete** (`deleted_at` nullable) e índices únicos parciais:

```sql
CREATE UNIQUE INDEX idx_user_links_steam_id_active
  ON user_links(steam_id)
  WHERE deleted_at IS NULL AND steam_id IS NOT NULL;
```

Isso permite que um mesmo `steam_id`/`twitch_id` apareça várias vezes ao longo do tempo (cada logout cria uma row "histórica"), desde que só uma esteja ativa.

## Rodando localmente

```bash
git clone https://github.com/NoCaus3/DropsDosMans.git
cd DropsDosMans
npm install
cp .env.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente

```
STEAM_API_KEY=          # https://steamcommunity.com/dev/apikey
TWITCH_CLIENT_ID=       # https://dev.twitch.tv/console/apps
TWITCH_CLIENT_SECRET=
TURSO_DATABASE_URL=     # libsql://...
TURSO_AUTH_TOKEN=
SESSION_SECRET=         # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
APP_URL=http://localhost:3000
```

No painel do Twitch, cadastre `http://localhost:3000/signin-twitch` como **OAuth Redirect URL** (sem trailing slash).

A tabela do banco é criada na primeira request. Pra criar/verificar manualmente:

```bash
npm run db:init
```

### Scripts

| Comando | O quê |
|---|---|
| `npm run dev` | Next dev server |
| `npm run build` | Build produção |
| `npm run typecheck` | `tsc --noEmit`, valida tipos sem tocar no `.next/` |
| `npm run db:init` | Cria tabela + índices se não existirem |

> Heads up: **não rode `npm run build` enquanto `npm run dev` estiver ativo**. Os dois compartilham `.next/`, e o build sobrescreve assets que o dev tá servindo, fazendo o CSS perder formatação até reiniciar o server. Pra validar mudanças use `npm run typecheck` ou só confie no hot reload.

## Estrutura

```
app/
  api/auth/
    steam/         # inicia OpenID
    twitch/        # inicia OAuth
    logout/        # soft-delete + redirect /
    unlink/        # soft-delete + redirect /connect
    enable/        # ativa drops
    refresh-drops/ # stub, futuro
  signin-steam/    # callback OpenID
  signin-twitch/   # callback OAuth
  connect/         # página de pareamento
  page.tsx         # home
components/        # Header, Hero, FAQ, Pair, Footer
lib/
  db.ts            # cliente Turso + queries
  session.ts       # JWT + cookies
  steam.ts         # buildLoginUrl, verifyOpenIdResponse, fetchProfile
  twitch.ts        # buildAuthUrl, exchangeCode, fetchUser, refreshToken
scripts/
  init-db.mjs              # cria schema
  inspect-user.mjs         # dump da DB
  refresh-twitch-avatars.mjs # popula avatares ausentes
```

## Roadmap

- [x] Clone visual da página `/`
- [x] Clone visual da página `/connect` (5 estados)
- [x] Pareamento Steam ↔ Twitch com soft delete
- [ ] Tracking de tempo assistido (heartbeat no embed + chat presence via EventSub)
- [ ] Painel pro streamer criar campanha (cadastrar drop, definir tempo mínimo, escolher canal)
- [ ] Distribuição automática dos prêmios via Steam Trade
- [ ] Página de inventário do usuário
- [ ] Implementar `/api/auth/refresh-drops` de verdade (atualmente stub)

## Contribuindo

PR bem-vinda. Issue também. Se quiser pegar algo do roadmap, comenta na issue correspondente antes pra evitar trabalho duplicado.

Estilo de código: zero comentários, nomes claros, falha explícita > fallback silencioso. Veja qualquer arquivo em [`lib/`](lib) ou [`components/Pair.tsx`](components/Pair.tsx) como referência.

## Licença

[MIT](LICENSE) — usa, fork, vende, faz o que quiser. Só não me processa.

## Créditos

- Layout original: [Facepunch Studios](https://facepunch.com/)
- Inspiração: a galera de Rust BR que segura live com 50 viewer no peito
