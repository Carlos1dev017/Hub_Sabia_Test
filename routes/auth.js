const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Importamos o nosso modelo de Usuário que criamos no passo anterior
const Usuario = require('../models/Usuario');

// ==========================================================
// ROTA DE REGISTRO
// MÉTODO: POST | ENDPOINT: /api/auth/registrar
// ==========================================================
router.post('/registrar', async (req, res) => {
    // 1. Extraímos os dados do corpo (body) da requisição
    const { nome, email, senha } = req.body;

    // 2. Validação simples para ver se todos os campos foram enviados
    if (!nome || !email || !senha) {
        return res.status(400).json({ msg: 'Por favor, inclua todos os campos: nome, email e senha.' });
    }

    try {
        // 3. Verifica se o usuário já existe no banco de dados
        let usuario = await Usuario.findOne({ email: email.toLowerCase() });

        if (usuario) {
            // Se encontrarmos um usuário com o mesmo email, retornamos um erro
            return res.status(400).json({ msg: 'Um usuário com este e-mail já existe.' });
        }

        // 4. Se o usuário não existe, criamos uma nova instância do modelo
        // Note que passamos a senha em texto plano aqui. O hook 'pre-save' no modelo vai criptografá-la.
        usuario = new Usuario({
            nome,
            email,
            senha_hash: senha
        });

        // 5. Salvamos o novo usuário no banco de dados. O Mongoose cuidará da criptografia.
        await usuario.save();

        // 6. Retornamos uma resposta de sucesso.
        // Por segurança, não retornamos o token aqui. O usuário deve fazer login para obtê-lo.
        res.status(201).json({ msg: 'Usuário registrado com sucesso!' });

    } catch (err) {
        // Se algo der errado no servidor (ex: problema de conexão com o banco), capturamos o erro
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
});


// ==========================================================
// ROTA DE LOGIN
// MÉTODO: POST | ENDPOINT: /api/auth/login
// ==========================================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Por favor, inclua email e senha.' });
    }

    try {
        // Procura o usuário pelo email
        const usuario = await Usuario.findOne({ email: email.toLowerCase() });

        if (!usuario) {
            // Se não encontrar o usuário, retornamos uma mensagem genérica por segurança
            return res.status(400).json({ msg: 'Credenciais inválidas.' });
        }

        // Compara a senha enviada com a senha criptografada no banco de dados
        const isMatch = await bcrypt.compare(password, usuario.senha_hash);

        if (!isMatch) {
            // Se as senhas não baterem, retornamos a mesma mensagem genérica
            return res.status(400).json({ msg: 'Credenciais inválidas.' });
        }

        // Se o login for bem-sucedido, criamos o "payload" para o token JWT
        const payload = {
            usuario: {
                id: usuario.id // Guardamos apenas o ID do usuário no token
            }
        };

        // Assinamos o token com o nosso segredo do .env
        // O token expira em 5 horas (você pode mudar isso)
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                // Retornamos o token para o cliente
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// Exportamos o router para que o server.js possa usá-lo
module.exports = router;