const MOCK = Object.fromEntries(
    [
        { id: 1, nome: 'Camiseta Básica', preco: 129, categoria: 'camisetas', descricao: 'Essencial do guarda-roupa feminino. Confeccionada em algodão premium de toque macio, com caimento equilibrado e costuras reforçadas para durar.', destaque: true, emoji: '👕', estoque: 20, imagem_url: "../img/produtos/basica.jpg" },
        { id: 2, nome: 'Vestido Midi', preco: 289, categoria: 'vestidos', descricao: 'Comprimento midi que equilibra elegância e modernidade. Tecido fluido com leve drapeado, ideal para ocasiões que pedem sofisticação sem exagero.', destaque: true, emoji: '👗', estoque: 10, imagem_url: "../img/produtos/midi.jpg" },
        { id: 3, nome: 'Calça Skinny', preco: 199, categoria: 'calcas', descricao: 'Modelagem ajustada em tecido com elastano que garante conforto e liberdade de movimento. Valoriza a silhueta com elegância para o dia a dia.', destaque: false, emoji: '👖', estoque: 15, imagem_url: "../img/produtos/skinny.jpg" },
        { id: 4, nome: 'Camiseta Oversized', preco: 149, categoria: 'camisetas', descricao: 'Caimento amplo e despojado com ombros caídos. Feita em malha encorpada, é a peça certa para looks urbanos cheios de personalidade.', destaque: false, emoji: '👕', estoque: 25, imagem_url: "../img/produtos/oversized.jpg" },
        { id: 5, nome: 'Vestido Estampado', preco: 259, categoria: 'vestidos', descricao: 'Estampa exclusiva em tecido leve e fluido. Corte feminino que combina frescor e estilo, perfeito para compor looks vibrantes em qualquer estação.', destaque: false, emoji: '👗', estoque: 8, imagem_url: "../img/produtos/estampado.jpg" },
        { id: 6, nome: 'Calça Cargo', preco: 179, categoria: 'calcas', descricao: 'Design utilitário com bolsos laterais funcionais e modelagem relaxada. Une o estilo streetwear à praticidade do cotidiano com muito caráter.', destaque: false, emoji: '👖', estoque: 12, imagem_url: "../img/produtos/cargo.jpg" },
        { id: 7, nome: 'Camiseta Slim', preco: 159, categoria: 'camisetas', descricao: 'Modelagem slim que acompanha o corpo sem apertar. Algodão penteado de alta gramatura com acabamento clean para um visual sempre polido.', destaque: true, emoji: '👕', estoque: 18, imagem_url: "../img/produtos/slim.jpg" },
        { id: 8, nome: 'Bolsa Couro', preco: 349, categoria: 'acessorios', descricao: 'Confeccionada em couro legítimo com ferragens douradas e forro interno em camurça. Design atemporal que atravessa tendências com sofisticação.', destaque: false, emoji: '👜', estoque: 5, imagem_url: "../img/produtos/bolsa.jpg" },
        { id: 9, nome: 'Cinto de Couro', preco: 89, categoria: 'acessorios', descricao: 'Cinto em couro curtido com fivela metálica de acabamento escovado. Um detalhe discreto que eleva qualquer produção com refinamento.', destaque: false, emoji: '🪢', estoque: 30, imagem_url: "../img/produtos/cinto.jpg" },
        { id: 10, nome: 'Camiseta Estampada', preco: 169, categoria: 'camisetas', descricao: 'Arte gráfica exclusiva impressa em malha 100% algodão. Uma peça de expressão que traz identidade e atitude para o visual do dia a dia.', destaque: false, emoji: '👕', estoque: 22, imagem_url: "../img/produtos/estampa.jpg" },
        { id: 11, nome: 'Vestido Longo', preco: 319, categoria: 'vestidos', descricao: 'Silhueta fluida e elegante em tecido leve com caimento impecável. Perfeito para eventos especiais ou para quem deseja um visual sofisticado sem esforço.', destaque: true, emoji: '👗', estoque: 6, imagem_url: "../img/produtos/longo.jpg" },
        { id: 12, nome: 'Vestido Tubinho', preco: 300, categoria: 'vestidos', descricao: 'Clássico e versátil, o tubinho molda a silhueta com precisão. Tecido estruturado com leve elasticidade para um ajuste perfeito do dia à noite.', destaque: true, emoji: '👗', estoque: 6, imagem_url: "../img/produtos/tubinho.jpg" },
        { id: 13, nome: 'Calça Baggy', preco: 290, categoria: 'calcas', descricao: 'Modelagem larga e confortável com cós alto e pernas amplas. Peça-chave do guarda-roupa contemporâneo, fácil de combinar e cheia de estilo.', destaque: true, emoji: '👖', estoque: 6, imagem_url: "../img/produtos/baggy.jpg" },
        { id: 14, nome: 'Calça Wide Leg', preco: 239, categoria: 'calcas', descricao: 'Pernas largas e fluidas com cós estruturado. Corte sofisticado que alonga a silhueta e transforma qualquer composição em um look de impacto.', destaque: false, emoji: '👖', estoque: 9, imagem_url: "../img/produtos/wide.jpg" }
    ].map(p => [p.id, p])
);

let product = null;
let selectedSize = 'P';
let qty = 1;

function changeQty(d) {
    qty = Math.max(1, qty + d);
    document.getElementById('qty-display').textContent = qty;
}

document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedSize = btn.dataset.size;
    });
});

function addToCart() {
    if (!product) return;
    const btn = document.getElementById('add-btn');
    btn.innerHTML = '<span class="loading-spinner inline-block mr-2"></span>Adicionando...';
    btn.disabled = true;
    setTimeout(() => {
        Cart.add(product, selectedSize, qty);
        btn.innerHTML = '✓ Adicionado!';
        setTimeout(() => { btn.innerHTML = 'Adicionar ao Carrinho'; btn.disabled = false; }, 1500);
    }, 600);
}

async function loadProduct() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { window.location.href = 'produtos.html'; return; }
    product = MOCK[id] || MOCK[1];
    document.getElementById('breadcrumb-name').textContent = product.nome;
    document.getElementById('product-name').textContent = product.nome;
    document.getElementById('product-cat').textContent = product.categoria;
    document.getElementById('product-price').textContent = formatCurrency(product.preco);
    document.getElementById('product-desc').textContent = product.descricao || 'Produto de alta qualidade com acabamento premium.';
    const mainImg = document.getElementById('main-img');

    if (product.imagem_url) {
        mainImg.innerHTML = `<img src="${product.imagem_url}" style="width:100%;height:100%;object-fit:cover;" />`;
    } else {
        mainImg.innerHTML = `<div style="font-size:8rem;opacity:0.3">${product.emoji || '👗'}</div>`;
    }
    document.title = `${product.nome} — MAISON`;
}

document.addEventListener('DOMContentLoaded', loadProduct);
