// Funções para a Navbar Dinâmica e Gerenciamento de Login
// ========================================================

function getUserDataFromCookie() {
  const cookieString = document.cookie.split('; ').find(row => row.startsWith('usuario='));
  console.log("DEBUG: Cookie string 'usuario=' encontrado:", cookieString);
  if (cookieString) {
      try {
          const userDataString = decodeURIComponent(cookieString.split('=')[1]);
          console.log("DEBUG: String de dados do usuário decodificada:", userDataString);
          const parsedData = JSON.parse(userDataString);
          console.log("DEBUG: Dados do usuário após parse:", parsedData);
          return parsedData;
      } catch (e) {
          console.error("Erro ao parsear o cookie do usuário:", e);
          return null;
      }
  }
  console.log("DEBUG: Cookie 'usuario' não encontrado.");
  return null;
}

function updateNavbarOnLoginStatus() {
  console.log("DEBUG: updateNavbarOnLoginStatus foi chamada.");
  const userData = getUserDataFromCookie();
  console.log("DEBUG: Dados do usuário para a navbar:", userData);

  const navItemLogin = document.getElementById('navItemLogin');
  const navItemUser = document.getElementById('navItemUser');
  const navbarUserName = document.getElementById('navbarUserName');
  const navbarUserPhoto = document.getElementById('navbarUserPhoto');
  const btnLogout = document.getElementById('btnLogout');

  if (userData && userData.Nome) {
      console.log("DEBUG: Condição (userData && userData.Nome) VERDADEIRA. Usuário considerado LOGADO.");
      if (navItemLogin) navItemLogin.style.display = 'none';
      if (navItemUser) navItemUser.style.display = 'block';
      if (navbarUserName) navbarUserName.textContent = userData.Nome;

      if (navbarUserPhoto && userData.Foto_usuario) {
          navbarUserPhoto.src = userData.Foto_usuario; // Assume que Foto_usuario é uma URL válida
          navbarUserPhoto.style.display = 'inline-block';
      } else if (navbarUserPhoto) {
          navbarUserPhoto.style.display = 'none'; // Esconde se não houver foto ou URL
      }

      if (btnLogout) {
          btnLogout.removeEventListener('click', logoutUser); // Evita múltiplos listeners
          btnLogout.addEventListener('click', logoutUser);
      }
  } else {
      console.log("DEBUG: Condição (userData && userData.Nome) FALSA. Usuário considerado NÃO LOGADO.");
      if (navItemLogin) navItemLogin.style.display = 'block';
      if (navItemUser) navItemUser.style.display = 'none';
  }
}

function logoutUser() {
  console.log("DEBUG: logoutUser foi chamada.");
  document.cookie = "usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  window.location.reload(); // Recarrega a página para refletir o logout
}

// Chamar a atualização da navbar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', updateNavbarOnLoginStatus);


// Cadastro de Usuário
// ===================
const btnRegistrar = document.getElementById('btnRegistrar');
if (btnRegistrar) {
  btnRegistrar.onclick = () => {
      if (confirm("Você tem certeza que deseja cadastrar?") == 1) {
          const registerName = document.getElementById("registerName");
          const registerSurname = document.getElementById("registerSurname");
          const registerEmail = document.getElementById("registerEmail");
          const registerPassword = document.getElementById("registerPassword");
          const confirmPassword = document.getElementById("confirmPassword");

          if (!registerName.value || !registerSurname.value || !registerEmail.value || !registerPassword.value) {
              return alert("Por favor, preencha todos os campos.");
          }
          if (registerPassword.value !== confirmPassword.value) {
              return alert("As senhas não coincidem.");
          }

          fetch("http://localhost:3000/cad_user", {
              method: "POST",
              headers: {
                  "accept": "application/json",
                  "content-type": "application/json"
              },
              body: JSON.stringify({
                  Nome: registerName.value,
                  Sobrenome: registerSurname.value,
                  Email_usuario: registerEmail.value,
                  Senha_usuario: registerPassword.value
              })
          })
          .then(res => res.json())
          .then(dados => {
              alert(dados.msg);
              if (dados.msg.includes("cadastrado")) { // Ajuste a condição se necessário
                   // Opcional: fechar modal de cadastro e abrir de login, ou limpar forms
                  const modalRegister = bootstrap.Modal.getInstance(document.getElementById('authModal'));
                  if(modalRegister) modalRegister.hide(); // Esconde o modal inteiro
                  // Poderia limpar os campos aqui também
              }
          })
          .catch(err => {
              console.error("Erro no cadastro:", err);
              alert("Erro ao tentar cadastrar. Verifique o console.");
          });
      }
  };
}

