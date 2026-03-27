const db = require('../config/db');

const getCart = async (req, res) => {
  try {
    const [carrinho] = await db.query('SELECT id FROM carrinho WHERE user_id = ?', [req.user.id]);
    if (!carrinho.length) return res.json({ itens: [], total: 0 });

    const [itens] = await db.query(
      `SELECT ci.id, ci.quantidade, ci.tamanho, p.id as produto_id, p.nome, p.preco, p.imagem_url
       FROM carrinho_itens ci JOIN produtos p ON ci.produto_id = p.id
       WHERE ci.carrinho_id = ?`,
      [carrinho[0].id]
    );
    const total = itens.reduce((s, i) => s + i.preco * i.quantidade, 0);
    res.json({ itens, total });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar carrinho.', error: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { produto_id, quantidade = 1, tamanho = 'M' } = req.body;
    if (!produto_id) return res.status(400).json({ message: 'produto_id é obrigatório.' });

    const [prod] = await db.query('SELECT id, estoque FROM produtos WHERE id = ?', [produto_id]);
    if (!prod.length) return res.status(404).json({ message: 'Produto não encontrado.' });
    if (prod[0].estoque < quantidade) return res.status(400).json({ message: 'Estoque insuficiente.' });

    let [carrinho] = await db.query('SELECT id FROM carrinho WHERE user_id = ?', [req.user.id]);
    if (!carrinho.length) {
      const [r] = await db.query('INSERT INTO carrinho (user_id) VALUES (?)', [req.user.id]);
      carrinho = [{ id: r.insertId }];
    }

    const [existing] = await db.query(
      'SELECT id, quantidade FROM carrinho_itens WHERE carrinho_id = ? AND produto_id = ? AND tamanho = ?',
      [carrinho[0].id, produto_id, tamanho]
    );
    if (existing.length) {
      await db.query('UPDATE carrinho_itens SET quantidade = quantidade + ? WHERE id = ?', [quantidade, existing[0].id]);
    } else {
      await db.query('INSERT INTO carrinho_itens (carrinho_id, produto_id, quantidade, tamanho) VALUES (?,?,?,?)',
        [carrinho[0].id, produto_id, quantidade, tamanho]);
    }
    res.json({ message: 'Item adicionado ao carrinho.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao adicionar ao carrinho.', error: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const [carrinho] = await db.query('SELECT id FROM carrinho WHERE user_id = ?', [req.user.id]);
    if (!carrinho.length) return res.status(404).json({ message: 'Carrinho não encontrado.' });
    await db.query('DELETE FROM carrinho_itens WHERE id = ? AND carrinho_id = ?', [req.params.itemId, carrinho[0].id]);
    res.json({ message: 'Item removido.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover item.', error: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const [carrinho] = await db.query('SELECT id FROM carrinho WHERE user_id = ?', [req.user.id]);
    if (carrinho.length) {
      await db.query('DELETE FROM carrinho_itens WHERE carrinho_id = ?', [carrinho[0].id]);
    }
    res.json({ message: 'Carrinho limpo.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao limpar carrinho.', error: err.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
