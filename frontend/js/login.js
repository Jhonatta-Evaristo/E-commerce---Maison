function togglePass() {
    const inp = document.getElementById('senha');
    inp.type = inp.type === 'password' ? 'text' : 'password';
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    const txt = document.getElementById('btn-text');
    const loader = document.getElementById('btn-loader');
    const errDiv = document.getElementById('error-msg');
    const errTxt = document.getElementById('error-text');

    txt.textContent = 'Entrando...';
    loader.classList.remove('hidden');
    btn.disabled = true;
    errDiv.classList.add('hidden');

    try {
        const data = await API.post('/auth/login', {
            email: document.getElementById('email').value,
            senha: document.getElementById('senha').value
        }, false);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.tipo === 'admin') {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'minha-conta.html';
        }
    } catch (err) {
        errTxt.textContent = err.message || 'Email ou senha incorretos.';
        errDiv.classList.remove('hidden');
        txt.textContent = 'Entrar';
        loader.classList.add('hidden');
        btn.disabled = false;
    }
}
