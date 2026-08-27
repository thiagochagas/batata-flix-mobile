# BatataFlix Mobile — como configurar

Este é o app de celular (Expo/React Native) do BatataFlix, irmão do site
BatataFlix Web. Ele usa o **mesmo banco de dados** (Supabase) do site — os
filmes que você adicionar em um aparecem no outro.

## 1. Instalar as dependências

Com o [Node.js](https://nodejs.org) instalado, abra um terminal dentro desta
pasta (`BATATA_FLIX_MOBILE`) e rode:

```
npm install --legacy-peer-deps
```

## 2. Configurar o `.env`

1. Copie o arquivo `.env.example` e renomeie a cópia para `.env`.
2. Abra o `.env` e preencha:
   - `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` — são os
     **mesmos valores** que já estão no arquivo `.env.local` da pasta
     `BATATA_FLIX_WEB` (campos `NEXT_PUBLIC_SUPABASE_URL` e
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`). É o mesmo projeto Supabase, só copiar.
   - `EXPO_PUBLIC_API_BASE_URL` — a URL do BatataFlix Web depois de publicado
     no Vercel (ex: `https://batataflix.vercel.app`, sem barra no final).
     Essa URL só é usada pra buscar dados de filmes online (TMDb/IMDb) — o
     app funciona normalmente sem ela, só a busca automática de dados fica
     desativada até você preencher.

**Nenhum desses valores deve ser compartilhado publicamente** — o `.env`
já está configurado para não ir pro Git.

## 3. Rodar o app

```
npx expo start
```

Isso abre um QR code no terminal. Com o app **Expo Go** instalado no seu
celular (Android ou iPhone), escaneie o QR code e o BatataFlix abre direto
no seu telefone.

Se preferir testar num emulador/simulador instalado no computador, pressione
`a` (Android) ou `i` (iOS) no terminal depois de rodar `npx expo start`.

## 4. Entrar no app

Não existe tela de cadastro — a conta é a mesma do BatataFlix Web, criada
manualmente no painel do Supabase. Use o mesmo e-mail e senha que você já
usa para entrar no site.

## O que o app faz

- **Painel** — estatísticas do seu acervo (assistidos, nota média, horas
  maratonadas, Oscars, década favorita, ranking dos melhores filmes).
- **Assistidos** — lista dos filmes já vistos, com busca e filtros.
- **Quero Ver** — fila de prioridade com reordenação e sorteio (🎲).
- **Quero Rever** — filmes assistidos marcados para rever.
- **Top IMDb** — navegue pelos melhores filmes do TMDb e adicione com um
  toque.
- **Ajustes** — cor de destaque, tema claro/escuro, enriquecer o acervo com
  dados online, backup em JSON e sair da conta.
