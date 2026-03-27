const MOCK_PRODUCTS = [ //Se for alterar, tem que ser no banco
  { id: 13, nome: 'Calça Baggy', preco: 129, categoria: 'calca', imagem_url: '../img/produtos/baggy.jpg', destaque: true },
  { id: 2, nome: 'Vestido Midi', preco: 289, categoria: 'vestidos', imagem_url: '../img/produtos/midi.jpg', destaque: true },
  { id: 7, nome: 'Camiseta Slim', preco: 159, categoria: 'camisetas', imagem_url: '../img/produtos/slim.jpg', destaque: true },
  { id: 11, nome: 'Vestido Longo', preco: 319, categoria: 'vestidos', imagem_url: '../img/produtos/longo.jpg', destaque: true },
];

// Guarda os produtos carregados (API ou mock) para o quickAdd funcionar
let loadedProducts = [];

function createProductCard(p) {
  let imagem = p.imagem_url || '';
  if (imagem && !imagem.startsWith('../') && !imagem.startsWith('http')) {
    imagem = '../' + imagem.replace(/^\//, '');
  }

  const imageHtml = imagem
    ? `<img src="${imagem}" alt="${p.nome}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" onerror="this.parentElement.innerHTML='<div class=product-placeholder>👗</div>'"/>`
    : `<div class="product-placeholder">${p.emoji || '👗'}</div>`;

  return `
  <div class="group cursor-pointer">
    <a href="produto.html?id=${p.id}" class="block">
      <div class="relative overflow-hidden aspect-[3/4] mb-4 bg-[#F2F0EE]">
        ${imageHtml}
        ${p.destaque ? '<span class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 text-[#1a1a1a] z-10">Destaque</span>' : ''}
        <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <button onclick="event.preventDefault(); quickAdd(${p.id})" 
                class="absolute bottom-4 left-4 right-4 bg-white text-[#1a1a1a] text-[10px] tracking-[0.2em] uppercase py-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#1a1a1a] hover:text-white">
          Adicionar ao Carrinho
        </button>
      </div>
    </a>
    <a href="produto.html?id=${p.id}">
      <h3 class="text-[11px] tracking-[0.2em] uppercase font-medium text-[#1a1a1a]">${p.nome}</h3>
      <p class="font-cormorant text-lg text-[#6D0F1F] mt-1">R$ ${p.preco},00</p>
    </a>
  </div>`;
}

async function loadDestaques() {
  const container = document.getElementById('produtos-destaque');
  if (!container) return;

  try {
    const data = await API.get('/produtos?destaque=true&limit=4', false);
    loadedProducts = (data.produtos && data.produtos.length > 0) ? data.produtos : MOCK_PRODUCTS;
  } catch (error) {
    loadedProducts = MOCK_PRODUCTS;
  }

  container.innerHTML = loadedProducts.map(createProductCard).join('');
}

// Agora busca nos produtos realmente carregados, não só no mock
function quickAdd(id) {
  const item = loadedProducts.find(p => p.id === id);
  if (item) {
    Cart.add({
      id: item.id,
      nome: item.nome,
      preco: item.preco,
      imagem_url: item.imagem_url
    }, 'M');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDestaques();

  // Navbar scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
    });
  }

  // Mobile menu
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  }

  // Parallax
  const heroImg = document.getElementById('hero-img');
  if (heroImg && window.matchMedia('(min-width: 768px)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          heroImg.style.transform = `translateY(${window.scrollY * 0.4}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}); 