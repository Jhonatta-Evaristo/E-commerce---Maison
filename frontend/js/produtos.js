const MOCK_ALL = [
  { id: 1, nome: 'Camiseta Básica', preco: 129, categoria: 'camisetas', destaque: false, emoji: '👕', estoque: 20, imagem_url: "../img/produtos/basica.jpg" },
  { id: 2, nome: 'Vestido Midi', preco: 289, categoria: 'vestidos', destaque: true, emoji: '👗', estoque: 10, imagem_url: "../img/produtos/midi.jpg" },
  { id: 3, nome: 'Calça Skinny', preco: 199, categoria: 'calcas', destaque: false, emoji: '👖', estoque: 15, imagem_url: "../img/produtos/skinny.jpg" },
  { id: 4, nome: 'Camiseta Oversized', preco: 149, categoria: 'camisetas', destaque: false, emoji: '👕', estoque: 25, imagem_url: "../img/produtos/oversized.jpg" },
  { id: 5, nome: 'Vestido Estampado', preco: 259, categoria: 'vestidos', destaque: false, emoji: '👗', estoque: 8, imagem_url: "../img/produtos/estampado.jpg" },
  { id: 6, nome: 'Calça Cargo', preco: 179, categoria: 'calcas', destaque: false, emoji: '👖', estoque: 12, imagem_url: "../img/produtos/cargo.jpg" },
  { id: 7, nome: 'Camiseta Slim', preco: 159, categoria: 'camisetas', destaque: true, emoji: '👕', estoque: 18, imagem_url: "../img/produtos/slim.jpg" },
  { id: 8, nome: 'Bolsa Couro', preco: 349, categoria: 'acessorios', destaque: false, emoji: '👜', estoque: 5, imagem_url: "../img/produtos/bolsa.jpg" },
  { id: 9, nome: 'Cinto de Couro', preco: 89, categoria: 'acessorios', destaque: false, emoji: '🧣', estoque: 30, imagem_url: "../img/produtos/cinto.jpg" },
  { id: 10, nome: 'Camiseta Estampada', preco: 169, categoria: 'camisetas', destaque: false, emoji: '👕', estoque: 22, imagem_url: "../img/produtos/estampa.jpg" },
  { id: 11, nome: 'Vestido Longo', preco: 319, categoria: 'vestidos', destaque: true, emoji: '👗', estoque: 6, imagem_url: "../img/produtos/longo.jpg" },
  { id: 12, nome: 'Vestido Tubinho', preco: 300, categoria: 'vestidos', destaque: false, emoji: '👗', estoque: 6, imagem_url: "../img/produtos/tubinho.jpg" },
  { id: 13, nome: 'Calça Baggy', preco: 290, categoria: 'calcas', destaque: true, emoji: '👖', estoque: 9, imagem_url: "../img/produtos/baggy.jpg" },
  { id: 14, nome: 'Calça Wide Leg', preco: 239, categoria: 'calcas', destaque: false, emoji: '👖', estoque: 9, imagem_url: "../img/produtos/wide.jpg" },
];

let allProducts = [];
let filters = { cat: '', search: '', sort: '' };

function createProductCard(p) {
  return `
  <a href="produto.html?id=${p.id}" class="product-card fade-in-up">
    <div class="product-card-img">
      ${p.imagem_url
      ? `<img src="${p.imagem_url}" alt="${p.nome}" loading="lazy"/>`
      : `<div class="product-placeholder">${p.emoji || '👗'}</div>`}
      ${p.destaque ? '<span class="product-tag">Destaque</span>' : ''}
      <div class="product-card-actions">
        <button onclick="event.preventDefault();addToCart(${p.id})" class="w-full btn-primary py-2.5">
          Adicionar
        </button>
      </div>
    </div>
    <div class="mt-3">
      <div class="product-name">${p.nome}</div>
      <div class="text-xs text-[#888] mb-1 capitalize">${p.categoria}</div>
      <div class="product-price">${formatCurrency(p.preco)}</div>
    </div>
  </a>`;
}

function applyFilters() {
  let list = [...allProducts];
  if (filters.cat) list = list.filter(p => p.categoria === filters.cat);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(p => p.nome.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
  }
  if (filters.sort === 'preco_asc') list.sort((a, b) => a.preco - b.preco);
  if (filters.sort === 'preco_desc') list.sort((a, b) => b.preco - a.preco);
  if (filters.sort === 'nome_asc') list.sort((a, b) => a.nome.localeCompare(b.nome));

  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('empty-state');
  const count = document.getElementById('result-count');

  if (list.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    grid.innerHTML = list.map(createProductCard).join('');
  }
  count.textContent = `${list.length} produto${list.length !== 1 ? 's' : ''} encontrado${list.length !== 1 ? 's' : ''}`;
}

function resetFilters() {
  filters = { cat: '', search: '', sort: '' };
  document.getElementById('search').value = '';
  document.getElementById('sort-select').value = '';
  document.querySelectorAll('[data-cat]').forEach(b => b.classList.toggle('active', b.dataset.cat === ''));
  applyFilters();
}

function addToCart(id) {
  const p = allProducts.find(x => x.id === id);
  if (p) Cart.add(p, 'M');
}

async function init() {
  // Read URL params
  const params = new URLSearchParams(window.location.search);
  if (params.get('cat')) {
    filters.cat = params.get('cat');
    document.querySelectorAll('[data-cat]').forEach(b => b.classList.toggle('active', b.dataset.cat === filters.cat));
  }

  allProducts = MOCK_ALL;
  applyFilters();

  // Category filter buttons
  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      filters.cat = btn.dataset.cat;
      document.querySelectorAll('[data-cat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  // Search
  let searchTimer;
  document.getElementById('search').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { filters.search = e.target.value; applyFilters(); }, 300);
  });

  // Sort
  document.getElementById('sort-select').addEventListener('change', e => {
    filters.sort = e.target.value;
    applyFilters();
  });
}

document.addEventListener('DOMContentLoaded', init);
