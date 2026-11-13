const { getMountHypotheses } = require('./mountDiagnosisRules');
const { getWiperSignalHypotheses } = require('./wiperSignalDiagnosisRules');
const { getBrakeHypotheses, adaptBrakeFluidCandidate } = require('./brakeDiagnosisRules');
const { getMaintenanceHypotheses, adaptDieselCandidate, adaptLightingCandidate } = require('./maintenanceDiagnosisRules');

const STOP_WORDS = new Set([
  'a', 'ao', 'aos', 'as', 'com', 'como', 'da', 'das', 'de', 'do', 'dos', 'e', 'em',
  'entre', 'essa', 'esse', 'esta', 'este', 'eu', 'foi', 'há', 'isso', 'meu', 'minha',
  'na', 'nas', 'no', 'nos', 'o', 'os', 'ou', 'para', 'pela', 'pelas', 'pelo', 'pelos',
  'por', 'que', 'se', 'sem', 'sob', 'um', 'uma', 'uns', 'umas', 'veiculo', 'carro',
  'fiat', 'problema', 'problemas', 'sintoma', 'sintomas', 'apresenta', 'apresentando',
  'quando', 'muito', 'pouco', 'me', 'meu', 'minha', 'está', 'esta', 'tem', 'tendo'
]);

const TOKEN_ALIASES = {
  barulho: 'ruido', ruidos: 'ruido', rangido: 'ruido', rangendo: 'ruido',
  vibrando: 'vibracao', vibra: 'vibracao', vibracoes: 'vibracao', trepidacao: 'vibracao',
  treme: 'vibracao', tremendo: 'vibracao', trepidando: 'vibracao', trepida: 'vibracao',
  tremer: 'vibracao', vibrar: 'vibracao', tremedeira: 'vibracao', sacudindo: 'vibracao', sacode: 'vibracao',
  chacoalhando: 'vibracao', chacoalha: 'vibracao', trepidacoes: 'vibracao',
  trancos: 'tranco',
  balancando: 'balanco', balanca: 'balanco', oscilando: 'oscilacao', oscila: 'oscilacao',
  batendo: 'batida', bate: 'batida', batidas: 'batida', estalos: 'estalo',
  falhando: 'falha', falhas: 'falha', engasgando: 'engasgo', engasga: 'engasgo',
  pega: 'partida', pegar: 'partida', partida: 'partida', partidas: 'partida'
};

const NEGATED_SYMPTOMS = new Set([
  'ruido', 'barulho', 'vibracao', 'fumaca', 'vazamento', 'superaquecimento',
  'chiado', 'rangido', 'trepidacao', 'falha', 'engasgo', 'luz', 'tranco', 'solavanco', 'impacto', 'bateria',
  'pastilha', 'disco', 'fluido', 'oleo', 'filtro', 'correia', 'alternador', 'amortecedor',
  'vazando', 'descarregada', 'gasta', 'gasto', 'queimado', 'acesa', 'travado',
  'balanco', 'oscilacao', 'quicando', 'batida', 'pancada', 'estalo', 'chute', 'coice'
]);

const normalize = (value = '') => value
  .toString()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const canonicalToken = (token) => {
  let value = TOKEN_ALIASES[token] || token;
  if (value.length > 5 && value.endsWith('oes')) value = `${value.slice(0, -3)}ao`;
  else if (value.length > 4 && value.endsWith('s')) value = value.slice(0, -1);
  return TOKEN_ALIASES[value] || value;
};

const tokenize = (value) => normalize(value)
  .split(' ')
  .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  .map(canonicalToken);

const getNegatedTerms = (value) => {
  const text = normalize(value);
  const terms = new Set();
  const pattern = /\b(?:nao|sem|nunca|jamais)\s+(?:(?:esta|estao|ta|faz|fazendo|tem|tendo|apresenta|ouve|escuta|sente|ocorre|ha|existe)\s+)?(?:muito\s+)?([a-z0-9]+)/g;
  for (const match of text.matchAll(pattern)) {
    const term = canonicalToken(match[1]);
    if (NEGATED_SYMPTOMS.has(term) || NEGATED_SYMPTOMS.has(match[1])) terms.add(term);
  }
  return terms;
};

