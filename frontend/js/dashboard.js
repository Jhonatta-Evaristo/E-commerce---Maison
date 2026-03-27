// AUTH CHECK
const user = getUser();
if (user) document.getElementById('admin-name').textContent = user.nome || 'Admin';

// DADOS REAIS DA API
let allProducts = [];
let allOrders = [];
let allClients = [];
let currentOrderFilter = '';
let editingId = null;

// Formata data ISO para dd/mm/aaaa
function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR');
}

// Carrega todos os dados da API ao iniciar
async function loadDashboardData() {
    try {
        const [prodRes, pedRes, userRes] = await Promise.all([
            API.get('/produtos', false),
            API.get('/pedidos'),
            API.get('/users'),
        ]);
        allProducts = prodRes.produtos || [];

        allOrders = (pedRes.pedidos || []).map(o => ({
            id: o.id,
            cliente: o.cliente_nome || '—',
            email: o.cliente_email || '—',
            user_id: o.user_id,
            total: parseFloat(o.total) || 0,
            pagamento: o.metodo_pagamento || '—',
            status: o.status,
            data: formatDate(o.data_criacao),
            data_criacao: new Date(o.data_criacao),
        }));

        // Enriquece clientes com pedidos e total gasto
        const rawUsers = (userRes.users || []).filter(u => u.tipo !== 'admin');
        allClients = rawUsers.map(u => {
            const pedidosDoCliente = allOrders.filter(o => o.user_id === u.id);
            const totalGasto = pedidosDoCliente
                .filter(o => ['pago', 'enviado', 'entregue'].includes(o.status))
                .reduce((s, o) => s + o.total, 0);
            return {
                id: u.id,
                nome: u.nome,
                email: u.email,
                pedidos: pedidosDoCliente.length,
                gasto: totalGasto,
                cadastro: formatDate(u.data_criacao),
            };
        });

        updateDashboardCards();
        renderSalesChart();
    } catch (err) {
        console.error('Erro ao carregar dados:', err);
        showToast('Erro ao carregar dados do servidor', 'error');
    }
}

function updateDashboardCards() {
    const pedidosPagos = allOrders.filter(o => ['pago', 'enviado', 'entregue'].includes(o.status));
    const receita = pedidosPagos.reduce((s, o) => s + o.total, 0);
    const totalPedidos = allOrders.length;
    const totalClientes = allClients.length;
    const ticket = pedidosPagos.length > 0 ? receita / pedidosPagos.length : 0;

    const agora = new Date();
    const pedidosMes = allOrders.filter(o =>
        o.data_criacao.getMonth() === agora.getMonth() &&
        o.data_criacao.getFullYear() === agora.getFullYear()
    ).length;

    document.getElementById('stat-receita').textContent = formatCurrency(receita);
    document.getElementById('stat-pedidos').textContent = totalPedidos;
    document.getElementById('stat-clientes').textContent = totalClientes;
    document.getElementById('stat-ticket').textContent = formatCurrency(ticket);

    const subReceita = document.getElementById('stat-receita-sub');
    const subPedidos = document.getElementById('stat-pedidos-sub');
    const subClientes = document.getElementById('stat-clientes-sub');
    const subTicket = document.getElementById('stat-ticket-sub');
    if (subReceita) subReceita.textContent = pedidosPagos.length > 0 ? pedidosPagos.length + ' pedidos pagos' : 'nenhum pedido pago';
    if (subPedidos) subPedidos.textContent = pedidosMes > 0 ? '+' + pedidosMes + ' este mês' : 'nenhum este mês';
    if (subClientes) subClientes.textContent = totalClientes + ' cadastrados';
    if (subTicket) subTicket.textContent = ticket > 0 ? 'por pedido pago' : 'sem dados';

    const recentTbody = document.getElementById('recent-orders-tbody');
    if (recentTbody) {
        const recent = allOrders.slice(0, 5);
        recentTbody.innerHTML = recent.length
            ? recent.map(o =>
                '<tr>' +
                '<td class="font-medium">#' + o.id + '</td>' +
                '<td class="text-sm">' + o.cliente + '</td>' +
                '<td class="font-cormorant text-base">' + formatCurrency(o.total) + '</td>' +
                '<td><span class="badge badge-' + o.status + '">' + o.status + '</span></td>' +
                '<td class="text-xs text-[#888]">' + o.data + '</td>' +
                '</tr>').join('')
            : '<tr><td colspan="5" class="text-center text-[#aaa] text-sm py-4">Nenhum pedido ainda</td></tr>';
    }
}

