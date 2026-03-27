const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
  });

  const SQL = `
    CREATE DATABASE IF NOT EXISTS ecommerce_roupas
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    USE ecommerce_roupas;

    CREATE TABLE IF NOT EXISTS usuarios (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      nome          VARCHAR(100) NOT NULL,
      email         VARCHAR(150) NOT NULL UNIQUE,
      senha         VARCHAR(255) NOT NULL,
      tipo          ENUM('admin','cliente') NOT NULL DEFAULT 'cliente',
      data_criacao  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email (email)
    );

    CREATE TABLE IF NOT EXISTS produtos (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      nome          VARCHAR(150) NOT NULL,
      descricao     TEXT,
      preco         DECIMAL(10,2) NOT NULL,
      categoria     ENUM('camisetas','calcas','moletons','acessorios') NOT NULL,
      tamanho       VARCHAR(50),
      cor           VARCHAR(80),
      imagem_url    VARCHAR(500),
      estoque       INT NOT NULL DEFAULT 0,
      destaque      TINYINT(1) NOT NULL DEFAULT 0,
      data_criacao  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_categoria (categoria),
      INDEX idx_destaque (destaque)
    );

    CREATE TABLE IF NOT EXISTS carrinho (
      id        INT AUTO_INCREMENT PRIMARY KEY,
      user_id   INT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS carrinho_itens (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      carrinho_id INT NOT NULL,
      produto_id  INT NOT NULL,
      quantidade  INT NOT NULL DEFAULT 1,
      tamanho     VARCHAR(10),
      FOREIGN KEY (carrinho_id) REFERENCES carrinho(id) ON DELETE CASCADE,
      FOREIGN KEY (produto_id)  REFERENCES produtos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      user_id          INT NOT NULL,
      total            DECIMAL(10,2) NOT NULL,
      status           ENUM('pendente','pago','enviado','entregue','cancelado') DEFAULT 'pendente',
      endereco         TEXT,
      metodo_pagamento VARCHAR(50),
      data_criacao     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      INDEX idx_user (user_id),
      INDEX idx_status (status)
    );

    CREATE TABLE IF NOT EXISTS pedido_itens (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      pedido_id   INT NOT NULL,
      produto_id  INT NOT NULL,
      quantidade  INT NOT NULL,
      preco       DECIMAL(10,2) NOT NULL,
      tamanho     VARCHAR(10),
      FOREIGN KEY (pedido_id)  REFERENCES pedidos(id) ON DELETE CASCADE,
      FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT
    );

    -- ADMIN padrão (senha: admin123)
    INSERT IGNORE INTO usuarios (nome, email, senha, tipo) VALUES
    ('Administrador', 'admin@maison.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

    -- Produtos mockados
    INSERT IGNORE INTO produtos (id, nome, descricao, preco, categoria, tamanho, cor, estoque, destaque) VALUES
    (1, 'Camiseta Essencial', 'Camiseta de algodão premium, corte regular. Perfeita para o dia a dia.', 129.00, 'camisetas', 'P,M,G,GG', 'Preto', 20, 1),
    (2, 'Moletom Velvet', 'Moletom de veludo suave com capuz. Design atemporal e caimento perfeito.', 289.00, 'moletons', 'P,M,G,GG', 'Vinho', 10, 1),
    (3, 'Calça Slim Fit', 'Calça com corte slim em tecido premium. Combina com qualquer look.', 199.00, 'calcas', 'P,M,G,GG', 'Azul Escuro', 15, 0),
    (4, 'Camiseta Oversized', 'Camiseta oversized com tecido encorpado. Estilo urbano e confortável.', 149.00, 'camisetas', 'P,M,G,GG', 'Branco', 25, 0),
    (5, 'Moletom Comfort', 'Moletom sem capuz em fleece premium. Leveza e conforto incomparáveis.', 259.00, 'moletons', 'P,M,G,GG', 'Cinza Mescla', 8, 0),
    (6, 'Calça Jogger', 'Calça jogger com elastano. Mobilidade total sem abrir mão do estilo.', 179.00, 'calcas', 'P,M,G,GG', 'Preto', 12, 0),
    (7, 'Camiseta Gráfica', 'Camiseta com estampa exclusiva da coleção. Arte contemporânea no seu look.', 159.00, 'camisetas', 'P,M,G,GG', 'Vinho', 18, 1),
    (8, 'Bolsa Couro Vegano', 'Bolsa em couro vegano com acabamento premium. Espaçosa e elegante.', 349.00, 'acessorios', 'Único', 'Caramelo', 5, 0),
    (9, 'Cinto Artesanal', 'Cinto em couro legítimo com fivela dourada. Acabamento artesanal exclusivo.', 89.00, 'acessorios', 'P,M,G', 'Preto', 30, 0),
    (10, 'Camiseta Polo', 'Polo clássica em piquet premium. Elegância casual para qualquer ocasião.', 169.00, 'camisetas', 'P,M,G,GG', 'Navy', 22, 0),
    (11, 'Moletom Premium', 'Moletom de lã merino com costura reforçada. A peça mais luxuosa da coleção.', 319.00, 'moletons', 'P,M,G,GG', 'Preto', 6, 1),
    (12, 'Calça Alfaiataria', 'Calça de alfaiataria em tecido italiano. Elegância sofisticada e versátil.', 239.00, 'calcas', 'P,M,G,GG', 'Carvão', 9, 0);
  `;

  try {
    await conn.query(SQL);
    console.log('✅ Banco de dados configurado com sucesso!');
    console.log('📧 Admin: admin@maison.com | Senha: admin123');
  } catch (err) {
    console.error('❌ Erro ao configurar banco:', err.message);
  } finally {
    await conn.end();
  }
}

setupDatabase();
