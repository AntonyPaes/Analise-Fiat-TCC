const VehicleCatalog = require('../models/VehicleCatalog');
const { SymptomCatalog, CauseCatalog, RepairGuideCatalog } = require('../models');
const symptomsCatalogData = require('./symptoms_catalog');

const fiatBaseModels = [
  {
    modelo: 'Palio',
    anos: [2008, 2017],
    motorizacoes: [
      { motor: '1.0 Fire', anos: [2008, 2017], cambios: [{ nome: 'Manual', anos: [2008, 2017] }] },
      { motor: '1.4 Fire', anos: [2008, 2017], cambios: [{ nome: 'Manual', anos: [2008, 2017] }] },
      { motor: '1.8 Powertrain', anos: [2008, 2010], cambios: [{ nome: 'Manual', anos: [2008, 2010] }] },
      { motor: '1.6 E.torQ', anos: [2011, 2017], cambios: [
          { nome: 'Manual', anos: [2011, 2017] },
          { nome: 'Automatizado (Dualogic)', anos: [2011, 2017] }
        ] 
      }
    ]
  },
  {
    modelo: 'Uno',
    anos: [2008, 2021],
    motorizacoes: [
      { motor: '1.0 Fire', anos: [2008, 2021], cambios: [{ nome: 'Manual', anos: [2008, 2021] }] },
      { motor: '1.4 Fire', anos: [2010, 2016], cambios: [{ nome: 'Manual', anos: [2010, 2016] }] },
      { motor: '1.0 Firefly', anos: [2017, 2021], cambios: [{ nome: 'Manual', anos: [2017, 2021] }] },
      { motor: '1.3 Firefly', anos: [2017, 2021], cambios: [
          { nome: 'Manual', anos: [2017, 2021] },
          { nome: 'Automatizado (Dualogic/GSR)', anos: [2017, 2019] }
        ] 
      }
    ]
  },
  {
    modelo: 'Siena',
    anos: [2008, 2016],
    motorizacoes: [
      { motor: '1.0 Fire', anos: [2008, 2016], cambios: [{ nome: 'Manual', anos: [2008, 2016] }] },
      { motor: '1.4 Fire', anos: [2008, 2016], cambios: [{ nome: 'Manual', anos: [2008, 2016] }] },
      { motor: '1.8 Powertrain', anos: [2008, 2010], cambios: [{ nome: 'Manual', anos: [2008, 2010] }] },
      { motor: '1.6 E.torQ', anos: [2011, 2012], cambios: [
          { nome: 'Manual', anos: [2011, 2012] },
          { nome: 'Automatizado (Dualogic)', anos: [2011, 2012] }
        ] 
      }
    ]
  },
  {
    modelo: 'Grand Siena',
    anos: [2012, 2021],
    motorizacoes: [
      { motor: '1.0 Fire', anos: [2016, 2021], cambios: [{ nome: 'Manual', anos: [2016, 2021] }] },
      { motor: '1.4 Fire', anos: [2012, 2021], cambios: [{ nome: 'Manual', anos: [2012, 2021] }] },
      { motor: '1.6 E.torQ', anos: [2012, 2018], cambios: [
          { nome: 'Manual', anos: [2012, 2018] },
          { nome: 'Automatizado (Dualogic)', anos: [2012, 2018] }
        ] 
      }
    ]
  },
  {
    modelo: 'Strada',
    anos: [2008, 2026],
    motorizacoes: [
      { motor: '1.4 Fire', anos: [2008, 2024], cambios: [{ nome: 'Manual', anos: [2008, 2024] }] },
      { motor: '1.8 Powertrain', anos: [2008, 2010], cambios: [{ nome: 'Manual', anos: [2008, 2010] }] },
      { motor: '1.6 E.torQ', anos: [2011, 2016], cambios: [
          { nome: 'Manual', anos: [2011, 2016] },
          { nome: 'Automatizado (Dualogic)', anos: [2012, 2016] }
        ] 
      },
      { motor: '1.8 E.torQ', anos: [2017, 2020], cambios: [
          { nome: 'Manual', anos: [2017, 2020] },
          { nome: 'Automatizado (Dualogic)', anos: [2017, 2018] }
        ] 
      },
      { motor: '1.3 Firefly', anos: [2020, 2026], cambios: [
          { nome: 'Manual', anos: [2020, 2026] },
          { nome: 'Automático CVT', anos: [2022, 2026] }
        ] 
      },
      { motor: '1.0 Turbo T200', anos: [2023, 2026], cambios: [{ nome: 'Automático CVT', anos: [2023, 2026] }] }
    ]
  },
  {
    modelo: 'Fiorino',
    anos: [2008, 2026],
    motorizacoes: [
      { motor: '1.3 Fire', anos: [2008, 2013], cambios: [{ nome: 'Manual', anos: [2008, 2013] }] },
      { motor: '1.4 EVO', anos: [2014, 2026], cambios: [{ nome: 'Manual', anos: [2014, 2026] }] }
    ]
  },
  {
    modelo: 'Punto',
    anos: [2008, 2017],
    motorizacoes: [
      { motor: '1.4 Fire', anos: [2008, 2017], cambios: [{ nome: 'Manual', anos: [2008, 2017] }] },
      { motor: '1.8 Powertrain', anos: [2008, 2010], cambios: [{ nome: 'Manual', anos: [2008, 2010] }] },
      { motor: '1.6 E.torQ', anos: [2011, 2017], cambios: [
          { nome: 'Manual', anos: [2011, 2017] },
          { nome: 'Automatizado (Dualogic)', anos: [2011, 2017] }
        ] 
      },
      { motor: '1.8 E.torQ', anos: [2011, 2017], cambios: [
          { nome: 'Manual', anos: [2011, 2017] },
          { nome: 'Automatizado (Dualogic)', anos: [2011, 2017] }
        ] 
      },
      { motor: '1.4 T-Jet', anos: [2009, 2016], cambios: [{ nome: 'Manual', anos: [2009, 2016] }] }
    ]
  },
  {
    modelo: 'Linea',
    anos: [2009, 2016],
    motorizacoes: [
      { motor: '1.9 16v', anos: [2009, 2010], cambios: [
          { nome: 'Manual', anos: [2009, 2010] },
          { nome: 'Automatizado (Dualogic)', anos: [2009, 2010] }
        ] 
      },
      { motor: '1.8 E.torQ', anos: [2011, 2016], cambios: [
          { nome: 'Manual', anos: [2011, 2016] },
          { nome: 'Automatizado (Dualogic)', anos: [2011, 2016] }
        ] 
      },
      { motor: '1.4 T-Jet', anos: [2009, 2012], cambios: [{ nome: 'Manual', anos: [2009, 2012] }] }
    ]
  },
  {
    modelo: 'Stilo',
    anos: [2008, 2011],
    motorizacoes: [
      { motor: '1.8 8v', anos: [2008, 2011], cambios: [
          { nome: 'Manual', anos: [2008, 2011] },
          { nome: 'Automatizado (Dualogic)', anos: [2008, 2011] }
        ] 
      },
      { motor: '1.8 16v', anos: [2008, 2009], cambios: [{ nome: 'Manual', anos: [2008, 2009] }] },
      { motor: '2.4 20v', anos: [2008, 2009], cambios: [{ nome: 'Manual', anos: [2008, 2009] }] }
    ]
  },
  {
    modelo: 'Bravo',
    anos: [2011, 2016],
    motorizacoes: [
      { motor: '1.8 E.torQ', anos: [2011, 2016], cambios: [
          { nome: 'Manual', anos: [2011, 2016] },
          { nome: 'Automatizado (Dualogic)', anos: [2011, 2016] }
        ] 
      },
      { motor: '1.4 T-Jet', anos: [2011, 2016], cambios: [{ nome: 'Manual', anos: [2011, 2016] }] }
    ]
  },
  {
    modelo: 'Idea',
    anos: [2008, 2016],
    motorizacoes: [
      { motor: '1.4 Fire', anos: [2008, 2016], cambios: [{ nome: 'Manual', anos: [2008, 2016] }] },
      { motor: '1.8 Powertrain', anos: [2008, 2010], cambios: [{ nome: 'Manual', anos: [2008, 2010] }] },
      { motor: '1.6 E.torQ', anos: [2011, 2016], cambios: [
          { nome: 'Manual', anos: [2011, 2016] },
          { nome: 'Automatizado (Dualogic)', anos: [2011, 2016] }
        ] 
      },
      { motor: '1.8 E.torQ', anos: [2011, 2016], cambios: [
          { nome: 'Manual', anos: [2011, 2016] },
          { nome: 'Automatizado (Dualogic)', anos: [2011, 2016] }
        ] 
      }
    ]
  },
  {
    modelo: 'Doblo',
    anos: [2008, 2021],
    motorizacoes: [
      { motor: '1.4 Fire', anos: [2010, 2016], cambios: [{ nome: 'Manual', anos: [2010, 2016] }] },
      { motor: '1.8 Powertrain', anos: [2008, 2010], cambios: [{ nome: 'Manual', anos: [2008, 2010] }] },
      { motor: '1.8 E.torQ', anos: [2011, 2021], cambios: [{ nome: 'Manual', anos: [2011, 2021] }] }
    ]
  },
  {
    modelo: '500',
    anos: [2009, 2017],
    motorizacoes: [
      { motor: '1.4 16v', anos: [2009, 2011], cambios: [
          { nome: 'Manual', anos: [2009, 2011] },
          { nome: 'Automático', anos: [2009, 2011] }
        ] 
      },
      { motor: '1.4 EVO', anos: [2011, 2017], cambios: [
          { nome: 'Manual', anos: [2011, 2017] },
          { nome: 'Automatizado (Dualogic)', anos: [2011, 2015] }
        ] 
      },
      { motor: '1.4 MultiAir', anos: [2011, 2017], cambios: [
          { nome: 'Manual', anos: [2011, 2017] },
          { nome: 'Automático', anos: [2011, 2017] }
        ] 
      }
    ]
  },
  {
    modelo: '500e',
    anos: [2021, 2026],
    motorizacoes: [
      { motor: 'Elétrico (EV)', anos: [2021, 2026], cambios: [{ nome: 'Automático', anos: [2021, 2026] }] }
    ]
  },
  {
    modelo: 'Freemont',
    anos: [2011, 2016],
    motorizacoes: [
      { motor: '2.4 16v', anos: [2011, 2016], cambios: [{ nome: 'Automático', anos: [2011, 2016] }] }
    ]
  },
  {
    modelo: 'Toro',
    anos: [2016, 2026],
    motorizacoes: [
      { motor: '1.8 E.torQ', anos: [2016, 2021], cambios: [
          { nome: 'Manual', anos: [2016, 2021] },
          { nome: 'Automático 6 Marchas', anos: [2016, 2021] }
        ] 
      },
      { motor: '2.4 Tigershark', anos: [2016, 2020], cambios: [{ nome: 'Automático 9 Marchas', anos: [2016, 2020] }] },
      { motor: '1.3 Turbo T270', anos: [2021, 2026], cambios: [{ nome: 'Automático 6 Marchas', anos: [2021, 2026] }] },
      { motor: '2.0 Turbodiesel', anos: [2016, 2026], cambios: [
          { nome: 'Manual', anos: [2016, 2019] },
          { nome: 'Automático 9 Marchas', anos: [2016, 2026] }
        ] 
      }
    ]
  },
  {
    modelo: 'Mobi',
    anos: [2016, 2026],
    motorizacoes: [
      { motor: '1.0 Fire', anos: [2016, 2026], cambios: [{ nome: 'Manual', anos: [2016, 2026] }] },
      { motor: '1.0 Firefly', anos: [2017, 2020], cambios: [
          { nome: 'Manual', anos: [2017, 2020] },
          { nome: 'Automatizado (GSR)', anos: [2017, 2020] }
        ] 
      }
    ]
  },
  {
    modelo: 'Argo',
    anos: [2017, 2026],
    motorizacoes: [
      { motor: '1.0 Firefly', anos: [2017, 2026], cambios: [{ nome: 'Manual', anos: [2017, 2026] }] },
      { motor: '1.3 Firefly', anos: [2017, 2026], cambios: [
          { nome: 'Manual', anos: [2017, 2026] },
          { nome: 'Automatizado (GSR)', anos: [2017, 2019] },
          { nome: 'Automático CVT', anos: [2022, 2026] }
        ] 
      },
      { motor: '1.8 E.torQ', anos: [2017, 2021], cambios: [
          { nome: 'Manual', anos: [2017, 2021] },
          { nome: 'Automático 6 Marchas', anos: [2017, 2021] }
        ] 
      }
    ]
  },
  {
    modelo: 'Cronos',
    anos: [2018, 2026],
    motorizacoes: [
      { motor: '1.0 Firefly', anos: [2022, 2026], cambios: [{ nome: 'Manual', anos: [2022, 2026] }] },
      { motor: '1.3 Firefly', anos: [2018, 2026], cambios: [
          { nome: 'Manual', anos: [2018, 2026] },
          { nome: 'Automatizado (GSR)', anos: [2018, 2019] },
          { nome: 'Automático CVT', anos: [2022, 2026] }
        ] 
      },
      { motor: '1.8 E.torQ', anos: [2018, 2021], cambios: [
          { nome: 'Manual', anos: [2018, 2021] },
          { nome: 'Automático 6 Marchas', anos: [2018, 2021] }
        ] 
      }
    ]
  },
  {
    modelo: 'Pulse',
    anos: [2021, 2026],
    motorizacoes: [
      { motor: '1.3 Firefly', anos: [2021, 2026], cambios: [
          { nome: 'Manual', anos: [2021, 2026] },
          { nome: 'Automático CVT', anos: [2021, 2026] }
        ] 
      },
      { motor: '1.0 Turbo T200', anos: [2021, 2026], cambios: [{ nome: 'Automático CVT', anos: [2021, 2026] }] },
      { motor: '1.3 Turbo T270 (Abarth)', anos: [2023, 2026], cambios: [{ nome: 'Automático 6 Marchas', anos: [2023, 2026] }] }
    ]
  },
  {
    modelo: 'Fastback',
    anos: [2022, 2026],
    motorizacoes: [
      { motor: '1.0 Turbo T200', anos: [2022, 2026], cambios: [{ nome: 'Automático CVT', anos: [2022, 2026] }] },
      { motor: '1.3 Turbo T270', anos: [2022, 2026], cambios: [{ nome: 'Automático 6 Marchas', anos: [2022, 2026] }] }
    ]
  },
  {
    modelo: 'Titano',
    anos: [2024, 2026],
    motorizacoes: [
      { motor: '2.2 Turbodiesel', anos: [2024, 2026], cambios: [
          { nome: 'Manual', anos: [2024, 2026] },
          { nome: 'Automático 6 Marchas', anos: [2024, 2026] }
        ] 
      }
    ]
  },
  {
    modelo: 'Ducato',
    anos: [2008, 2026],
    motorizacoes: [
      { motor: '2.3 Turbodiesel', anos: [2010, 2022], cambios: [{ nome: 'Manual', anos: [2010, 2022] }] },
      { motor: '2.2 Turbodiesel', anos: [2023, 2026], cambios: [{ nome: 'Manual', anos: [2023, 2026] }] }
    ]
  }
];

