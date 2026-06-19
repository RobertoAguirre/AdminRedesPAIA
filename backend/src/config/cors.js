const DEFAULT_DEV_ORIGIN = 'http://localhost:5173';

function collectOrigins() {
  const fromEnv = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) || [];

  const extras = [
    DEFAULT_DEV_ORIGIN,
    process.env.FRONTEND_URL?.trim(),
    process.env.RENDER_EXTERNAL_URL?.trim(),
  ].filter(Boolean);

  return [...new Set([...fromEnv, ...extras])];
}

export function corsOptions() {
  const allowedOrigins = collectOrigins();

  return {
    origin(origin, callback) {
      // Peticiones same-origin, health checks o herramientas sin header Origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      console.warn(`CORS bloqueado para origen: ${origin}`);
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

export function getAllowedOrigins() {
  return collectOrigins();
}
