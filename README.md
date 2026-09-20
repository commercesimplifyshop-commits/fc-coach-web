# fc-coach-web

Frontend do FC Coach: React + Vite + TypeScript. Faz deploy na Vercel (projeto `fc-coach-web`).

## Comandos

```sh
npm install
npm run dev      # http://localhost:5173, proxy de /api para http://localhost:3001
npm run lint
npm run build
```

Para o `/api` funcionar em desenvolvimento, rode o `fc-coach-api` (`npm run dev`, porta 3001). Sem ele a página mostra "API indisponível".

## Variáveis de ambiente

Copie `.env.example` para `.env`. Só variáveis com prefixo `VITE_` chegam ao navegador. Na Vercel já estão configuradas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (chave *publishable*, segura para o browser).

## Branches e deploy

- `feature/*` → PR → `staging` → PR → `production`.
- Merge em `production` faz o deploy de produção na Vercel (Production Branch = `production`).
- `main` é espelho de `production`, atualizado por `.github/workflows/sync-main.yml`. Não commite nela.
- CI (`.github/workflows/ci.yml`): `tsc --noEmit`, `lint` e `build` em todo PR e nos pushes das três branches.
- `production` está protegida: exige PR e o check `build`.

O `vercel.json` reescreve `/api/*` para a API de produção (`https://fc-coach-api.vercel.app`), então o navegador nunca chama outra origem.

## Como criar uma aplicação nova nesse padrão

Passo a passo completo (GitHub, Vercel, Supabase, primeiro deploy e troubleshooting) em
`docs/PLAYBOOK-NOVA-APLICACAO.md` do repo `fc-coach-api`.
