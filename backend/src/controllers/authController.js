const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha)
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    if (senha.length < 6)
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });

    const [exists] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (exists.length > 0)
      return res.status(409).json({ message: 'Este email já está cadastrado.' });

    const hash = await bcrypt.hash(senha, 10);
    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
      [nome, email, hash, 'cliente']
    );

    const user = { id: result.insertId, nome, email, tipo: 'cliente' };
    const token = jwt.sign(user, process.env.JWT_SECRET || 'maison_secret', { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Erro interno.', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha)
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });

    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: 'Email ou senha incorretos.' });

    const usuario = rows[0];
    const valid = await bcrypt.compare(senha, usuario.senha);
    if (!valid)
      return res.status(401).json({ message: 'Email ou senha incorretos.' });

    const user = { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo };
    const token = jwt.sign(user, process.env.JWT_SECRET || 'maison_secret', { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Erro interno.', error: err.message });
  }
};

const me = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nome, email, tipo, data_criacao FROM usuarios WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro interno.' });
  }
};

module.exports = { register, login, me };
