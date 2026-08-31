import React, { useState, useEffect } from 'react';
import { CarFront, AlertCircle, CheckCircle2 } from 'lucide-react';

const VehicleForm = ({ onNext }) => {
  const [formData, setFormData] = useState({
    modelo: '',
    ano: '',
    motorizacao: '',
    quilometragem: '',
    tipo_cambio: '',
  });
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  
  const [dbOptions, setDbOptions] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableEngines, setAvailableEngines] = useState([]);
  const [availableCambios, setAvailableCambios] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/vehicles/options');
        const data = await response.json();
        setDbOptions(data);
        const models = [...new Set(data.map(item => item.modelo))].sort();
        setAvailableModels(models);
      } catch (error) {
        console.error("Erro ao carregar opções do banco de dados", error);
      }
    };
    fetchOptions();
  }, []);

  const MAX_KM = 1200000;

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'quilometragem') {
      const numericOnly = value.replace(/\D/g, '');
      if (!numericOnly) {
        value = '';
      } else {
        const numValue = Math.min(parseInt(numericOnly, 10), MAX_KM);
        value = numValue.toLocaleString('pt-BR');
      }
    }
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'modelo') {
        newData.ano = '';
        newData.motorizacao = '';
        newData.tipo_cambio = '';
        const years = [...new Set(dbOptions.filter(item => item.modelo === value).map(item => item.ano))].sort((a, b) => b - a);
        setAvailableYears(years);
        setAvailableEngines([]);
        setAvailableCambios([]);
      } else if (name === 'ano') {
        newData.motorizacao = '';
        newData.tipo_cambio = '';
        const engines = [...new Set(dbOptions.filter(item => item.modelo === newData.modelo && String(item.ano) === String(value)).map(item => item.motorizacao))].sort();
        setAvailableEngines(engines);
        setAvailableCambios([]);
      } else if (name === 'motorizacao') {
        newData.tipo_cambio = '';
        const cambios = [...new Set(dbOptions.filter(item => item.modelo === newData.modelo && String(item.ano) === String(newData.ano) && item.motorizacao === value).map(item => item.tipo_cambio))].sort();
        setAvailableCambios(cambios);
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const cleanKm = parseInt(formData.quilometragem.replace(/\D/g, ''), 10);
      if (isNaN(cleanKm) || cleanKm < 0) {
        throw new Error('Por favor, insira uma quilometragem válida.');
      }
      if (cleanKm > MAX_KM) {
        throw new Error(`A quilometragem não pode exceder ${MAX_KM.toLocaleString('pt-BR')} km.`);
      }

      const response = await fetch('http://localhost:3000/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelo: formData.modelo,
          ano: parseInt(formData.ano),
          motorizacao: formData.motorizacao,
          quilometragem: cleanKm,
          tipo_cambio: formData.tipo_cambio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar os dados do veículo.');
      }

      if (onNext) {
        onNext(data);
      }

      setStatus({ type: 'success', message: 'Dados do veículo registrados com sucesso!' });
      setFormData({
        modelo: '', ano: '', motorizacao: '', quilometragem: '', tipo_cambio: ''
      });

    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "w-full bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-fiatRed/20 focus:border-fiatRed block transition-all duration-200 outline-none shadow-sm hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed text-[clamp(0.8rem,1.2vw,1rem)] p-[clamp(0.5rem,1vh,0.85rem)]";

  return (
    <div className="flex-1 w-full bg-white flex flex-col overflow-y-auto">
      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-between px-[4vw] py-[4vh]">

        {/* Header */}
        <div className="text-center" style={{ marginBottom: 'clamp(1rem, 3vh, 2.5rem)' }}>
          <h1 className="font-bold text-fiatDark flex items-center justify-center gap-3 mb-2"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 2.5rem)' }}>
            <div className="bg-black rounded-xl flex items-center justify-center shadow-md"
                 style={{ padding: 'clamp(0.35rem, 0.8vw, 0.6rem)' }}>
              <svg viewBox="0 0 200 200" style={{ width: 'clamp(2rem, 3.5vw, 3rem)', height: 'clamp(2rem, 3.5vw, 3rem)' }}>
                <polygon points="10,135 21,135 41,65 30,65" fill="#008C45" />
                <polygon points="27,135 38,135 58,65 47,65" fill="#FFFFFF" />
                <polygon points="44,135 55,135 75,65 64,65" fill="#FFFFFF" />
                <polygon points="61,135 72,135 92,65 81,65" fill="#E51B24" />
                <g fill="#FFFFFF">
                  <path d="M 106 65 H 125 V 76 H 113 V 94 H 123 V 104 H 113 V 135 H 106 Z" />
                  <path d="M 129 65 H 136 V 135 H 129 Z" />
                  <path d="M 140 135 L 149 65 H 156 L 165 135 H 157 L 155 117 H 149 L 147 135 Z M 150 107 H 154 L 152 82 Z" />
                  <path d="M 169 65 H 191 V 76 H 183 V 135 H 176 V 76 H 169 Z" />
                </g>
              </svg>
            </div>
            <span>FIAT Assist</span>
          </h1>
          <p className="text-gray-500" style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}>
            Insira as especificações técnicas do veículo para analisar possíveis falhas.
          </p>
        </div>

        {/* Alert */}
        {status.message && (
          <div className={`flex items-center gap-3 font-medium rounded-xl border ${
            status.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'
          }`} style={{ padding: 'clamp(0.6rem, 1.2vh, 1rem)', marginBottom: 'clamp(0.8rem, 2vh, 1.5rem)', fontSize: 'clamp(0.75rem, 1.1vw, 0.95rem)' }}>
            {status.type === 'error' ? <AlertCircle style={{ width: 'clamp(1rem, 1.5vw, 1.25rem)', height: 'clamp(1rem, 1.5vw, 1.25rem)' }} className="flex-shrink-0" /> : <CheckCircle2 style={{ width: 'clamp(1rem, 1.5vw, 1.25rem)', height: 'clamp(1rem, 1.5vw, 1.25rem)' }} className="flex-shrink-0" />}
            {status.message}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between" style={{ gap: 'clamp(1rem, 3vh, 2rem)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 2.5vh, 2rem)' }}>

            {/* Título Seção */}
            <div className="flex items-center gap-2 text-fiatRed font-semibold border-b border-gray-100"
                 style={{ paddingBottom: 'clamp(0.4rem, 0.8vh, 0.75rem)', fontSize: 'clamp(0.85rem, 1.3vw, 1.1rem)' }}>
              <CarFront style={{ width: 'clamp(1rem, 1.5vw, 1.3rem)', height: 'clamp(1rem, 1.5vw, 1.3rem)' }} />
              <h2>Especificações do Veículo</h2>
            </div>

            {/* Grid Modelo / Ano */}
            <div className="grid grid-cols-2" style={{ gap: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
              <div>
                <label className="block font-medium text-gray-700" style={{ fontSize: 'clamp(0.75rem, 1.1vw, 0.95rem)', marginBottom: 'clamp(0.3rem, 0.6vh, 0.5rem)' }}>Modelo</label>
                <select name="modelo" value={formData.modelo} onChange={handleChange} required className={selectClass}>
                  <option value="">Selecione...</option>
                  {availableModels.map(modelo => (<option key={modelo} value={modelo}>{modelo}</option>))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700" style={{ fontSize: 'clamp(0.75rem, 1.1vw, 0.95rem)', marginBottom: 'clamp(0.3rem, 0.6vh, 0.5rem)' }}>Ano</label>
                <select name="ano" value={formData.ano} onChange={handleChange} required className={selectClass} disabled={!formData.modelo}>
                  <option value="">Selecione...</option>
                  {availableYears.map(ano => (<option key={ano} value={ano}>{ano}</option>))}
                </select>
              </div>
            </div>

            {/* Grid Motorização / Câmbio */}
            <div className="grid grid-cols-2" style={{ gap: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
              <div>
                <label className="block font-medium text-gray-700" style={{ fontSize: 'clamp(0.75rem, 1.1vw, 0.95rem)', marginBottom: 'clamp(0.3rem, 0.6vh, 0.5rem)' }}>Motorização</label>
                <select name="motorizacao" value={formData.motorizacao} onChange={handleChange} required className={selectClass} disabled={!formData.ano}>
                  <option value="">Selecione...</option>
                  {availableEngines.map(motor => (<option key={motor} value={motor}>{motor}</option>))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700" style={{ fontSize: 'clamp(0.75rem, 1.1vw, 0.95rem)', marginBottom: 'clamp(0.3rem, 0.6vh, 0.5rem)' }}>Tipo de Câmbio</label>
                <select name="tipo_cambio" value={formData.tipo_cambio} onChange={handleChange} required className={selectClass} disabled={!formData.motorizacao}>
                  <option value="">Selecione...</option>
                  {availableCambios.map(cambio => (<option key={cambio} value={cambio}>{cambio}</option>))}
                </select>
              </div>
            </div>

            {/* Quilometragem */}
            <div>
              <label className="block font-medium text-gray-700" style={{ fontSize: 'clamp(0.75rem, 1.1vw, 0.95rem)', marginBottom: 'clamp(0.3rem, 0.6vh, 0.5rem)' }}>Quilometragem (km)</label>
              <input
                type="text"
                inputMode="numeric"
                name="quilometragem"
                value={formData.quilometragem}
                onChange={handleChange}
                required
                className={selectClass}
                placeholder="Ex: 150.000 (máx. 1.200.000)"
              />
            </div>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white bg-fiatRed hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-semibold rounded-xl text-center shadow-md hover:shadow-lg transition-all duration-300 flex justify-center items-center gap-2 group"
            style={{ padding: 'clamp(0.65rem, 1.5vh, 1rem)', fontSize: 'clamp(0.9rem, 1.3vw, 1.1rem)' }}
          >
            {loading ? (
              <span className="border-2 border-white border-t-transparent rounded-full animate-spin"
                    style={{ width: 'clamp(1rem, 1.5vw, 1.25rem)', height: 'clamp(1rem, 1.5vw, 1.25rem)' }} />
            ) : (
              <>
                Avançar
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;
