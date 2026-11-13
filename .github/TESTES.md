# CI do Fiat Assist

O workflow `workflows/testes.yml` executa em push para `main`, em pull requests direcionados a `main` e manualmente pela aba Actions → Testes Fiat Assist → Run workflow. A execução manual aparece quando o workflow estiver na branch padrão. Este arquivo e o workflow ainda precisam ser enviados com autorização do responsável.

## Jobs e isolamento

- **Backend:** Ubuntu 24.04, Node.js 22 e `npm ci --include=dev`. Verifica `NODE_ENV=test`, dialeto SQLite e armazenamento `:memory:` antes de executar todas as suítes Jest, em série, com cobertura e relatório JSON.
- **Frontend:** Ubuntu 24.04 e Node.js 22. Executa o lint existente, os dois arquivos de testes Node de configuração/renderização e `npm run build`. As dependências do backend também são instaladas porque o teste de renderização importa o serviço de ranking. O build utiliza somente `https://fiat-api.test`, uma URL reservada de testes.
- **Navegadores:** Windows Server 2022 e Node.js 22. O roteiro existente depende de caminhos Windows fixos para Chrome e Edge; esse runner permite executá-lo sem modificar testes. A presença dos executáveis é obrigatória. O backend iniciado pelo próprio roteiro força SQLite em memória, usa fixtures do catálogo e porta local dinâmica. As requisições para a URL reservada do build são interceptadas e encaminhadas à API local.

Nenhum job usa secrets, environments de produção ou serviços PostgreSQL. As variáveis de conexão e chaves externas são esvaziadas; os testes de IA usam mocks. Nenhum comando inicia `backend/server.js`, faz deploy, altera o Supabase ou publica código. O token do workflow tem somente `contents: read` e o checkout não persiste credenciais Git.

## Resultados e evidências

Os três jobs tentam publicar seus arquivos mesmo quando um teste falha. Os artifacts ficam disponíveis por 14 dias na página da execução:

- `backend-jest-cobertura`: JSON do Jest, cobertura resumida, LCOV e relatório HTML.
- `frontend-relatorios-build`: log do lint, relatório TAP, log do build e `dist` de testes.
- `navegadores-chrome-edge-evidencias`: relatórios JSON, respostas HTTP de fixtures, logs e capturas de tela.

Os builds anexados servem somente para testes e apontam para `https://fiat-api.test`; não devem ser publicados na Vercel. A quantidade e o resultado dos testes vêm dos relatórios reais. O workflow não fixa uma contagem nem declara aprovação antecipada. Se Chrome ou Edge forem ignorados pelo roteiro, uma verificação adicional reprova o job em vez de aceitar uma execução incompleta.

## Limitações

O runner hospedado pelo GitHub e suas versões de navegador só poderão ser confirmados em uma execução real do Actions, após o push autorizado. A imagem Windows contém Chrome e Edge, mas atualizações da imagem podem mudar seus caminhos; nesse caso o job falha explicitamente. Não há `continue-on-error` para ocultar falhas.

O roteiro testa a interface e API locais, não a disponibilidade da Vercel, Render, Supabase ou destinos comerciais. As fontes remotas podem exigir acesso de rede do navegador. A instalação reproduz as versões dos dois `package-lock.json`; o runner precisa acessar o registry npm e os downloads dos binários nativos, como SQLite. A versão de patch do Node.js 22 e os navegadores acompanham as atualizações do runner.

## Validação local em 13/11/2026

O workflow passou no actionlint 1.7.12, na leitura YAML e nas verificações estruturais dos gatilhos, Node.js 22, isolamento, artifacts e ausência de `continue-on-error`. Os dois lockfiles foram comparados com seus respectivos `package.json` e estão compatíveis.

Com Node.js 22.14.0 no Windows, foram executados: lint aprovado, build aprovado, 295 testes Jest aprovados com cobertura, 34 testes Node do frontend aprovados e 62 verificações de navegador aprovadas, divididas entre Chrome e Edge. Esses são resultados locais reais, não uma execução do GitHub Actions.

A instalação limpa por `npm ci` nos runners Ubuntu/Windows e a publicação dos artifacts no GitHub ainda dependem da primeira execução remota. A verificação local utilizou as dependências já instaladas no workspace. Nenhum teste existente ou código da aplicação foi alterado para obter esses resultados.

Referências: [workflows do GitHub Actions](https://docs.github.com/en/actions/get-started/quickstart), [setup-node](https://github.com/actions/setup-node), [artifacts](https://github.com/actions/upload-artifact) e [imagem Windows 2022](https://github.com/actions/runner-images/blob/main/images/windows/Windows2022-Readme.md).
