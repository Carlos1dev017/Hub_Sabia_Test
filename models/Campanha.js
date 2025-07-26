const mongoose = require('mongoose');

const CampanhaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    periodo_inicio: { type: Date, required: true },
    periodo_fim: { type: Date, required: true },
    status: { type: String, enum: ['Ativa', 'Planejada', 'Concluída', 'Cancelada'], default: 'Planejada' },
    publico_alvo: { type: String },
    // Link com o usuário que criou a campanha
    criador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, { timestamps: true }); // timestamps adiciona createdAt e updatedAt automaticamente

module.exports = mongoose.model('Campanha', CampanhaSchema);