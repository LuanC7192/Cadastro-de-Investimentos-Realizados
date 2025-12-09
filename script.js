// ================== LOGIN ==================

// Captura elementos do login
const loginScreen = document.getElementById('login-screen');
const sistemaDiv = document.getElementById('sistema');
const emailInput = document.getElementById('login-email');
const senhaInput = document.getElementById('login-senha');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');

// Se já estiver logado, pula a tela de login
if (localStorage.getItem('usuario_logado')) {
  loginScreen.style.display = 'none';
  sistemaDiv.style.display = 'block';
}

// Evento de login
btnLogin.addEventListener('click', () => {
  if (emailInput.value && senhaInput.value) {
    localStorage.setItem('usuario_logado', emailInput.value);
    loginScreen.style.display = 'none';
    sistemaDiv.style.display = 'block';
  } else {
    alert('Preencha e-mail e senha');
  }
});

// Evento de logout
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('usuario_logado');
  location.reload();
});

// ================== CLASSES ==================

class Investimento {
  constructor(nome, montante, retorno) {
    this.nome = nome;
    this.montante_aplicado = Number(montante);
    this.retorno_esperado = Number(retorno);
    this.data = new Date().toISOString();
  }
}

class SistemaInvestimentos {
  constructor() {
    this.chave = 'investimentos';
    this.lista = JSON.parse(localStorage.getItem(this.chave)) || [];
  }

  adicionar(inv) {
    this.lista.push(inv);
    this.salvar();
  }

  remover(index) {
    this.lista.splice(index, 1);
    this.salvar();
  }

  salvar() {
    localStorage.setItem(this.chave, JSON.stringify(this.lista));
  }

  totalInvestido() {
    return this.lista.reduce((acc, i) => acc + i.montante_aplicado, 0);
  }

  totalRetorno() {
    return this.lista.reduce((acc, i) => acc + i.retorno_esperado, 0);
  }
}

const sistema = new SistemaInvestimentos();

// ================== INTERFACE ==================

const form = document.getElementById('form-inv');
const nomeInput = document.getElementById('nome');
const montanteInput = document.getElementById('montante');
const retornoInput = document.getElementById('retorno');

const listaDiv = document.getElementById('lista');
const totalInvestidoDiv = document.getElementById('total-investido');
const totalRetornoDiv = document.getElementById('total-retorno');

const btnClear = document.getElementById('btn-clear');
const btnSeed = document.getElementById('btn-seed');
const btnClearAll = document.getElementById('btn-clear-all');

// ================== EVENTOS ==================

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const montante = Number(montanteInput.value);
  const retorno = Number(retornoInput.value);

  if (!nome || montante <= 0 || retorno <= 0) {
    alert('Valores inválidos!');
    return;
  }

  sistema.adicionar(new Investimento(nome, montante, retorno));
  form.reset();
  renderizar();
});

btnClear.addEventListener('click', () => form.reset());

btnSeed.addEventListener('click', () => {
  sistema.adicionar(new Investimento('Fundo Alpha', 10000, 12000));
  sistema.adicionar(new Investimento('Tesouro', 5000, 5600));
  renderizar();
});

btnClearAll.addEventListener('click', () => {
  if (confirm('Deseja apagar tudo?')) {
    localStorage.clear();
    location.reload();
  }
});

// ================== RENDERIZAÇÃO ==================

function formatar(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderizar() {
  listaDiv.innerHTML = '';

  sistema.lista.forEach((inv, index) => {
    const div = document.createElement('div');
    div.className = 'list-item';

    div.innerHTML = `
      <div>
        <b>${inv.nome}</b><br>
        Aplicado: ${formatar(inv.montante_aplicado)}<br>
        Retorno: ${formatar(inv.retorno_esperado)}
      </div>
      <button style="background:red;" onclick="remover(${index})">X</button>
    `;

    listaDiv.appendChild(div);
  });

  totalInvestidoDiv.textContent = formatar(sistema.totalInvestido());
  totalRetornoDiv.textContent = formatar(sistema.totalRetorno());
}

// Função global usada no botão
function remover(index) {
  sistema.remover(index);
  renderizar();
}

// Primeira renderização
renderizar();
