require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./src/routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARES ────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000', 'null', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── ROUTES ─────────────────────────────────────────────────────
app.use('/api', routes);

// ─── SERVE FRONTEND ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});


app.get('/*', (req, res, next) => {
  let file = req.params[0];

  // se não tiver nada, ignora
  if (!file) return next();

  // remove barra inicial (ESSENCIAL)
  file = file.replace(/^\/+/, '');

  // ignora API
  if (file.startsWith('api')) return next();

  const filePath = path.join(__dirname, '../frontend/pages', file);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.log('❌ Não encontrou:', filePath);
      next();
    }
  });
});
// ─── ERROR HANDLER ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.message);
  res.status(500).json({ message: 'Erro interno do servidor.', error: err.message });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

// ─── START ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ███╗   ███╗ █████╗ ██╗███████╗ ██████╗ ███╗   ██╗');
  console.log('  ████╗ ████║██╔══██╗██║██╔════╝██╔═══██╗████╗  ██║');
  console.log('  ██╔████╔██║███████║██║███████╗██║   ██║██╔██╗ ██║');
  console.log('  ██║╚██╔╝██║██╔══██║██║╚════██║██║   ██║██║╚██╗██║');
  console.log('  ██║ ╚═╝ ██║██║  ██║██║███████║╚██████╔╝██║ ╚████║');
  console.log('  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝');
  console.log('');
  console.log(`  🚀 API rodando em: http://localhost:${PORT}`);
  console.log(`  📚 Endpoints:      http://localhost:${PORT}/api`);
  console.log(`  🛍️  Loja:           http://localhost:${PORT}`);
  console.log('');
});

module.exports = app;