async function seedDatabase() {
  try {
    // 1. Seed fiatBaseModels into VehicleCatalog
    const count = await VehicleCatalog.count();
    if (count === 0) {
      console.log('🌱 Gerando combinações de veículos FIAT de 2008 até 2026 para o catálogo...');

      let generatedVehicles = [];
      for (const base of fiatBaseModels) {
        const { modelo, anos, motorizacoes } = base;
        for (let ano = anos[0]; ano <= anos[1]; ano++) {
          if (ano > 2026) break;

          // Passo A: Filtrar motorizações cujo ciclo de vida englobe o ano escolhido
          const motoresValidos = motorizacoes.filter(
            (m) => ano >= m.anos[0] && ano <= m.anos[1]
          );

          for (const mObj of motoresValidos) {
            const motorNome = mObj.motor || mObj.nome;

            // Passo B: Filtrar câmbios atrelados ao motor cujo ciclo de vida englobe o ano escolhido
            const cambiosValidos = (mObj.cambios || []).filter(
              (c) => ano >= c.anos[0] && ano <= c.anos[1]
            );

            for (const cObj of cambiosValidos) {
              generatedVehicles.push({
                modelo: modelo,
                ano: ano,
                motorizacao: motorNome,
                tipo_cambio: cObj.nome || cObj.motor
              });
            }
          }
        }
      }

      console.log(`🚀 Inserindo ${generatedVehicles.length} versões no catálogo de veículos FIAT...`);
      await VehicleCatalog.bulkCreate(generatedVehicles);
      console.log('✅ Catálogo de veículos FIAT inserido com sucesso!');
    } else {
      console.log('ℹ️ O catálogo de veículos já possui registros. Pulando.');
    }

    // 2. Seed symptomsCatalogData into SymptomCatalog
    const symptomCount = await SymptomCatalog.count();
    if (symptomCount === 0) {
      console.log('🌱 Gerando catálogo de sintomas no banco de dados...');
      for (const symptom of symptomsCatalogData) {
        await SymptomCatalog.create(symptom, {
          include: [
            {
              model: CauseCatalog,
              as: 'causes',
              include: [
                {
                  model: RepairGuideCatalog,
                  as: 'repairGuides'
                }
              ]
            }
          ]
        });
      }
      console.log('✅ Catálogo de sintomas inserido com sucesso no banco de dados!');
    } else {
      console.log('ℹ️ O catálogo de sintomas já possui registros no banco de dados. Pulando.');
    }

  } catch (error) {
    console.error('❌ Erro ao popular o catálogo:', error);
  }
}

module.exports = seedDatabase;
