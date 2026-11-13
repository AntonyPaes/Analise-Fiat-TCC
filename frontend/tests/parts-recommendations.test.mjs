import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { transformWithOxc } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const { rankDiagnosis } = require('../../backend/services/diagnosisService');
let DiagnosisResult;
before(async () => {
  const source = await readFile(new URL('../src/components/DiagnosisResult.jsx', import.meta.url), 'utf8');
  const transformed = await transformWithOxc(source, 'DiagnosisResult.jsx', { jsx: { runtime: 'automatic' } });
  const code = transformed.code.replace(/(['"])(react(?:\/jsx-runtime)?|lucide-react)\1/g,
    (_, quote, name) => `${quote}${pathToFileURL(require.resolve(name)).href}${quote}`);
  DiagnosisResult = (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).default;
});

const renderResult = (query, selectedCategory, vehicle, select = () => true) => {
  const results = rankDiagnosis({ query, selectedCategory, vehicle });
  const candidate = results.find(select);
  assert.ok(candidate, 'A regra deve produzir uma hipótese');
  const html = renderToStaticMarkup(createElement(DiagnosisResult, {
    vehicleData: { quilometragem: 80000, tipo_cambio: 'Manual', ...vehicle },
    diagnosisData: [{ nome: candidate.symptom.nome, causes: [{ nome: candidate.causeName, descricao: candidate.causeDescription, repairGuides: candidate.cause.repairGuides }], match: {
      category: candidate.category, confidence: candidate.confidence, purchaseRecommended: candidate.purchaseRecommended,
      purchaseParts: candidate.purchaseParts, lightingNotice: candidate.lightingNotice
    } }]
  }));
  const links = [...html.matchAll(/href="(https:\/\/lista\.mercadolivre\.com\.br[^\"]+)"/g)].map(match => decodeURIComponent(match[1]));
  return { html, links };
};

test('lâmpada e conjunto LED têm dois links distintos com modelo e ano', () => {
  const { html, links } = renderResult('farol baixo queimado', 'Elétrica', { modelo: 'Palio', ano: 2014, motorizacao: '1.6 E.torQ' });
  assert.equal(links.length, 2);
  assert.ok(links.some(url => url.includes('Lâmpada do farol')));
  assert.ok(links.some(url => url.includes('Farol LED completo')));
  assert.ok(links.every(url => url.includes('Palio 2014')));
  assert.match(html, /LED integrado sem lâmpada substituível/);
});
test('lanterna oferece lâmpada traseira e lanterna LED completa', () => {
  const { links } = renderResult('lanterna traseira apagada', 'Elétrica', { modelo: 'Uno', ano: 2014 });
  assert.equal(links.length, 2);
  assert.ok(links.some(url => url.includes('Lâmpada da lanterna traseira')));
  assert.ok(links.some(url => url.includes('Lanterna traseira LED completo')));
});
test('full-LED conhecido oferece somente farol completo', () => {
  const { links, html } = renderResult('farol baixo queimado', 'Elétrica', { modelo: 'Toro', ano: 2026, motorizacao: '2.2 Turbodiesel' });
  assert.equal(links.length, 1);
  assert.match(links[0], /Farol LED completo/);
  assert.match(html, /não compre lâmpada avulsa/);
});
test('diesel compra vela aquecedora e não vela de ignição', () => {
  const { links } = renderResult('dificuldade de partida a frio', 'Motor', { modelo: 'Toro', ano: 2026, motorizacao: '2.2 Turbodiesel' });
  assert.equal(links.length, 1);
  assert.match(links[0], /Vela aquecedora diesel/);
  assert.doesNotMatch(links[0], /igni[cç]/i);
});
test('coxim da suspensão mantém links específicos, sem virar amortecedor genérico', () => {
  const { links } = renderResult('suspensão dianteira batendo', 'Suspensão', { modelo: 'Argo', ano: 2022 }, candidate => candidate.causeName.startsWith('Coxim'));
  assert.equal(links.length, 2);
  assert.ok(links.some(url => url.includes('Coxim do amortecedor dianteiro')));
  assert.ok(links.some(url => url.includes('Rolamento do coxim')));
});

test('fluido abaixo do nível oferece link de compra para DOT4', () => {
  const { links } = renderResult('fluido de freio abaixo do nível', 'Freios', { modelo: 'Palio', ano: 2014 });
  assert.equal(links.length, 1);
  assert.match(links[0], /Fluido de freio DOT4/);
  assert.match(links[0], /Palio 2014/);
});
test('alavanca do freio de mão oferece link para o conjunto correto', () => {
  const { links } = renderResult('alavanca não trava e não faz barulho', 'Freios', { modelo: 'Uno', ano: 2014 });
  assert.equal(links.length, 1);
  assert.match(links[0], /Alavanca do freio de mão/);
});
test('interface exibe no máximo cinco causas mesmo recebendo sete de uma API antiga', () => {
  const diagnosisData = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1, nome: `Sintoma extra ${index}`, causes: [{ nome: `Causa extra ${index}`, repairGuides: [] }],
    match: { confidence: 'Moderada', purchaseRecommended: false }
  }));
  const html = renderToStaticMarkup(createElement(DiagnosisResult, {
    vehicleData: { modelo: 'Argo', ano: 2022, quilometragem: 50000 }, diagnosisData
  }));
  assert.match(html, /5 de até 5/);
  assert.match(html, /Causa extra 4/);
  assert.doesNotMatch(html, /Causa extra [56]|Sintoma extra [56]/);
});

