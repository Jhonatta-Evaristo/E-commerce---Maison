async function handleRegister(e) {
  e.preventDefault();
  const senha = document.getElementById('senha').value;
  const confirmar = document.getElementById('confirmar').value;
  const err = document.getElementById('error-msg');
  const errTxt = document.getElementById('error-text');

  if (senha !== confirmar) {
    errTxt.textContent = 'As senhas não coincidem.';
    err.classList.remove('hidden');
    return;
  }

  const btn = document.getElementById('btn');
  const txt = document.getElementById('btn-text');
  const loader = document.getElementById('btn-loader');
  txt.textContent = 'Criando conta...';
  loader.classList.remove('hidden');
  btn.disabled = true;
  err.classList.add('hidden');

  try {
    const data = await API.post('/auth/register', {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      senha
    }, false);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'minha-conta.html';
  } catch (e2) {
    errTxt.textContent = e2.message || 'Erro ao criar conta.';
    err.classList.remove('hidden');
    txt.textContent = 'Criar Conta';
    loader.classList.add('hidden');
    btn.disabled = false;
  }
}