// Login de Usuário
// ================
const btnLogin = document.getElementById('btnLogin');
if (btnLogin) {
  btnLogin.onclick = () => {
      const loginEmailInput = document.getElementById("loginEmail");
      const loginPasswordInput = document.getElementById("loginPassword");
      const mensagemErroEl = document.getElementById("mensagemErro"); // Para exibir erros de login

      if (!loginEmailInput.value || !loginPasswordInput.value) {
          if(mensagemErroEl) mensagemErroEl.textContent = "Por favor, preencha e-mail e senha.";
          return;
      }
      if(mensagemErroEl) mensagemErroEl.textContent = ""; // Limpa erros anteriores

      fetch("http://localhost:3000/login", {
          method: "POST",
          headers: {
              "accept": "application/json",
              "content-type": "application/json"
          },
          body: JSON.stringify({
              Email_usuario: loginEmailInput.value,
              Senha_usuario: loginPasswordInput.value
          })
      })
      .then(res => {
          if (!res.ok) {
              return res.json().then(errData => { throw errData; });
          }
          return res.json();
      })
      .then(dados => {
          console.log("Dados recebidos do login:", dados);
          if (dados.usuario && (dados.msg === "Altere seu tipo de perfil." || dados.msg === "Login realizado com sucesso")) {
              let usuarioParaCookie = {
                  ID_Usuario: dados.usuario.id,
                  Nome: dados.usuario.nome,
                  Sobrenome: dados.usuario.sobrenome,
                  Email_usuario: dados.usuario.email,
                  Foto_usuario: dados.usuario.foto // Certifique-se que 'foto' é a URL correta da imagem
              };
              document.cookie = `usuario=${JSON.stringify(usuarioParaCookie)}; path=/; SameSite=Lax`;

              const authModalElement = document.getElementById('authModal');
              const modalLoginInstance = bootstrap.Modal.getInstance(authModalElement);
              
              if (modalLoginInstance) {
                  authModalElement.addEventListener('hidden.bs.modal', function onModalHide() {
                      updateNavbarOnLoginStatus(); // Atualiza a navbar APÓS o modal ser completamente escondido
                      // authModalElement.removeEventListener('hidden.bs.modal', onModalHide); // Removido se 'once:true' é usado
                  }, { once: true }); // Garante que o listener rode uma vez e seja removido
                  modalLoginInstance.hide();
              } else {
                  updateNavbarOnLoginStatus(); // Caso não haja modal visível/instanciado
              }

              if (dados.msg === "Altere seu tipo de perfil.") {
                  alert(dados.msg);
                  // Pequeno delay para garantir que o modal desapareceu antes do redirect
                  setTimeout(() => {
                      window.location.href = `meu-perfil.html?idusuario=${dados.usuario.id}#perfil`;
                  }, 100); 
              }
          } else {
              if (mensagemErroEl) mensagemErroEl.textContent = dados.msg || "Usuário ou senha inválidos.";
              console.log("DEBUG: Login falhou ou dados inesperados:", dados.msg);
          }
      })
      .catch(err => {
          console.error("Erro no fetch de login:", err);
          const erroMsg = (typeof err === 'object' && err.msg) ? err.msg : "Erro de conexão ou servidor.";
          if (mensagemErroEl) mensagemErroEl.textContent = erroMsg;
      });
  };
}

