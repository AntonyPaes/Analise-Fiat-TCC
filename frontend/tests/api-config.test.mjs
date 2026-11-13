import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getApiBaseUrl, getApiUrl, apiFetch } from '../src/config/api.js';

test('desenvolvimento local pode usar localhost sem variável', () => {
  assert.equal(getApiBaseUrl({ DEV: true }), 'http://localhost:3000');
});
test('URL HTTPS configurada é usada em todos os endpoints', () => {
  const env = { PROD: true, DEV: false, VITE_API_URL: ' https://api-fiat.onrender.com/ ' };
  for (const path of ['/api/vehicles/options', '/api/vehicles', '/api/symptoms/catalog', '/api/vehicles/42/diagnose']) {
    assert.equal(getApiUrl(path, env), `https://api-fiat.onrender.com${path}`);
  }
});
test('configuração local explícita também é respeitada', () => {
  assert.equal(getApiBaseUrl({ DEV: true, VITE_API_URL: 'http://127.0.0.1:4000/' }), 'http://127.0.0.1:4000');
});
for (const env of [{}, { PROD: true }, { DEV: false, VITE_API_URL: '  ' }]) {
  test(`sem configuração não há fallback em produção: ${JSON.stringify(env)}`, () => {
    assert.throws(() => getApiUrl('/api/vehicles/options', env), /VITE_API_URL não está definida/);
  });
}
for (const value of ['localhost:3000', 'http://api.onrender.com', 'https://localhost:3000', 'https://127.0.0.1', 'https://[::1]', 'ftp://api.test', 'https://user:password@api.test', 'https://api.test?token=x', 'https://api.test#x']) {
  test(`produção recusa URL inválida ou local: ${value}`, () => {
    assert.throws(() => getApiBaseUrl({ DEV: false, VITE_API_URL: value }), /VITE_API_URL inválida/);
  });
}
test('sem variável em produção nenhuma requisição é enviada', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Não deve executar'); });
  await assert.rejects(apiFetch('/api/vehicles/options', undefined, { DEV: false }), /VITE_API_URL não está definida/);
  assert.equal(fetchMock.mock.callCount(), 0);
});
test('opções, JSON e resposta HTTP são preservados', async t => {
  const response = new Response(JSON.stringify({ id: 7 }), { status: 201 });
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => response);
  const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"modelo":"Palio"}' };
  assert.equal(await apiFetch('/api/vehicles', options, { VITE_API_URL: 'https://api.onrender.com' }), response);
  assert.deepEqual(fetchMock.mock.calls[0].arguments, ['https://api.onrender.com/api/vehicles', options]);
});
test('HTTP inválido continua disponível para o tratamento dos formulários', async t => {
  const response = new Response('{"error":"Dados inválidos"}', { status: 400 });
  t.mock.method(globalThis, 'fetch', async () => response);
  const result = await apiFetch('/api/vehicles', {}, { VITE_API_URL: 'https://api.onrender.com' });
  assert.equal(result.status, 400);
  assert.equal((await result.json()).error, 'Dados inválidos');
});
test('falha de rede recebe mensagem clara, sem repetir por localhost', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(apiFetch('/api/vehicles/options', {}, { VITE_API_URL: 'https://api.onrender.com' }), /Não foi possível conectar.*CORS/);
  assert.equal(fetchMock.mock.callCount(), 1);
});
