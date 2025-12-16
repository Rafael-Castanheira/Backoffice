const db = require('../models');

// Simple development login: checks email and password against utilizadores.password_hash
// Replace with proper hashing and JWT in production.
async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email e password são obrigatórios' });

  try {
    const user = await db.utilizadores.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    // Development-only password check (plain text comparison)
    if (String(user.password_hash || '') !== String(password)) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Return a simple token placeholder and basic user info
    const token = `dev-token-${user.id_user}`;
    return res.json({ token, user: { id: user.id_user, email: user.email, nome: user.nome } });
  } catch (err) {
    console.error('Auth login error:', err.message || err);
    // Return the actual error message for debugging purposes
    return res.status(500).json({ message: err.message || 'An unexpected error occurred' });
  }
}

module.exports = { login };
