# Fiat Assist: Vercel e Render

## Vercel — frontend

Configure `VITE_API_URL=https://analise-fiat-tcc.onrender.com` em Settings → Environment Variables, para Production e para os ambientes Preview que utilizar. Use a URL raiz do backend, sem `/api` e sem credenciais. O frontend de produção está em `https://fiat-assist-tcc.vercel.app`.

Com Root Directory `frontend`, utilize `npm run build` e Output Directory `dist`. Faça um novo deploy após alterar `VITE_API_URL`: o Vite incorpora essa variável durante a compilação. Nunca coloque senhas ou dados de conexão ao banco em variáveis `VITE_`.

Sem `VITE_API_URL`, a interface de produção exibe um erro de configuração e não tenta acessar localhost. HTTP e endereços locais também são recusados em produção.

## Render — backend

Configure em Environment:

```text
NODE_ENV=production
CORS_ORIGINS=https://fiat-assist-tcc.vercel.app
```

Use a origem exata do frontend, sem caminhos ou barra final. Para domínio próprio ou previews adicionais, separe as origens HTTPS por vírgula, por exemplo `https://fiat-assist-tcc.vercel.app,https://SEU-DOMINIO.com`. Não use `*` nem `*.vercel.app`. Cada domínio de preview precisa ser autorizado explicitamente.

Salve e faça deploy do backend para aplicar o CORS. Sem `CORS_ORIGINS` em produção, a inicialização falha com uma mensagem explícita. A API autoriza CORS somente para as origens configuradas e métodos GET, POST e OPTIONS, sem credenciais de cookies. Requisições sem Origin, como chamadas entre servidores, continuam funcionando; CORS é uma política aplicada pelo navegador.

Mantenha as variáveis de banco, senhas, Supabase e demais credenciais existentes. A correção não exige alterações no banco nem execução de seed, reset ou migrações. O servidor existente já utiliza `process.env.PORT`.

## Desenvolvimento e testes locais

No `npm run dev`, sem `VITE_API_URL`, o frontend usa `http://localhost:3000`. Fora de produção, o backend autoriza as origens locais das portas 5173 e 4173. Um endereço local opcional pode ser configurado em `frontend/.env.local`.

Testes automatizados do backend usam `NODE_ENV=test` e SQLite em memória. O roteiro de navegador aceita `BROWSER_AUDIT_API_URL`, que deve ser igual à `VITE_API_URL` usada no build de testes. Para build de auditoria isolada, use uma URL reservada, como `https://fiat-api.test`; o roteiro intercepta somente essa origem e encaminha as requisições para a API SQLite local. Não use a API de produção para esse roteiro.

## Verificação após o deploy

1. Abra a URL HTTPS da Vercel em um celular e recarregue a página.
2. Confira que os modelos carregam e que `GET /api/vehicles/options` usa a URL HTTPS do Render.
3. Confira o cadastro do veículo, catálogo e análise no fluxo normal. O preflight OPTIONS dos POSTs deve autorizar a origem exata da Vercel e o cabeçalho Content-Type.
4. Se houver falha, confira as duas URLs, os ambientes da variável na Vercel, os logs do Render e se os dois serviços receberam novo deploy.

Referências: [variáveis do Vite](https://vite.dev/guide/env-and-mode), [variáveis na Vercel](https://vercel.com/docs/environment-variables), [variáveis no Render](https://render.com/docs/configure-environment-variables) e [CORS do Express](https://expressjs.com/en/resources/middleware/cors/).
