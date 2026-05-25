import React, { useState, useEffect } from 'react';
import { CarFront, AlertCircle, CheckCircle2 } from 'lucide-react';

const VehicleForm = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
      const response = await fetch('http://localhost:3000/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelo: formData.modelo,
          ano: parseInt(formData.ano),
          motorizacao: formData.motorizacao,
          quilometragem: parseInt(formData.quilometragem),
          tipo_cambio: formData.tipo_cambio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar os dados do veículo.');
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

  return (
    <div className="w-full max-w-lg mx-auto bg-white shadow-xl rounded-2xl p-6 sm:p-8 md:p-10 animate-fade-in border border-gray-100 transition-all duration-300 hover:shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-fiatDark mb-2 flex items-center justify-center gap-2">
          <div className="bg-fiatRed/10 p-3 rounded-full">
            <CarFront className="text-fiatRed w-8 h-8" />
          </div>
          FIAT Assist
        </h1>
        <p className="text-gray-500 text-sm">Insira as especificações técnicas do veículo para analisar possíveis falhas.</p>
      </div>

      {status.message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'
        }`}>
          {status.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Seção Veículo */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-fiatRed font-semibold border-b border-gray-100 pb-2">
            <CarFront className="w-5 h-5" />
            <h2>Especificações do Veículo</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Modelo</label>
              <select name="modelo" value={formData.modelo} onChange={handleChange} required className="input-field bg-white">
                <option value="">Selecione...</option>
                {availableModels.map(modelo => (
                  <option key={modelo} value={modelo}>{modelo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Ano</label>
              <select name="ano" value={formData.ano} onChange={handleChange} required className="input-field bg-white" disabled={!formData.modelo}>
                <option value="">Selecione...</option>
                {availableYears.map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Motorização</label>
              <select name="motorizacao" value={formData.motorizacao} onChange={handleChange} required className="input-field bg-white" disabled={!formData.ano}>
                <option value="">Selecione...</option>
                {availableEngines.map(motor => (
                  <option key={motor} value={motor}>{motor}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Tipo de Câmbio</label>
              <select name="tipo_cambio" value={formData.tipo_cambio} onChange={handleChange} required className="input-field bg-white" disabled={!formData.motorizacao}>
                <option value="">Selecione...</option>
                {availableCambios.map(cambio => (
                  <option key={cambio} value={cambio}>{cambio}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-text">Quilometragem (km)</label>
            <input type="number" name="quilometragem" value={formData.quilometragem} onChange={handleChange} required className="input-field" placeholder="Ex: 15000" />
          </div>
        </div>

        <div className="pt-6">
          <button type="submit" disabled={loading} className="btn-primary flex justify-center items-center gap-2 group">
            {loading ? (
               <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Avançar
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </>
            )}
          </button>
        </div>
        
      </form>
    </div>
  );
};

export default VehicleForm;
