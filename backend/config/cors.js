function createCorsOptions(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const configured = (env.CORS_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
  if (production && configured.length === 0) {
    throw new Error('CORS_ORIGINS não está definida. Configure a origem HTTPS do frontend da Vercel no Render.');
  }
  const origins = production ? configured : [...configured, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173'];
  const allowed = new Set(origins.map(value => {
    let url;
    try {
      url = new URL(value);
    } catch {
      throw new Error('CORS_ORIGINS contém uma origem inválida. Use URLs completas, separadas por vírgula.');
    }
    const loopback = /^(localhost|.*\.localhost|127\..*|0\.0\.0\.0|\[::1\])$/i.test(url.hostname);
    if (!['http:', 'https:'].includes(url.protocol) || url.hostname.includes('*') || url.username || url.password
      || url.pathname !== '/' || url.search || url.hash || (production && (url.protocol !== 'https:' || loopback))) {
      throw new Error('CORS_ORIGINS aceita apenas origens exatas, sem caminhos ou curingas, e exige HTTPS público em produção.');
    }
    return url.origin;
  }));
  return {
    origin(origin, callback) {
      callback(null, Boolean(origin) && allowed.has(origin));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: false,
    maxAge: 600
  };
}

module.exports = { createCorsOptions };
