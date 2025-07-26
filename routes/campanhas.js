// Arquivo: backend/routes/campanhas.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Campanha = require('../models/Campanha'); // Importe o modelo

// ==========================================================
// ROTA PARA LISTAR (GET)
// ==========================================================
router.get('/', authMiddleware, async (req, res) => {
    try {
        const campanhas = await Campanha.find({ criador: req.usuario.id }).sort({ createdAt: -1 });
        res.json(campanhas);
    } catch (err) {
        console.error("Erro ao listar campanhas:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// ROTA PARA CRIAR (POST) - A PARTE QUE ESTAVA FALTANDO
// ==========================================================
router.post('/', authMiddleware, async (req, res) => {
    const { nome, periodo_inicio, periodo_fim, status, publico_alvo } = req.body;

    if (!nome || !periodo_inicio || !periodo_fim) {
        return res.status(400).json({ msg: 'Por favor, inclua nome e período da campanha.' });
    }

    try {
        const novaCampanha = new Campanha({
            nome,
            periodo_inicio,
            periodo_fim,
            status,
            publico_alvo,
            criador: req.usuario.id
        });

        const campanhaSalva = await novaCampanha.save();
        res.status(201).json(campanhaSalva);

    } catch (err) {
        console.error("Erro ao criar campanha:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// ROTA PARA EXCLUIR (DELETE) - Adicionando de volta para garantir
// ==========================================================
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const campanha = await Campanha.findById(req.params.id);

        if (!campanha) {
            return res.status(404).json({ msg: 'Campanha não encontrada.' });
        }

        if (campanha.criador.toString() !== req.usuario.id) {
            return res.status(401).json({ msg: 'Ação não autorizada.' });
        }

        await Campanha.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Campanha removida com sucesso.' });

    } catch (err) {
        console.error("Erro ao excluir campanha:", err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Campanha não encontrada (ID inválido).' });
        }
        res.status(500).send('Erro no servidor.');
    }
});

// ==========================================================
// NOVA ROTA: PUT /api/campanhas/:id (Editar Campanha)
// ==========================================================
router.put('/:id', authMiddleware, async (req, res) => {
    // 1. Pega os novos dados do corpo da requisição
    const { nome, periodo_inicio, periodo_fim, status, publico_alvo } = req.body;

    // 2. Cria um objeto apenas com os campos que foram fornecidos
    const camposAtualizados = {};
    if (nome) camposAtualizados.nome = nome;
    if (periodo_inicio) camposAtualizados.periodo_inicio = periodo_inicio;
    if (periodo_fim) camposAtualizados.periodo_fim = periodo_fim;
    if (status) camposAtualizados.status = status;
    if (publico_alvo) camposAtualizados.publico_alvo = publico_alvo;

    try {
        // 3. Encontra a campanha pelo ID
        let campanha = await Campanha.findById(req.params.id);

        if (!campanha) {
            return res.status(404).json({ msg: 'Campanha não encontrada.' });
        }

        // 4. VERIFICAÇÃO DE SEGURANÇA: O usuário é o dono da campanha?
        if (campanha.criador.toString() !== req.usuario.id) {
            return res.status(401).json({ msg: 'Ação não autorizada.' });
        }

        // 5. Atualiza a campanha no banco de dados com os novos campos
        // { new: true } garante que o método retorne o documento atualizado
        campanha = await Campanha.findByIdAndUpdate(
            req.params.id,
            { $set: camposAtualizados },
            { new: true }
        );

        // 6. Retorna a campanha atualizada
        res.json(campanha);

    } catch (err) {
        console.error("Erro ao editar campanha:", err.message);
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;