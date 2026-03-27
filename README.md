# MAISON — E-commerce de Roupas Premium

> Stack: HTML · TailwindCSS · JavaScript · Node.js · Express · MySQL

---

## 🚀 Instalação Rápida

### 1. Pré-requisitos
- Node.js 18+
- MySQL 8+

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edite o .env com suas credenciais do MySQL

npm install

# Configurar banco de dados
npm run setup-db

# Iniciar servidor
npm run dev        # modo desenvolvimento
npm start          # modo produção
```

### 3. Frontend
Abra com Live Server (VS Code) ou qualquer servidor estático:

```bash
# Opção 1: com npx
npx serve frontend

# Opção 2: com Python
cd frontend && python -m http.server 5500
```

---

## 🔑 Credenciais Demo

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin  | admin@maison.com | admin123 |

---

## 📁 Estrutura

```
ecommerce/
├── frontend/
│   ├── pages/
│   │   ├── index.html          ← Home da loja
│   │   ├── produtos.html       ← Listagem com filtros
│   │   ├── produto.html        ← Detalhe do produto
│   │   ├── carrinho.html       ← Carrinho
│   │   ├── checkout.html       ← Finalizar compra
│   │   ├── login.html          ← Login cliente
│   │   ├── cadastro.html       ← Cadastro
│   │   ├── minha-conta.html    ← Área do cliente
│   │   └── admin/
│   │       ├── login.html      ← Login admin
│   │       └── dashboard.html  ← Painel admin completo
│   ├── css/
│   │   └── main.css            ← Design system premium
│   └── js/
│       ├── api.js              ← Helper de fetch
│       ├── cart.js             ← Gerenciamento carrinho
│       ├── home.js             ← Lógica da home
│       └── produtos.js         ← Listagem e filtros
│
└── backend/
    ├── server.js               ← Entry point Express
    ├── .env.example            ← Variáveis de ambiente
    └── src/
        ├── config/
        │   ├── db.js           ← Pool MySQL
        │   └── setupDb.js      ← Script criação DB
        ├── controllers/
        │   ├── authController.js
        │   ├── produtosController.js
        │   ├── pedidosController.js
        │   ├── usersController.js
        │   └── carrinhoController.js
        ├── middlewares/
        │   └── auth.js         ← JWT + Admin guard
        └── routes/
            └── index.js        ← Todas as rotas API
```

---

## 🔌 API Endpoints

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Perfil (auth) |

### Produtos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/produtos` | Listar (filtros: categoria, destaque, search, sort) |
| GET | `/api/produtos/:id` | Detalhes |
| POST | `/api/produtos` | Criar (admin) |
| PUT | `/api/produtos/:id` | Editar (admin) |
| DELETE | `/api/produtos/:id` | Excluir (admin) |

### Pedidos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/pedidos` | Todos (admin) |
| GET | `/api/pedidos/me` | Meus pedidos (auth) |
| POST | `/api/pedidos` | Criar (auth) |
| PUT | `/api/pedidos/:id/status` | Atualizar status (admin) |

### Carrinho
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/carrinho` | Ver carrinho (auth) |
| POST | `/api/carrinho/add` | Adicionar item (auth) |
| DELETE | `/api/carrinho/:itemId` | Remover item (auth) |

---

## 🎨 Design System

**Cores:**
- Vinho: `#6D0F1F`
- Preto: `#1A1A1A`
- Creme: `#F9F7F5`

**Tipografia:**
- Display: Cormorant Garamond (serif elegante)
- Body: Montserrat (sans-serif clean)

---

## ✅ Funcionalidades

- [x] Loja completa com filtros e busca
- [x] Carrinho com localStorage (funciona sem API)
- [x] Checkout com simulação de pagamento
- [x] Login/Cadastro com JWT
- [x] Painel Admin com Dashboard, Produtos, Pedidos, Clientes
- [x] CRUD completo de produtos
- [x] Atualização de status de pedidos
- [x] Responsivo (mobile, tablet, desktop)
- [x] Design premium com animações suaves