function renderSalesChart() {
    const hoje = new Date();
    const labels = [];
    const valores = [];
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(hoje);
        d.setDate(hoje.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const dFim = new Date(d);
        dFim.setHours(23, 59, 59, 999);
        labels.push(diasSemana[d.getDay()]);
        const total = allOrders
            .filter(o => {
                const dc = o.data_criacao;
                return dc >= d && dc <= dFim && ['pago', 'enviado', 'entregue'].includes(o.status);
            })
            .reduce((s, o) => s + o.total, 0);
        valores.push(total);
    }

    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    if (window._salesChart) window._salesChart.destroy();
    window._salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data: valores,
                borderColor: '#6D0F1F',
                backgroundColor: 'rgba(109,15,31,0.05)',
                borderWidth: 2,
                pointBackgroundColor: '#6D0F1F',
                pointRadius: 4,
                fill: true,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            layout: {
                padding: { right: 8 }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: {
                        font: { size: 10 },
                        color: '#aaa',
                        callback: function (v) { return 'R$' + v.toLocaleString('pt-BR'); }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 }, color: '#aaa', maxRotation: 0 }
                }
            }
        }
    });

    // Gráfico de categorias com dados reais
    const catCount = {};
    allProducts.forEach(function (p) { catCount[p.categoria] = (catCount[p.categoria] || 0) + 1; });
    const catLabels = Object.keys(catCount);
    const catData = Object.values(catCount);
    const catColors = ['#6D0F1F', '#1a1a1a', '#888', '#d4c5b8', '#c4a882', '#555'];
    const ctxCat = document.getElementById('catChart');
    if (ctxCat) {
        if (window._catChart) window._catChart.destroy();
        window._catChart = new Chart(ctxCat, {
            type: 'doughnut',
            data: {
                labels: catLabels.length ? catLabels : ['Sem produtos'],
                datasets: [{ data: catData.length ? catData : [1], backgroundColor: catColors, borderWidth: 0 }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '55%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { size: 10 }, color: '#555', boxWidth: 10, padding: 12 }
                    }
                }
            }
        });
    }
}

function showSection(name) {
    ['dashboard', 'produtos', 'pedidos', 'clientes'].forEach(s => {
        document.getElementById(`section-${s}`).classList.add('hidden');
    });
    document.getElementById(`section-${name}`).classList.remove('hidden');

    document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
    event.currentTarget && event.currentTarget.classList.add('active');

    const titles = { dashboard: ['Dashboard', 'Visão geral do negócio'], produtos: ['Produtos', 'Gerenciar catálogo'], pedidos: ['Pedidos', 'Gerenciar pedidos'], clientes: ['Clientes', 'Base de clientes'] };
    if (titles[name]) {
        document.getElementById('page-title').textContent = titles[name][0];
        document.getElementById('page-sub').textContent = titles[name][1];
    }

    if (name === 'produtos') renderProducts(allProducts);
    if (name === 'pedidos') renderOrders(allOrders);
    if (name === 'clientes') renderClients();
}

// CHARTS + INIT
window.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardData();

});

// PRODUCTS
function renderProducts(list) {
    document.getElementById('prod-tbody').innerHTML = list.map(p => `
        <tr>
          <td>
            <div class="font-medium text-sm">${p.nome}</div>
            <div class="text-[10px] text-[#aaa]">${p.cor || ''}</div>
          </td>
          <td><span class="text-xs capitalize">${p.categoria}</span></td>
          <td class="font-cormorant text-base">${formatCurrency(p.preco)}</td>
          <td>
            <span class="${p.estoque < 5 ? 'text-red-500 font-medium' : 'text-[#555]'} text-sm">${p.estoque}</span>
          </td>
          <td>${p.destaque ? '<span class="badge badge-pago">Sim</span>' : '<span class="text-[#ccc] text-xs">—</span>'}</td>
          <td>
            <div class="flex gap-3">
              <button onclick="editProduct(${p.id})" class="text-xs text-[#6D0F1F] hover:underline">Editar</button>
              <button onclick="deleteProduct(${p.id})" class="text-xs text-[#aaa] hover:text-red-500">Excluir</button>
            </div>
          </td>
        </tr>
      `).join('');
}

function filterProducts() {
    const q = document.getElementById('prod-search').value.toLowerCase();
    const cat = document.getElementById('prod-cat-filter').value;
    let list = allProducts.filter(p =>
        (!q || p.nome.toLowerCase().includes(q)) &&
        (!cat || p.categoria === cat)
    );
    renderProducts(list);
}

function openProductModal(product = null) {
    editingId = product?.id || null;
    document.getElementById('modal-title').textContent = product ? 'Editar Produto' : 'Novo Produto';
    document.getElementById('p-nome').value = product?.nome || '';
    document.getElementById('p-desc').value = product?.descricao || '';
    document.getElementById('p-preco').value = product?.preco || '';
    document.getElementById('p-estoque').value = product?.estoque || '';
    document.getElementById('p-cat').value = product?.categoria || 'camisetas';
    document.getElementById('p-cor').value = product?.cor || '';
    document.getElementById('p-img').value = product?.imagem_url || '';
    document.getElementById('p-destaque').checked = product?.destaque || false;
    document.getElementById('product-modal').classList.remove('hidden');
}