// Atualização de Perfil
// ======================
async function alterarPerfil2() { // Renomeie se quiser, ex: salvarAtualizacaoPerfil
  let cookie = document.cookie.split('; ').find(row => row.startsWith('usuario='));
  if (!cookie) {
      alert("Usuário não autenticado.");
      return;
  }
  
  let idusuario;
  try {
      const usuarioObj = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
      idusuario = usuarioObj.ID_Usuario;
  } catch (e) {
      alert("Erro ao ler ID do usuário do cookie.");
      return;
  }

  // Se o idusuario não for encontrado no cookie, pode tentar pegar da URL como fallback
  // mas o ideal é confiar no cookie para o usuário logado.
  if (!idusuario) {
      let idDaUrl = window.location.search;
      idDaUrl = idDaUrl.substring(idDaUrl.indexOf("idusuario=") + 10); // Ajuste se o nome do parâmetro for diferente
      if (idDaUrl) {
          idusuario = idDaUrl.split('&')[0]; // Pega apenas o valor do idusuario
      } else {
          alert("ID do usuário não encontrado.");
          return;
      }
  }
  
  console.log("ID do usuário para atualização:", idusuario);

  const dadosParaAtualizar = {
      CPF: document.getElementById("CPF")?.value, // Opcional chaining se o campo não existir em todas as forms
      RG: document.getElementById("RG")?.value,
      Data_Nascimento: document.getElementById("nascimento")?.value,
      Genero: document.getElementById("genero")?.value,
      Celular: document.getElementById("Celular")?.value,
      CEP: document.getElementById("cep")?.value,
      Endereco: document.getElementById("endereco")?.value,
      Numero: document.getElementById("numero")?.value,
      Bairro: document.getElementById("bairro")?.value,
      Cidade: document.getElementById("cidade")?.value,
      Estado: document.getElementById("estado")?.value,
      Foto_usuario: document.getElementById("uploadFoto")?.value, // Lembre-se que isso é só o nome do arquivo, não o upload em si
      Tipo_usuario: document.getElementById("tipoUsuario")?.value,
      Tipo_servico: document.getElementById("tipoServico")?.value,
      Preco_servico: document.getElementById("precoDiaria")?.value,
      Tipo_porte: document.getElementById("tipoPorte")?.value,
      Experiencia: document.getElementById("observacoes")?.value || ""
  };

  try {
      // Aqui você decidiria qual endpoint chamar ou se os dados de usuário e pessoais são atualizados juntos.
      // A rota /meu-perfil/alterar-dados-pessoais/:id já parece lidar com muitos desses campos.
      
      const responsePessoais = await fetch(`http://localhost:3000/meu-perfil/alterar-dados-pessoais/${idusuario}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosParaAtualizar) // Envia todos os dados coletados
      });

      const resultadoPessoais = await responsePessoais.json();

      if (responsePessoais.ok) {
          alert(resultadoPessoais.msg || "Perfil atualizado com sucesso!");
      } else {
          throw resultadoPessoais; // Lança o objeto de erro do backend (que pode ter .msg)
      }

  } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      const mensagemErro = (typeof err === 'object' && err.msg) ? err.msg : "Erro de comunicação ao salvar perfil.";
      alert(`Erro ao atualizar perfil: ${mensagemErro}`);
  }
}
// Se houver um botão para chamar alterarPerfil2, adicione o event listener:
// const btnAtualizarPerfil = document.getElementById('seuBotaoDeAtualizarPerfil');
// if(btnAtualizarPerfil) btnAtualizarPerfil.addEventListener('click', alterarPerfil2);


// Área de Configuração - Atualizar Dados Pessoais (simplificado)
// ==============================================================
// Esta função parece específica para a tela de configurações, atualizando menos campos.
function atualizarConfiguracoesPerfil() {
  const cookieUsuario = document.cookie.split('; ').find(row => row.startsWith('usuario='));
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

  const nomeConfig = document.getElementById("nomeConfig")?.value;
  const sobrenomeConfig = document.getElementById("sobrenomeConfig")?.value;
  const celularConfig = document.getElementById("celularConfig")?.value;
  const emailConfig = document.getElementById("emailConfig")?.value;

  fetch(`http://localhost:3000/meu-perfil/config/${ID_Usuario}`, {
      method: "PUT",
      headers: {
          "accept": "application/json",
          "content-type": "application/json"
      },
      body: JSON.stringify({
          Nome: nomeConfig,
          Sobrenome: sobrenomeConfig,
          Celular: celularConfig,
          Email_usuario: emailConfig // Assumindo que o backend espera Email_usuario
      })
  })
  .then(res => {
      if (!res.ok) return res.json().then(err => { throw err; });
      return res.json();
  })
  .then(dados => {
      alert(dados.msg || "Configurações atualizadas com sucesso!");
      // Opcional: recarregar os dados nos campos se o backend retornar os dados atualizados.
      // No seu código original, você tentava repopular com 'user.Nome', etc.
      // Seria melhor se o backend retornasse o objeto 'usuario' atualizado para isso.
      // Ex: if (dados.usuario) {
      // document.getElementById("nomeConfig").value = dados.usuario.Nome || '';
      // ...
      // }
      // Também é preciso atualizar o cookie 'usuario' se o Nome, Email ou Foto mudarem
      // e então chamar updateNavbarOnLoginStatus()
  })
  .catch(err => {
      console.error("Erro ao atualizar configurações:", err);
      alert(err.msg || "Erro ao atualizar configurações.");
  });
}
// Adicione event listener ao botão de salvar configurações, se houver:
// const btnSalvarConfig = document.getElementById('seuBotaoDeSalvarConfig');
// if(btnSalvarConfig) btnSalvarConfig.addEventListener('click', atualizarConfiguracoesPerfil);


