// Cart management (localStorage based for speed)
const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  },
  save(items) {
    localStorage.setItem('cart', JSON.stringify(items));
    this.updateCount();
  },
  add(product, size, qty = 1) {
    const items = this.get();
    const key = `${product.id}_${size}`;
    const idx = items.findIndex(i => i.key === key);
    if (idx > -1) {
      items[idx].quantidade += qty;
    } else {
      items.push({ key, produto_id: product.id, nome: product.nome, preco: product.preco, imagem_url: product.imagem_url, tamanho: size, quantidade: qty });
    }
    this.save(items);
    showToast('Produto adicionado ao carrinho ✓');
  },
  remove(key) {
    const items = this.get().filter(i => i.key !== key);
    this.save(items);
  },
  updateQty(key, qty) {
    const items = this.get();
    const idx = items.findIndex(i => i.key === key);
    if (idx > -1) {
      if (qty <= 0) { items.splice(idx, 1); }
      else { items[idx].quantidade = qty; }
    }
    this.save(items);
  },
  total() {
    return this.get().reduce((s, i) => s + (i.preco * i.quantidade), 0);
  },
  count() {
    return this.get().reduce((s, i) => s + i.quantidade, 0);
  },
  clear() { localStorage.removeItem('cart'); this.updateCount(); },
  updateCount() {
    const el = document.getElementById('cart-count');
    if (el) { el.textContent = this.count(); el.style.display = this.count() > 0 ? 'flex' : 'none'; }
  }
};

// Init cart count on all pages
document.addEventListener('DOMContentLoaded', () => Cart.updateCount());
