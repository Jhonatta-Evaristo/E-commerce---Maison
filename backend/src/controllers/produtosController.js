const db = require('../config/db');

const getAll = async (req, res) => {
  try {
    const { categoria, destaque, search, sort, limit = 50, page = 1 } = req.query;
    let sql = 'SELECT * FROM produtos WHERE 1=1';
    const params = [];

    if (categoria) { sql += ' AND categoria = ?'; params.push(categoria); }
    if (destaque === 'true') { sql += ' AND destaque = 1'; }
    if (search) { sql += ' AND (nome LIKE ? OR descricao LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    if (sort === 'preco_asc') sql += ' ORDER BY preco ASC';
    else if (sort === 'preco_desc') sql += ' ORDER BY preco DESC';
    else if (sort === 'nome_asc') sql += ' ORDER BY nome ASC';
    else sql += ' ORDER BY destaque DESC, data_criacao DESC';

    const lim = Math.min(parseInt(limit), 100);
    const off = (parseInt(page) - 1) * lim;
    sql += ' LIMIT ? OFFSET ?';
    params.push(lim, off);

    const [rows] = await db.query(sql, params);
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM produtos');
    res.json({ produtos: rows, total, page: parseInt(page), limit: lim });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos.', error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Produto não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro interno.' });
  }
};

const create = async (req, res) => {
  try {
    const { nome, descricao, preco, categoria, tamanho, cor, imagem_url, estoque, destaque } = req.body;
    if (!nome || !preco || !categoria)
      return res.status(400).json({ message: 'Nome, preço e categoria são obrigatórios.' });

    const [result] = await db.query(
      'INSERT INTO produtos (nome, descricao, preco, categoria, tamanho, cor, imagem_url, estoque, destaque) VALUES (?,?,?,?,?,?,?,?,?)',
      [nome, descricao || '', preco, categoria, tamanho || 'P,M,G,GG', cor || '', imagem_url || '', estoque || 0, destaque ? 1 : 0]
    );
    const [newProd] = await db.query('SELECT * FROM produtos WHERE id = ?', [result.insertId]);
    res.status(201).json(newProd[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar produto.', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { nome, descricao, preco, categoria, tamanho, cor, imagem_url, estoque, destaque } = req.body;
    const [exists] = await db.query('SELECT id FROM produtos WHERE id = ?', [req.params.id]);
    if (!exists.length) return res.status(404).json({ message: 'Produto não encontrado.' });

    await db.query(
      'UPDATE produtos SET nome=?, descricao=?, preco=?, categoria=?, tamanho=?, cor=?, imagem_url=?, estoque=?, destaque=? WHERE id=?',
      [nome, descricao, preco, categoria, tamanho, cor, imagem_url, estoque, destaque ? 1 : 0, req.params.id]
    );
    const [updated] = await db.query('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar produto.', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const [exists] = await db.query('SELECT id FROM produtos WHERE id = ?', [req.params.id]);
    if (!exists.length) return res.status(404).json({ message: 'Produto não encontrado.' });
    await db.query('DELETE FROM produtos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Produto excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir produto.', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
