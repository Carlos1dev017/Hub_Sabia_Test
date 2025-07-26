const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'Acesso negado. Nenhum token fornecido.' });
    }

    try {
        // Verifica o token usando o segredo do arquivo .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Anexa o payload do usuário à requisição
        req.usuario = decoded.usuario;
        next();

    } catch (err) {
        res.status(401).json({ msg: 'Token inválido.' });
    }
};