const getCatalogTerms = (symptom) => {
  const titleTerms = new Set(tokenize(symptom.nome));
  const keywordTerms = new Set((symptom.keywords || []).flatMap(tokenize));
  return { titleTerms, keywordTerms, allTerms: new Set([...titleTerms, ...keywordTerms]) };
};

const makeIdf = (symptoms) => {
  const frequency = new Map();
  for (const symptom of symptoms) {
    for (const term of getCatalogTerms(symptom).allTerms) {
      frequency.set(term, (frequency.get(term) || 0) + 1);
    }
  }
  return (term) => Math.log(1 + (symptoms.length - (frequency.get(term) || 0) + 0.5) / ((frequency.get(term) || 0) + 0.5));
};

const scoreSymptom = (symptom, query, idf, category) => {
  const { titleTerms, keywordTerms } = getCatalogTerms(symptom);
  const negated = getNegatedTerms(query);
  const queryTerms = [...new Set(tokenize(query).filter((term) => !negated.has(term)))];
  const matchedTitle = queryTerms.filter((term) => titleTerms.has(term));
  const matchedKeywords = queryTerms.filter((term) => !titleTerms.has(term) && keywordTerms.has(term));
  const contextTerms = [...titleTerms].filter((term) => !['falha', 'ruido', 'vibracao'].includes(term));
  const hasTitleContext = contextTerms.length === 0 || contextTerms.some((term) => queryTerms.includes(term));
  const evidenceTerms = [...new Set([...matchedTitle, ...matchedKeywords])];
  const normalizedQuery = normalize(query);
  const normalizedTitle = normalize(symptom.nome);
  const exactTitle = normalizedTitle.length > 5 && normalizedQuery.includes(normalizedTitle)
    && ![...titleTerms].some((term) => negated.has(term));
  const score = evidenceTerms.reduce((total, term) => {
    return total + idf(term) * (titleTerms.has(term) ? 3 : 1.15);
  }, 0) + (exactTitle ? 8 : 0) + (normalize(symptom.categoria) === normalize(category) ? 0.35 : 0);

  return { score, evidenceTerms, matchedTitle, exactTitle, queryTerms, hasTitleContext };
};

const getCauseOptions = (cause) => {
  const name = (cause.nome || '').trim();
  if (!name) return [];

  if (/peca causadora apos diagnostico|componente especifico do sistema/i.test(normalize(name))) return [];

  const scrub = (value) => value
    .replace(/,?\s*(?:conforme|apos|ap[oó]s|quando|se)\s+(?:o\s+)?diagn[oó]stico.*$/i, '')
    .replace(/\s*\+\s*consum[ií]veis.*$/i, '')
    .replace(/\s+etc\.?\s*$/i, '')
    .trim();
  const parts = name.split(/[;,]+/).map(scrub).filter(Boolean);
  const alternatives = parts.flatMap((part) => part.split(/\s+ou\s+/i).map(scrub).filter(Boolean));
  const isComponentList = parts.length > 1 || /conforme diagnostico|quando aplicavel|pecas de campanha/i.test(normalize(name));
  return (alternatives.length > 1 ? alternatives : [name]).map((part) => ({ name: part, isComponentList }));
};

const getApplication = (cause) => {
  const description = cause.descricao || '';
  const match = description.match(/aplica(?:ção|cao)\s*:\s*([^.;]+)/i);
  return match?.[1]?.trim() || '';
};

