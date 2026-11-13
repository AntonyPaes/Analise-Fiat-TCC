export function getApiBaseUrl(env = import.meta.env || {}) {
  const configured = env.VITE_API_URL?.trim();
  if (!configured && env.DEV !== true) {
    throw new Error('VITE_API_URL não está definida. Configure a URL HTTPS do backend no ambiente da Vercel e faça um novo deploy.');
  }
  const value = configured || 'http://localhost:3000';
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('VITE_API_URL inválida. Informe a URL completa do backend, incluindo https://.');
  }
  const localHost = /^(localhost|.*\.localhost|127\..*|0\.0\.0\.0|\[::1\])$/i.test(url.hostname);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash
    || (env.DEV !== true && (url.protocol !== 'https:' || localHost))) {
    throw new Error('VITE_API_URL inválida. Em produção, use a URL HTTPS pública do backend, sem localhost, credenciais, parâmetros ou fragmentos.');
  }
  return url.href.replace(/\/+$/, '');
}

export function getApiUrl(path, env = import.meta.env || {}) {
  if (!path.startsWith('/api/')) throw new Error('Caminho de API inválido.');
  return `${getApiBaseUrl(env)}${path}`;
}

export async function apiFetch(path, options, env = import.meta.env || {}) {
  const url = getApiUrl(path, env);
  try {
    return await fetch(url, options);
  } catch {
    throw new Error('Não foi possível conectar ao backend do Fiat Assist. Verifique a conexão, a disponibilidade da API e as configurações de VITE_API_URL e CORS.');
  }
}