// Redefinir Senha
// ===============
async function redefinirSenha() {
  const cookieUsuario = document.cookie.split('; ').find(row => row.startsWith('usuario='));
  if (!cookieUsuario) { return alert("Usuário não encontrado no cookie."); }

  let ID_Usuario;
  try {
      const usuarioObj = JSON.parse(decodeURIComponent(cookieUsuario.split('=')[1]));
      ID_Usuario = usuarioObj.ID_Usuario;
  } catch (e) { return alert("Erro ao ler o cookie do usuário."); }

  const novaSenha = document.getElementById("novaSenha")?.value;
  const repitaSenha = document.getElementById("repitaSenha")?.value;

  if (!novaSenha || !repitaSenha) return alert("Preencha ambos os campos de senha.");
  if (novaSenha !== repitaSenha) return alert("As senhas não coincidem!");

  try {
      const res = await fetch(`http://localhost:3000/meu-perfil/config/senha/${ID_Usuario}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Senha_usuario: novaSenha })
      });
      const json = await res.json();
      if (!res.ok) throw json; // Lança erro se não estiver ok
      alert(json.msg || "Senha atualizada com sucesso!");
  } catch (err) {
      console.error("Erro ao atualizar senha:", err);
      alert(err.msg || "Erro ao redefinir a senha.");
  }
}
// Adicione event listener ao botão de redefinir senha, se houver:
// const btnRedefinirSenha = document.getElementById('seuBotaoDeRedefinirSenha');
// if(btnRedefinirSenha) btnRedefinirSenha.addEventListener('click', redefinirSenha);

// Gerenciamento de Pets
// ======================
async function salvarPet() {
  const cookieUsuario = document.cookie.split('; ').find(row => row.startsWith('usuario='));
  if (!cookieUsuario) { return alert("Usuário não encontrado no cookie."); }

  let ID_Usuario;
  try {
      const usuarioObj = JSON.parse(decodeURIComponent(cookieUsuario.split('=')[1]));
      ID_Usuario = usuarioObj.ID_Usuario;
  } catch (e) { return alert("Erro ao ler o cookie do usuário."); }

  const petData = {
      ID_Usuario: ID_Usuario,
      Nome: document.getElementById('nomePet')?.value,
      Especie: document.getElementById('especiePet')?.value,
      Sexo: document.getElementById('sexoPet')?.value,
      Idade: document.getElementById('idadePet')?.value,
      Raca: document.getElementById('racaPet')?.value,
      Porte: document.getElementById('portePet')?.value,
      Castrado: document.getElementById('castradoPet')?.value,
      Restricoes: document.getElementById('restricoesPet')?.value,
      Comportamento: document.getElementById('comportamentoPet')?.value,
      Preferencias: document.getElementById('preferenciasPet')?.value,
      Foto_Pet: null // Lembre-se que upload de foto é um processo diferente
  };

  // Validação básica
  if (!petData.Nome || !petData.Especie) {
      return alert("Nome e Espécie do pet são obrigatórios.");
  }

  try {
      const response = await fetch(`http://localhost:3000/meu-perfil/${ID_Usuario}/cad-pet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(petData)
      });
      const json = await response.json();
      if (!response.ok) throw json;

      alert(json.msg || "Pet cadastrado com sucesso!"); // O backend parece retornar 'message', não 'msg'
      window.location.reload(); // Para atualizar a lista de pets, se houver uma na página

      const modalPetElement = document.getElementById('modalPet'); // Assumindo que o ID do modal de pet é 'modalPet'
      if(modalPetElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalPetElement);
          if (modalInstance) modalInstance.hide();
      }
  } catch (err) {
      console.error('Erro ao salvar pet:', err);
      alert(err.msg || err.message || "Erro na comunicação com o servidor ao salvar pet.");
  }
}
// Adicione event listener ao botão de salvar pet, se houver:
// const btnSalvarPet = document.getElementById('btnSalvarPet');
// if(btnSalvarPet) btnSalvarPet.addEventListener('click', salvarPet);


