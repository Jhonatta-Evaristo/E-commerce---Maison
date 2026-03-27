const db = require('../config/db');

const getAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let sql = `SELECT p.*, u.nome as cliente_nome, u.email as cliente_email
               FROM pedidos p JOIN usuarios u ON p.user_id = u.id WHERE 1=1`;
    const params = [];
    if (status) { sql += ' AND p.status = ?'; params.push(status); }
    sql += ' ORDER BY p.data_criacao DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [rows] = await db.query(sql, params);
    res.json({ pedidos: rows });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar pedidos.', error: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const [pedidos] = await db.query(
      'SELECT * FROM pedidos WHERE user_id = ? ORDER BY data_criacao DESC',
      [req.user.id]
    );
    for (const p of pedidos) {
      const [itens] = await db.query(
        `SELECT pi.*, pr.nome, pr.imagem_url FROM pedido_itens pi
         JOIN produtos pr ON pi.produto_id = pr.id WHERE pi.pedido_id = ?`,
        [p.id]
      );
      p.itens = itens;
    }
    res.json({ pedidos });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar seus pedidos.', error: err.message });
  }
};

const create = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { items, total, endereco, metodo_pagamento } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Carrinho vazio.' });

    const [result] = await conn.query(
      'INSERT INTO pedidos (user_id, total, status, endereco, metodo_pagamento) VALUES (?,?,?,?,?)',
      [req.user.id, total, 'pendente', endereco || '', metodo_pagamento || 'pix']
    );
    const pedidoId = result.insertId;

    for (const item of items) {
      await conn.query(
        'INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco, tamanho) VALUES (?,?,?,?,?)',
        [pedidoId, item.produto_id, item.quantidade, item.preco, item.tamanho || 'M']
      );
      await conn.query(
        'UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND estoque >= ?',
        [item.quantidade, item.produto_id, item.quantidade]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Pedido criado!', pedido: { id: pedidoId, total, status: 'pendente' } });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Erro ao criar pedido.', error: err.message });
  } finally {
    conn.release();
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pendente','pago','enviado','entregue','cancelado'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Status inválido.' });

    const [exists] = await db.query('SELECT id FROM pedidos WHERE id = ?', [req.params.id]);
    if (!exists.length) return res.status(404).json({ message: 'Pedido não encontrado.' });

    await db.query('UPDATE pedidos SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status atualizado.', status });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar status.', error: err.message });
  }
};

module.exports = { getAll, getMyOrders, create, updateStatus };
