function renderCart() {
    const items = Cart.get();
    const container = document.getElementById('cart-items');
    const empty = document.getElementById('cart-empty');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (items.length === 0) {
        container.innerHTML = '';
        empty.classList.remove('hidden');
        checkoutBtn.style.opacity = '0.4';
        checkoutBtn.style.pointerEvents = 'none';
        document.getElementById('subtotal').textContent = formatCurrency(0);
        document.getElementById('total-val').textContent = formatCurrency(0);
        document.getElementById('frete-val').textContent = 'Grátis';
        return;
    }

    empty.classList.add('hidden');
    checkoutBtn.style.opacity = '1';
    checkoutBtn.style.pointerEvents = 'auto';

    container.innerHTML = items.map(item => `
        <div class="cart-item" id="item-${item.key}">
          <div class="cart-item-img flex items-center justify-center text-4xl">
            ${item.imagem_url ? `<img src="${item.imagem_url}" class="w-full h-full object-cover"/>` : '👕'}
          </div>
          <div>
            <div class="text-sm font-medium mb-1">${item.nome}</div>
            <div class="text-xs text-[#888] mb-3">Tamanho: ${item.tamanho}</div>
            <div class="qty-control">
              <button class="qty-btn" onclick="updateItem('${item.key}', ${item.quantidade - 1})">−</button>
              <span class="qty-num">${item.quantidade}</span>
              <button class="qty-btn" onclick="updateItem('${item.key}', ${item.quantidade + 1})">+</button>
            </div>
          </div>
          <div class="text-right flex flex-col items-end justify-between">
            <button onclick="removeItem('${item.key}')" class="text-[#aaa] hover:text-[#6D0F1F] transition-colors text-xs">✕</button>
            <div class="font-cormorant text-xl">${formatCurrency(item.preco * item.quantidade)}</div>
          </div>
        </div>
      `).join('');

    const total = Cart.total();
    const frete = total >= 299 ? 0 : 19.90;
    document.getElementById('subtotal').textContent = formatCurrency(total);
    document.getElementById('frete-val').textContent = frete === 0 ? '🎉 Grátis' : formatCurrency(frete);
    document.getElementById('total-val').textContent = formatCurrency(total + frete);
}

function updateItem(key, qty) {
    Cart.updateQty(key, qty);
    renderCart();
}

function removeItem(key) {
    const el = document.getElementById(`item-${key}`);
    if (el) { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; }
    setTimeout(() => { Cart.remove(key); renderCart(); }, 300);
}

function applyCoupon() {
    showToast('Cupom inválido ou expirado', 'error');
}

document.addEventListener('DOMContentLoaded', renderCart);
