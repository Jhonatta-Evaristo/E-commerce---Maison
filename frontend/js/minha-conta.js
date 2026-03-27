const MOCK_PEDIDOS = [
    { id: '10042', total: 289, status: 'pago', metodo_pagamento: 'pix', data_criacao: '2025-03-23', itens: [{ nome: 'Moletom Velvet', quantidade: 1, preco: 289 }] },
    { id: '10038', total: 298, status: 'entregue', metodo_pagamento: 'cartao', data_criacao: '2025-03-10', itens: [{ nome: 'Camiseta Essencial', quantidade: 2, preco: 129 }, { nome: 'Cinto Artesanal', quantidade: 1, preco: 89 }] },
];

function showTab(tab) {
    ['pedidos', 'dados'].forEach(t => document.getElementById(`tab-${t}`).classList.toggle('hidden', t !== tab));
    document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function renderPedidos(list) {
    const el = document.getElementById('pedidos-list');
    if (!list.length) {
        el.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><p class="text-sm text-[#888]">Nenhum pedido ainda</p><a href="produtos.html" class="btn-primary mt-4 inline-block text-xs">Comprar agora</a></div>`;
        return;
    }
    el.innerHTML = list.map(p => `
        <div class="bg-white p-6 mb-4">
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="text-xs text-[#888] mb-1">Pedido #${p.id}</div>
              <div class="text-xs text-[#888]">${new Date(p.data_criacao).toLocaleDateString('pt-BR')}</div>
            </div>
            <div class="text-right">
              <span class="badge badge-${p.status}">${p.status}</span>
              <div class="font-cormorant text-xl mt-1">${formatCurrency(p.total)}</div>
            </div>
          </div>
          <div class="border-t border-gray-100 pt-4">
            ${(p.itens || []).map(i => `
              <div class="flex justify-between text-xs text-[#666] py-1">
                <span>${i.nome} × ${i.quantidade}</span>
                <span>${formatCurrency(i.preco * i.quantidade)}</span>
              </div>
            `).join('')}
          </div>
          <div class="mt-3 text-xs text-[#888]">Pagamento: <span class="capitalize">${p.metodo_pagamento}</span></div>
        </div>
      `).join('');
}

async function init() {
    const user = getUser();
    if (!user) { window.location.href = 'login.html'; return; }

    document.getElementById('user-avatar').textContent = user.nome?.charAt(0)?.toUpperCase() || '?';
    document.getElementById('user-name').textContent = user.nome;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('edit-nome').value = user.nome;
    document.getElementById('edit-email').value = user.email;

    try {
        const data = await API.get('/pedidos/me');
        renderPedidos(data.pedidos || []);
    } catch {
        renderPedidos(MOCK_PEDIDOS);
    }
}

document.addEventListener('DOMContentLoaded', init);
