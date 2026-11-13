const isDiesel = (vehicle) => /diesel|multijet|jtd/i.test(vehicle?.motorizacao || '');
const normalizeText = (value = '') => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const hasSparkParts = (value = '') => {
  const text = normalizeText(value);
  return /bobina(?:s)?(?: de ignicao)?|cabos? de (?:vela|ignicao)|velas? de ignicao/.test(text)
    || (/\bvelas?\b/.test(text) && !/aquec|incandesc|pre.?aquec/.test(text));
};

function getMaintenanceHypotheses({ query, selectedCategory, vehicle, normalize, tokenize, getNegatedTerms }) {
  const text = normalize(query);
  const category = normalize(selectedCategory);
  const negated = getNegatedTerms(query);
  const terms = new Set(tokenize(query).filter(term => !negated.has(term)));
  const results = [];
  const add = (id, nome, categoria, causes) => {
    const symptom = { id: `maintenance-rule:${id}`, nome, categoria, descricao: nome, codigo_obd: null };
    causes.forEach((cause, index) => results.push({
      symptom, cause, causeName: cause.nome, causeDescription: cause.descricao,
      confidence: 'Moderada', isComponentList: false, score: 0, priority: 90 - index,
      category: categoria, categoryMismatch: Boolean(selectedCategory) && normalize(categoria) !== category,
      vehicleFit: 'unknown', evidence: [`Relato reconhecido: ${nome}`, `Hipótese a verificar: ${cause.nome}`],
      purchaseParts: cause.purchaseParts
    }));
  };
  const suspension = terms.has('suspensao') || category.includes('suspensao');
  const bouncing = ['balanco', 'oscilacao', 'quicando'].some(term => terms.has(term));
  const knocking = ['batida', 'pancada', 'ruido', 'estalo'].some(term => terms.has(term));
  const front = /\b(dianteira|dianteiro|frente)\b/.test(text);
  const suspensionCause = (nome, descricao, parts, inspection) => ({
    nome, descricao: `${descricao} A causa deve ser confirmada em inspeção antes da compra ou troca.`,
    purchaseParts: parts,
    repairGuides: [{
      titulo: `Inspeção e substituição: ${parts.join(' / ')}`,
      descricao: 'Localizar o defeito e substituir somente os componentes confirmados.',
      passos: `1. Em oficina, reproduza o ruído ou a oscilação em condição segura.\n2. ${inspection}\n3. Verifique também fixações, folgas e componentes próximos para confirmar a origem.\n4. Substitua a peça defeituosa conforme o procedimento e os torques do fabricante; na troca de amortecedores, avalie o par do mesmo eixo.\n5. Confira a geometria da suspensão quando aplicável e valide o reparo.`,
      dificuldade: 'Mediano', ferramentas: 'Elevador, ferramentas para inspeção de folgas e torquímetro; compressor de molas quando exigido pelo procedimento'
    }]
  });
  const shock = suspensionCause('Amortecedor desgastado ou estourado',
    'Balanço excessivo, oscilações persistentes e batidas de fim de curso são indicadores de perda de amortecimento. Pode haver vazamento ou desgaste interno mesmo sem vazamento visível.',
    [front ? 'Amortecedor dianteiro' : 'Amortecedor'],
    'Inspecione vazamentos, haste, fixações e capacidade de amortecimento; o balanço isolado não confirma o defeito.');
  if (suspension && (bouncing || (front && knocking))) {
    const causes = bouncing ? [shock] : [];
    if (front && knocking) {
      causes.push(
        suspensionCause('Batente e coifa do amortecedor danificados',
          'Batente ressecado ou rompido deixa de amortecer o fim de curso e pode causar batidas; a coifa rasgada expõe a haste à sujeira e favorece desgaste.',
          ['Kit de batente e coifa do amortecedor dianteiro'], 'Verifique integridade do batente, da coifa e sinais de batida de fim de curso.'),
        suspensionCause('Coxim ou rolamento do coxim do amortecedor desgastado',
          'Folgas no apoio superior ou travamento de seu rolamento podem produzir estalos e batidas, inclusive ao esterçar.',
          ['Coxim do amortecedor dianteiro', 'Rolamento do coxim do amortecedor'], 'Verifique folga no apoio superior e funcionamento do rolamento ao esterçar.'),
        ...(!bouncing ? [shock] : []),
        suspensionCause('Buchas da bandeja desgastadas ou rasgadas',
          'Buchas deterioradas permitem movimentação excessiva da bandeja e podem produzir batidas em pisos irregulares.',
          ['Bucha da bandeja dianteira'], 'Inspecione borrachas, descolamento e folgas das buchas com a suspensão na posição indicada pelo fabricante.'),
        suspensionCause('Pivô da suspensão com folga',
          'Desgaste da articulação do pivô pode causar batidas metálicas e comprometer a fixação e o controle da roda.',
          ['Pivô da suspensão dianteira'], 'Teste a folga do pivô e verifique sua coifa; folga acentuada exige reparo antes de continuar utilizando o veículo.'),
        suspensionCause('Buchas da barra estabilizadora ou bieletas com folga',
          'Folgas nas buchas de fixação ou nas articulações das bieletas podem causar toc-toc e batidas em piso irregular.',
          ['Bucha da barra estabilizadora', 'Bieleta dianteira'], 'Verifique as buchas da barra estabilizadora e as articulações das bieletas.'),
        suspensionCause('Folga nas fixações da caixa de direção ou nos terminais',
          'Ruído percebido na dianteira também pode vir de folga nas fixações da caixa, nas buchas quando existentes ou nos terminais de direção.',
          ['Bucha de fixação da caixa de direção', 'Terminal de direção'], 'Localize a folga nas fixações e terminais antes de indicar qualquer peça; confira se a versão permite substituir a bucha separadamente.')
      );
    }
    add('suspension', front && knocking ? 'Suspensão dianteira batendo' : 'Suspensão balançando ou oscilando excessivamente', 'Suspensão', causes);
  }

  const coldStart = /\b(frio|fria|aquecedora|aquecedoras|pre aquecimento|incandescencia)\b/.test(text);
  const startTrouble = /\b(?:nao (?:liga|pega)|demora (?:a |para )?(?:pegar|ligar)|dificuldade|falha|falhando|queimad[oa]s?|fumaca branca)\b/.test(text);
  if (isDiesel(vehicle) && coldStart && startTrouble) {
    add('diesel-glow', 'Dificuldade de partida a frio no motor diesel', 'Motor', [{
      nome: 'Velas aquecedoras (de pré-aquecimento) ou circuito de alimentação com falha',
      descricao: 'Motores diesel usam velas aquecedoras, também chamadas de pré-aquecimento ou incandescência, para auxiliar a partida a frio. Elas não produzem a centelha de uma vela de ignição. Teste as velas e o módulo ou relé de alimentação antes de substituir peças.',
      purchaseParts: ['Vela aquecedora diesel'],
      repairGuides: [{
        titulo: 'Teste e substituição das velas aquecedoras diesel', descricao: 'Testar o pré-aquecimento e substituir apenas componentes defeituosos.',
        passos: '1. Leia falhas e verifique a bateria e o circuito de pré-aquecimento.\n2. Teste alimentação, módulo ou relé e velas conforme o manual, respeitando a tensão específica.\n3. Se o defeito da vela aquecedora for confirmado, providencie a substituição em oficina conforme o procedimento para evitar quebra na remoção.\n4. Valide a partida com o motor frio.',
        dificuldade: 'Mediano', ferramentas: 'Scanner, multímetro e ferramentas específicas para velas aquecedoras'
      }]
    }]);
  }

  const lighting = /\b(farol|farois|lanterna|lanternas|lampada|lampadas)\b|\bluz(?:es)? (?:de freio|traseira)/.test(text);
  const lightFailure = /\b(apagad[oa]s?|queim\w*|piscando|falhando|fraco|fraca)\b|\bnao (?:acende|funciona|liga|ilumina)\b/.test(text)
    && !/\b(?:nao|sem) (?:esta |tem )?(?:queim\w*|apagad\w*|falhando|piscando)\b/.test(text);
  if (lighting && lightFailure) {
    const rear = /\blanterna|\btraseir|\bluz(?:es)? de freio/.test(text);
    const housing = rear ? 'Lanterna traseira' : 'Farol';
    const article = rear ? 'da' : 'do';
    add('lighting', `${housing} ${rear ? 'apagada' : 'apagado'} ou com falha de iluminação`, 'Elétrica', [{
      nome: `Falha na fonte de luz ${article} ${housing.toLowerCase()}`,
      descricao: 'Verifique alimentação, fusíveis, aterramento e conectores antes de condenar a fonte de luz. A peça a substituir depende de o conjunto usar lâmpada removível ou LED integrado.',
      repairGuides: [{ titulo: `Inspeção e substituição da fonte de luz ${article} ${housing.toLowerCase()}`,
        descricao: 'Confirmar a tecnologia e a peça defeituosa antes da substituição.',
        passos: '1. Identifique a função, o lado e a tecnologia da iluminação no veículo e no manual.\n2. Teste fusíveis, alimentação, aterramento e conectores em oficina.\n3. Se usar lâmpada removível, substitua somente a lâmpada defeituosa pela especificada.\n4. Se usar LED integrado sem lâmpada substituível e o defeito for confirmado no conjunto, substitua o farol ou a lanterna completos.\n5. Valide todas as funções e regule o facho após intervenção no farol.',
        dificuldade: 'Mediano', ferramentas: 'Multímetro e ferramentas indicadas pelo fabricante'
      }]
    }]);
  }
  return results;
}

