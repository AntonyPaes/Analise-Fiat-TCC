jest.mock('@google/genai', () => ({ GoogleGenAI: jest.fn() }));
const { GoogleGenAI } = require('@google/genai');
const vehicle = { modelo: 'Argo', ano: 2022, motorizacao: '1.0', quilometragem: 1000, tipo_cambio: 'Manual' };
let service;
let originalKey;
beforeEach(() => {
  originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  jest.resetModules();
  service = require('../services/aiService');
});
afterEach(() => {
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  jest.restoreAllMocks();
});
describe('Serviço de parecer: testes isolados sem chamadas externas', () => {
  test.each([
    ['freio com falha', 'Alta'], ['fumaça', 'Alta'], ['vazamento', 'Alta'],
    ['superaquecimento', 'Alta'], ['luz acesa', 'Média'], ['ruído', 'Média'],
    ['barulho', 'Média'], ['relato genérico', 'Baixa'], [undefined, 'Baixa']
  ])('fallback para relato %s classifica urgência %s', async (report, level) => {
    const result = await service.gerarParecerDiagnostico(vehicle, report, []);
    expect(result.nivelUrgencia).toBe(level);
    for (const key of ['resumoExecutivo', 'dicaSeguranca', 'recomendacaoTecnica']) expect(typeof result[key]).toBe('string');
    expect(result.resumoExecutivo).toContain('Argo');
  });
  test('causa rotulada Alta eleva urgência e aparece no parecer', () => {
    const result = service.gerarParecerFallback(vehicle, '', [{ nome: 'Falha', causes: [{ nome: 'Bobina', probabilidade: 'Alta' }] }]);
    expect(result.nivelUrgencia).toBe('Alta');
    expect(result.resumoExecutivo).toContain('Bobina');
  });
  test('resposta JSON da API simulada é interpretada', async () => {
    service.apiKey = 'chave-ficticia';
    const expected = { resumoExecutivo: 'Teste', nivelUrgencia: 'Baixa', dicaSeguranca: 'Teste', recomendacaoTecnica: 'Teste' };
    const generateContent = jest.fn().mockResolvedValue({ text: `\n\`\`\`json\n${JSON.stringify(expected)}\n\`\`\`` });
    service.ai = { models: { generateContent } };
    expect(await service.gerarParecerDiagnostico(vehicle, 'relato', [{ nome: 'Falha', causes: [{ nome: 'Bobina' }] }])).toEqual(expected);
    expect(generateContent).toHaveBeenCalledWith(expect.objectContaining({ model: 'gemini-2.5-flash', contents: expect.stringContaining('Argo') }));
  });
  test.each(['erro', 'json inválido', 'vazio', 'sem objeto'])('API simulada com %s aciona fallback', async mode => {
    service.apiKey = 'chave-ficticia';
    service.ai = { models: { generateContent: mode === 'erro'
      ? jest.fn().mockRejectedValue(new Error('offline'))
      : jest.fn().mockResolvedValue({ text: mode === 'vazio' ? undefined : mode === 'json inválido' ? '{errado}' : 'sem JSON' }) } };
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect((await service.gerarParecerDiagnostico(vehicle, 'freio', [])).nivelUrgencia).toBe('Alta');
  });
});
