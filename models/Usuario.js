const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Importamos o bcrypt para criptografar a senha

// Primeiro, definimos a estrutura para os chatbots que serão aninhados
const ChatbotSchema = new mongoose.Schema({
    nome_chatbot: {
        type: String,
        required: [true, 'O nome do chatbot é obrigatório.']
    },
    // Você pode adicionar mais campos aqui no futuro, como uma descrição do chatbot
    data_criacao: {
        type: Date,
        default: Date.now
    }
});

// Agora, definimos a estrutura principal do Usuário
const UsuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'O nome é obrigatório.']
    },
    email: {
        type: String,
        required: [true, 'O e-mail é obrigatório.'],
        unique: true, // Garante que não haverá dois e-mails iguais no banco
        lowercase: true // Salva sempre o e-mail em minúsculas para evitar duplicidade
    },
    senha_hash: {
        type: String,
        required: [true, 'A senha é obrigatória.']
    },
    data_criacao: {
        type: Date,
        default: Date.now
    },
    chatbots: {
        type: [ChatbotSchema], // Um array de documentos que seguem o molde do ChatbotSchema
        validate: [
            (val) => val.length <= 6, // Uma função de validação
            'Um usuário pode ter no máximo 6 chatbots.' // Mensagem de erro se a validação falhar
        ]
    }
});

// Isso é um "hook" do Mongoose. Antes ('pre') de um usuário ser salvo ('save')...
// ...nós vamos executar esta função para criptografar a senha.
UsuarioSchema.pre('save', async function(next) {
    // Se a senha não foi modificada, não fazemos nada e passamos para o próximo passo
    if (!this.isModified('senha_hash')) {
        return next();
    }

    // Gera o "salt" (uma string aleatória para aumentar a segurança) e criptografa a senha
    const salt = await bcrypt.genSalt(10);
    this.senha_hash = await bcrypt.hash(this.senha_hash, salt);
    next();
});

// Exportamos o modelo para que possamos usá-lo em outras partes do nosso código
module.exports = mongoose.model('Usuario', UsuarioSchema);