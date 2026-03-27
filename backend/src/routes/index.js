const express = require('express');
const router = express.Router();

const authCtrl     = require('../controllers/authController');
const prodCtrl     = require('../controllers/produtosController');
const pedCtrl      = require('../controllers/pedidosController');
const userCtrl     = require('../controllers/usersController');
const cartCtrl     = require('../controllers/carrinhoController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// AUTH
router.post('/auth/register', authCtrl.register);
router.post('/auth/login',    authCtrl.login);
router.get('/auth/me',        authMiddleware, authCtrl.me);

// PRODUTOS (público GET, admin para escrita)
router.get('/produtos',     prodCtrl.getAll);
router.get('/produtos/:id', prodCtrl.getById);
router.post('/produtos',    authMiddleware, adminMiddleware, prodCtrl.create);
router.put('/produtos/:id', authMiddleware, adminMiddleware, prodCtrl.update);
router.delete('/produtos/:id', authMiddleware, adminMiddleware, prodCtrl.remove);

// PEDIDOS
router.get('/pedidos',           authMiddleware, adminMiddleware, pedCtrl.getAll);
router.get('/pedidos/me',        authMiddleware, pedCtrl.getMyOrders);
router.post('/pedidos',          authMiddleware, pedCtrl.create);
router.put('/pedidos/:id/status',authMiddleware, adminMiddleware, pedCtrl.updateStatus);

// USUÁRIOS (admin)
router.get('/users',     authMiddleware, adminMiddleware, userCtrl.getAll);
router.get('/users/:id', authMiddleware, adminMiddleware, userCtrl.getById);

// CARRINHO
router.get('/carrinho',              authMiddleware, cartCtrl.getCart);
router.post('/carrinho/add',         authMiddleware, cartCtrl.addToCart);
router.delete('/carrinho/:itemId',   authMiddleware, cartCtrl.removeFromCart);
router.delete('/carrinho',           authMiddleware, cartCtrl.clearCart);

// HEALTH
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

module.exports = router;
