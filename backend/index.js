const express = require('express');
const cors = require('cors');

// 1. Importar a sua configuração da Base de Dados (o ficheiro models/index.js)
const db = require('./models'); // O Node.js procura ./models/index.js automaticamente

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de Teste
app.get('/', (req, res) => {
  res.json({ message: 'O servidor Express está a funcionar!' });
});

// --- Iniciar o Servidor e a Base de Dados ---

// Usamos db.sequelize.sync() para garantir que a BD está ligada
// antes de o servidor começar a aceitar pedidos.
db.sequelize.sync().then(() => {
  console.log('✅ Base de dados ligada com sucesso.');

  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend a correr em http://localhost:${PORT}`);
  });

}).catch(err => {
  console.error('❌ Erro ao ligar à base de dados:', err);
});