const checkVehicleFit = (symptom, cause, vehicle) => {
  if (!vehicle?.modelo) return 'unknown';
  const application = normalize(getApplication(cause));
  if (!application || /diversos modelos|varios modelos|confirmar modelo|modelos fiat/.test(application)) return 'unknown';
  const model = normalize(vehicle.modelo);
  const knownModels = [
    'argo', 'cronos', 'mobi', 'pulse', 'fastback', 'strada', 'toro', 'fiorino', 'ducato',
    'palio', 'uno', 'siena', 'grand siena', 'punto', 'bravo', 'linea', 'idea', 'doblo', 'freemont'
  ];
  const mentionedModels = knownModels.filter((name) => application.includes(name));
  if (mentionedModels.length > 0 && !mentionedModels.some((name) => name === model)) return 'mismatch';

  const applicationYears = [...application.matchAll(/\b(?:19|20)\d{2}\b/g)].map((match) => Number(match[0]));
  const yearRange = application.match(/\b((?:19|20)\d{2})\s+((?:19|20)\d{2})\b/);
  if (vehicle.ano && yearRange) {
    const year = Number(vehicle.ano);
    if (year < Number(yearRange[1]) || year > Number(yearRange[2])) return 'mismatch';
  } else if (applicationYears.length > 0 && vehicle.ano && !applicationYears.includes(Number(vehicle.ano))) {
    return 'mismatch';
  }

  const normalizedEngine = normalize(vehicle.motorizacao || '');
  const applicationEngine = application.match(/\b\d\s\d\s*(?:firefly|fire|turbo|torq|e torq)\b/);
  if (applicationEngine && normalizedEngine && !normalizedEngine.includes(applicationEngine[0])) return 'mismatch';

  if (mentionedModels.length > 0 || applicationYears.length > 0 || applicationEngine) return 'match';
  return 'unknown';
};

const matchCause = (causeName, query, idf) => {
  const normalizedQuery = normalize(query);
  const normalizedCause = normalize(causeName);
  const causeTerms = new Set(tokenize(causeName));
  const negated = getNegatedTerms(query);
  if ([...causeTerms].some((term) => negated.has(term))) return { score: 0, shared: [], exactPhrase: false, negated: true };
  const queryTerms = new Set(tokenize(query).filter((term) => !getNegatedTerms(query).has(term)));
  const shared = [...causeTerms].filter((term) => queryTerms.has(term));
  const exactPhrase = normalizedCause.length > 3 && normalizedQuery.includes(normalizedCause)
    && ![...causeTerms].some((term) => negated.has(term));
  const score = shared.reduce((total, term) => total + idf(term) * 1.5, 0) + (exactPhrase ? 5 : 0);
  return { score, shared, exactPhrase };
};

const shouldRecommendPartSearch = (causeName, guide, isComponentList = false) => {
  if (!guide) return false;
  const normalizeParts = (value) => normalize(value).replace(/\bcoxins\b/g, 'coxim');
  const partName = normalizeParts(causeName);
  const guideTitle = normalizeParts([guide.titulo, guide.descricao].filter(Boolean).join(' '));
  const procedure = normalizeParts(guide.passos || '');
  const action = /\b(substitu\w*|troca\w*|trocar|instala\w*|renova\w*|repor|precisa ser trocad\w*|deve ser trocad\w*)\b/;
  const parts = [
    'motor do limpador', 'motor de partida', 'cabo de vela', 'disco de freio', 'palheta',
    'buzina', 'fusivel', 'rele', 'bateria', 'alternador', 'solenoide', 'pastilha', 'vela',
    'filtro', 'oleo', 'correia', 'amortecedor', 'bomba', 'embreagem', 'sensor', 'bobina',
    'injetor', 'radiador', 'mangueira', 'junta', 'retentor', 'rolamento', 'compressor', 'valvula', 'coxim',
    'lampada', 'farol', 'lanterna', 'batente', 'coifa', 'bucha', 'pivo', 'bieleta', 'terminal de direcao',
    'fluido', 'alavanca do freio de mao'
  ];
  const part = parts.find((name) => partName.includes(name));
  if (!part) return false;
  const replacementContext = guideTitle.includes(part)
    || procedure.split(/[;.!?]+/).some((step) => action.test(step) && step.includes(part));
  const genericConfirmedReplacement = /\b(substitu\w*|troca\w*)\b.{0,35}\b(componente|peca) confirmad\w*/.test(procedure)
    || /\bsubstitu\w* ou limpar\b/.test(procedure);
  if (action.test(normalize([guide.titulo, guide.descricao, guide.passos].join(' ')))
    && (replacementContext || genericConfirmedReplacement)) return true;

  const repairText = normalize([guide.titulo, guide.descricao, guide.passos].filter(Boolean).join(' '));
  const namedPart = normalize(causeName);
  const replacementAction = /\b(substitu\w*|troca\w*|trocar|instala\w*|renova\w*|repor|precisa ser trocad\w*|deve ser trocad\w*)\b/.test(repairText);
  const knownPart = [
    'vela', 'cabo', 'pastilha', 'disco', 'fluido', 'filtro', 'oleo', 'termostatic',
    'correia', 'amortecedor', 'bateria', 'alternador', 'bomba', 'mola', 'embreagem',
    'sensor', 'bobina', 'injetor', 'radiador', 'mangueira', 'junta', 'retentor',
    'rolamento', 'pneu', 'embreagem', 'motor de partida', 'solenoide', 'compressor', 'valvula'
  ].some((part) => namedPart.includes(part));
  return replacementAction && knownPart;
};

