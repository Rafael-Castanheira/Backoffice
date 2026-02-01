const db = require('../models');
const bcrypt = require('bcryptjs');

function looksLikeBcryptHash(value) {
  const s = String(value || '');
  return s.startsWith('$2a$') || s.startsWith('$2b$') || s.startsWith('$2y$');
}

async function verifyPassword(user, password) {
  const stored = String(user?.password_hash || '');
  const input = String(password || '');

  if (!stored) return false;
  if (looksLikeBcryptHash(stored)) {
    try {
      return await bcrypt.compare(input, stored);
    } catch {
      return false;
    }
  }

  // Legacy plaintext password support (dev)
  return stored === input;
}

async function maybeUpgradePlaintextPassword(user, password) {
  const stored = String(user?.password_hash || '');
  if (!stored || looksLikeBcryptHash(stored)) return;

  // If the stored value matched plaintext, upgrade it to bcrypt.
  if (stored === String(password || '')) {
    try {
      const hashed = await bcrypt.hash(String(password || ''), 10);
      await user.update({ password_hash: hashed });
    } catch {
      // ignore upgrade failures (e.g. schema too small) so login still works
    }
  }
}

// Simple development login: checks email and password against utilizadores.password_hash
// Replace with proper hashing and JWT in production.
async function login(req, res) {
  const { email, password } = req.body || {};
  const identifier = String(email || '').trim();
  if (!identifier || !password) return res.status(400).json({ message: 'Utilizador e password são obrigatórios' });

  try {
    const { Op } = db.Sequelize;
    const user = await db.utilizadores.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { numero_utente: identifier }],
      },
    });
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    const ok = await verifyPassword(user, password);
    if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });

    // Best-effort upgrade from plaintext to bcrypt
    await maybeUpgradePlaintextPassword(user, password);

    // Return a simple token placeholder and basic user info
    const token = `dev-token-${user.id_user}`;
    return res.json({
      token,
      user: {
        id: user.id_user,
        email: user.email,
        nome: user.nome,
        id_tipo_user: user.id_tipo_user,
        numero_utente: user.numero_utente,
      },
    });
  } catch (err) {
    console.error('Auth login error:', err.message || err);
    // Return the actual error message for debugging purposes
    return res.status(500).json({ message: err.message || 'An unexpected error occurred' });
  }
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  const current = String(currentPassword || '');
  const next = String(newPassword || '');

  if (!req.user) return res.status(401).json({ message: 'Não autenticado.' });
  if (!current || !next) return res.status(400).json({ message: 'Password atual e nova password são obrigatórias.' });
  if (next.length < 6) return res.status(400).json({ message: 'A nova password deve ter pelo menos 6 caracteres.' });
  if (next.length > 72) return res.status(400).json({ message: 'A nova password é demasiado longa.' });
  if (current === next) return res.status(400).json({ message: 'A nova password tem de ser diferente da atual.' });

  try {
    const user = await db.utilizadores.findByPk(req.user.id_user);
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado.' });

    const ok = await verifyPassword(user, current);
    if (!ok) return res.status(401).json({ message: 'Password atual incorreta.' });

    const hashed = await bcrypt.hash(next, 10);
    await user.update({ password_hash: hashed });

    return res.status(204).send();
  } catch (err) {
    const msg = err?.message || '';
    // Common failure if the DB column is too small.
    if (/value too long|too long for type|varchar\(12\)|character varying\(12\)/i.test(msg)) {
      return res.status(500).json({ message: 'A base de dados ainda não suporta passwords encriptadas. Execute sync-db.js (alter: true) ou reinicie o backend para aplicar a atualização de schema.' });
    }
    return res.status(500).json({ message: msg || 'Erro ao alterar password.' });
  }
}

module.exports = { login, changePassword };
