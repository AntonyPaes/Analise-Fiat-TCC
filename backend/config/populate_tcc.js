/**
 * populate_tcc.js
 * Script dedicado para limpar e repopular o catálogo de sintomas
 * com os 594 problemas extraídos da Base TCC - Auxílio ao Diagnóstico Fiat.
 *
 * Uso: node config/populate_tcc.js
 */

require('dotenv').config();

const sequelize = require('./database');
const { SymptomCatalog, CauseCatalog, RepairGuideCatalog } = require('../models');
const tccData = require('./tcc_symptoms.json');

async function populateTccCatalog() {
  try {
    console.log('🔌 Conectando ao banco de dados...');
    await sequelize.authenticate();

    // Assegurar que as tabelas existem (sem dropar outras tabelas)
    await SymptomCatalog.sync();
    await CauseCatalog.sync();
    await RepairGuideCatalog.sync();

    // Contar registros existentes
    const existingCount = await SymptomCatalog.count();
    console.log(`ℹ️  Catálogo atual: ${existingCount} sintomas registrados.`);

    if (existingCount > 0) {
      console.log('🗑️  Limpando catálogo antigo...');
      // Deletar na ordem correta por foreign key
      await RepairGuideCatalog.destroy({ where: {} });
      await CauseCatalog.destroy({ where: {} });
      await SymptomCatalog.destroy({ where: {} });
      console.log('✅ Catálogo antigo removido com sucesso!');
    }

    console.log(`\n🌱 Inserindo ${tccData.length} registros da Base TCC no banco de dados...`);

    const catStats = {};
    let inserted = 0;

    for (const symptom of tccData) {
      const symptomRecord = await SymptomCatalog.create(
        {
          nome: symptom.nome,
          descricao: symptom.descricao,
          codigo_obd: symptom.codigo_obd || null,
          categoria: symptom.categoria,
          keywords: symptom.keywords,
          causes: symptom.causes.map(cause => ({
            nome: cause.nome,
            descricao: cause.descricao,
            probabilidade: cause.probabilidade,
            repairGuides: cause.repairGuides.map(guide => ({
              titulo: guide.titulo,
              descricao: guide.descricao,
              passos: guide.passos,
              tempo_estimado: guide.tempo_estimado,
              dificuldade: guide.dificuldade,
              ferramentas: guide.ferramentas,
            })),
          })),
        },
        {
          include: [
            {
              model: CauseCatalog,
              as: 'causes',
              include: [
                {
                  model: RepairGuideCatalog,
                  as: 'repairGuides',
                },
              ],
            },
          ],
        }
      );

      inserted++;
      catStats[symptom.categoria] = (catStats[symptom.categoria] || 0) + 1;

      if (inserted % 50 === 0) {
        console.log(`   Progresso: ${inserted}/${tccData.length} registros inseridos...`);
      }
    }

    console.log('\n✅ Inserção concluída! Resumo por categoria:');
    for (const [cat, count] of Object.entries(catStats)) {
      console.log(`   - ${cat}: ${count} sintomas`);
    }
    console.log(`\n🎉 Total: ${inserted} sintomas inseridos com sucesso no banco de dados!`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a população do banco de dados:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

populateTccCatalog();
