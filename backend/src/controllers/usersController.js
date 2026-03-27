const db = require('../config/db');

const getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome, email, tipo, data_criacao FROM usuarios ORDER BY data_criacao DESC'
    );
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar usuários.', error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome, email, tipo, data_criacao FROM usuarios WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Usuário não encontrado.' });
    const [pedidos] = await db.query(
      'SELECT * FROM pedidos WHERE user_id = ? ORDER BY data_criacao DESC',
      [req.params.id]
    );
    res.json({ user: rows[0], pedidos });
  } catch (err) {
    res.status(500).json({ message: 'Erro interno.' });
  }
};

module.exports = { getAll, getById };
