// Tela de Login (Alternar entre Login e Cadastro)

// Quando clicar no link "Cadastrar-se"
document.getElementById('showRegisterForm').addEventListener('click', function () {
    // Esconde o formulário de login
    document.getElementById('loginForm').style.display = 'none';
    // Mostra o formulário de cadastro
    document.getElementById('registerForm').style.display = 'block';
  });
  
  // Quando clicar no link "Já tem conta? Entrar"
  document.getElementById('showLoginForm').addEventListener('click', function () {
    // Esconde o formulário de cadastro
    document.getElementById('registerForm').style.display = 'none';
    // Mostra o formulário de login
    document.getElementById('loginForm').style.display = 'block';
  });
  
  
  // Mostrar/ocultar senhas
  
  // Para o campo de senha do login
  document.getElementById('toggleLoginPassword').addEventListener('click', function () {
    // Seleciona o campo de senha
    const passwordInput = document.getElementById('loginPassword');
    // Seleciona o ícone dentro do botão (olhinho)
    const icon = this.querySelector('i');
  
    // Se o tipo atual for 'password', troca para 'text' (mostrar senha)
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      // Troca o ícone para o olho com risco (senha visível)
      icon.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
      // Se já está visível, volta para tipo 'password'
      passwordInput.type = 'password';
      // Troca o ícone para o olho normal (senha oculta)
      icon.classList.replace('bi-eye-slash', 'bi-eye');
    }
  });
  
  // Para o campo de senha do cadastro
  document.getElementById('toggleRegisterPassword').addEventListener('click', function() {
    const input = document.getElementById('registerPassword');
    const icon = this.querySelector('i');
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('bi-eye');
      icon.classList.add('bi-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('bi-eye-slash');
      icon.classList.add('bi-eye');
    }
  });
  
  document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
    const input = document.getElementById('confirmPassword');
    const icon = this.querySelector('i');
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('bi-eye');
      icon.classList.add('bi-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('bi-eye-slash');
      icon.classList.add('bi-eye');
    }
  });

    // Busca do Estado e Cidade
    // Primeiro buscamos os estados do Brasil, ordenados por nome
  fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
  .then(res => res.json()) // Convertemos a resposta em JSON
  .then(estados => {
    const estadoSelect = document.getElementById('estado'); // Pegamos o <select> do estado pelo ID

    // Para cada estado recebido da API...
    estados.forEach(estado => {
      // ...adicionamos uma <option> no <select>
      estadoSelect.innerHTML += `<option value="${estado.id}">${estado.nome}</option>`;
    });
  });

  // Quando o usuário selecionar um estado, vamos buscar as cidades dele
  document.getElementById('estado').addEventListener('change', function () {
  const estadoId = this.value; // Pegamos o ID do estado selecionado
  const cidadeSelect = document.getElementById('cidade'); // Pegamos o <select> da cidade

  // Limpamos e desabilitamos o campo de cidade temporariamente
  cidadeSelect.innerHTML = '<option>Carregando...</option>';
  cidadeSelect.disabled = false;

  // Buscamos os municípios (cidades) com base no estado selecionado
  fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`)
    .then(res => res.json()) // Convertendo resposta em JSON
    .then(cidades => {
      cidadeSelect.innerHTML = '<option selected disabled>Selecione sua cidade</option>';

      // Para cada cidade recebida...
      cidades.forEach(cidade => {
        // ...criamos uma nova <option> no <select> de cidades
        cidadeSelect.innerHTML += `<option value="${cidade.nome}">${cidade.nome}</option>`;
      });
    });
  });


// Quantidade de Pets
let quantidade = 1;

// Atualiza o campo de input com o valor atual da variável
function atualizarInput() {
  document.getElementById('quantidade').value = quantidade;
}

// Incrementa até o limite de 10
function incrementar() {
  if (quantidade < 10) {
    quantidade++;
    atualizarInput();
  } else {
    alert("Limite de 10 pets atingido!");
  }
}

// Decrementa até no mínimo 1
function decrementar() {
  if (quantidade > 1) {
    quantidade--;
    atualizarInput();
  }
}

// Variavel de controle para saber se o segundo pet já foi adicionado
let petAdicionado = false; // Controla se já foi adicionado o segundo pet
// Função que adiciona um pet extra (máximo de 1)
function adicionarPet() {
  // Verifica se o segundo pet já foi adicionado
  if (petAdicionado) {
    alert("Você só pode adicionar até 2 pets."); // Exibe alerta se tentar adicionar mais de um
    return; // Sai da função se já tiver adicionado
  }
  // Pega o container onde os pets adicionais vão ser inseridos
  const container = document.getElementById('pets-container');
  // Cria a div que vai conter os elementos do pet extra
  const novoPet = document.createElement('div');
  novoPet.className = 'd-flex align-items-center gap-2 mb-2'; // Estilo com espaçamento
  novoPet.setAttribute('id', `pet_extra`); // ID fixo já que só terá 1 pet extra
  // Define o conteúdo HTML dentro da nova div
  novoPet.innerHTML = `
    <select class="form-select" name="tipo_pet_extra" style="max-width: 500px;">
      <option>Gato</option>
      <option>Cachorro</option>
    </select>

    <button type="button" class="btn btn-light" onclick="decrementarPet('extra')">-</button>

    <input type="text" id="quantidade_extra" class="form-control text-center" value="1" style="width: 50px;" readonly />

    <button type="button" class="btn btn-light" onclick="incrementarPet('extra')">+</button>

    <button type="button" style="color: red; border: none; background: transparent;" onclick="removerPet('extra')">X</button>
  `;
  // Adiciona a nova div ao container
  container.appendChild(novoPet);
  // Atualiza a variável para indicar que o segundo pet foi adicionado
  petAdicionado = true; 
}

// Função para incrementar a quantidade de um pet
function incrementarPet(index) {
  // Pega o input correspondente ao pet pelo ID
  const input = document.getElementById(`quantidade_${index}`);
  let valor = parseInt(input.value); // Converte o valor para número
  // Verifica se está dentro do limite
  if (valor < 10) {
    input.value = valor + 1; // Incrementa
  } else {
    alert("Limite de 10 por pet!"); // Alerta se ultrapassar o limite
  }
}
// Função para decrementar a quantidade de um pet
function decrementarPet(index) {
  // Pega o input correspondente ao pet pelo ID
  const input = document.getElementById(`quantidade_${index}`);
  let valor = parseInt(input.value); // Converte o valor para número
  // Verifica se o valor é maior que 1
  if (valor > 1) {
    input.value = valor - 1; // Decrementa
  }
}

// Remove o pet extra e libera o botão para adicionar novamente
function removerPet(index) {
  const petDiv = document.getElementById(`pet_${index}`);
  if (petDiv) {
    petDiv.remove(); // Remove a div do DOM
    petAdicionado = false; // Libera para adicionar outro pet
  }
}

// Meu Perfil
document.getElementById('uploadFoto').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      document.getElementById('fotoPerfil').src = event.target.result;
    }
    reader.readAsDataURL(file);
  }
});

document.getElementById('cep').addEventListener('blur', async () => {
  const cep = document.getElementById('cep').value.replace(/\D/g, '');
  if (cep.length === 8) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        document.getElementById('endereco').value = data.logradouro;
        document.getElementById('bairro').value = data.bairro;
        document.getElementById('cidade').value = data.localidade;
        document.getElementById('estado').value = data.uf;
      } else {
        alert('CEP não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP. Tente novamente mais tarde.');
    }
  } else if (cep.length > 0) {
    alert('CEP inválido. Digite 8 números.');
  }
});


document.getElementById('formPerfil').addEventListener('submit', function(e) {
  e.preventDefault();
  const toastEl = document.getElementById('toastSucesso');
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
});

function formatarCPF(campo) {

campo.value = campo.value
.replace(/\D/g, '')
.replace(/(\d{3})(\d)/, '$1.$2')
.replace(/(\d{3})(\d)/, '$1.$2')
.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarCelular(campo) {
campo.value = campo.value
.replace(/\D/g, '')
.replace(/(\d{2})(\d)/, '($1) $2')
.replace(/(\d{5})(\d)/, '$1-$2')
.replace(/(-\d{4})\d+?$/, '$1');
}

function formatarRG(campo) {
campo.value = campo.value
.replace(/\D/g, '')
.replace(/(\d{2})(\d)/, '$1.$2')
.replace(/(\d{3})(\d)/, '$1.$2')
.replace(/(\d{3})(\d{1})$/, '$1-$2');
}

function formatarCEP(campo) {
campo.value = campo.value
.replace(/\D/g, '')                   // Remove tudo que não for dígito
.replace(/^(\d{5})(\d)/, '$1-$2')     // Adiciona o traço depois dos 5 primeiros números
.replace(/(-\d{3})\d+?$/, '$1');      // Impede digitar mais que 8 números
}


// Para mostrar os campos para o cuidador preencher.
function mostrarCamposAdicionais() {
  const tipo = document.getElementById("tipoUsuario").value;
  const campos = document.getElementById("camposCuidadora");

  if (tipo === "Cuidador" || tipo === "Cuidador/Tutor") {
    campos.style.display = "block";
  } else {
    campos.style.display = "none";
  }
}

// Meus Pets

let pets = [];
  let petEditandoId = null;

  function abrirModalAdicionarPet() {
    document.getElementById('formPet').reset();
    document.getElementById('idPetEdicao').value = '';
    document.getElementById('modalPetLabel').innerText = 'Adicionar Pet';
    new bootstrap.Modal(document.getElementById('modalPet')).show();
  }

  function abrirModalEditarPet(id) {
    const pet = pets.find(p => p.id === id);
    if (!pet) return;

    document.getElementById('idPetEdicao').value = pet.id;
    document.getElementById('nomePet').value = pet.nome;
    document.getElementById('especiePet').value = pet.especie;
    document.getElementById('racaPet').value = pet.raca;
    document.getElementById('modalPetLabel').innerText = 'Editar Pet';
    new bootstrap.Modal(document.getElementById('modalPet')).show();
  }

  function excluirPet(id) {
    if (confirm('Tem certeza que deseja excluir este pet?')) {
      pets = pets.filter(p => p.id !== id);
      renderizarPets();
    }
  }

  function renderizarPets() {


    const cookieUsuario = document.cookie
    .split('; ')
    .find(row => row.startsWith('usuario='));
  
  if (!cookieUsuario) {
    alert("Usuário não encontrado no cookie.");
    return;
  }
  
  let ID_Usuario;
  try {
    const usuarioObj = JSON.parse(decodeURIComponent(cookieUsuario.split('=')[1]));
    ID_Usuario = usuarioObj.ID_Usuario;
  } catch (e) {
    alert("Erro ao ler o cookie do usuário.");
    return;
  }


    const lista = document.getElementById('listaPets');
    lista.innerHTML = '';

    fetch(`http://127.0.0.1:3000/meu-perfil/${ID_Usuario}/listar_pet`)
    .then((res)=> res.json())
    .then((pets) => {
    pets.forEach(pet => {
      const card = document.createElement('div');
      card.className = 'col-md-4 mb-4';
      card.innerHTML = `
        <div class="card shadow-sm">
          <img src="${pet.Foto_Pet || 'https://media.istockphoto.com/id/1433858575/pt/foto/man-stroking-his-old-dog.jpg?s=612x612&w=0&k=20&c=PIzNmza2NkJW_2hYrwWxGggGhP5DTe48ZJqVs329u1o='}" class="card-img-top pet-img mx-auto mt-3" alt="Foto do Pet">
          <div class="card-body text-center">
            <h5 class="card-title">${pet.Nome}</h5>
            <p class="card-text text-muted">${pet.Especie} - ${pet.Raca}</p>
            <button class="btn btn-outline-primary btn-sm" onclick="abrirModalEditarPet('${pet.ID_Pet}')">Editar</button>
            <button class="btn btn-outline-danger btn-sm" onclick="excluirPet('${pet.ID_Pet}')">Excluir</button>
          </div>
        </div>
      `;
      lista.appendChild(card);
    });
  })
}

function exibirPets(){
    const idEdicao = document.getElementById('idPetEdicao').value;
    const nome = document.getElementById('nomePet').value;
    const especie = document.getElementById('especiePet').value;
    const raca = document.getElementById('racaPet').value;
    const fotoInput = document.getElementById('fotoPet');
    let foto = '';

    if (fotoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        foto = e.target.result;
        salvarPet(idEdicao, nome, especie, raca, foto);
      }
      reader.readAsDataURL(fotoInput.files[0]);
    } else {
      salvarPet(idEdicao, nome, especie, raca, '');
    }
  };

  function salvarPet(id, nome, especie, raca, foto) {
    if (id) {
      const pet = pets.find(p => p.id === id);
      pet.nome = nome;
      pet.especie = especie;
      pet.raca = raca;
      if (foto) pet.foto = foto;
    } else {
      pets.push({
        id: Date.now().toString(),
        nome,
        especie,
        raca,
        foto
      });
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalPet'));
    modal.hide();
    renderizarPets();
  }

  // mostrar tela meu pet e configuracoes

  
  function mostrarTela(tela) {
    
    window.location.href=`meu-perfil.html#${tela}`
    const perfil = document.querySelector('.section-border');
    const telaPets = document.getElementById('meusPets');
    const config = document.getElementById('configuracoes');
    const tabs = document.querySelectorAll('.nav-link');

    // Reseta abas
    tabs.forEach(tab => tab.classList.remove('active'));

    // Esconde tudo primeiro
    perfil.style.display = 'none';
    telaPets.style.display = 'none';
    config.style.display = 'none';
    console.log(tela)
    if (tela === 'perfil') {
      perfil.style.display = 'flex';      
      tabs[0].classList.add('active');
    } else if (tela === 'pets') {      
      telaPets.style.display = 'block';      
      tabs[1].classList.add('active');
    } else if (tela === 'config') {
      config.style.display = 'block';
      tabs[2].classList.add('active');
    }
}

// olhinho da senha (redefinir a senha)

document.getElementById('toggleNovaSenha').addEventListener('click', function() {
  const input = document.getElementById('novaSenha');
  const icon = this.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('bi-eye');
    icon.classList.add('bi-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('bi-eye-slash');
    icon.classList.add('bi-eye');
  }
});

document.getElementById('toggleRepitaSenha').addEventListener('click', function() {
  const input = document.getElementById('repitaSenha');
  const icon = this.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('bi-eye');
    icon.classList.add('bi-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('bi-eye-slash');
    icon.classList.add('bi-eye');
  }
});

// Filtro (minhas reservas)

function filtrarStatus(statusSelecionado) {
  const linhas = document.querySelectorAll("#listaReservas tr");
  linhas.forEach(linha => {
    const status = linha.querySelector(".badge-status").innerText.trim();
    linha.style.display = (!statusSelecionado || status === statusSelecionado) ? "" : "none";
  });
}


