import React, { useState } from 'react';
import { ArrowLeft, Clock, Wrench, RotateCcw, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

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
  // Retrieve the first cause (our schema models 1:N but we usually have 1 primary cause for these structured guides)
  const currentCause = currentSymptom.causes?.[0];
  const currentGuide = currentCause?.repairGuides?.[0];

  // Parse steps (passos) from a newline-separated string into an array of strings
  const stepsList = currentGuide?.passos
    ? currentGuide.passos.split('\n').filter(step => step.trim() !== '')
    : [];

  const handleToggleStep = (index) => {
    const key = `${selectedSymptomIndex}-${index}`;
    setCompletedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getCompletedCount = () => {
    return stepsList.filter((_, idx) => completedSteps[`${selectedSymptomIndex}-${idx}`]).length;
  };

  const isGuideFinished = stepsList.length > 0 && getCompletedCount() === stepsList.length;

  return (
    <div className="flex-1 w-full bg-white flex flex-col overflow-y-auto">
      {/* Header Vermelho com Resumo do Veículo */}
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

      {/* Grid Principal */}
      <div className="flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-8">
        
        {/* Coluna Esquerda: Lista de Opções Encontradas (3/12 de largura) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h2 className="text-gray-800 font-bold text-lg border-b border-gray-100 pb-2">
            Problemas Identificados ({diagnosisData.length})
          </h2>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] lg:max-h-[500px]">
            {diagnosisData.map((symptom, index) => {
              const isSelected = selectedSymptomIndex === index;
              const guide = symptom.causes?.[0]?.repairGuides?.[0];
              const difficulty = guide?.dificuldade || 'Fácil';

              return (
                <button
                  key={symptom.id || index}
                  onClick={() => setSelectedSymptomIndex(index)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 ${
                    isSelected
                      ? 'border-2 border-fiatRed bg-red-50/10 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`font-bold text-sm ${isSelected ? 'text-fiatRed' : 'text-gray-800'}`}>
                      {symptom.nome}
                    </span>
                    {symptom.codigo_obd && (
                      <span className="bg-gray-100 text-gray-700 text-[10px] font-mono px-2 py-0.5 rounded">
                        {symptom.codigo_obd}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {symptom.descricao}
                  </p>

                  <div className="flex items-center justify-between mt-1 border-t border-gray-100/50 pt-2 text-[10px] text-gray-400">
                    <span className={`font-semibold px-2 py-0.5 rounded ${
                      difficulty === 'Fácil' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-orange-50 text-orange-600 border border-orange-200'
                    }`}>
                      Dificuldade: {difficulty}
                    </span>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-fiatRed" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna Direita: Guia de Reparo Detalhado (8/12 de largura) */}
        <div className="lg:col-span-8 flex flex-col gap-6 bg-gray-50/50 p-4 md:p-6 rounded-2xl border border-gray-200/60">
          {currentSymptom && (
            <>
              {/* Seção Causa Provável */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-fiatRed tracking-wide uppercase">Causa Provável</span>
                  {currentCause && (
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      currentCause.probabilidade === 'Alta'
                        ? 'bg-red-100 text-red-700'
                        : currentCause.probabilidade === 'Média'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      Probabilidade: {currentCause.probabilidade}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {currentCause?.nome || 'Diagnóstico sob análise'}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {currentCause?.descricao}
                </p>
              </div>

              {/* Seção Guia de Reparo */}
              {currentGuide ? (
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-5">
                  <div className="border-b border-gray-100 pb-3">
                    <h4 className="text-md font-bold text-gray-800 flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-fiatRed" />
                      {currentGuide.titulo}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {currentGuide.descricao}
                    </p>
                  </div>

                  {/* Informações Auxiliares (Tempo, Ferramentas) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4.5 h-4.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold block text-xs text-gray-400 uppercase">Tempo Estimado</span>
                        <span className="font-bold text-gray-800">{currentGuide.tempo_estimado || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Wrench className="w-4.5 h-4.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold block text-xs text-gray-400 uppercase">Ferramentas</span>
                        <span className="text-gray-800 font-medium">{currentGuide.ferramentas || 'Nenhuma ferramenta específica'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checklist Passo a Passo Interativo */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-gray-800 uppercase tracking-wide">Passo a Passo</span>
                      <span className="text-xs text-gray-500 font-bold bg-gray-100 px-2.5 py-0.5 rounded-full">
                        {getCompletedCount()} de {stepsList.length} concluídos
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {stepsList.map((step, idx) => {
                        const isCompleted = !!completedSteps[`${selectedSymptomIndex}-${idx}`];
                        return (
                          <div
                            key={idx}
                            onClick={() => handleToggleStep(idx)}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                              isCompleted
                                ? 'bg-green-50/30 border-green-200 text-gray-500'
                                : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => {}} // Handled by div onClick
                              className="mt-1 h-4 w-4 text-fiatRed border-gray-300 rounded focus:ring-fiatRed/20"
                            />
                            <span className={`text-sm leading-relaxed ${isCompleted ? 'line-through decoration-gray-300' : ''}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mensagem de Conclusão */}
                  {isGuideFinished && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 animate-fadeIn">
                      <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-600" />
                      <div>
                        <h5 className="font-bold text-sm">Manutenção Concluída!</h5>
                        <p className="text-xs text-green-600/90">Você concluiu todos os passos indicados para este reparo com sucesso.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl border border-gray-200 text-center py-12 text-gray-400">
                  Nenhum guia detalhado associado a esta causa.
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Rodapé */}
      <div className="w-full bg-fiatDark text-white text-center font-bold tracking-tight uppercase border-t border-gray-800"
           style={{ padding: 'clamp(0.5rem, 1.2vh, 0.85rem)', fontSize: 'clamp(0.6rem, 0.9vw, 0.8rem)' }}>
        AVISO: ESTE SISTEMA NÃO REALIZA DIAGNÓSTICO, APENAS ORIENTAÇÃO TÉCNICA ESPECIALIZADA.
      </div>
    </div>
  );
};

export default DiagnosisResult;
