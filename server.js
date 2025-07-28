const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// Middlewares essenciais
app.use(cors()); // Permite que seu frontend se comunique com este backend
app.use(express.json()); // Permite que o servidor entenda JSON

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB (HubSabia) conectado com sucesso!'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/campanhas', require('./routes/campanhas'));

// Rota de teste inicial
app.get('/', (req, res) => {
    res.send('API do HubSabia está no ar!');
});

const corsOptions = {
    origin: 'https://hub-sabia-front.vercel.app/' // A URL que a Vercel te deu
};

app.use(cors(corsOptions));