// Deletar Conta
// =============
function deletarConta() {
  if (!confirm("Tem certeza que deseja deletar sua conta? Essa ação é irreversível!")) return;

  const cookieUsuario = document.cookie.split('; ').find(row => row.startsWith('usuario='));
  if (!cookieUsuario) { return alert("Usuário não encontrado no cookie."); }

  let ID_Usuario;
  try {
      const usuarioObj = JSON.parse(decodeURIComponent(cookieUsuario.split('=')[1]));
      ID_Usuario = usuarioObj.ID_Usuario;
  } catch (e) { return alert("Erro ao ler o cookie do usuário."); }

  fetch(`http://localhost:3000/meu-perfil/config/${ID_Usuario}`, {
      method: 'DELETE'
  })
  .then(res => {
      if(!res.ok) return res.json().then(err => {throw err;});
      return res.json();
  })
  .then(json => {
      alert(json.msg || "Conta deletada com sucesso.");
      logoutUser(); // Chama a função de logout para limpar cookie e recarregar/redirecionar
      // window.location.href = "/index.html"; // O logoutUser já faz reload, o que deve mostrar a navbar de deslogado
  })
  .catch(err => {
      console.error("Erro ao deletar conta:", err);
      alert(err.msg || "Erro ao deletar conta. Tente novamente.");
  });
}
// Adicione event listener ao botão de deletar conta, se houver:
// const btnDeletarConta = document.getElementById('btnDeletarConta');
// if(btnDeletarConta) btnDeletarConta.addEventListener('click', deletarConta);


// Enviar Reserva
// ==============
function enviarReserva() {
  // IDs do Tutor, Cuidador e Serviço precisam ser obtidos dinamicamente
  // Ex: const dadosUsuarioLogado = getUserDataFromCookie();
  // const ID_Tutor = dadosUsuarioLogado ? dadosUsuarioLogado.ID_Usuario : null;
  // const ID_Cuidador = // ... obter da página, talvez de um data attribute ou localStorage
  // const ID_Servico = // ... obter da página

  // if(!ID_Tutor || !ID_Cuidador || !ID_Servico) {
  //     alert("Erro: Informações do usuário, cuidador ou serviço não encontradas para criar a reserva.");
  //     return;
  // }

  const reserva = {
      Cuidador: document.getElementById("id_cuidador")?.value, // Precisa de um campo para o ID do cuidador
      Tutor: getUserDataFromCookie()?.ID_Usuario, // Pega ID do tutor logado
      ID_Servico: document.getElementById("id_servico")?.value, // Precisa de um campo para o ID do serviço
      Preco_servico: document.getElementById("preco_servico")?.innerText.replace("R$", "").trim(),
      qtd_pets: 1, // Ajuste conforme necessário (ex: contar pets selecionados)
      Porte_pet: document.getElementById("portePet")?.value, // Este parece ser o tipo de pet na sua reserva.html ("Cachorro", "Gato")
      Situacao: "Pendente",
      data_inicio: document.getElementById("data_inicio")?.value,
      data_conclusao: document.getElementById("data_conclusao")?.value,
      ID_Pet: document.getElementById("id_pet")?.value, // ID do pet selecionado no <select>
      Periodo_entrada: document.getElementById("periodo_entrada")?.value,
      Periodo_saida: document.getElementById("periodo_saida")?.value,
      Instru_Pet: document.getElementById("instrucao_pet")?.value,
      Itens_Pet: document.getElementById("itens_pet")?.value
      // Adicionar Contato de Emergência se for salvar no backend
      // Nome_Emergencia: document.getElementById("nome_emergencia")?.value,
      // Celular_Emergencia: document.getElementById("celular_emergencia")?.value,
  };

  console.log(`Dados da reserva:`, reserva);

  if (!reserva.Tutor || !reserva.ID_Pet || !reserva.data_inicio || !reserva.data_conclusao) {
      return alert("Por favor, preencha todas as informações obrigatórias da reserva (Pet, datas). Faça login se necessário.");
  }

  fetch("http://localhost:3000/reserva/cad-hosp/", { // Corrigido para HTTP
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reserva)
  })
  .then(response => {
      if (!response.ok) return response.json().then(err => { throw err; });
      return response.json();
  })
  .then(data => {
      console.log("Reserva enviada com sucesso:", data);
      alert(data.msg || data.message || "Reserva solicitada com sucesso!"); // Backend parece retornar 'message' às vezes
      // Após confirmar a reserva, redirecionar para pagamento.html
      // Passar o ID da reserva recém-criada (se o backend retornar) ou os detalhes para a próxima página
      if(data.ID_Agendamento || data.ID_Servico) { // Supondo que o backend retorne um ID
           localStorage.setItem('idReservaParaPagamento', data.ID_Agendamento || data.ID_Servico);
      }
      localStorage.setItem('reservaConfirmadaDetalhes', JSON.stringify(reserva)); // Guarda os detalhes atuais
      window.location.href = `pagamento.html?cuidador=${Cuidador}&tutor=${Tutor}&nome=${Nome}&sobrenome=${Sobrenome}&estado='${Estado}'&cidade=${Cidade}&pet=${Pet}&precoS=${dt.Preco_servico}&idservico=${ID_servico}&ins_pet${Instru_Pet}&itens_pet=${Itens_Pet}&data_inicio=${data_inicio}&data_conclusao=${data_conclusao}`; // Ajuste a URL conforme necessário
  })
  .catch(error => {
      console.error("Erro na requisição de reserva:", error);
      alert(error.msg || error.message || "Falha ao enviar a reserva. Tente novamente.");
  });
}
// O botão em reserva.html já tem onclick="enviarReserva()"


