# Drops dos Mans

Paródia brasileira do [twitch.facepunch.com](https://twitch.facepunch.com/) — a página oficial dos Twitch Drops do Rust. A ideia é simples: copiar o esqueleto que a galera já conhece e adaptar pra cena BR, premiando viewer de acordo com o tempo que ele fica na live.

> Projeto de estudo, sem afiliação com a Facepunch Studios, Twitch ou Valve. Logos e assets de marca pertencem aos respectivos donos.

## Por que isso existe

Streamer pequeno BR sofre pra segurar viewer. Drop é um chamariz que funciona — você assiste, ganha skin, todo mundo feliz. Esse projeto é um esqueleto pronto pra qualquer streamer/comunidade fazer a própria campanha de drops sem depender de campanha oficial da Twitch (que é chata de ser aprovada e geralmente só rola pra jogo grande).

A premiação por tempo assistido é a parte interessante: a pessoa não precisa ficar refresh no chat torcendo pra ganhar sorteio — ela só assiste, e a recompensa cai sozinha.

## Como funciona

- Usuário entra em `/connect`
- Loga com Steam (OpenID 2.0) e Twitch (OAuth 2.0)
- O sistema parea as duas contas no banco
- Conforme o usuário assiste live(s) participantes, acumula tempo
- Atingiu X minutos → drop liberado pra resgatar

A parte de **tracking de tempo assistido** ainda não está implementada — só o fluxo de pareamento de contas e a UI. Esse é o próximo passo (provavelmente via Twitch EventSub + cron checando viewers).

## Stack

- **Next.js 14** (App Router, Server Components)
- **Turso** (libSQL) pra persistência
- **jose** pra JWT da sessão
- **CSS original** importado direto do site real (clone fiel da UI; o objetivo aqui não é reinventar design, é replicar uma referência conhecida)

Sem Tailwind no final — comecei com ele mas troquei pelo CSS original importado pra evitar o trabalho infinito de tradução de classes pra Tailwind.

## Rodando localmente

```bash
git clone https://github.com/NoCaus3/DropsDosMans.git
cd DropsDosMans
npm install
cp .env.example .env.local
# preencha as variáveis (instruções abaixo)
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

No painel do Twitch, cadastre `http://localhost:3000/signin-twitch` como **OAuth Redirect URL**.

A tabela do banco é criada automaticamente na primeira request — não precisa rodar migration.

## Estrutura

```
app/
  api/auth/        # rotas de auth (steam, twitch, logout, enable)
  signin-steam/    # callback OpenID do Steam
  signin-twitch/   # callback OAuth do Twitch
  connect/         # página de pareamento
  page.tsx         # home
components/        # Header, Hero, FAQ, Pair, Footer
lib/
  db.ts            # cliente Turso + queries
  session.ts       # JWT sign/verify
```

## Roadmap

- [x] Clone visual da página
- [x] Pareamento Steam ↔ Twitch
- [ ] Tracking de tempo assistido (Twitch EventSub)
- [ ] Painel pro streamer criar campanha (cadastrar drop, definir tempo mínimo, etc.)
- [ ] Distribuição automática dos prêmios via Steam Trade
- [ ] Página de inventário do usuário
- [ ] Dark/light? (provavelmente nunca, é Rust né)

## Contribuindo

PR é bem-vinda. Issue também. Se quiser pegar algo do roadmap, comenta na issue correspondente antes pra evitar trabalho duplicado.

Padrão de commit: livre, mas tenta deixar a mensagem clara. Sem commit `wip` no main.

## Licença

[MIT](LICENSE) — usa, fork, vende, faz o que quiser. Só não me processa.

## Créditos

- Layout original: [Facepunch Studios](https://facepunch.com/)
- Inspiração: a galera de Rust BR que segura live com 50 viewer no peito
