import React, { useState } from 'react';
import { ArrowLeft, Search, Gauge, Disc, MoveVertical, Zap, ChevronRight } from 'lucide-react';

const SymptomReportForm = ({ vehicleData, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Freios');
  const [description, setDescription] = useState('');

  const categories = [
    { id: 'Motor', label: 'Motor', icon: Gauge },
    { id: 'Freios', label: 'Freios', icon: Disc },
    { id: 'Suspensão', label: 'Suspensão', icon: MoveVertical },
    { id: 'Elétrica', label: 'Elétrica', icon: Zap },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submetendo sintomas:', { vehicleData, searchTerm, selectedCategory, description });
  };

  const inputClass = "w-full bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-fiatRed/20 focus:border-fiatRed block transition-all duration-200 outline-none shadow-sm hover:border-gray-400 text-[clamp(0.8rem,1.2vw,1rem)] p-[clamp(0.5rem,1vh,0.85rem)]";

  return (
    <div className="flex-1 w-full bg-white flex flex-col overflow-y-auto">

      {/* Header Vermelho — largura total */}
      <div className="w-full bg-fiatRed text-white flex items-center justify-between relative"
           style={{ padding: 'clamp(0.75rem, 1.8vh, 1.25rem) clamp(1rem, 3vw, 2.5rem)' }}>
        <button
          type="button"
          onClick={onBack}
          className="hover:bg-white/10 rounded-full transition-colors duration-200"
          style={{ padding: 'clamp(0.3rem, 0.5vw, 0.5rem)' }}
          title="Voltar"
        >
          <ArrowLeft style={{ width: 'clamp(1.25rem, 2vw, 1.75rem)', height: 'clamp(1.25rem, 2vw, 1.75rem)' }} className="text-white" />
        </button>
        <h1 className="font-bold tracking-wide text-center flex-1"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', paddingRight: 'clamp(1.5rem, 3vw, 2rem)' }}>
          Relatar Problema
        </h1>
      </div>

      {/* Conteúdo centralizado */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-between"
        style={{ padding: 'clamp(1.5rem, 4vh, 3rem) clamp(1.5rem, 4vw, 4rem)', gap: 'clamp(1rem, 3vh, 2.5rem)' }}
      >
        {/* Corpo dos campos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 2.5vh, 2rem)' }}>

          {/* Seção 1: Pesquisa */}
          <div>
            <label className="block font-semibold text-gray-800" style={{ fontSize: 'clamp(0.8rem, 1.2vw, 1rem)', marginBottom: 'clamp(0.35rem, 0.8vh, 0.6rem)' }}>
              Pesquise por sintomas
            </label>
            <div className="relative">
              <Search className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ width: 'clamp(1rem, 1.5vw, 1.25rem)', height: 'clamp(1rem, 1.5vw, 1.25rem)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ex: Barulho ao frear, luz da injeção..."
                className={inputClass}
                style={{ paddingLeft: 'clamp(2.5rem, 3.5vw, 3rem)' }}
              />
            </div>
          </div>

          {/* Seção 2: Categorias */}
          <div>
            <label className="block font-semibold text-gray-800" style={{ fontSize: 'clamp(0.8rem, 1.2vw, 1rem)', marginBottom: 'clamp(0.35rem, 0.8vh, 0.6rem)' }}>
              Ou selecione uma categoria
            </label>
            <div className="grid grid-cols-4" style={{ gap: 'clamp(0.5rem, 1.5vw, 1.25rem)' }}>
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-200 border ${
                      isSelected
                        ? 'border-2 border-fiatRed text-fiatRed bg-red-50/20 shadow-sm font-semibold'
                        : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                    style={{ padding: 'clamp(0.75rem, 2vh, 1.5rem) clamp(0.5rem, 1vw, 1rem)', gap: 'clamp(0.4rem, 0.8vh, 0.75rem)' }}
                  >
                    <Icon className={isSelected ? 'text-fiatRed' : 'text-gray-500'}
                          style={{ width: 'clamp(1.25rem, 2.5vw, 2rem)', height: 'clamp(1.25rem, 2.5vw, 2rem)' }} />
                    <span style={{ fontSize: 'clamp(0.75rem, 1.1vw, 1rem)' }}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seção 3: Descrição */}
          <div>
            <label className="block font-semibold text-gray-800" style={{ fontSize: 'clamp(0.8rem, 1.2vw, 1rem)', marginBottom: 'clamp(0.35rem, 0.8vh, 0.6rem)' }}>
              Descreva o problema com suas palavras
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Barulho ao frear, pedal fofo, luz de injeção acesa..."
              className={inputClass}
              style={{ resize: 'none', minHeight: 'clamp(5rem, 15vh, 10rem)' }}
            />
          </div>
        </div>

        {/* Botão */}
        <button
          type="submit"
          className="w-full text-white bg-fiatRed hover:bg-red-700 font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex justify-center items-center gap-2"
          style={{ padding: 'clamp(0.65rem, 1.5vh, 1rem)', fontSize: 'clamp(0.9rem, 1.3vw, 1.1rem)' }}
        >
          <span>Analisar Problema</span>
          <ChevronRight style={{ width: 'clamp(1rem, 1.5vw, 1.25rem)', height: 'clamp(1rem, 1.5vw, 1.25rem)' }} />
        </button>
      </form>

      {/* Rodapé */}
      <div className="w-full bg-fiatDark text-white text-center font-bold tracking-tight uppercase border-t border-gray-800"
           style={{ padding: 'clamp(0.5rem, 1.2vh, 0.85rem)', fontSize: 'clamp(0.6rem, 0.9vw, 0.8rem)' }}>
        AVISO: ESTE SISTEMA NÃO REALIZA DIAGNÓSTICO, APENAS ORIENTAÇÃO TÉCNICA ESPECIALIZADA.
      </div>
    </div>
  );
};

export default SymptomReportForm;
