async function handleAdminLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('btn');
    const txt = document.getElementById('btn-text');
    const loader = document.getElementById('btn-loader');
    const errDiv = document.getElementById('error-msg');
    txt.textContent = 'Verificando...';
    loader.classList.remove('hidden');
    btn.disabled = true;
    errDiv.classList.add('hidden');
    await new Promise(r => setTimeout(r, 800));
    try {
        const data = await API.post('/auth/login', {
            email: document.getElementById('email').value,
            senha: document.getElementById('senha').value
        }, false);
        if (data.user?.tipo !== 'admin') throw new Error('Acesso não autorizado.');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'dashboard.html';
    } catch (err) {
        // Demo fallback
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        if (email === 'admin@maison.com' && senha === 'admin123') {
            localStorage.setItem('token', 'demo-token');
            localStorage.setItem('user', JSON.stringify({ id: 1, nome: 'Admin', email, tipo: 'admin' }));
            window.location.href = 'dashboard.html';
            return;
        }
        document.getElementById('error-text').textContent = err.message || 'Credenciais inválidas.';
        errDiv.classList.remove('hidden');
        txt.textContent = 'Acessar Painel';
        loader.classList.add('hidden');
        btn.disabled = false;
    }
}
