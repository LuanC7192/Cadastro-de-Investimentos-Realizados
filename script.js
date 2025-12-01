// ======================================================
//  CLASSES DO SISTEMA
// ======================================================

// Classe que representa um investimento individual
class Investimento {
  constructor(nome, montante_aplicado, retorno_esperado, data_investimento = null) {
    // Nome do investimento (ex: "Tesouro Direto")
    this.nome = nome;

    // Valor aplicado convertido para número
    this.montante_aplicado = Number(montante_aplicado);

    // Retorno esperado convertido para número
    this.retorno_esperado = Number(retorno_esperado);

    // Se a data não for passada, registra a data atual automaticamente
    this.data_investimento = data_investimento || new Date().toISOString();
  }
}

// Classe responsável por armazenar e gerenciar uma lista de investimentos
class SistemaInvestimentos {
  constructor(storageKey = 'sistema_investimentos_data') {
    this.storageKey = storageKey;     // Nome da chave usada no localStorage
    this.investimentos = this._carregar(); // Carrega dados salvos ao iniciar
  }

  // Adiciona um novo investimento ao sistema
  adicionar(inv) {
    this.investimentos.push(inv);
    this._salvar(); // Atualiza o localStorage
  }

  // Remove um investimento pelo índice
  remover(index) {
    if (index >= 0 && index < this.investimentos.length) {
      this.investimentos.splice(index, 1);
      this._salvar(); // Atualiza o localStorage
    }
  }

  // Atualiza um investimento existente
  atualizar(index, novoInv) {
    if (index >= 0 && index < this.investimentos.length) {
      this.investimentos[index] = novoInv;
      this._salvar();
    }
  }

  // Soma total investido
  totalInvestido() {
    return this.investimentos.reduce((acc, inv) => acc + inv.montante_aplicado, 0);
  }

  // Soma total esperado de retorno
  totalRetornoEsperado() {
    return this.investimentos.reduce((acc, inv) => acc + inv.retorno_esperado, 0);
  }

  // Salva a lista no localStorage
  _salvar() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.investimentos));
  }

  // Carrega dados salvos do localStorage
  _carregar() {
    const raw = localStorage.getItem(this.storageKey);
    
    // Se não houver nada salvo, retorna lista vazia
    if (!raw) return [];

    const list = JSON.parse(raw);

    // Reconstrói cada objeto como instância da classe Investimento
    return list.map(o =>
      new Investimento(o.nome, o.montante_aplicado, o.retorno_esperado, o.data_investimento)
    );
  }

  // Apaga todos os investimentos armazenados
  limparTudo() {
    this.investimentos = [];
    localStorage.removeItem(this.storageKey);
  }
}

// ======================================================
//  INSTÂNCIA PRINCIPAL DO SISTEMA
// ======================================================

const sistema = new SistemaInvestimentos();

// ======================================================
//  REFERÊNCIAS A ELEMENTOS DA INTERFACE
// ======================================================

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

// ======================================================
//  LÓGICA DO FORMULÁRIO – ADICIONAR INVESTIMENTO
// ======================================================

// Função acionada quando o formulário é enviado
function handleAddSubmit(e) {
  e.preventDefault(); // Evita recarregar a página

  // Lê valores dos campos
  const nome = nomeInput.value.trim();
  const montante = parseFloat(montanteInput.value);
  const retorno = parseFloat(retornoInput.value);

  // Verificação simples de validade
  if (!nome || isNaN(montante) || isNaN(retorno)) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  // Adiciona ao sistema
  sistema.adicionar(new Investimento(nome, montante, retorno));

  // Limpa os campos
  form.reset();

  // Atualiza a interface
  renderizar();
}

// Evento disparado ao enviar o formulário
form.addEventListener('submit', handleAddSubmit);

// ======================================================
//  BOTÃO: Limpar campos
// ======================================================

btnClear.addEventListener('click', () => form.reset());

// ======================================================
//  BOTÃO: Adicionar exemplos (seed)
// ======================================================

btnSeed.addEventListener('click', () => {
  // Lista de investimentos "caprichados" para demonstração
  const exemplos = [
    new Investimento('Fundo Alpha', 10000, 11500),
    new Investimento('Tesouro Prefixado', 5000, 5400),
    new Investimento('Ações Setor X', 20000, 26000),
  ];

  // Adiciona cada exemplo ao sistema
  exemplos.forEach(e => sistema.adicionar(e));

  // Atualiza interface
  renderizar();
});

// ======================================================
//  BOTÃO: Apagar TODOS os investimentos
// ======================================================

btnClearAll.addEventListener('click', () => {
  if (!confirm('Tem certeza que deseja apagar tudo?')) return;
  sistema.limparTudo();
  renderizar();
});

// ======================================================
//  FORMATAÇÃO DE MOEDA
// ======================================================

// Converte números para formato Real (R$)
function formatarMoedaBR(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ======================================================
//  FUNÇÃO PRINCIPAL: RENDERIZAR A INTERFACE
// ======================================================

function renderizar() {
  // Limpa a área da lista para reescrever tudo
  listaDiv.innerHTML = '';

  // Se não houver investimentos cadastrados
  if (sistema.investimentos.length === 0) {
    listaDiv.innerHTML = '<p class="muted">Nenhum investimento cadastrado.</p>';
  } else {

    // Para cada investimento, cria um item visual
    sistema.investimentos.forEach((inv, idx) => {

      // Container externo do item
      const item = document.createElement('div');
      item.className = 'list-item';

      // Parte esquerda = informações
      const left = document.createElement('div');
      left.innerHTML = `
        <div style="font-weight:700">${inv.nome}</div>
        <div class="meta">Aplicado: ${formatarMoedaBR(inv.montante_aplicado)} — Retorno esperado: ${formatarMoedaBR(inv.retorno_esperado)}</div>
        <div class="meta">Registrado em: ${new Date(inv.data_investimento).toLocaleString()}</div>
      `;

      // Parte direita = botões/ações
      const right = document.createElement('div');
      right.className = 'actions';

      // Botão excluir
      const btnExcluir = document.createElement('button');
      btnExcluir.textContent = 'Excluir';
      btnExcluir.style.background = 'var(--danger)';
      btnExcluir.style.color = 'white';
      btnExcluir.style.borderRadius = '6px';

      // Ao clicar, remove o investimento
      btnExcluir.addEventListener('click', () => {
        if (confirm(`Excluir investimento "${inv.nome}"?`)) {
          sistema.remover(idx);
          renderizar();
        }
      });

      // Monta o elemento visual
      right.appendChild(btnExcluir);
      item.appendChild(left);
      item.appendChild(right);
      listaDiv.appendChild(item);
    });
  }

  // Atualiza totais no painel
  totalInvestidoDiv.textContent = formatarMoedaBR(sistema.totalInvestido());
  totalRetornoDiv.textContent = formatarMoedaBR(sistema.totalRetornoEsperado());
}

// Primeira renderização ao carregar a página
renderizar();