// Listar Pets para o Select na Página de Reserva
// ==============================================
function listarPetsReserva() {
  const cookieUsuario = document.cookie.split('; ').find(row => row.startsWith('usuario='));
  if (!cookieUsuario) {
      // Não exibir alerta aqui, pois pode ser chamado em páginas onde o usuário não está logado
      // e o <select> simplesmente não será populado.
      console.log("Usuário não logado, não é possível listar pets para reserva.");
      return;
  }

  let ID_Usuario;
  try {
      const usuarioObj = JSON.parse(decodeURIComponent(cookieUsuario.split('=')[1]));
      ID_Usuario = usuarioObj.ID_Usuario;
  } catch (e) {
      console.error("Erro ao ler o cookie do usuário para listar pets.");
      return;
  }

  const listaSelect = document.getElementById('id_pet');
  if (!listaSelect) return; // Sai se o select não existir na página atual

  fetch(`http://localhost:3000/meu-perfil/${ID_Usuario}/listar_pet`) // Usando localhost:3000 para consistência
  .then(res => {
      if (!res.ok) return res.json().then(err => { throw err; });
      return res.json();
  })
  .then(pets => {
      listaSelect.innerHTML = '<option value="">Selecione seu pet</option>'; // Opção default
      if (pets && pets.length > 0) {
          pets.forEach(pet => {
              let option = document.createElement('option');
              option.value = pet.ID_Pet;
              option.textContent = pet.Nome; // No seu backend, o campo é 'Nome' (maiúsculo)
              listaSelect.appendChild(option);
          });
      } else {
          listaSelect.innerHTML = '<option value="">Nenhum pet cadastrado</option>';
      }
  })
  .catch(err => {
      console.error("Erro ao listar pets para reserva:", err);
      listaSelect.innerHTML = '<option value="">Erro ao carregar pets</option>';
  });
}

// Chamar listarPetsReserva se a página tiver o elemento 'id_pet'.
// A página reserva.html já tem onload="listarPetsReserva()" no body.
// Alternativamente, pode-se verificar a existência do elemento:
// if(document.getElementById('id_pet')) {
//     listarPetsReserva();
// }


// Funções de UI do Modal de Login/Cadastro (se estiverem em script.js, pode deixar lá)
// Se não, pode adicionar aqui. Exemplo:
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegisterFormLink = document.getElementById('showRegisterForm');
  const showLoginFormLink = document.getElementById('showLoginForm');

  if (showRegisterFormLink) {
      showRegisterFormLink.addEventListener('click', function(e) {
          e.preventDefault();
          if(loginForm) loginForm.style.display = 'none';
          if(registerForm) registerForm.style.display = 'block';
      });
  }

  if (showLoginFormLink) {
      showLoginFormLink.addEventListener('click', function(e) {
          e.preventDefault();
          if(registerForm) registerForm.style.display = 'none';
          if(loginForm) loginForm.style.display = 'block';
      });
  }

  // Lógica para mostrar/ocultar senha (se ainda não implementada)
  const togglePasswordIcons = document.querySelectorAll('.eye-icon');
  togglePasswordIcons.forEach(icon => {
      icon.addEventListener('click', function() {
          const input = this.previousElementSibling; // Pega o input antes do span
          const iconElement = this.querySelector('i');
          if (input.type === "password") {
              input.type = "text";
              iconElement.classList.remove('bi-eye');
              iconElement.classList.add('bi-eye-slash');
          } else {
              input.type = "password";
              iconElement.classList.remove('bi-eye-slash');
              iconElement.classList.add('bi-eye');
          }
      });
  });
});