function adaptDieselCandidate(candidate, vehicle) {
  if (!isDiesel(vehicle)) return candidate;
  if (hasSparkParts(candidate.causeName) || hasSparkParts(candidate.symptom.nome)) return null;
  const cause = { ...candidate.cause };
  let causeDescription = candidate.causeDescription || '';
  if (hasSparkParts(causeDescription)) causeDescription = 'Hipótese a verificar no motor diesel. Confirme o defeito com testes compatíveis com a motorização antes de substituir componentes.';
  cause.repairGuides = (cause.repairGuides || []).map(guide => hasSparkParts(JSON.stringify(guide)) ? {
    ...guide, titulo: `Inspeção de ${candidate.causeName}`, descricao: causeDescription,
    passos: '1. Leia falhas e parâmetros do motor diesel com scanner.\n2. Teste o componente indicado seguindo o manual da motorização.\n3. Repare ou substitua somente a peça com defeito confirmado e valide o funcionamento.',
    ferramentas: 'Scanner e ferramentas específicas da motorização diesel'
  } : guide);
  return { ...candidate, cause, causeDescription };
}

function adaptLightingCandidate(candidate, query, vehicle, normalize) {
  const text = normalize([candidate.symptom.nome, candidate.causeName].join(' '));
  const queryText = normalize(query);
  if (!/\b(lampada|lampadas|farol|farois|lanterna|lanternas)\b/.test(text)) return candidate;
  const context = `${queryText} ${text}`;
  const signal = /\b(seta|setas|pisca|indicador de direcao)\b/.test(text);
  const lateral = signal && /\b(retrovisor|lateral)\b/.test(context);
  const rear = /\blanterna|\btraseir|\bluz(?:es)? de freio/.test(context);
  const front = /\bfarol|\bfarois/.test(context) || (signal && !rear && !lateral);
  if (!rear && !front && !lateral) return candidate;
  if (!/lampada|fonte de luz|led|farol.*(?:queim|defeito)|lanterna.*(?:queim|defeito)/.test(normalize(candidate.causeName))) return candidate;
  const housing = lateral ? 'Repetidor de seta' : rear ? 'Lanterna traseira' : 'Farol';
  const explicitLed = /\bled\b/.test(queryText) && !/\b(?:nao|sem) (?:e |usa |tem )?led\b/.test(queryText);
  const knownLed = front && !rear && normalize(vehicle?.modelo || '') === 'toro' && Number(vehicle?.ano) >= 2026;
  const integratedLed = explicitLed || knownLed;
  const notice = integratedLed
    ? `Este relato indica ${housing.toLowerCase()} de LED integrado. Se o defeito estiver no LED não substituível, compre o conjunto completo; não compre lâmpada avulsa. Confirme alimentação e módulos reparáveis antes de condenar o conjunto.`
    : `Confira a tecnologia instalada: se usar lâmpada removível, compre a lâmpada especificada. Se usar LED integrado sem lâmpada substituível, a troca é do ${housing.toLowerCase()} completo, após confirmar o defeito. Os links abaixo são alternativas conforme a versão.`;
  const purchaseParts = integratedLed ? [`${housing} LED completo`] : [signal ? 'Lâmpada da seta' : `Lâmpada ${rear ? 'da lanterna traseira' : 'do farol'}`, `${housing} LED completo`];
  const causeName = integratedLed ? `${housing} de LED integrado com falha a confirmar` : candidate.causeName;
  const causeDescription = `${integratedLed ? 'Verifique o circuito de alimentação e confirme a falha do conjunto antes da substituição.' : candidate.causeDescription || ''} ${notice}`;
  const cause = { ...candidate.cause, nome: causeName, descricao: causeDescription,
    repairGuides: (candidate.cause.repairGuides || []).map(guide => ({
      ...guide, titulo: integratedLed ? `Inspeção e troca do ${housing.toLowerCase()} de LED completo` : guide.titulo,
      descricao: notice,
      passos: `1. Identifique a tecnologia, a função e o lado afetado no manual do veículo.\n2. Verifique fusíveis, alimentação, aterramento e conectores; avalie módulos reparáveis antes de trocar o conjunto.\n3. ${integratedLed ? `Com defeito confirmado no LED integrado não substituível, troque o ${housing.toLowerCase()} completo conforme o manual.` : `Se usar lâmpada removível, substitua a lâmpada defeituosa pela especificada. Se usar LED integrado não substituível, troque o ${housing.toLowerCase()} completo com defeito confirmado.`}\n4. Valide as funções de iluminação e regule o facho do farol quando aplicável.`
    })) };
  return { ...candidate, cause, causeName, causeDescription, purchaseParts, purchaseRecommended: true, lightingNotice: notice };
}

module.exports = { getMaintenanceHypotheses, adaptDieselCandidate, adaptLightingCandidate, isDiesel };
