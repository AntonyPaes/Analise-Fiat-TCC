function getBrakeHypotheses({ query, selectedCategory, normalize }) {
  const text = normalize(query);
  const category = normalize(selectedCategory);
  const results = [];
  const add = (id, nome, cause) => results.push({
    symptom: { id: `brake-rule:${id}`, nome, descricao: nome, categoria: 'Freios', codigo_obd: null },
    cause, causeName: cause.nome, causeDescription: cause.descricao,
    confidence: 'Moderada', isComponentList: false, score: 0, priority: 95,
    category: 'Freios', categoryMismatch: Boolean(selectedCategory) && category !== 'freios',
    vehicleFit: 'unknown', evidence: [`Relato reconhecido: ${nome}`, `Hipótese a verificar: ${cause.nome}`],
    purchaseParts: cause.purchaseParts
  });

  const handbrake = /\bfreio (?:de )?(?:mao|estacionamento)\b/.test(text);
  const lever = /\balavanca\b/.test(text);
  const gearLever = /\b(cambio|marcha|marchas|trambulador)\b/.test(text) && !handbrake;
  const leverContext = !gearLever && (handbrake || (lever && (category === 'freios' || !category)));
  const leverFailure = /\b(?:falta de|sem) (?:pressao|resistencia|tensao|cliques?|estalos?|barulho)\b|\bnao (?:esta |ta )?(?:funciona|funcionando|trava|travando|segura|segurando|arma|engata|faz (?:mais |nenhum )?(?:barulho|cliques?|estalos?)|(?:tem|sinto) (?:pressao|resistencia)|fica (?:puxad[oa]|levantad[oa]|travada))\b|\b(?:alavanca|freio de mao) (?:esta |ta |muito )*(?:mole|solt[oa]|froux[oa]|sem forca)\b|\b(?:desce|abaixa|volta) sozinh[oa]\b|\bcatraca (?:quebrada|gasta|desgastada)\b/.test(text);
  if (leverContext && leverFailure) {
    add('handbrake-lever', 'Alavanca do freio de mão sem resistência ou sem travamento', {
      nome: 'Alavanca do freio de mão com falha na catraca ou no travamento',
      descricao: 'Falta de resistência, ausência dos cliques da catraca ou alavanca que não se mantém acionada podem indicar defeito no mecanismo. Priorize a inspeção da alavanca e recomenda-se a troca do conjunto se a falha for confirmada. Verifique também cabos, regulagem e freios traseiros para diferenciar as causas.',
      purchaseParts: ['Alavanca do freio de mão'],
      repairGuides: [{
        titulo: 'Inspeção e troca da alavanca do freio de mão',
        descricao: 'Aplicável ao acionamento mecânico por alavanca; confirmar o defeito antes da troca.',
        passos: '1. Imobilize o veículo em local plano com calços e encaminhe o reparo à oficina; não dependa do freio de estacionamento defeituoso.\n2. Confira o travamento da catraca, o botão de liberação, a fixação da alavanca, os cabos e a regulagem dos freios traseiros.\n3. Consulte campanhas de recall pelo chassi antes de comprar peças ou fazer reparo particular.\n4. Com defeito confirmado no mecanismo, substitua a alavanca do freio de mão pela peça específica da versão e siga os torques do fabricante.\n5. Ajuste o curso conforme o manual e valide acionamento, liberação e retenção em condição controlada.',
        dificuldade: 'Mediano', ferramentas: 'Calços, ferramentas de acabamento, soquetes e torquímetro'
      }]
    });
  }

  const brakeFluid = /\bfluido (?:de |do )?freio\b/.test(text)
    || (category === 'freios' && /\bfluido\b/.test(text));
  const lowLevel = /\b(?:abaixo|baixo|baixou|baixando|minimo|min|faltando)\b/.test(text)
    && !/\b(?:nao|nunca) (?:esta |ta |ficou )?(?:abaixo|baixo|baixou|baixando)\b/.test(text);
  if (brakeFluid && lowLevel) {
    add('low-brake-fluid', 'Fluido de freio abaixo do nível', {
      nome: 'Fluido de freio abaixo do nível',
      descricao: 'Verifique vazamentos e desgaste das pastilhas antes de corrigir o nível. Se houver necessidade de renovação, troque o fluido e faça a sangria conforme o manual. Use DOT4 somente quando essa for a especificação do veículo; não complete apenas para ocultar uma perda de fluido.',
      purchaseParts: ['Fluido de freio DOT4'],
      repairGuides: [{
        titulo: 'Inspeção do nível e troca do fluido de freio DOT4 quando especificado',
        descricao: 'Investigar a causa do nível baixo e confirmar a especificação do fluido no manual.',
        passos: '1. Confira o nível no reservatório e inspecione vazamentos e desgaste das pastilhas em oficina.\n2. Confirme a especificação no manual; utilize fluido de freio DOT4 novo e lacrado somente quando indicado para a versão.\n3. Corrija a causa da perda antes de abastecer; se houver vazamento ou perda de frenagem, interrompa o uso do veículo.\n4. Quando a troca for indicada, renove o fluido e faça a sangria seguindo o procedimento do fabricante, inclusive do ABS quando aplicável.\n5. Verifique estanqueidade, nível e funcionamento do pedal antes de liberar o veículo.',
        dificuldade: 'Mediano', ferramentas: 'Fluido especificado no manual, equipamento de sangria e ferramentas de inspeção'
      }]
    });
  }
  return results;
}

function adaptBrakeFluidCandidate(candidate, normalize) {
  const cause = normalize(candidate.causeName);
  const context = normalize(`${candidate.symptom.nome} ${candidate.category} ${candidate.causeName}`);
  const guides = normalize(JSON.stringify(candidate.cause.repairGuides || []));
  if (!/\bfluido\b/.test(cause) || !/\bfreio|\bfreios\b/.test(context)
    || !/\bdot ?4\b/.test(guides) || !/\b(?:troc\w*|substitu\w*|renov\w*|complet\w*)\b/.test(guides)) return candidate;
  return { ...candidate, purchaseRecommended: true, purchaseParts: ['Fluido de freio DOT4'] };
}

module.exports = { getBrakeHypotheses, adaptBrakeFluidCandidate };
