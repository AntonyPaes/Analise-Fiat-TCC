const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const directory = path.join(root, 'frontend');
const findings = [];
let inspected = 0;
function inspect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'tests', '.git'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) inspect(file);
    else if (/\.(?:js|jsx|html|css|json)$/.test(entry.name) && !entry.name.includes('lock')) {
      const text = fs.readFileSync(file, 'utf8');
      inspected++;
      const patterns = [
        ['Chave privada', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
        ['Padrão de chave Google', /AIza[0-9A-Za-z_-]{30,}/],
        ['Atribuição literal de credencial', /(?:api[_-]?key|password|senha|secret|access[_-]?token)\s*[:=]\s*['"][^'"\s]{8,}['"]/i]
      ];
      for (const [type, regex] of patterns) if (regex.test(text)) findings.push({ file: path.relative(root, file), type, value: '[OCULTO]' });
    }
  }
}
inspect(directory);
const result = { id: 'SEG04', date: process.env.TEST_EXECUTION_DATE || '2026-11-13', environment: 'Inspeção estática local de frontend/src e build, entre outros arquivos do frontend',
  objective: 'Buscar exposição evidente de credenciais no frontend sem revelar valores.',
  procedure: 'Buscar padrões de chaves privadas, chaves Google e atribuições literais de credenciais.',
  expected: 'Nenhum padrão de credencial encontrado.',
  observed: { inspected, findings }, status: findings.length ? 'Reprovado' : 'Aprovado',
  limitation: 'Análise heurística por padrões; não garante ausência de todos os formatos de segredos ou vulnerabilidades.' };
fs.writeFileSync(path.join(root, 'documentacao/testes/evidencias/security-static.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ inspected, findings: findings.map(f => ({ file: f.file, type: f.type })), status: result.status }));
process.exitCode = findings.length ? 1 : 0;
