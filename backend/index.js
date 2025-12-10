const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/consulta', require('./routes/consulta_route'));

// Rota de Teste
app.get('/', (req, res) => {
  res.json({ message: 'O servidor Express está a funcionar!' });
});

// --- Iniciar o Servidor e a Base de Dados ---

// Usamos db.sequelize.sync() para garantir que a BD está ligada
// antes de o servidor começar a aceitar pedidos.
async function start() {
  try {
    // Try to authenticate and sync DB, but don't prevent the server from starting if DB is down.
    await db.sequelize.authenticate();
    await db.sequelize.sync();
    console.log('✅ Base de dados ligada com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao ligar à base de dados:', err.message || err);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend a correr em http://localhost:${PORT}`);
  });
}

start();