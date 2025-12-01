// ====== Classes ======

class Investimento {
  constructor(nome, montante_aplicado, retorno_esperado, data_investimento = null) {
    this.nome = nome;
    this.montante_aplicado = Number(montante_aplicado);
    this.retorno_esperado = Number(retorno_esperado);
    this.data_investimento = data_investimento || new Date().toISOString();
  }
}

class SistemaInvestimentos {
  constructor(storageKey = 'sistema_investimentos_data') {
    this.storageKey = storageKey;
    this.investimentos = this._carregar();
  }

  adicionar(inv) {
    this.investimentos.push(inv);
    this._salvar();
  }

  remover(index) {
    if (index >= 0 && index < this.investimentos.length) {
      this.investimentos.splice(index, 1);
      this._salvar();
    }
  }

  atualizar(index, novoInv) {
    if (index >= 0 && index < this.investimentos.length) {
      this.investimentos[index] = novoInv;
      this._salvar();
    }
  }

  totalInvestido() {
    return this.investimentos.reduce((acc, inv) => acc + inv.montante_aplicado, 0);
  }

  totalRetornoEsperado() {
    return this.investimentos.reduce((acc, inv) => acc + inv.retorno_esperado, 0);
  }

  _salvar() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.investimentos));
  }

  _carregar() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return list.map(o => new Investimento(o.nome, o.montante_aplicado, o.retorno_esperado, o.data_investimento));
  }

  limparTudo() {
    this.investimentos = [];
    localStorage.removeItem(this.storageKey);
  }
}

// ====== Instância do sistema ======

const sistema = new SistemaInvestimentos();

// ====== Elementos UI ======

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

// ====== Função para adicionar investimento ======

function handleAddSubmit(e) {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const montante = parseFloat(montanteInput.value);
  const retorno = parseFloat(retornoInput.value);

  if (!nome || isNaN(montante) || isNaN(retorno)) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  sistema.adicionar(new Investimento(nome, montante, retorno));
  form.reset();
  renderizar();
}

form.addEventListener('submit', handleAddSubmit);

// ====== Botão limpar campos ======
btnClear.addEventListener('click', () => form.reset());

// ====== Botão seed (adicionar exemplos) ======
btnSeed.addEventListener('click', () => {
  const exemplos = [
    new Investimento('Fundo Alpha', 10000, 11500),
    new Investimento('Tesouro Prefixado', 5000, 5400),
    new Investimento('Ações Setor X', 20000, 26000),
  ];
  exemplos.forEach(e => sistema.adicionar(e));
  renderizar();
});

// ====== Botão apagar tudo ======
btnClearAll.addEventListener('click', () => {
  if (!confirm('Tem certeza que deseja apagar tudo?')) return;
  sistema.limparTudo();
  renderizar();
});

// ====== Formatar moeda ======
function formatarMoedaBR(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ====== Renderização ======
function renderizar() {
  listaDiv.innerHTML = '';

  if (sistema.investimentos.length === 0) {
    listaDiv.innerHTML = '<p class="muted">Nenhum investimento cadastrado.</p>';
  } else {
    sistema.investimentos.forEach((inv, idx) => {
      const item = document.createElement('div');
      item.className = 'list-item';

      const left = document.createElement('div');
      left.innerHTML = `
        <div style="font-weight:700">${inv.nome}</div>
        <div class="meta">Aplicado: ${formatarMoedaBR(inv.montante_aplicado)} — Retorno esperado: ${formatarMoedaBR(inv.retorno_esperado)}</div>
        <div class="meta">Registrado em: ${new Date(inv.data_investimento).toLocaleString()}</div>
      `;

      const right = document.createElement('div');
      right.className = 'actions';

      const btnExcluir = document.createElement('button');
      btnExcluir.textContent = 'Excluir';
      btnExcluir.style.background = 'var(--danger)';
      btnExcluir.style.color = 'white';
      btnExcluir.style.borderRadius = '6px';
      btnExcluir.addEventListener('click', () => {
        if (confirm(`Excluir investimento "${inv.nome}"?`)) {
          sistema.remover(idx);
          renderizar();
        }
      });

      right.appendChild(btnExcluir);
      item.appendChild(left);
      item.appendChild(right);
      listaDiv.appendChild(item);
    });
  }

  totalInvestidoDiv.textContent = formatarMoedaBR(sistema.totalInvestido());
  totalRetornoDiv.textContent = formatarMoedaBR(sistema.totalRetornoEsperado());
}

renderizar();