test('palheta e motor do limpador têm links das peças corretas', () => {
  const vehicle = { modelo: 'Palio', ano: 2014 };
  assert.match(renderResult('palheta arranhando o vidro', 'Elétrica', vehicle).links[0], /Palheta do limpador de para-brisa/);
  assert.match(renderResult('motor do limpador não funciona', 'Elétrica', vehicle).links[0], /Motor do limpador de para-brisa/);
});
test('seta oferece lâmpada e alternativa de farol LED quando a tecnologia não é conhecida', () => {
  const { links, html } = renderResult('pisca de seta não funciona', 'Elétrica', { modelo: 'Argo', ano: 2026 });
  assert.equal(links.length, 2);
  assert.ok(links.some(url => url.includes('Lâmpada da seta')));
  assert.ok(links.some(url => url.includes('Farol LED completo')));
  assert.match(html, /LED integrado/);
});
test('seta em farol full-LED conhecido oferece somente conjunto completo', () => {
  const { links } = renderResult('pisca não funciona', 'Elétrica', { modelo: 'Toro', ano: 2026 });
  assert.equal(links.length, 1);
  assert.match(links[0], /Farol LED completo/);
});
for (const [query, category] of [
  ['motor vibrando parado', 'Motor'], ['trancos no câmbio', 'Transmissão'], ['suspensão dianteira batendo', 'Suspensão']
]) {
  test(`aviso mediano de ${category} mantém guia e compra`, () => {
    const { html, links } = renderResult(query, category, { modelo: 'Argo', ano: 2022 });
    assert.match(html, /Recomendamos procurar uma concessionária FIAT próxima/);
    assert.match(html, /elevador automotivo/);
    assert.match(html, /Passo a Passo|Passo a passo|passos|passo/);
    assert.ok(links.length > 0);
  });
}
test('aviso mediano não aparece em elétrica nem em reparo fácil', () => {
  assert.doesNotMatch(renderResult('motor do limpador não funciona', 'Elétrica', { modelo: 'Palio', ano: 2014 }).html,
    /Recomendamos procurar uma concessionária FIAT próxima/);
  assert.doesNotMatch(renderResult('palheta arranhando o vidro', 'Elétrica', { modelo: 'Palio', ano: 2014 }).html,
    /Recomendamos procurar uma concessionária FIAT próxima/);
});
