// Development-friendly auth middleware.
//
// The current login endpoint returns a placeholder token like: "dev-token-<id_user>".
// This middleware parses that token and attaches the user to req.user.
//
// IMPORTANT: for backward compatibility, it does not hard-block requests without a token.
// Sensitive endpoints must still validate req.user and permissions.

const db = require('../models');

function parseBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(String(header));
  return m ? m[1] : '';
}

function isDevToken(token) {
  return /^dev-token-\d+$/i.test(String(token || ''));
}

async function verifyToken(req, res, next) {
  try {
    const token = parseBearerToken(req);
    if (!token) {
      req.user = null;
      return next();
    }

    if (isDevToken(token)) {
      const id = String(token).replace(/^dev-token-/i, '');
      const user = await db.utilizadores.findOne({ where: { id_user: id } });
      if (!user) {
        req.user = null;
        return next();
      }

      req.user = {
        id_user: user.id_user,
        email: user.email,
        nome: user.nome,
        id_tipo_user: user.id_tipo_user,
        numero_utente: user.numero_utente,
      };
      return next();
    }

    // Unknown token format (no JWT support in this dev setup yet)
    req.user = null;
    return next();
  } catch {
    req.user = null;
    return next();
  }
}

module.exports = { verifyToken };