const confidenceFor = (symptomMatch, causeMatch, isComponentList) => {
  if (!isComponentList && symptomMatch.exactTitle) return 'Forte';
  if (!isComponentList && symptomMatch.matchedTitle.length >= 2) return 'Forte';
  if (symptomMatch.exactTitle && (causeMatch.exactPhrase || causeMatch.shared.length > 0)) return 'Forte';
  if (symptomMatch.matchedTitle.length >= 2 && causeMatch.shared.length > 0) return 'Forte';
  if (symptomMatch.score >= 4 && causeMatch.shared.length > 0) return 'Moderada';
  return null;
};

function rankDiagnosis({ catalog = [], query = '', selectedCategory = '', vehicle, limit = 5 }) {
  const resultLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 5) : 5;
  if (tokenize(query).length === 0) return [];

  const normalizedQuery = normalize(query);
  const electricalCategory = normalize(selectedCategory).includes('eletrica');
  const noStartIntent = /\bnao (?:liga|pega|da partida)\b|\bnao consegue (?:ligar|dar partida)\b/.test(normalizedQuery);
  const electricalNoStart = electricalCategory && noStartIntent;
  const rankingQuery = electricalNoStart
    ? `${query} bateria partida alternador solenoide`
    : query;

  const idf = makeIdf(catalog);
  const ruleContext = { query, selectedCategory, vehicle, normalize, tokenize, getNegatedTerms };
  const candidates = [...getMountHypotheses(ruleContext), ...getMaintenanceHypotheses(ruleContext), ...getBrakeHypotheses(ruleContext), ...getWiperSignalHypotheses(ruleContext)]
    .map(candidate => ({
      ...candidate,
      purchaseRecommended: shouldRecommendPartSearch(candidate.causeName, candidate.cause.repairGuides[0])
        || (candidate.purchaseParts || []).some(part => shouldRecommendPartSearch(part, candidate.cause.repairGuides[0]))
    }));
  for (const symptom of catalog) {
    if (electricalNoStart && normalize(symptom.categoria) !== normalize(selectedCategory)) continue;
    const symptomMatch = scoreSymptom(symptom, rankingQuery, idf, selectedCategory);
    if (symptomMatch.score < 3 || symptomMatch.evidenceTerms.length === 0) continue;
    if (!symptomMatch.hasTitleContext && !electricalNoStart) continue;

    for (const catalogCause of symptom.causes || []) {
      const vehicleFit = checkVehicleFit(symptom, catalogCause, vehicle);
      if (vehicleFit === 'mismatch') continue;

      const symptomName = normalize(symptom.nome);
      const specificElectricalNoStart = electricalNoStart
        && /\b(bateria fraca|motor de partida com defeito|solenoide do motor de partida)\b/.test(symptomName);
      if (electricalNoStart && !specificElectricalNoStart) continue;
      const catalogOptions = getCauseOptions(catalogCause);
      const brakingNoiseTriage = normalize(symptom.categoria) === 'freios'
        && normalize(selectedCategory) === 'freios'
        && getCatalogTerms(symptom).titleTerms.has('ruido')
        && symptomMatch.queryTerms.includes('ruido')
        && symptomMatch.queryTerms.some((term) => ['frear', 'freio'].includes(term))
        && (catalogCause.repairGuides || []).length > 0
        && catalogOptions.some((option) => option.isComponentList)
        && catalogOptions.every((option) => matchCause(option.name, rankingQuery, idf).shared.length === 0);
      const causeOptions = specificElectricalNoStart
        ? [{ name: symptom.nome, isComponentList: false, inferredFromSymptom: true }]
        : brakingNoiseTriage
        ? [{ name: 'Origem do ruído nos freios a verificar', isComponentList: true, noiseTriage: true }]
        : catalogOptions;

      for (const option of causeOptions) {
        const causeMatch = matchCause(option.name, rankingQuery, idf);
        if (causeMatch.negated) continue;
        if (option.isComponentList && !option.noiseTriage && causeMatch.shared.length === 0 && !causeMatch.exactPhrase) continue;
        const confidence = electricalNoStart || option.noiseTriage
          ? 'Moderada'
          : confidenceFor(symptomMatch, causeMatch, option.isComponentList);
        if (!confidence) continue;

        const evidenceTerms = [...new Set([...symptomMatch.evidenceTerms, ...causeMatch.shared])];
        const evidence = electricalNoStart
          ? [`Relato reconhecido: o veÃ­culo nÃ£o dÃ¡ partida`, `Categoria selecionada: ${symptom.categoria}`, `HipÃ³tese a verificar: ${symptom.nome}`]
          : [`Sintoma relacionado: ${symptom.nome}`, ...evidenceTerms.map((term) => `Termo identificado: ${term}`)];
        const categoryMismatch = Boolean(selectedCategory) && normalize(symptom.categoria) !== normalize(selectedCategory);
        if (categoryMismatch) {
          evidence.push(`Categoria provável no catálogo: ${symptom.categoria}`);
        }
        if (vehicleFit === 'match') evidence.push(`Aplicação compatível com ${vehicle.modelo}`);

        candidates.push({
          symptom,
          cause: catalogCause,
          causeName: option.name,
          isComponentList: option.isComponentList,
          confidence,
          score: symptomMatch.score + causeMatch.score + (vehicleFit === 'match' ? 1 : 0),
          evidence,
          vehicleFit,
          categoryMismatch,
          category: symptom.categoria,
          purchaseRecommended: !option.noiseTriage && shouldRecommendPartSearch(option.name, (catalogCause.repairGuides || [])[0], option.isComponentList),
          causeDescription: option.noiseTriage
            ? 'O relato indica ruído durante a frenagem, mas não identifica a peça defeituosa. O guia do catálogo orienta a inspeção do sistema; um profissional deve confirmar a origem antes de qualquer substituição ou compra.'
            : option.inferredFromSymptom
            ? 'HipÃ³tese inicial para triagem elÃ©trica. Teste a bateria e o circuito de partida antes de substituir qualquer componente.'
            : option.isComponentList
            ? `O cat\u00e1logo lista este componente entre os itens a verificar para o sintoma \"${symptom.nome}\". A correspond\u00eancia n\u00e3o confirma defeito; a inspe\u00e7\u00e3o t\u00e9cnica deve confirmar a causa.`
            : catalogCause.descricao
        });
      }
    }
  }

  const unique = new Map();
  const compatibleCandidates = candidates
    .map(candidate => adaptDieselCandidate(candidate, vehicle))
    .filter(Boolean)
    .map(candidate => adaptLightingCandidate(candidate, query, vehicle, normalize))
    .map(candidate => adaptBrakeFluidCandidate(candidate, normalize));
  compatibleCandidates.sort((a, b) => (b.priority || 0) - (a.priority || 0) || b.score - a.score
    || normalize(a.causeName).localeCompare(normalize(b.causeName), 'pt-BR')
    || normalize(a.symptom.nome).localeCompare(normalize(b.symptom.nome), 'pt-BR'));
  for (const candidate of compatibleCandidates) {
    const key = `${normalize(candidate.symptom.nome)}|${normalize(candidate.causeName)}`;
    if (!unique.has(key)) unique.set(key, candidate);
    if (unique.size >= resultLimit) break;
  }
  return [...unique.values()];
}

module.exports = { rankDiagnosis, normalize, tokenize, getCauseOptions, checkVehicleFit, shouldRecommendPartSearch };
