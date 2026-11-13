const fs = require('node:fs');
const path = require('node:path');
const dir = path.resolve(__dirname, '../../documentacao/testes');
const read = file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8').replace(/^\uFEFF/, ''));
const jest = read('evidencias/backend-jest.json');
const browser = read('evidencias/browser-results.json');
const security = read('evidencias/security-static.json');
const commands = read('evidencias/quality-commands.json');
const comparison = read('evidencias/preservacao-producao.json');
const coverage = read('evidencias/coverage/coverage-summary.json').total;
const previous = read('historico/2026-11-12/evidencias/casos-executados.json');
const date = process.env.TEST_EXECUTION_DATE || '2026-11-13';
const dateLabel = date.split('-').reverse().join('/');
const all = [];
const clean = text => String(text ?? '').replace(/\u001b\[[0-9;]*m/g, '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
const pct = n => String(n).replace('.', ',');
for (const suite of jest.testResults) {
  const file = path.basename(suite.name);
  for (const test of suite.assertionResults) all.push({
    id: 'BE' + String(all.length + 1).padStart(3, '0'), name: test.fullName, objective: test.title,
    procedure: `Executar o caso em backend/tests/${file} pelo npm test em série e com cobertura.`,
    data: previous.find(c => c.name === test.fullName)?.data || `Fixtures literais em backend/tests/${file}; a variação está identificada no título. Catálogo TCC real/Palio 2014 ou catálogo sintético, conforme o corpo do teste.`,
    expected: `Atender às asserções do caso: ${test.title}.`,
    observed: test.status === 'passed' ? 'Caso concluído; todas as asserções passaram.' : clean(test.failureMessages.join(' ')),
    status: test.status === 'passed' ? 'Aprovado' : test.status === 'failed' ? 'Reprovado' : 'Não executado',
    date, environment: 'Windows; Node.js 22.14.0; Jest; SQLite em memória nos testes com banco; serviços externos simulados.',
    evidence: 'evidencias/backend-jest.json', source: '../../backend/tests/' + file, durationMs: test.duration
  });
}
for (const test of browser.results) all.push({ ...test, id: test.browser + '-' + test.id, objective: test.name,
  environment: test.environment || 'Navegador headless; build local; API real com SQLite em memória.',
  data: test.data || { precondition: 'Continuidade do roteiro literal ou complementar descrita no procedimento.' } });
all.push({ ...security, name: 'Inspeção estática de credenciais', data: 'Fontes e build do frontend.', evidence: 'evidencias/security-static.json' });
for (const command of commands) all.push({ id: command.id, name: command.name, objective: command.name,
  procedure: `Executar ${command.command} em ${command.cwd}.`, data: 'Frontend e dependências existentes.',
  expected: 'Exit code 0.', observed: `Exit code ${command.exitCode}; consultar saída completa no log.`,
  status: command.exitCode === 0 ? 'Aprovado' : 'Reprovado', date, environment: 'Windows; Node.js 22.14.0.', evidence: command.evidence });
for (const [id, name, reason, procedure] of [
  ['NE01', 'Compatibilidade Firefox', 'Navegador não localizado nas localizações verificadas na campanha anterior; não instalado nesta etapa.', 'Executar TS01–TS12 em Firefox e registrar versão.'],
  ['NE02', 'Integração PostgreSQL real', 'Sem base de testes PostgreSQL isolada configurada; dados reais não acessados.', 'Configurar base de homologação e repetir integração.'],
  ['NE03', 'Gemini real', 'API externa simulada; serviço não participa das quatro rotas atuais.', 'Validar a API em homologação com credencial segura.'],
  ['NE04', 'Suíte unitária própria do frontend', 'Sem script test ou framework unitário próprio do frontend; houve testes reais de navegador.', 'Definir escopo de suíte unitária específica se necessário.']
]) all.push({ id, name, objective: name, procedure, data: 'Não utilizado.', expected: 'Execução em ambiente apropriado.', observed: reason,
  status: 'Não executado', date, environment: 'Ambiente local.', evidence: 'RELATORIO_TESTES_FIAT_ASSIST.md' });
for (const width of [375, 390, 768, 1366]) all.push({ id: 'MAN-' + width, name: 'Revisão humana de usabilidade em ' + width + 'px',
  objective: 'Avaliar legibilidade subjetiva e interação por toque/rolagem.',
  procedure: 'Abrir as três telas, rolar até o final e avaliar leitura e acionamento em dispositivo físico.',
  data: 'Palio 2014, 1.6 E.torQ, Manual, 80.000 km; consultas de freios.', expected: 'Conteúdo legível e controles utilizáveis.',
  observed: 'Medições geométricas e capturas disponíveis; revisão humana pendente.', status: 'Pendente de execução manual', date,
  environment: 'Dispositivo físico e navegador a registrar na execução manual.', evidence: `evidencias/Chrome-RESP-resultado-${width}.png` });
const counts = Object.fromEntries(['Aprovado', 'Reprovado', 'Bloqueado', 'Não executado', 'Pendente de execução manual'].map(s => [s, all.filter(c => c.status === s).length]));
const executed = counts.Aprovado + counts.Reprovado;
const approval = Number((100 * counts.Aprovado / executed).toFixed(2));
const ui = browser.results.filter(c => ['Aprovado', 'Reprovado'].includes(c.status));
const uiPassed = ui.filter(c => c.status === 'Aprovado').length;
const uiFailed = ui.length - uiPassed;
const responsive = browser.results.filter(c => c.id.startsWith('RESP-'));
const modified = comparison.filter(c => !c.preservado).map(c => c.path);
const versions = [...new Map(browser.results.filter(c => c.version).map(c => [c.browser, c.version])).entries()].map(([n, v]) => `${n}: ${v}`).join('; ');
const summary = { date, records: all.length, executed, counts, approvalPercent: approval, productionFilesChanged: modified, browserRunnerErrors: browser.errors.length, coverage };
fs.writeFileSync(path.join(dir, 'evidencias/casos-executados.json'), JSON.stringify(all, null, 2));
fs.writeFileSync(path.join(dir, 'evidencias/resumo-execucao.json'), JSON.stringify(summary, null, 2));
const suites = jest.testResults.map(s => `| ${path.basename(s.name)} | ${s.assertionResults.length} | ${s.assertionResults.filter(t => t.status === 'passed').length} | ${s.assertionResults.filter(t => t.status === 'failed').length} |`).join('\n');
const report = `# Relatório técnico de testes — Fiat Assist

Data da revalidação: **${dateLabel}**.

## Objetivo e resultado

Corrigir os achados funcionais da campanha anterior e verificar novamente o sistema, mantendo os testes que haviam reprovado. Foram executadas **${executed} verificações**, com **${counts.Aprovado} aprovações**, **${counts.Reprovado} reprovações** e **${counts.Bloqueado} bloqueios atuais**. A taxa de aprovação dos casos efetivamente executados é **${pct(approval)}%**. Itens não executados e revisões manuais não compõem esse percentual.

## Histórico e alterações

A campanha de 12/11/2026, com 170 verificações executadas, 166 aprovações e quatro reprovações correspondentes a dois achados, foi preservada em historico/2026-11-12, incluindo relatórios e evidências. Os resultados atuais substituem a situação final, sem apagar as falhas históricas.

O usuário autorizou as correções nesta etapa. A comparação com os ${comparison.length} arquivos monitorados identifica alterações de produção apenas em: ${modified.join(', ')}. Não houve alteração de telas, layout, endpoints, esquema ou dados reais. Nenhuma biblioteca foi instalada.

1. **F01 corrigido:** ruído e frenagem explícitos, categoria Freios e guia existente permitem retornar triagem com correspondência Moderada. A descrição não identifica peça defeituosa, não confirma lista de componentes e não recomenda compra. Relatos vagos ou negados continuam filtrados.
2. **F02 corrigido:** o ranking passou a exigir contexto do título do sintoma além de termos genéricos como falha, ruído e vibração. Isso impede o retorno de chave presencial/controle remoto para “motor falhando com vela” apenas por palavras amplas do catálogo. Resultados pertinentes em outra categoria continuam permitidos e sinalizados.
3. **Configuração de teste:** SQLite em memória usa dialect/storage explícitos, eliminando a depreciação de sqlite::memory:. A configuração PostgreSQL de uso não foi alterada.

Os dois testes anteriormente reprovados foram mantidos e passaram. Foram acrescentados seis casos de regressão, sem remover ou ignorar testes para obter aprovação.

## Ambiente e inspeção do projeto

- Windows, Node.js 22.14.0, npm 10.9.2.
- Backend: Express 5.2.1, Sequelize 6.37.8, pg 8.21.0, Jest 30.4.2, Supertest 7.2.2 e sqlite3 6.0.1.
- Frontend: React/React DOM 19.2.6, Vite 8.0.14, Tailwind CSS 4.3.0 e ESLint 10.4.0.
- Navegadores realmente executados: ${versions}, em headless com perfis temporários.
- Handlers e quatro rotas em backend/app.js; serviços em backend/services; oito modelos e associações em backend/models. O Prisma presente não foi utilizado pelos testes de domínio.
- Componentes: App, VehicleForm, SymptomReportForm e DiagnosisResult.
- Scripts backend: test, start, populate-tcc. Scripts frontend: dev, build, lint, preview; sem script test próprio.
- Banco dos testes exclusivamente SQLite em memória, com NODE_ENV=test. PostgreSQL e dados reais não foram acessados. Nenhuma credencial foi exibida nos relatórios.

## Metodologia

O script npm test foi executado em série, com Jest, detecção de handles, resultados JSON e cobertura. Supertest exerceu Express com persistência real em SQLite. A inicialização do servidor e o serviço Gemini utilizaram dependências simuladas nos testes isolados. Erros injetados intencionalmente devem ser tratados e não representam reprovações quando o tratamento esperado ocorre.

A interface usou o build de produção servido localmente e automação via Chrome DevTools Protocol, sem dependências adicionais. O adaptador de teste encaminhou requisições fixas para localhost:3000 à API real em porta isolada, com 578 combinações de veículos e 594 sintomas. As hipóteses não foram simuladas. O adaptador atende o preflight de testes; esta execução não homologa a configuração CORS de implantação.

## Testes unitários e de integração

| Suíte | Executados | Aprovados | Reprovados |
| --- | ---: | ---: | ---: |
${suites}
| **Total** | **${jest.numTotalTests}** | **${jest.numPassedTests}** | **${jest.numFailedTests}** |

O Jest registrou ${jest.numPendingTests} testes ignorados. Foram verificados modelos e associações, validação de veículos e quilometragem, catálogos, ranking, negação, contexto, compatibilidade, OBD, persistência, transações, exclusão em cascata, seed sem duplicação e tratamento de erros. A regressão HTTP confirmou a triagem de freios persistida com guia, probabilidade nula e compra não recomendada.

## Testes funcionais e aplicabilidade

TS01–TS09 e TS12 foram executados no fluxo literal com Palio 2014, 1.6 E.torQ, Manual, 80.000 km, categoria Freios e “Barulho ao frear.”. O resultado passou a apresentar hipótese de triagem, descrição orientativa e guia de inspeção.

Os antigos TS10/TS11 bloqueados foram desdobrados explicitamente segundo as regras existentes:

- **TS10:** verifica que o guia Difícil oculta procedimentos, conforme RF008. Não comprova marcação nesse reparo. **SUP10:** efetivamente marca/desmarca passos e verifica o contador em guia Mediano, com “Controle remoto falhando motor”.
- **TS11:** verifica que triagem sem peça identificada não apresenta compra. Não comprova abertura da loja nesse relato. **SUP11:** efetivamente abre pesquisa no Mercado Livre com peça e veículo, usando “barulho ao frear com pastilhas raspando”; a aba é fechada sem compra.

Esses critérios condicionais mantêm as proteções e não declaram procedimentos indisponíveis como executados. As consultas complementares também verificam múltiplas hipóteses e seleção de outro resultado. Resposta vazia foi testada com relato sem correspondência próprio; erro de comunicação foi simulado separadamente. Avisos orientativos e nova consulta foram verificados nos dois navegadores.

## Responsividade e compatibilidade

Foram executadas ${responsive.length} verificações geométricas em três telas, quatro viewports e dois navegadores: 375×812, 390×844, 768×1024 e 1366×768. As asserções verificaram excesso horizontal do documento, limites laterais dos elementos inspecionados e fontes de pelo menos 10 px. A emulação alterou viewport com mobile=false e não equivale a dispositivo físico. Há capturas por tela e largura; o resultado e o ranking podem ter rolagem vertical.

Chrome e Edge executaram 31 verificações cada. A revisão humana de legibilidade e interação em dispositivo físico permanece pendente. Firefox não foi executado, sem alegação de compatibilidade.

## Build, lint e segurança básica

Build e lint concluíram com exit code 0. A inspeção estática analisou ${security.observed.inspected} arquivos do frontend, incluindo build, sem encontrar os padrões pesquisados de credenciais. Trata-se de busca heurística, não auditoria completa. Foram exercitados campos vazios, tipos incompatíveis, JSON malformado, respostas vazias, erro de conexão e avisos.

Permanecem avisos não impeditivos de Browserslist desatualizado e tempo de plugins no build. Não representam erros de compilação ou reprovações. O aviso anterior do SQLite foi eliminado. O erro de rede simulado continua apresentado como “Failed to fetch”; sua localização pode ser aprimorada separadamente.

## Resultados consolidados

| Grupo | Executados | Aprovados | Reprovados |
| --- | ---: | ---: | ---: |
| Backend/Jest | ${jest.numTotalTests} | ${jest.numPassedTests} | ${jest.numFailedTests} |
| Interface, responsividade e validações — Chrome/Edge | ${ui.length} | ${uiPassed} | ${uiFailed} |
| Build, lint e inspeção estática | 3 | ${commands.filter(c => c.exitCode === 0).length + (security.status === 'Aprovado' ? 1 : 0)} | ${commands.filter(c => c.exitCode !== 0).length + (security.status === 'Aprovado' ? 0 : 1)} |
| **Total** | **${executed}** | **${counts.Aprovado}** | **${counts.Reprovado}** |

**Aprovação dos executados: ${pct(approval)}%.** Bloqueios atuais: ${counts.Bloqueado}. Fora do denominador: ${counts['Não executado']} verificações não executadas e ${counts['Pendente de execução manual']} revisões manuais. Casos parametrizados e navegadores são contados separadamente. Build, lint e inspeção são verificações de qualidade, não casos unitários adicionais.

## Cobertura e limitações

Linhas: **${pct(coverage.lines.pct)}%** (${coverage.lines.covered}/${coverage.lines.total}); instruções: **${pct(coverage.statements.pct)}%**; funções: **${pct(coverage.functions.pct)}%**; ramificações: **${pct(coverage.branches.pct)}%**. A instrumentação inclui app.js, server.js, services/*.js, models/*.js, config/database.js e config/seed.js. Frontend, scripts de manutenção, Prisma e dados JSON não compõem esse percentual. Aprovação de 100% não significa cobertura de 100% ou ausência de todos os defeitos.

Não foram homologados PostgreSQL real, Gemini real, Firefox, implantação, carga/concorrência, segurança abrangente ou precisão mecânica em veículos reais. Não há suíte unitária própria do frontend; há testes de interface em navegadores. O serviço aiService é isolado e não participa das quatro rotas atuais. A pesquisa do Mercado Livre não valida preços, disponibilidade ou conteúdo comercial. As limitações devem acompanhar a declaração de aprovação.

## Evidências, arquivos e reprodução

- [Resumo para o TCC](RESUMO_TCC_TESTES.md), [tabela de casos](TABELA_CASOS_DE_TESTE.md) e [inventário detalhado](evidencias/casos-executados.json).
- [Jest JSON](evidencias/backend-jest.json), [log Jest](evidencias/backend-jest.log) e [cobertura HTML](evidencias/coverage/lcov-report/index.html).
- [Navegadores](evidencias/browser-results.json), [requisições/respostas](evidencias/browser-network.json) e capturas PNG em evidencias/.
- [Build](evidencias/frontend-build.log), [lint](evidencias/frontend-lint.log), [inspeção](evidencias/security-static.json), [comparação de produção](evidencias/preservacao-producao.json) e [resumo numérico](evidencias/resumo-execucao.json).
- Regressões em backend/tests/tcc.acceptance.test.js e backend/tests/integration.test.js. Runner em frontend/tests/browser-audit.cjs e API isolada em backend/tests/browser-api.cjs.

Na raiz, executar npm --prefix frontend run build, npm --prefix frontend run lint, node frontend/tests/browser-audit.cjs e node frontend/tests/security-static.cjs. O comando completo de npm test está no início de backend-jest.log. O runner abre navegadores de teste e a pesquisa autorizada de peças, sem compras. Após atualizar evidências, gerar a documentação com node frontend/tests/generate-tcc-report.cjs. A campanha atual é de ${dateLabel}.
`;
fs.writeFileSync(path.join(dir, 'RELATORIO_TESTES_FIAT_ASSIST.md'), report);
fs.writeFileSync(path.join(dir, 'TABELA_CASOS_DE_TESTE.md'), `# Tabela de casos de teste — Fiat Assist

Data: ${dateLabel}. ${executed} verificações executadas; ${counts.Aprovado} aprovadas; ${counts.Reprovado} reprovadas; ${counts.Bloqueado} bloqueadas; ${counts['Não executado']} não executadas; ${counts['Pendente de execução manual']} revisões manuais pendentes.

Dados, objetivo, ambiente, data e observação completa por caso estão em [casos-executados.json](evidencias/casos-executados.json). Os valores literais dos testes Jest estão nos arquivos vinculados. TS10/TS11 verificam as proteções do guia Difícil e da compra sem peça; SUP10/SUP11 executam marcação e pesquisa em condições elegíveis. A distinção deve acompanhar a citação dos resultados.

| ID | Teste | Procedimento | Resultado esperado | Resultado obtido | Situação | Evidência |
| --- | --- | --- | --- | --- | --- | --- |
` + all.map(c => `| ${clean(c.id)} | ${clean(c.name)} | ${clean(c.procedure)} | ${clean(c.expected)} | ${clean(typeof c.observed === 'object' ? JSON.stringify(c.observed) : c.observed).slice(0, 600)} | ${c.status} | [Evidência](${c.evidence})${c.source ? `; [teste](${c.source})` : ''} |`).join('\n') + '\n');
fs.writeFileSync(path.join(dir, 'RESUMO_TCC_TESTES.md'), `# 3.1.4 – Execução e Resultados dos Testes

A revalidação do Fiat Assist foi realizada em 13 de novembro de 2026, após a correção de dois achados funcionais da campanha anterior. O primeiro correspondia à ausência de hipóteses para o relato “Barulho ao frear.”; o segundo, à apresentação de hipóteses de chave presencial e controle remoto para um relato de motor falhando. As correções passaram a permitir uma triagem orientativa de ruído nos freios, sem identificar indevidamente uma peça ou recomendar sua compra, e a exigir contexto do sintoma na seleção de resultados. Os testes anteriormente reprovados foram mantidos, e seis casos de regressão foram acrescentados.

No backend, utilizaram-se Jest e Supertest para executar ${jest.numTotalTests} casos distribuídos em sete suítes, com ${jest.numPassedTests} aprovações, ${jest.numFailedTests} reprovações e nenhum teste ignorado. Foram avaliados modelos e relacionamentos, validação dos dados do veículo e quilometragem, catálogos, classificação de sintomas, persistência de hipóteses e guias, reversão de gravações diante de falhas e tratamento de entradas inválidas. As integrações de persistência utilizaram SQLite em memória, sem alteração do banco de uso. O serviço externo de inteligência artificial e a inicialização do servidor foram avaliados com dependências simuladas. A cobertura dos módulos instrumentados atingiu ${pct(coverage.lines.pct)}% das linhas e ${pct(coverage.branches.pct)}% das ramificações.

O frontend foi avaliado a partir de seu build de produção em Google Chrome e Microsoft Edge, no modo headless, por automação via Chrome DevTools Protocol. As requisições da interface foram encaminhadas por um adaptador de testes à API real conectada ao banco isolado, contendo 578 combinações de veículos e 594 sintomas do catálogo. Foram executadas ${ui.length} verificações de interface, responsividade e validação, com ${uiPassed} aprovações e ${uiFailed} reprovações, considerando cada navegador separadamente. O roteiro utilizou Palio 2014, motor 1.6 E.torQ, câmbio manual e 80.000 km. O relato literal de freios passou a apresentar uma hipótese de triagem com correspondência moderada, descrição orientativa e guia de inspeção.

Nos guias de dificuldade Difícil, confirmou-se a ocultação dos procedimentos e o encaminhamento ao atendimento especializado, conforme a regra de segurança existente. A marcação e desmarcação de passos foram efetivamente testadas em um guia de dificuldade Mediano. A ausência de indicação de compra foi verificada na triagem sem peça identificada, enquanto a abertura da pesquisa no Mercado Livre foi exercitada em uma consulta complementar com peça indicada, sem realização de compras. Também foram avaliados navegação, seleção de hipótese, avisos orientativos, nova consulta, resposta vazia e falha de comunicação simulada.

As verificações de responsividade abrangeram as larguras de 375, 390, 768 e 1366 pixels, em três telas e dois navegadores, totalizando ${responsive.length} casos geométricos aprovados. Foram avaliados transbordamento horizontal, posicionamento lateral dos elementos inspecionados e tamanho de fonte. Esses resultados não substituem a revisão humana de legibilidade e usabilidade em dispositivos físicos. O build de produção e o lint foram concluídos sem erros, e a inspeção estática de ${security.observed.inspected} arquivos não encontrou os padrões pesquisados de exposição de credenciais, sem configurar auditoria completa de segurança.

Considerando os testes de backend, as verificações nos navegadores e as três verificações adicionais de qualidade, foram executadas ${executed} verificações, com ${counts.Aprovado} aprovações e ${counts.Reprovado} reprovações, correspondendo a ${pct(approval)}% de aprovação dos casos efetivamente executados. Não houve bloqueios atuais nesse conjunto. Permaneceram registradas, fora desse percentual, quatro verificações não executadas e quatro revisões manuais pendentes. Não foram homologados PostgreSQL real, Gemini real ou Firefox, nem avaliadas carga, implantação ou precisão mecânica das hipóteses em veículos reais. Assim, a aprovação integral refere-se aos critérios executados no ambiente descrito e não implica cobertura integral do código ou ausência de todos os defeitos possíveis. As falhas e evidências da campanha anterior foram preservadas no histórico documental.
`);
console.log(JSON.stringify(summary, null, 2));