async function carregarDadosPaginaReserva() {
  console.log("DEBUG: carregarDadosPaginaReserva chamada");
  const queryParams = new URLSearchParams(window.location.search);
  const cuidadorId = queryParams.get('cuidadorId');
  const servicoId = queryParams.get('servicoId'); // Pode ser o ID do serviço principal do cuidador ou um serviço específico

  if (!cuidadorId) {
      console.error("ID do Cuidador não encontrado na URL.");
      // Poderia redirecionar ou mostrar uma mensagem de erro mais proeminente
      // window.location.href = 'cuidadores.html'; // Ou para a página de busca
  }

  // Placeholder para a URL da foto do cuidador e outras infos
  const cuidadorFotoEl = document.getElementById('cuidadorFoto');
  const cuidadorNomeEl = document.getElementById('cuidadorNome');
  const cuidadorLocalEl = document.getElementById('cuidadorLocal');
  const cuidadorPrecoServicoEl = document.getElementById('cuidadorPrecoServico'); // No card do cuidador
  const precoTotalServicoEl = document.getElementById('preco_servico'); // No resumo do valor total

  try {
      // Você precisará de um endpoint no backend que retorne os detalhes do cuidador e do serviço
      // Ex: /api/detalhes-reserva?cuidadorId=123&servicoId=45 (ou apenas cuidadorId se o serviço for padrão)
      // Este endpoint deve retornar nome, foto_url, local (cidade/bairro), preço do serviço, etc.
      // Estou usando placeholder para a URL do fetch e dados de exemplo
      
    //   ------ INÍCIO: LÓGICA DE EXEMPLO DE FETCH (SUBSTITUA PELO SEU ENDPOINT REAL) ------
      const response = await fetch(`http:localhost:3000/listar_cuidador/${ID_Usuario}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        
      );
      if (!response.ok) {
          throw new Error('Falha ao buscar dados do cuidador/serviço');
      } 
      // ------ FIM: LÓGICA DE EXEMPLO DE FETCH ------

      // ------ INÍCIO: DADOS MOCK (SUBSTITUA PELO RESULTADO DO FETCH REAL) ------
      // Simule a resposta do backend para teste, depois substitua pelo fetch real.
      // Seu backend deve buscar na tabela 'usuario', 'dados_pessoais', 'enderecos' e 'servicos'.
      const mockDadosCuidador = {
          nome: "",
          sobrenome: "", // Adicione se tiver
          foto_url: "", // Caminho relativo se a página estiver em /pages/
          cidade: "",
          bairro: "",
          preco_servico: "", // Preço base do serviço
          // Adicione avaliação se tiver
      };
      // ------ FIM: DADOS MOCK ------
      
      const dados = mockDadosCuidador; // Usando mock por enquanto

      if (cuidadorFotoEl && dados.foto_url) cuidadorFotoEl.src = dados.foto_url;
      if (cuidadorNomeEl) cuidadorNomeEl.textContent = `${dados.nome} ${dados.sobrenome || ''}`;
      if (cuidadorLocalEl) cuidadorLocalEl.textContent = `${dados.cidade} - ${dados.bairro}`;
      
      let precoFormatado = `R$ ${parseFloat(dados.preco_servico || 0).toFixed(2)}`;
      if (cuidadorPrecoServicoEl) cuidadorPrecoServicoEl.textContent = precoFormatado;
      if (precoTotalServicoEl) precoTotalServicoEl.textContent = parseFloat(dados.preco_servico || 0).toFixed(2); // Só o número para o span

      // Guardar IDs para usar no envio do formulário
      const formReserva = document.getElementById('formReserva');
      if (formReserva) {
          // Adiciona campos hidden ao formulário para guardar os IDs
          let cuidadorIdInput = formReserva.querySelector('input[name="cuidadorId"]');
          if (!cuidadorIdInput) {
              cuidadorIdInput = document.createElement('input');
              cuidadorIdInput.type = 'hidden';
              cuidadorIdInput.name = 'cuidadorId';
              formReserva.appendChild(cuidadorIdInput);
          }
          cuidadorIdInput.value = cuidadorId;

          if (servicoId) { // Se houver um servicoId específico
              let servicoIdInput = formReserva.querySelector('input[name="servicoId"]');
              if (!servicoIdInput) {
                  servicoIdInput = document.createElement('input');
                  servicoIdInput.type = 'hidden';
                  servicoIdInput.name = 'servicoId';
                  formReserva.appendChild(servicoIdInput);
              }
              servicoIdInput.value = servicoId;
          }
      }

  } catch (error) {
      console.error("Erro ao carregar dados para página de reserva:", error);
      alert("Não foi possível carregar os detalhes da reserva. Tente novamente.");
      if (cuidadorNomeEl) cuidadorNomeEl.textContent = "Erro ao carregar";
  }
}

// Em assets/js/back.js, revise sua função enviarReserva:
function enviarReserva() {
  const dadosUsuarioLogado = getUserDataFromCookie(); // Pega dados do usuário logado
  if (!dadosUsuarioLogado) {
      alert("Você precisa estar logado para fazer uma reserva.");
      // Opcional: abrir modal de login
      const authModal = new bootstrap.Modal(document.getElementById('authModal'));
      authModal.show();
      return;
  }

  const ID_Tutor = dadosUsuarioLogado.ID_Usuario;

  // Pegar cuidadorId e servicoId dos campos hidden que adicionamos ao formulário
  const formReserva = document.getElementById('formReserva');
  const cuidadorId = formReserva.elements['cuidadorId'] ? formReserva.elements['cuidadorId'].value : null;
  const servicoId = formReserva.elements['servicoId'] ? formReserva.elements['servicoId'].value : null; // Pode ser ID do serviço do cuidador ou um serviço específico

//   // Validação básica inicial
//   if (!cuidadorId) { // servicoId pode ser opcional dependendo da sua lógica de como um serviço é escolhido
//       alert("Erro: Informações do cuidador não encontradas. Tente selecionar novamente.");
//       return;
//   }
  
  // Coleta dos outros dados do formulário de reserva.html
  const reserva = {
      Cuidador: document.getElementById("id_cuidador")?.value,
      Tutor: ID_Tutor,
      ID_Servico: document.getElementById("id_servico")?.value, // Se servicoId não vier da URL, o backend pode usar um serviço padrão do cuidador
      Preco_servico: document.getElementById("preco_servico")?.innerText.replace("R$", "").trim(), // Ou o valor do card do cuidador
      // qtd_pets: 1, // Ajuste se o usuário puder selecionar mais de um pet
      Porte_pet: document.getElementById("porte_pet")?.value, // Parece ser o 'Tipo de Pet' no seu form
      Situacao: "Pendente", 
      data_inicio: document.getElementById("data_inicio")?.value,
      data_conclusao: document.getElementById("data_conclusao")?.value,
      ID_Pet: document.getElementById("id_pet")?.value,
      Periodo_entrada: document.getElementById("periodo_entrada")?.value,
      Periodo_saida: document.getElementById("periodo_saida")?.value,
      Instru_Pet: document.getElementById("instrucao_pet")?.value,
      Itens_Pet: document.getElementById("itens_pet")?.value,
      // Adicionar campos de endereço e contato de emergência
      CEP: document.getElementById("buscarcep")?.value,
      Endereco: document.getElementById("endereco")?.value,
      Numero: document.getElementById("numero")?.value,
      Bairro: document.getElementById("bairro")?.value,
      Cidade: document.getElementById("cidade")?.value,
      Estado: document.getElementById("estado")?.value,
      Nome_Emergencia: document.getElementById("nome_emergencia")?.value,
      Celular_Emergencia: document.getElementById("celular_emergencia")?.value,
  };

  // Validação mais completa dos campos obrigatórios
  if (!reserva.ID_Pet || !reserva.data_inicio || !reserva.data_conclusao || !reserva.Endereco) {
      alert("Por favor, preencha todas as informações obrigatórias da reserva (Pet, datas, endereço).");
      return;
  }

  console.log("Enviando reserva:", reserva);

  fetch("http://localhost:3000/reserva/cad-hosp/", { // Verifique se a URL está correta (HTTP)
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reserva)
  })
  .then(response => {
      if (!response.ok) return response.json().then(err => { throw err; });
      return response.json();
  })
  .then(data => {
      console.log("Reserva enviada com sucesso:", data);
      alert(data.msg || data.message || "Sua solicitação de reserva foi enviada!");
      
      // Guardar ID da reserva/agendamento para a próxima página
      if (data.payload && data.payload.ID_Agendamento) { // Ajuste conforme a resposta real do seu backend
          localStorage.setItem('idReservaPendente', data.payload.ID_Agendamento);
      } else if (data.ID_Agendamento) {
           localStorage.setItem('idReservaPendente', data.ID_Agendamento);
      }
      // Opcional: guardar todos os detalhes para exibir no resumo
      localStorage.setItem('reservaParaPagamentoDetalhes', JSON.stringify(reserva)); 
      
      window.location.href = 'pagamento.html'; // Redireciona para a página de pagamento
  })
//   .catch(error => {
//       console.error("Erro na requisição de reserva:", error);
//       alert(error.msg || error.message || "Falha ao enviar a reserva. Tente novamente.");
//   });
}

// pagamento 

