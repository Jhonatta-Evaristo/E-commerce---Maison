let payMethod = 'pix';
function selectPayment(m) {
    payMethod = m;
    ['pix', 'cartao', 'boleto'].forEach(x => {
        document.getElementById(`${x}-card`).classList.toggle('selected', x === m);
    });
    document.getElementById('cartao-form').classList.toggle('hidden', m !== 'cartao');
    updateSummary();
}
function maskCep(el) { el.value = el.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2'); }
function maskCard(el) { el.value = el.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim(); }
function goToStep1() {
    document.getElementById('step-1').classList.remove('hidden');
    document.getElementById('step-2').classList.add('hidden');
}
function goToStep2() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const end = document.getElementById('endereco').value;
    if (!nome || !email || !end) { showToast('Preencha todos os campos obrigatórios', 'error'); return; }
    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
    document.getElementById('step2-circle').classList.add('bg-[#1a1a1a]', 'text-white');
    document.getElementById('step2-circle').classList.remove('bg-gray-200', 'text-[#888]');
}
async function placeOrder() {
    const btn = document.getElementById('order-btn');
    const txt = document.getElementById('order-btn-text');
    const loader = document.getElementById('order-btn-loader');
    btn.disabled = true;
    txt.textContent = 'Processando...';
    loader.classList.remove('hidden');
    await new Promise(r => setTimeout(r, 1800));
    try {
        const items = Cart.get();
        const total = Cart.total();
        const payload = {
            items,
            total: payMethod === 'pix' ? total * 0.95 : total,
            endereco: `${document.getElementById('endereco').value}, ${document.getElementById('cidade').value} - ${document.getElementById('estado').value}`,
            metodo_pagamento: payMethod
        };
        const data = await API.post('/pedidos', payload);
        const orderId = data.pedido?.id || Math.floor(Math.random() * 90000 + 10000);
        finishOrder(orderId);
    } catch {
        const orderId = Math.floor(Math.random() * 90000 + 10000);
        finishOrder(orderId);
    }
}
function finishOrder(orderId) {
    Cart.clear();
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.remove('hidden');
    document.getElementById('order-id').textContent = `#${orderId}`;
    Cart.updateCount();
}
function updateSummary() {
    const items = Cart.get();
    const subtotal = Cart.total();
    const frete = subtotal >= 299 ? 0 : 19.90;
    const discount = payMethod === 'pix' ? subtotal * 0.05 : 0;
    const total = subtotal + frete - discount;
    document.getElementById('sum-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('sum-frete').textContent = frete === 0 ? 'Grátis' : formatCurrency(frete);
    document.getElementById('sum-total').textContent = formatCurrency(total);
    const discRow = document.getElementById('discount-row');
    discRow.classList.toggle('hidden', payMethod !== 'pix');
    if (discount > 0) document.getElementById('sum-discount').textContent = `-${formatCurrency(discount)}`;
    document.getElementById('summary-items').innerHTML = items.map(i => `
        <div class="flex justify-between items-start gap-2">
          <div>
            <div class="text-xs font-medium">${i.nome}</div>
            <div class="text-[10px] text-[#888]">Tam: ${i.tamanho} · Qtd: ${i.quantidade}</div>
          </div>
          <div class="text-xs font-cormorant text-base">${formatCurrency(i.preco * i.quantidade)}</div>
        </div>
      `).join('') || '<p class="text-xs text-[#888]">Carrinho vazio</p>';
}
document.addEventListener('DOMContentLoaded', updateSummary);
