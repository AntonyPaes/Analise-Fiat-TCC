const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const evidence = path.join(root, 'documentacao/testes/evidencias');
fs.mkdirSync(evidence, { recursive: true });
const results = [];
const network = [];
const errors = [];
const executionDate = process.env.TEST_EXECUTION_DATE || '2026-11-13';
const auditApiUrl = new URL(process.env.BROWSER_AUDIT_API_URL || process.env.VITE_API_URL || 'https://fiat-api.test');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const result = await fn();
    if (result) return result;
    await pause(100);
  }
  throw new Error('Tempo de espera excedido');
}
class CDP {
  constructor(socket) {
    this.socket = socket;
    this.counter = 0;
    this.pending = new Map();
    this.handlers = new Map();
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const item = this.pending.get(message.id);
        if (!item) return;
        this.pending.delete(message.id);
        clearTimeout(item.timer);
        if (message.error) item.reject(new Error(message.error.message));
        else item.resolve(message.result);
      } else for (const handler of this.handlers.get(message.method) || []) {
        Promise.resolve(handler(message.params)).catch(error => errors.push({ event: message.method, error: error.message }));
      }
    });
  }
  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    return new CDP(socket);
  }
  on(event, fn) { this.handlers.set(event, [...(this.handlers.get(event) || []), fn]); }
  send(method, params = {}) {
    const id = ++this.counter;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  }
}
async function main() {
  let apiChild;
  let staticServer;
  try {
    apiChild = spawn(process.execPath, [path.join(root, 'backend/tests/browser-api.cjs')], {
      cwd: root, env: { ...process.env, NODE_ENV: 'test' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
    });
    let output = '';
    let api;
    apiChild.stdout.on('data', data => {
      output += data;
      for (const line of output.split(/\r?\n/)) {
        try { const item = JSON.parse(line); if (item.ready) api = item; } catch {                    }
      }
    });
    apiChild.stderr.on('data', data => fs.appendFileSync(path.join(evidence, 'browser-api.log'), data));
    await until(() => api, 30000);
    fs.writeFileSync(path.join(evidence, 'browser-api-seed.log'), output);
    const dist = path.join(root, 'frontend/dist');
    staticServer = http.createServer((req, res) => {
      const relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = path.resolve(dist, '.' + (relative === '/' ? '/index.html' : relative));
      if (!file.startsWith(dist + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
      const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
      res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    });
    await new Promise(resolve => staticServer.listen(0, '127.0.0.1', resolve));
    const appUrl = `http://127.0.0.1:${staticServer.address().port}/`;
    for (const [browserName, executable] of [
      ['Chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe'],
      ['Edge', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']
    ]) {
      if (!fs.existsSync(executable)) { results.push({ id: 'COMP-' + browserName, browser: browserName, status: 'Não executado', observed: 'Executável não localizado' }); continue; }
      const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fiat-tcc-' + browserName + '-'));
      const browserProcess = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
        '--disable-extensions', '--remote-debugging-port=0', '--remote-allow-origins=*', '--user-data-dir=' + profile, 'about:blank'],
      { windowsHide: true, stdio: 'ignore' });
      let browser;
      let page;
      let browserVersion;
      try {
        const portFile = path.join(profile, 'DevToolsActivePort');
        const port = await until(() => {
          try {
            const value = fs.readFileSync(portFile, 'utf8').split(/\r?\n/)[0];
            return /^\d+$/.test(value) ? value : undefined;
          } catch (error) {
            if (['ENOENT', 'EBUSY', 'EPERM'].includes(error.code)) return undefined;
            throw error;
          }
        }, 20000);
        const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
        browserVersion = version.Browser;
        browser = await CDP.connect(version.webSocketDebuggerUrl);
        const target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page');
        page = await CDP.connect(target.webSocketDebuggerUrl);
        let failureMode = false;
        page.on('Runtime.exceptionThrown', event => errors.push({ browser: browserName, error: event.exceptionDetails.exception?.description || event.exceptionDetails.text }));
        await page.send('Page.enable');
        await page.send('Runtime.enable');
        await page.send('Network.enable');
        await page.send('Fetch.enable', { patterns: [{ urlPattern: `${auditApiUrl.origin}/*`, requestStage: 'Request' }] });
        page.on('Fetch.requestPaused', async event => {
          const requestUrl = new URL(event.request.url);
          if (failureMode && event.request.method === 'POST') {
            await page.send('Fetch.failRequest', { requestId: event.requestId, errorReason: 'ConnectionRefused' });
            network.push({ browser: browserName, path: requestUrl.pathname, simulatedFailure: true });
            return;
          }
          const response = await fetch(`http://127.0.0.1:${api.port}${requestUrl.pathname}`, {
            method: event.request.method, headers: {
              'Content-Type': 'application/json', Origin: 'http://localhost:5173',
              ...(event.request.method === 'OPTIONS' ? {
                'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'
              } : {})
            },
            body: ['GET', 'HEAD'].includes(event.request.method) ? undefined : event.request.postData
          });
          const body = await response.text();
          network.push({ browser: browserName, method: event.request.method, path: requestUrl.pathname,
            requestBody: event.request.postData ? JSON.parse(event.request.postData) : null, status: response.status, response: body ? JSON.parse(body) : null });
          await page.send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: response.status,
            responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, { name: 'Access-Control-Allow-Origin', value: new URL(appUrl).origin },
              { name: 'Access-Control-Allow-Headers', value: 'Content-Type' }, { name: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' }],
            body: Buffer.from(body).toString('base64') });
        });
        const text = () => page.evaluate('document.body.innerText');
        const waitText = value => until(async () => (await text()).includes(value));
        async function screenshot(id) {
          const filename = `${browserName}-${id}.png`;
          const { data } = await page.send('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync(path.join(evidence, filename), Buffer.from(data, 'base64'));
          return 'evidencias/' + filename;
        }
        async function record(id, name, procedure, expected, action, data = {}) {
          const item = { id, name, procedure, expected, data, browser: browserName, version: browserVersion, date: executionDate, environment: 'Headless; frontend dist; API real; SQLite em memória' };
          try { item.observed = await action(); item.status = 'Aprovado'; }
          catch (error) { item.observed = error.message; item.status = 'Reprovado'; }
          item.evidence = await screenshot(id);
          results.push(item);
          console.log(`${browserName} ${id}: ${item.status}`);
          return item;
        }
        async function click(selector) {
          const point = await page.evaluate(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) throw Error('Elemento ausente: ' + ${JSON.stringify(selector)}); e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
          await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
          await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
          await pause(120);
        }
        const clickText = async value => {
          const selector = await page.evaluate(`(() => { const es=[...document.querySelectorAll('button,a')]; const i=es.findIndex(e=>e.innerText.includes(${JSON.stringify(value)})); if(i<0)throw Error('Botão ausente: '+${JSON.stringify(value)}); es[i].setAttribute('data-audit-click','target'); return '[data-audit-click="target"]'; })()`);
          await click(selector);
          await page.evaluate("document.querySelector('[data-audit-click]')?.removeAttribute('data-audit-click')");
        };
        async function setField(selector, value) {
          await page.evaluate(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e)throw Error('Campo ausente'); const proto=e.tagName==='SELECT'?HTMLSelectElement.prototype:e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)}); e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true})); })()`);
          await pause(100);
        }
        async function vehicleForm() {
          await until(() => page.evaluate("[...document.querySelectorAll('select[name=modelo] option')].some(o=>o.value==='Palio')"));
          for (const [field, value] of Object.entries({ modelo: 'Palio', ano: '2014', motorizacao: '1.6 E.torQ', tipo_cambio: 'Manual' })) {
            await until(() => page.evaluate(`[...document.querySelectorAll('select[name=${field}] option')].some(o=>o.value===${JSON.stringify(value)})`));
            await setField(`select[name=${field}]`, value);
          }
          await setField('input[name=quilometragem]', '80000');
        }
        async function viewport(width, height) {
          await page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
          await pause(200);
        }
        async function responsive(stage) {
          for (const [width, height] of [[375, 812], [390, 844], [768, 1024], [1366, 768]]) {
            await viewport(width, height);
            await page.evaluate("document.querySelector('.screen-root').scrollTop=0");
            await record(`RESP-${stage}-${width}`, `Responsividade ${stage} em ${width}px`, 'Renderizar e medir overflow, geometria e tamanho de fonte; salvar captura.',
              'Sem transbordamento horizontal, controles com dimensões válidas e texto de pelo menos 10px.', async () => {
                const metrics = await page.evaluate(`(() => { const es=[...document.querySelectorAll('button,input,select,textarea,a,h1,h2,h3,p,span')].filter(e=>e.getBoundingClientRect().width>0); const clipped=es.filter(e=>{const r=e.getBoundingClientRect();return r.left < -1 || r.right > innerWidth+1}).map(e=>({tag:e.tagName,text:e.innerText.slice(0,80)})); return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,clipped,minFont:Math.min(...es.map(e=>parseFloat(getComputedStyle(e).fontSize))),controls:document.querySelectorAll('button,input,select,textarea,a').length}; })()`);
                assert.ok(metrics.documentWidth <= width + 1, JSON.stringify(metrics));
                assert.equal(metrics.clipped.length, 0, JSON.stringify(metrics));
                assert.ok(metrics.minFont >= 10, JSON.stringify(metrics));
                return metrics;
              }, { width, height, humanReview: 'Legibilidade subjetiva e usabilidade por toque requerem revisão manual.' });
          }
          await viewport(1366, 768);
        }
        await viewport(1366, 768);
        await page.send('Page.navigate', { url: appUrl });
        await waitText('FIAT Assist');
        await record('TS01', 'Acesso ao sistema', 'Abrir build de produção e verificar campos de identificação.', 'Cinco campos de veículo e título FIAT Assist.', async () => {
          assert.equal(await page.evaluate("document.querySelectorAll('select,input').length"), 5);
          return 'Tela inicial apresentada com quatro seletores e campo de quilometragem.';
        });
        await record('TS03', 'Campos obrigatórios', 'Clicar Avançar com formulário vazio.', 'Permanecer na identificação sem enviar cadastro.', async () => {
          const before = network.filter(r => r.method === 'POST').length;
          await clickText('Avançar');
          assert.ok((await text()).includes('Especificações do Veículo'));
          assert.equal(network.filter(r => r.method === 'POST').length, before);
          assert.equal(await page.evaluate('document.querySelector("form").checkValidity()'), false);
          return 'Validação HTML impediu submissão; nenhuma requisição POST enviada.';
        });
        await record('TS02', 'Seleção do veículo', 'Selecionar modelo, ano, motor, câmbio e digitar quilometragem.', 'Valores preservados, com quilometragem formatada.', async () => {
          await vehicleForm();
          const data = await page.evaluate('Object.fromEntries(new FormData(document.querySelector("form")))');
          assert.deepEqual(data, { modelo: 'Palio', ano: '2014', motorizacao: '1.6 E.torQ', tipo_cambio: 'Manual', quilometragem: '80.000' });
          return data;
        }, { modelo: 'Palio', ano: 2014, motor: '1.6 E.torQ', cambio: 'Manual', km: 80000 });
        await responsive('veiculo');
        await record('TS04', 'Navegação entre etapas', 'Clicar Avançar após seleção válida.', 'Tela Relatar Problema e cadastro persistido.', async () => {
          await clickText('Avançar'); await waitText('Relatar Problema');
          const request = network.filter(r => r.path === '/api/vehicles' && r.method === 'POST').at(-1);
          assert.equal(request.status, 201); assert.equal(request.response.quilometragem, 80000);
          return { tela: 'Relatar Problema', status: request.status, vehicle: request.response };
        });
        await record('TS05', 'Categoria Freios', 'Selecionar categoria Freios.', 'Categoria com classe e borda de seleção.', async () => {
          await clickText('Freios');
          const selected = await page.evaluate("[...document.querySelectorAll('button')].find(e=>e.innerText==='Freios').className");
          assert.ok(selected.includes('border-fiatRed'));
          return selected;
        });
        await record('TS06', 'Descrição dos sintomas', 'Preencher descrição literal solicitada.', 'Texto preservado integralmente.', async () => {
          await setField('textarea', 'Barulho ao frear.');
          assert.equal(await page.evaluate('document.querySelector("textarea").value'), 'Barulho ao frear.');
          return 'Barulho ao frear.';
        });
        await responsive('relato');
        const ts07 = await record('TS07', 'Análise do problema', 'Clicar Analisar Problema com o relato literal.', 'Uma ou mais hipóteses encontradas na base.', async () => {
          await clickText('Analisar Problema');
          await until(async () => (await text()).includes('Nenhuma hipótese') || (await text()).includes('Ranking de Problemas'));
          const response = network.filter(r => r.path.endsWith('/diagnose')).at(-1);
          assert.ok(response.response.length > 0, 'API retornou HTTP ' + response.status + ' com []; interface exibiu Nenhuma hipótese confiável encontrada.');
          return response.response;
        }, { description: 'Barulho ao frear.', selectedCategory: 'Freios' });
        if (ts07.status !== 'Aprovado') for (const [id, name] of [['TS08','Ranking'],['TS09','Detalhamento'],['TS10','Passo a passo'],['TS11','Pesquisa de peças']]) {
          results.push({ id, name, browser: browserName, version: browserVersion, date: executionDate, status: 'Bloqueado',
            procedure: 'Continuar o fluxo literal de TS07.', expected: 'Hipótese disponível para interação.', observed: 'Sem hipóteses no relato literal; depende de TS07.', evidence: ts07.evidence });
        }
        if (ts07.status === 'Aprovado') {
          await record('TS08', 'Ranking do relato literal', 'Inspecionar o ranking após Barulho ao frear.', 'Hipótese de inspeção com correspondência moderada e dificuldade.', async () => {
            const body = await text();
            assert.ok(body.includes('Ranking de Problemas'));
            assert.ok(body.includes('Origem do ruído nos freios a verificar'));
            assert.ok(body.includes('Moderada'));
            assert.ok(body.includes('Difícil'));
            return 'Triagem de ruído apresentada com correspondência Moderada e guia Difícil.';
          });
          await record('TS09', 'Detalhamento do relato literal', 'Selecionar a hipótese de triagem no ranking.', 'Descrição orientativa, guia e ressalva sobre peça não identificada.', async () => {
            const selector = await page.evaluate("(() => {const e=[...document.querySelectorAll('button')].find(e=>/correspondência/i.test(e.innerText));if(!e)throw Error('Hipótese ausente');e.setAttribute('data-literal-hypothesis','first');return '[data-literal-hypothesis=first]';})()");
            await click(selector);
            const body = await text();
            assert.ok(body.includes('não identifica a peça defeituosa'));
            assert.ok(body.includes('Fluxo de Reparo:'));
            return 'Hipótese selecionada, descrição e guia de inspeção renderizados; causa não confirmada.';
          });
          await record('TS10', 'Proteção dos procedimentos de reparo difícil', 'Verificar se o guia Difícil permite marcar procedimentos.', 'Pela regra RF008, guia difícil oculta passos e direciona ao profissional.', async () => {
            assert.ok((await text()).includes('Reparo de Alta Complexidade'));
            assert.equal(await page.evaluate("document.querySelectorAll('input[type=checkbox]').length"), 0);
            return 'Procedimentos ocultos por regra de segurança. A marcação de passos disponíveis é exercitada separadamente em SUP10.';
          });
          await record('TS11', 'Compra condicionada à identificação de peça', 'Verificar link de compra na triagem sem peça identificada.', 'Nenhum botão de compra para triagem; consulta de peça é testada em SUP11.', async () => {
            const response = network.filter(r=>r.path.endsWith('/diagnose') && r.method==='POST').at(-1).response;
            assert.ok(response.every(r=>r.match.purchaseRecommended===false));
            assert.equal(await page.evaluate("[...document.querySelectorAll('a')].filter(e=>e.innerText.includes('Comprar no Mercado Livre')).length"), 0);
            return 'Sem recomendação de compra para causa não identificada. Abertura de pesquisa elegível é exercitada em SUP11.';
          });
        }
        await record('SEG01', 'Resposta vazia e recuperação', 'Verificar orientação da lista vazia e clicar Tentar Novamente.', 'Mensagem de ausência e retorno ao relato.', async () => {
          if ((await text()).includes('Ranking de Problemas')) {
            await click('button[title=Voltar]'); await waitText('Relatar Problema');
            await setField('textarea', 'xyz inexistente aleatorio');
            await clickText('Analisar Problema'); await waitText('Nenhuma hipótese');
          }
          assert.ok((await text()).includes('evidência suficiente'));
          await clickText('Tentar Novamente'); await waitText('Relatar Problema');
          return 'Lista vazia tratada e retorno funcional.';
        });
        await record('SEG02', 'Falha de comunicação', 'Simular conexão recusada somente para POST e solicitar análise.', 'Mensagem de erro visível e permanência no relato.', async () => {
          failureMode = true;
          try { await clickText('Analisar Problema'); await waitText('Não foi possível conectar ao backend do Fiat Assist'); }
          finally { failureMode = false; }
          assert.ok((await text()).includes('Relatar Problema'));
          return 'Mensagem de conexão em português visível; envio encerrado e formulário mantido.';
        });
        await record('SUP08', 'Ranking com relato complementar', 'Substituir descrição por relato com pastilhas e analisar.', 'Ranking com correspondência e dificuldade.', async () => {
          await setField('textarea', 'barulho ao frear com pastilhas raspando');
          await clickText('Analisar Problema'); await waitText('Ranking de Problemas');
          assert.ok((await text()).includes('Correspondência'));
          assert.ok((await text()).includes('Difícil'));
          return network.filter(r => r.path.endsWith('/diagnose')).at(-1).response.map(r => ({ nome: r.nome, causa: r.causes[0].nome }));
        }, { description: 'barulho ao frear com pastilhas raspando' });
        await record('SUP09', 'Detalhamento e proteção para reparo difícil', 'Selecionar a segunda hipótese de freio.', 'Descrição, aviso de complexidade e ocultação do passo a passo para reparo difícil.', async () => {
          const selector = await page.evaluate("(() => { const es=[...document.querySelectorAll('button')].filter(e=>/correspondência/i.test(e.innerText)); if(es.length<2)throw Error('Ranking sem segunda hipótese');es[1].setAttribute('data-hypothesis','second');return '[data-hypothesis=second]';})()");
          await click(selector);
          assert.ok((await text()).includes('Reparo de Alta Complexidade'));
          assert.equal(await page.evaluate("document.querySelectorAll('input[type=checkbox]').length"), 0);
          return 'Segunda hipótese selecionada; orientação à concessionária e guia difícil sem procedimentos interativos.';
        });
        await record('SUP11', 'Pesquisa externa de peça', 'Clicar Comprar no Mercado Livre; observar a URL da nova aba e fechá-la.', 'Nova aba de pesquisa com peça e veículo, sem efetuar compra.', async () => {
          const href = await page.evaluate("[...document.querySelectorAll('a')].find(e=>e.innerText.includes('Comprar no Mercado Livre'))?.href");
          assert.ok(href && new URL(href).hostname === 'lista.mercadolivre.com.br');
          assert.ok(decodeURIComponent(href).includes('Palio 2014 1.6 E.torQ'));
          await clickText('Comprar no Mercado Livre');
          const opened = await until(async () => (await browser.send('Target.getTargets')).targetInfos.find(t => t.url.startsWith('https://lista.mercadolivre.com.br/')));
          await browser.send('Target.closeTarget', { targetId: opened.targetId });
          return { href, openedUrl: opened.url, note: 'Abertura da pesquisa validada; conteúdo externo e resultados comerciais não avaliados.' };
        });
        await record('SEG03', 'Avisos orientativos', 'Inspecionar avisos na tela de resultado.', 'Avisos sobre orientação técnica, profissional especializado e responsabilidade.', async () => {
          const body = await text();
          for (const phrase of ['AVISO ORIENTATIVO', 'não substituem diagnóstico técnico', 'responsável', 'ESTE SISTEMA NÃO REALIZA DIAGNÓSTICO']) assert.ok(body.includes(phrase), phrase);
          return 'Avisos presentes e renderizados.';
        });
        await responsive('resultado');
        await record('SUP10', 'Marcação dos procedimentos disponíveis', 'Voltar ao relato; usar Controle remoto falhando motor; marcar e desmarcar primeiro passo.', 'Checkbox e contador alterados, sem concluir procedimentos reais.', async () => {
          await click('button[title=Voltar]'); await waitText('Relatar Problema');
          await setField('textarea', 'Controle remoto falhando motor');
          await clickText('Analisar Problema'); await waitText('Ranking de Problemas');
          await until(() => page.evaluate("document.querySelectorAll('input[type=checkbox]').length>0"));
          await click('input[type=checkbox]');
          assert.equal(await page.evaluate("document.querySelector('input[type=checkbox]').checked"), true);
          assert.ok((await text()).includes('1 de'));
          await click('input[type=checkbox]');
          assert.equal(await page.evaluate("document.querySelector('input[type=checkbox]').checked"), false);
          return 'Marcação e desmarcação refletidas no checkbox e no contador; dados reais do catálogo.';
        }, { description: 'Controle remoto falhando motor', note: 'Consulta complementar independente do fluxo literal de freios.' });
        await record('TS12', 'Nova consulta', 'Acionar Nova Consulta após a consulta complementar.', 'Tela inicial com identificação vazia.', async () => {
          await clickText('Nova Consulta'); await waitText('Especificações do Veículo');
          assert.equal(await page.evaluate("document.querySelector('select[name=modelo]').value"), '');
          assert.equal(await page.evaluate("document.querySelector('input[name=quilometragem]').value"), '');
          return 'Nova consulta iniciada com campos limpos.';
        });
      } catch (error) {
        results.push({ id: 'HARNESS-' + browserName, browser: browserName, version: browserVersion, status: 'Bloqueado', observed: error.stack, date: executionDate });
        console.error(browserName + ': ' + error.message);
      } finally {
        if (page) page.socket.close();
        if (browser) { await browser.send('Browser.close').catch(() => {}); browser.socket.close(); }
        browserProcess.kill();
      }
    }
  } finally {
    if (apiChild) apiChild.kill();
    if (staticServer) await new Promise(resolve => staticServer.close(resolve));
    fs.writeFileSync(path.join(evidence, 'browser-results.json'), JSON.stringify({ results, errors, note: 'Google Fonts e destinos comerciais não compõem asserções de disponibilidade.' }, null, 2));
    fs.writeFileSync(path.join(evidence, 'browser-network.json'), JSON.stringify(network, null, 2));
    if (results.some(item => ['Reprovado', 'Bloqueado'].includes(item.status)) || errors.length) process.exitCode = 1;
  }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
