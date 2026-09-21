import React, { useState } from 'react';
import {
  ArrowLeft, Clock, Wrench, RotateCcw, AlertTriangle, CheckCircle2,
  ChevronRight, ShoppingCart, ShieldAlert, Info, ExternalLink,
  HardHat, TriangleAlert, Star
} from 'lucide-react';

// Mapeamento de probabilidade textual para percentual numérico
const probabilidadeMap = {
  'Alta': { pct: 85, color: 'text-red-600', bar: 'bg-red-500', badge: 'bg-red-100 text-red-700 border-red-200' },
  'Média': { pct: 60, color: 'text-orange-500', bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  'Baixa': { pct: 35, color: 'text-yellow-600', bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
};

// Mapeamento de dificuldade para estilo
const dificuldadeMap = {
  'Fácil':   { badge: 'bg-green-100 text-green-700 border-green-200',   icon: '🟢' },
  'Mediano': { badge: 'bg-orange-100 text-orange-700 border-orange-200', icon: '🟡' },
  'Difícil': { badge: 'bg-red-100 text-red-700 border-red-200',         icon: '🔴' },
};

// Inferir nome de peça a partir do título do guia (simples, baseado no título)
const inferirPecas = (guia) => {
  if (!guia) return [];
  const titulo = guia.titulo?.toLowerCase() || '';
  const pecasMap = [
    { key: 'vela',        nome: 'Velas de Ignição',          cod: 'FIAT-55191916' },
    { key: 'cabo',        nome: 'Cabos de Vela',             cod: 'FIAT-55204777' },
    { key: 'pastilha',    nome: 'Pastilha de Freio',         cod: 'FIAT-77364797' },
    { key: 'disco',       nome: 'Disco de Freio',            cod: 'FIAT-46417550' },
    { key: 'fluido',      nome: 'Fluido de Freio DOT 4',     cod: 'FIAT-9.55550' },
    { key: 'filtro de ar',nome: 'Filtro de Ar',              cod: 'FIAT-46553266' },
    { key: 'filtro de combustível', nome: 'Filtro de Combustível', cod: 'FIAT-46543900' },
    { key: 'óleo',        nome: 'Óleo Lubrificante 5W30',    cod: 'FIAT-9.55535' },
    { key: 'termostátic', nome: 'Válvula Termostática',      cod: 'FIAT-55238053' },
    { key: 'correia',     nome: 'Correia Dentada',           cod: 'FIAT-55202017' },
    { key: 'amortecedor', nome: 'Amortecedor',               cod: 'FIAT-46472047' },
    { key: 'bateria',     nome: 'Bateria Moura 60Ah',        cod: 'FIAT-51804033' },
    { key: 'alternador',  nome: 'Alternador',                cod: 'FIAT-46841239' },
    { key: 'bomba',       nome: 'Bomba de Combustível',      cod: 'FIAT-46518173' },
    { key: 'mola',        nome: 'Mola de Suspensão',         cod: 'FIAT-46411862' },
  ];
  return pecasMap.filter(p => titulo.includes(p.key));
};

// Construir URL de busca otimizada na Loja Oficial FIAT no Mercado Livre
const buildMercadoLivreUrl = (pecaNome, vehicle) => {
  const baseUrl = 'https://lista.mercadolivre.com.br/loja/fiat/';
  const queryParts = [];
  if (pecaNome) queryParts.push(pecaNome);
  queryParts.push('fiat');
  if (vehicle?.modelo) queryParts.push(vehicle.modelo);
  if (vehicle?.ano) queryParts.push(vehicle.ano);
  if (vehicle?.motorizacao) queryParts.push(vehicle.motorizacao);

  const fullQuery = queryParts.join(' ').trim();
  return `${baseUrl}${encodeURIComponent(fullQuery)}`;
};

const DiagnosisResult = ({ vehicleData, diagnosisData, onBackToSymptom, onBackToStart }) => {
  const [selectedSymptomIndex, setSelectedSymptomIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});

  if (!diagnosisData || diagnosisData.length === 0) {
    return (
      <div className="flex-1 w-full bg-white flex flex-col justify-center items-center p-8 text-center">
        <AlertTriangle className="text-yellow-500 w-16 h-16 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum Diagnóstico Encontrado</h2>
        <p className="text-gray-500 max-w-md mb-6">
          Não foi possível cruzar as informações fornecidas com o nosso catálogo de falhas conhecidas.
        </p>
        <button
          onClick={onBackToSymptom}
          className="text-white bg-fiatRed hover:bg-red-700 px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Tentar Novamente</span>
        </button>
      </div>
    );
  }

  const currentSymptom = diagnosisData[selectedSymptomIndex];
  const currentCause = currentSymptom.causes?.[0];
  const currentGuide = currentCause?.repairGuides?.[0];

  const stepsList = currentGuide?.passos
    ? currentGuide.passos.split('\n').filter(step => step.trim() !== '')
    : [];

  const dificuldade = currentGuide?.dificuldade || 'Fácil';
  const isDificil = dificuldade === 'Difícil';
  const showGuideDetails = !isDificil; // RF008

  const probInfo = probabilidadeMap[currentCause?.probabilidade] || probabilidadeMap['Média'];
  const difInfo = dificuldadeMap[dificuldade] || dificuldadeMap['Fácil'];
  const pecas = inferirPecas(currentGuide);

  const handleToggleStep = (index) => {
    const key = `${selectedSymptomIndex}-${index}`;
    setCompletedSteps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getCompletedCount = () =>
    stepsList.filter((_, idx) => completedSteps[`${selectedSymptomIndex}-${idx}`]).length;

  const isGuideFinished = stepsList.length > 0 && getCompletedCount() === stepsList.length;

  return (
    <div className="flex-1 w-full bg-white flex flex-col overflow-y-auto">

      {/* ── Banner de Aviso Orientativo (RF010 / NF007) ─────────────── */}
      <div className="w-full bg-amber-50 border-b border-amber-200 flex items-start gap-3 px-4 py-3">
        <TriangleAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-amber-800 text-xs font-medium leading-relaxed">
          <span className="font-bold">AVISO ORIENTATIVO:</span> As informações apresentadas possuem caráter exclusivamente orientativo e{' '}
          <span className="font-bold">não substituem diagnóstico técnico</span> realizado por profissional especializado.
          Em caso de dúvida, procure uma concessionária FIAT autorizada.{' '}
          {/* NF009 */}
          <span className="font-bold">O usuário é responsável por qualquer intervenção realizada em seu veículo.</span>
        </p>
      </div>

      {/* ── Header Vermelho com Resumo do Veículo ───────────────────── */}
      <div className="w-full bg-fiatRed text-white flex flex-col md:flex-row md:items-center justify-between relative shadow-md"
           style={{ padding: 'clamp(0.75rem, 1.8vh, 1.25rem) clamp(1rem, 3vw, 2.5rem)', gap: '0.75rem' }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToSymptom}
            className="hover:bg-white/10 rounded-full transition-colors duration-200 p-2"
            title="Voltar"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="font-bold text-[clamp(1.1rem,1.8vw,1.4rem)] leading-tight">
              Análise e Orientação Técnica
            </h1>
            {vehicleData && (
              <p className="text-red-100 text-[clamp(0.75rem,1.1vw,0.9rem)] font-medium mt-0.5">
                {vehicleData.modelo} {vehicleData.ano} • {vehicleData.motorizacao} • {vehicleData.tipo_cambio} • {vehicleData.quilometragem.toLocaleString('pt-BR')} km
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onBackToStart}
          className="bg-white text-fiatRed hover:bg-gray-100 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all duration-200 flex items-center gap-2 self-start md:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Nova Consulta</span>
        </button>
      </div>

      {/* ── Grid Principal ───────────────────────────────────────────── */}
      <div className="flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6">

        {/* ── Coluna Esquerda: Ranking (RF003) ── */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-gray-800 font-bold text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-fiatRed" />
              Ranking de Problemas
            </h2>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {diagnosisData.length} de até 5
            </span>
          </div>

          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[320px] lg:max-h-none pr-1">
            {diagnosisData.map((symptom, index) => {
              const isSelected = selectedSymptomIndex === index;
              const guide = symptom.causes?.[0]?.repairGuides?.[0];
              const diff = guide?.dificuldade || 'Fácil';
              const cause = symptom.causes?.[0];
              const pInfo = probabilidadeMap[cause?.probabilidade] || probabilidadeMap['Média'];
              const dInfo = dificuldadeMap[diff] || dificuldadeMap['Fácil'];

              return (
                <button
                  key={symptom.id || index}
                  onClick={() => setSelectedSymptomIndex(index)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-2 ${
                    isSelected
                      ? 'border-2 border-fiatRed bg-red-50/30 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  {/* Ranking badge + nome */}
                  <div className="flex items-start gap-2">
                    <span className={`text-xs font-black rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected ? 'bg-fiatRed text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`font-bold text-sm leading-tight block ${isSelected ? 'text-fiatRed' : 'text-gray-800'}`}>
                        {symptom.nome}
                      </span>
                      {symptom.codigo_obd && (
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-mono px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          {symptom.codigo_obd}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Barra de probabilidade (RF004) */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Probabilidade</span>
                      <span className={`text-xs font-bold ${pInfo.color}`}>{pInfo.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${pInfo.bar}`}
                        style={{ width: `${pInfo.pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Badges inferiores */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${dInfo.badge}`}>
                      {dInfo.icon} {diff}
                    </span>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-fiatRed" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Coluna Direita: Guia de Reparo ── */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {currentSymptom && (
            <>
              {/* Cabeçalho da Causa */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-fiatRed tracking-widest uppercase block mb-1">
                      Causa Provável #{selectedSymptomIndex + 1}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 leading-snug">
                      {currentCause?.nome || 'Diagnóstico sob análise'}
                    </h3>
                  </div>
                  {/* Probabilidade e Dificuldade (RF004 + RF005) */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {currentCause && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${probInfo.badge}`}>
                        {probInfo.pct}% prob.
                      </span>
                    )}
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${difInfo.badge}`}>
                      {difInfo.icon} {dificuldade}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{currentCause?.descricao}</p>
              </div>

              {/* ── Card de Concessionária para Difícil (NF008) ── */}
              {isDificil && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <HardHat className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-800 text-sm">Reparo de Alta Complexidade</h4>
                      <p className="text-xs text-red-700 mt-1 leading-relaxed">
                        Este problema envolve componentes críticos do veículo e requer ferramental especializado.
                        <strong> Recomendamos fortemente que você procure uma concessionária FIAT autorizada.</strong>
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://www.fiat.com.br/concessionarias.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-fiatRed hover:bg-red-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Store className="w-4 h-4" />
                    Encontrar Concessionária FIAT
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* ── Guia de Reparo (RF006 / RF008 / RF011) ── */}
              {currentGuide ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-0 overflow-hidden">

                  {/* Título do guia */}
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-fiatRed flex-shrink-0" />
                      {currentGuide.titulo}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">{currentGuide.descricao}</p>
                  </div>

                  {/* Info auxiliar — tempo e ferramentas (RF008: só se não for Difícil) */}
                  {showGuideDetails && (
                    <div className="grid grid-cols-2 gap-4 px-5 py-3 bg-gray-50/70 border-b border-gray-100 text-sm">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Tempo Estimado</span>
                          <span className="font-bold text-gray-800 text-sm">{currentGuide.tempo_estimado || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Wrench className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Ferramentas</span>
                          <span className="font-medium text-gray-800 text-sm">{currentGuide.ferramentas || 'Nenhuma específica'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nota de segurança (RF011) */}
                  {showGuideDetails && stepsList.length > 0 && (
                    <div className="mx-5 mt-4 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <ShieldAlert className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 leading-relaxed">
                        <strong>Segurança:</strong> Realize os procedimentos com o motor frio e o veículo em superfície plana.
                        Use equipamentos de proteção (luvas e óculos) quando necessário.
                      </p>
                    </div>
                  )}

                  {/* Passo a Passo interativo (RF006 / RF008 / RF011) */}
                  {showGuideDetails && stepsList.length > 0 ? (
                    <div className="px-5 py-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-700 uppercase tracking-wide">Passo a Passo</span>
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                          {getCompletedCount()} de {stepsList.length} concluídos
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {stepsList.map((step, idx) => {
                          const isCompleted = !!completedSteps[`${selectedSymptomIndex}-${idx}`];
                          return (
                            <div
                              key={idx}
                              onClick={() => handleToggleStep(idx)}
                              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                                isCompleted
                                  ? 'bg-green-50/50 border-green-200 text-gray-400'
                                  : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={() => {}}
                                className="mt-0.5 h-4 w-4 text-fiatRed border-gray-300 rounded focus:ring-fiatRed/20 flex-shrink-0"
                              />
                              <span className={`text-sm leading-relaxed ${isCompleted ? 'line-through decoration-gray-300' : ''}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {/* Conclusão */}
                      {isGuideFinished && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-xl border border-green-200 animate-fadeIn">
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600" />
                          <div>
                            <p className="font-bold text-sm">Procedimento Concluído!</p>
                            <p className="text-xs text-green-600/90">Todos os passos foram finalizados com sucesso.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : !showGuideDetails ? null : (
                    <div className="px-5 py-6 text-center text-gray-400 text-sm">
                      Nenhum passo detalhado disponível para este guia.
                    </div>
                  )}

                  {/* ── Peças Necessárias (RF007 / RF009) ── */}
                  <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-fiatRed" />
                      <span className="font-bold text-sm text-gray-700 uppercase tracking-wide">Peças Necessárias</span>
                    </div>

                    {pecas.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {pecas.map((peca, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
                            <div>
                              <span className="text-sm font-semibold text-gray-800">{peca.nome}</span>
                              <span className="block text-[10px] font-mono text-gray-400">{peca.cod}</span>
                            </div>
                            <a
                              href={buildMercadoLivreUrl(peca.nome, vehicleData)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors duration-200 flex-shrink-0 shadow-sm"
                              title={`Buscar ${peca.nome} no Mercado Livre`}
                            >
                              <ShoppingCart className="w-3 h-3" />
                              Mercado Livre
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Consulte um especialista para identificar as peças necessárias.</p>
                    )}

                    {/* RF009 — Marketplace Mercado Livre */}
                    <a
                      href={buildMercadoLivreUrl(pecas[0]?.nome || 'peças', vehicleData)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-sm py-2.5 px-4 rounded-xl transition-all duration-200 mt-1 shadow-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buscar Peças no Mercado Livre (Loja FIAT)
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl border border-gray-200 text-center py-10 text-gray-400 text-sm">
                  Nenhum guia detalhado associado a esta causa.
                </div>
              )}

              {/* ── Disclaimer final (NF009) ── */}
              <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  As orientações acima são de caráter informativo. O FIAT Assist não se responsabiliza por danos decorrentes
                  da aplicação dessas informações. <strong>O proprietário do veículo é inteiramente responsável por qualquer
                  intervenção realizada.</strong>
                </p>
              </div>
            </>
          )}
        </div>

      </div>

      {/* ── Rodapé ── */}
      <div className="w-full bg-fiatDark text-white text-center font-bold tracking-tight uppercase border-t border-gray-800"
           style={{ padding: 'clamp(0.5rem, 1.2vh, 0.85rem)', fontSize: 'clamp(0.6rem, 0.9vw, 0.8rem)' }}>
        AVISO: ESTE SISTEMA NÃO REALIZA DIAGNÓSTICO, APENAS ORIENTAÇÃO TÉCNICA ESPECIALIZADA.
      </div>

    </div>
  );
};

export default DiagnosisResult;
