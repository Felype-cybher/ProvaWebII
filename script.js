const style = `
body { font-family: Arial, sans-serif; margin: 20px; }
.valid { border: 2px solid green; }
.invalid { border: 2px solid red; }
.item { margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
.item button { margin-left: 10px; }
`;
document.getElementById('dynamic-style').textContent = style;

const form = document.getElementById('itemForm');
const lista = document.getElementById('listaItens');

let itens = JSON.parse(localStorage.getItem('itens')) || [];

function renderLista() {
lista.innerHTML = '';
itens.forEach((item, index) => {
  const div = document.createElement('div');
  div.className = 'item';
  div.innerHTML = `
    <strong>${item.nome}</strong> - R$${item.preco} - ${item.categoria} <br>
    <em>${item.descricao}</em><br>
    Disponível: ${item.disponivel ? 'Sim' : 'Não'}<br>
    <small>Endereço: ${item.endereco || 'N/A'}</small>
    <button onclick="editarItem(${index})">Editar</button>
    <button onclick="removerItem(${index})">Remover</button>
  `;
  lista.appendChild(div);
});
}

function validarInput(input, condicao) {
input.classList.remove('valid', 'invalid');
input.classList.add(condicao ? 'valid' : 'invalid');
return condicao;
}

function buscarEndereco(cep) {
return fetch(`https://viacep.com.br/ws/${cep}/json/`)
  .then(res => res.json())
  .then(data => data.logradouro || '');
}

form.addEventListener('submit', async (e) => {
e.preventDefault();

const nome = document.getElementById('nome');
const preco = document.getElementById('preco');
const categoria = document.getElementById('categoria');
const descricao = document.getElementById('descricao');
const disponivel = document.getElementById('disponivel').checked;
const cep = document.getElementById('cep');

const isNomeValido = validarInput(nome, nome.value.trim().length >= 2);
const isPrecoValido = validarInput(preco, parseFloat(preco.value) > 0);
const isCategoriaValida = validarInput(categoria, categoria.value !== '');
const isDescricaoValida = validarInput(descricao, descricao.value.trim().length >= 5);
const isCepValido = validarInput(cep, cep.value.length === 8);

if (!isNomeValido || !isPrecoValido || !isCategoriaValida || !isDescricaoValida || !isCepValido) return;

const endereco = await buscarEndereco(cep.value);

const novoItem = {
  nome: nome.value,
  preco: parseFloat(preco.value).toFixed(2),
  categoria: categoria.value,
  descricao: descricao.value,
  disponivel: disponivel,
  endereco: endereco
};

const itemId = document.getElementById('itemId').value;

if (itemId) {
  itens[itemId] = novoItem;
  document.getElementById('itemId').value = '';
} else {
  itens.push(novoItem);
}

localStorage.setItem('itens', JSON.stringify(itens));
renderLista();
form.reset();
});

function editarItem(index) {
const item = itens[index];
document.getElementById('nome').value = item.nome;
document.getElementById('preco').value = item.preco;
document.getElementById('categoria').value = item.categoria;
document.getElementById('descricao').value = item.descricao;
document.getElementById('disponivel').checked = item.disponivel;
document.getElementById('cep').value = '';
document.getElementById('itemId').value = index;
}

function removerItem(index) {
itens.splice(index, 1);
localStorage.setItem('itens', JSON.stringify(itens));
renderLista();
}

renderLista();
