const { rankDiagnosis } = require('../services/diagnosisService');
const catalog = require('../config/tcc_symptoms.json');
const diagnose = (query, vehicle = {}) => rankDiagnosis({ catalog, query, selectedCategory: 'Elétrica', vehicle });

describe('Palheta e motor do limpador', () => {
  test.each(['palheta arranhando o vidro', 'limpador riscando o para-brisa', 'palheta raspando no vidro',
    'palheta ressecada', 'palheta deixa faixas', 'palheta deixa listras', 'limpador chiando', 'palheta não limpa direito'])('%s recomenda palheta com compra', query => {
    const [result] = diagnose(query);
    expect(result.causeName).toBe('Palheta do limpador desgastada ou danificada');
    expect(result.purchaseRecommended).toBe(true);
    expect(result.purchaseParts).toEqual(['Palheta do limpador de para-brisa']);
    expect(result.cause.repairGuides[0].titulo).toContain('troca da palheta');
  });
  test.each(['motor do limpador não funciona', 'limpador não liga', 'limpador não se movimenta',
    'limpador parou de funcionar', 'limpador sem movimento', 'limpador travou', 'limpador parou do nada',
    'motor do limpador queimou'])('%s recomenda motor com teste antes da troca', query => {
    const [result] = diagnose(query);
    expect(result.causeName).toBe('Motor do limpador com falha a confirmar');
    expect(result.purchaseRecommended).toBe(true);
    expect(result.purchaseParts).toEqual(['Motor do limpador de para-brisa']);
    expect(result.cause.repairGuides[0].passos).toContain('alimentação');
  });
  test('peças traseiras são identificadas separadamente', () => {
    expect(diagnose('palheta traseira riscando o vidro')[0].purchaseParts).toEqual(['Palheta do limpador traseiro']);
    expect(diagnose('motor do limpador traseiro queimou')[0].purchaseParts).toEqual(['Motor do limpador traseiro']);
  });
  test.each(['palheta não está arranhando o vidro', 'limpador funciona normalmente', 'motor de partida não funciona', 'vidro elétrico não funciona'])('não inventa falha do limpador: %s', query => {
    expect(diagnose(query).filter(r => String(r.symptom.id).startsWith('visibility-rule:wiper'))).toEqual([]);
  });
});

describe('Seta e LED integrado', () => {
  test.each(['pisca não funciona', 'pisca de seta não funciona', 'seta não acende', 'seta queimada',
    'seta parou de piscar', 'seta piscando muito rápido', 'indicador de direção não funciona'])('%s oferece lâmpada e alternativa LED', query => {
    const [result] = diagnose(query, { modelo: 'Palio', ano: 2014 });
    expect(result.purchaseRecommended).toBe(true);
    expect(result.purchaseParts).toEqual(['Lâmpada da seta', 'Farol LED completo']);
    expect(result.lightingNotice).toContain('LED integrado');
  });
  test('farol full-LED conhecido indica conjunto completo para seta dianteira', () => {
    const [result] = diagnose('pisca não funciona', { modelo: 'Toro', ano: 2026 });
    expect(result.purchaseParts).toEqual(['Farol LED completo']);
    expect(result.causeName).not.toMatch(/lâmpada/i);
  });
  test.each([
    ['seta de LED dianteira não funciona', 'Farol LED completo'],
    ['seta traseira de LED não funciona', 'Lanterna traseira LED completo'],
    ['seta de LED do retrovisor não funciona', 'Repetidor de seta LED completo']
  ])('respeita a posição da seta: %s', (query, part) => {
    const [result] = diagnose(query);
    expect(result.purchaseParts).toEqual([part]);
    expect(result.cause.repairGuides[0].passos).not.toContain('substitua a lâmpada');
  });
  test('ano recente sozinho não determina tecnologia da seta', () => {
    const [result] = diagnose('seta não funciona', { modelo: 'Argo', ano: 2026 });
    expect(result.purchaseParts).toContain('Lâmpada da seta');
    expect(result.purchaseParts).toContain('Farol LED completo');
  });
  test.each(['seta funciona normalmente', 'seta não está queimada', 'seta sem defeito'])('respeita relato sem falha: %s', query => {
    expect(diagnose(query).filter(r => r.symptom.id === 'visibility-rule:turn-signal')).toEqual([]);
  });
});