function editProduct(id) {
    const p = allProducts.find(x => x.id === id);
    if (p) openProductModal(p);
}

async function deleteProduct(id) {
    if (!confirm('Excluir este produto?')) return;
    try {
        await API.delete(`/produtos/${id}`);
        const res = await API.get('/produtos', false);
        allProducts = res.produtos || [];
        renderProducts(allProducts);
        showToast('Produto excluído');
    } catch {
        showToast('Erro ao excluir produto', 'error');
    }
}

async function saveProduct(e) {
    e.preventDefault();
    const txt = document.getElementById('save-txt');
    const loader = document.getElementById('save-loader');
    txt.textContent = 'Salvando...';
    loader.classList.remove('hidden');

    const prod = {
        id: editingId || Date.now(),
        nome: document.getElementById('p-nome').value,
        descricao: document.getElementById('p-desc').value,
        preco: parseFloat(document.getElementById('p-preco').value),
        estoque: parseInt(document.getElementById('p-estoque').value),
        categoria: document.getElementById('p-cat').value,
        cor: document.getElementById('p-cor').value,
        imagem_url: document.getElementById('p-img').value,
        destaque: document.getElementById('p-destaque').checked,
    };

    // Chama API e recarrega lista real
    try {
        if (editingId) await API.put(`/produtos/${editingId}`, prod);
        else await API.post('/produtos', prod);
        const res = await API.get('/produtos', false);
        allProducts = res.produtos || [];
    } catch (err) {
        showToast('Erro ao salvar no servidor', 'error');
    }

    renderProducts(allProducts);
    closeModal();
    showToast(editingId ? 'Produto atualizado!' : 'Produto criado!');
    txt.textContent = 'Salvar Produto';
    loader.classList.add('hidden');
}

function closeModal() { document.getElementById('product-modal').classList.add('hidden'); }
function closeModalOutside(e) { if (e.target === e.currentTarget) closeModal(); }

async function updateOrderStatus(id, status) {
    try {
        await API.put(`/pedidos/${id}/status`, { status });
        // Atualiza localmente sem precisar recarregar tudo
        const o = allOrders.find(x => x.id == id);
        if (o) o.status = status;
        showToast(`Status atualizado: ${status}`);
    } catch {
        showToast('Erro ao atualizar status', 'error');
    }
}

function renderOrders(list) {
    document.getElementById('orders-tbody').innerHTML = list.map(o => `
        <tr>
          <td class="font-medium">#${o.id}</td>
          <td>
            <div class="text-sm">${o.cliente}</div>
            <div class="text-[10px] text-[#aaa]">${o.email}</div>
          </td>
          <td class="font-cormorant text-base">${formatCurrency(o.total)}</td>
          <td class="capitalize text-xs">${o.pagamento}</td>
          <td><span class="badge badge-${o.status}">${o.status}</span></td>
          <td class="text-xs text-[#888]">${o.data}</td>
          <td>
            <select class="form-select text-xs w-32 py-1 px-2" onchange="updateOrderStatus('${o.id}', this.value)">
              <option ${o.status === 'pendente' ? 'selected' : ''}>pendente</option>
              <option ${o.status === 'pago' ? 'selected' : ''}>pago</option>
              <option ${o.status === 'enviado' ? 'selected' : ''}>enviado</option>
              <option ${o.status === 'entregue' ? 'selected' : ''}>entregue</option>
            </select>
          </td>
        </tr>
      `).join('');
}

function filterOrders(btn) {
    currentOrderFilter = btn.dataset.status;
    document.querySelectorAll('[data-status]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = allOrders.filter(o => !currentOrderFilter || o.status === currentOrderFilter);
    renderOrders(filtered);
}

// CLIENTS
function renderClients() {
    document.getElementById('clients-tbody').innerHTML = allClients.length
        ? allClients.map(function (c) {
            return '<tr>' +
                '<td class="font-medium text-sm">' + c.nome + '</td>' +
                '<td class="text-xs text-[#888]">' + c.email + '</td>' +
                '<td class="text-center">' + c.pedidos + '</td>' +
                '<td class="font-cormorant text-base">' + (c.gasto > 0 ? formatCurrency(c.gasto) : '—') + '</td>' +
                '<td class="text-xs text-[#888]">' + c.cadastro + '</td>' +
                '</tr>';
        }).join('')
        : '<tr><td colspan="5" class="text-center text-[#aaa] text-sm py-6">Nenhum cliente cadastrado ainda</td></tr>';
}
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-admin-menu');
    menu.classList.toggle('open');
}

function closeMobileMenu() {
    document.getElementById('mobile-admin-menu').classList.remove('open');
}
