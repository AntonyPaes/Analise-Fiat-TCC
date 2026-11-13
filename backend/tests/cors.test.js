const express = require('express');
const cors = require('cors');
const request = require('supertest');
const { createCorsOptions } = require('../config/cors');

const makeApp = (env) => {
  const app = express();
  app.use(cors(createCorsOptions(env)));
  app.use(express.json());
  app.get('/api/vehicles/options', (req, res) => res.json([{ modelo: 'Palio' }]));
  app.post('/api/vehicles', (req, res) => res.status(201).json(req.body));
  return app;
};
const production = { NODE_ENV: 'production', CORS_ORIGINS: 'https://fiat-assist.vercel.app' };

test('origem HTTPS exata da Vercel recebe cabeçalhos CORS', async () => {
  const response = await request(makeApp(production)).get('/api/vehicles/options').set('Origin', 'https://fiat-assist.vercel.app');
  expect(response.status).toBe(200);
  expect(response.headers['access-control-allow-origin']).toBe('https://fiat-assist.vercel.app');
  expect(response.headers.vary).toContain('Origin');
  expect(response.headers['access-control-allow-credentials']).toBeUndefined();
});
test('preflight autoriza POST com JSON', async () => {
  const response = await request(makeApp(production)).options('/api/vehicles')
    .set('Origin', 'https://fiat-assist.vercel.app').set('Access-Control-Request-Method', 'POST')
    .set('Access-Control-Request-Headers', 'content-type');
  expect(response.status).toBe(204);
  expect(response.headers['access-control-allow-origin']).toBe(production.CORS_ORIGINS);
  expect(response.headers['access-control-allow-methods']).toBe('GET,POST,OPTIONS');
  expect(response.headers['access-control-allow-headers']).toBe('Content-Type');
});
test('POST autorizado mantém o corpo e a resposta', async () => {
  const response = await request(makeApp(production)).post('/api/vehicles').set('Origin', production.CORS_ORIGINS).send({ modelo: 'Palio' });
  expect(response.status).toBe(201);
  expect(response.body).toEqual({ modelo: 'Palio' });
});
test.each(['https://outro-projeto.vercel.app', 'https://fiat-assist.vercel.app.evil.test', 'http://fiat-assist.vercel.app', 'http://localhost:5173', 'null'])('não concede leitura CORS para %s', async origin => {
  const response = await request(makeApp(production)).get('/api/vehicles/options').set('Origin', origin);
  expect(response.headers['access-control-allow-origin']).toBeUndefined();
});
test('requisições sem Origin continuam funcionando', async () => {
  const response = await request(makeApp(production)).get('/api/vehicles/options');
  expect(response.status).toBe(200);
  expect(response.headers['access-control-allow-origin']).toBeUndefined();
});
test('previews e domínio próprio são autorizados somente quando listados', async () => {
  const app = makeApp({ ...production, CORS_ORIGINS: `${production.CORS_ORIGINS},https://fiat-preview.vercel.app/,https://fiat.example.com` });
  for (const origin of ['https://fiat-preview.vercel.app', 'https://fiat.example.com']) {
    const response = await request(app).get('/api/vehicles/options').set('Origin', origin);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
  }
});
test('origens locais ficam disponíveis em desenvolvimento', async () => {
  const response = await request(makeApp({ NODE_ENV: 'development' })).get('/api/vehicles/options').set('Origin', 'http://localhost:5173');
  expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
});
test.each(['', '*', 'https://*.vercel.app', 'http://frontend.test', 'https://localhost', 'https://frontend.test/api', 'https://user:secret@frontend.test', 'https://frontend.test?q=x'])('configuração insegura ou ausente falha em produção: %s', value => {
  expect(() => createCorsOptions({ NODE_ENV: 'production', CORS_ORIGINS: value })).toThrow(/CORS_ORIGINS/);
});
