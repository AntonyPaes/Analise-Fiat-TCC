const { GoogleGenAI } = require('@google/genai');

/**
 * Serviço de Inteligência Artificial para a plataforma AnaliseFiat
 */
class AiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    } else {
      this.ai = null;
    }
  }

  /**
   * Gera um parecer analítico inteligente (resumo explicativo, urgência, orientações)
   * baseado no veículo, no relato do cliente e nos sintomas encontrados.
   */
  async gerarParecerDiagnostico(veiculo, relatoCliente, sintomasDiagnosticados) {
    // Tenta usar a API do Gemini se a chave estiver configurada
    if (this.apiKey) {
      try {
        if (!this.ai) {
          this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        }

        const prompt = `
          Você é um assistente virtual especialista em diagnóstico automotivo oficial dos veículos Fiat.
          
          Informações do Veículo:
          - Modelo: ${veiculo.modelo}
          - Ano: ${veiculo.ano}
          - Motorização: ${veiculo.motorizacao}
          - Quilometragem: ${veiculo.quilometragem} km
          - Câmbio: ${veiculo.tipo_cambio}

          Relato / Sintomas informado pelo cliente:
          "${relatoCliente || 'Sem descrição livre fornecida'}"

          Diagnóstico Técnico Encontrado no Sistema:
          ${JSON.stringify(sintomasDiagnosticados.map(s => ({
            sintoma: s.nome,
            descricao: s.descricao,
            causas: s.causes?.map(c => ({ causa: c.nome, probabilidade: c.probabilidade }))
          })), null, 2)}

          Por favor, analise esses dados e retorne ESTRITAMENTE um objeto JSON válido (sem marcação de bloco de código markdown extra e sem texto antes ou depois) com a seguinte estrutura:
          {
            "resumoExecutivo": "Explicação em português simples e amigável relacionando o relato do cliente com o diagnóstico encontrado.",
            "nivelUrgencia": "Alta" | "Média" | "Baixa",
            "dicaSeguranca": "Alerta de segurança sobre como o motorista deve agir até o reparo.",
            "recomendacaoTecnica": "Recomendação para o técnico/proprietário ao levar na concessionária Fiat."
          }
        `;

        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const rawText = response.text ? response.text.trim() : '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed;
        }
      } catch (error) {
        console.warn('[AiService] Erro ao consultar Gemini API, utilizando fallback inteligente:', error.message);
      }
    }

    // Fallback inteligente (executado quando offline, sem chave API ou em caso de falha da API)
    return this.gerarParecerFallback(veiculo, relatoCliente, sintomasDiagnosticados);
  }

  /**
   * Fallback inteligente baseado em regras heurísticas para manter a aplicação 100% funcional sem API Key.
   */
  gerarParecerFallback(veiculo, relatoCliente, sintomasDiagnosticados) {
    const primeiroSintoma = sintomasDiagnosticados[0];
    const primeiraCausa = primeiroSintoma?.causes?.[0];
    const relatoNormalizado = (relatoCliente || '').toLowerCase();

    let nivelUrgencia = 'Média';
    if (
      relatoNormalizado.includes('freio') ||
      relatoNormalizado.includes('fumaça') ||
      relatoNormalizado.includes('vazamento') ||
      relatoNormalizado.includes('superaquecimento') ||
      primeiraCausa?.probabilidade === 'Alta'
    ) {
      nivelUrgencia = 'Alta';
    } else if (relatoNormalizado.includes('luz') || relatoNormalizado.includes('ruído') || relatoNormalizado.includes('barulho')) {
      nivelUrgencia = 'Média';
    } else {
      nivelUrgencia = 'Baixa';
    }

    const nomeSintoma = primeiroSintoma ? primeiroSintoma.nome : 'Anomalia detectada';
    const nomeCausa = primeiraCausa ? primeiraCausa.nome : 'verificação geral do sistema';

    return {
      resumoExecutivo: `Com base no relato "${relatoCliente || 'registrado'}" para o seu ${veiculo.modelo} ${veiculo.ano}, a inteligência do sistema correlacionou o comportamento ao sintoma "${nomeSintoma}". A causa mais provável aponta para "${nomeCausa}".`,
      nivelUrgencia: nivelUrgencia,
      dicaSeguranca: nivelUrgencia === 'Alta'
        ? 'Atenção: Por envolver um componente de risco crítico, evite percorrer longas distâncias antes da inspeção preventiva.'
        : 'Recomenda-se realizar a inspeção visual dos componentes durante a próxima parada técnica.',
      recomendacaoTecnica: `Realizar o teste funcional e verificação visual detalhada da peça relacionada no veículo ${veiculo.modelo} (${veiculo.motorizacao}).`
    };
  }
}

module.exports = new AiService();
