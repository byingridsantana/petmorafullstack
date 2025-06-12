
    // mostrar tela meu pet e configuracoes
  
  const pagina = window.location.href.split('#')
  console.log(pagina)
  let tela = pagina[1]
    
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

// Cookie adicionado para parte de login 
    const fotoPerfil = document.getElementById("fotoPerfil");
    const iduser = document.getElementById("iduser");
    const nomeExibicao = document.getElementById("nomeExibicao");
    const inputNome = document.getElementById("inputNome");
    const inputSobrenome = document.getElementById("inputSobrenome");
    const inputEmail = document.getElementById("inputEmail");






    let cookie = document.cookie.split('; ').find(row => row.startsWith('usuario='));
if (cookie) {
  let usuario = JSON.parse(cookie.split('=')[1]);

    let separa_igual = cookie.split('=')
    // console.log(separa_igual)
    
    let separa_virgula = separa_igual[1].split(',')
    // console.log(separa_virgula)
    //pegar a quantidade de caracteres do idusuario
    // console.log(separa_virgula[0].length)

    let fotousuario = separa_virgula[4].substring(16,separa_virgula[4].length-2)
    // console.log(fotousuario)
    
    // console.log(separa_virgula[0].substring(14,separa_virgula[0].length))
    let idusuario = separa_virgula[0].substring(13,separa_virgula[0].length)
    
    // console.log(separa_virgula[1].substring(8,separa_virgula[1].length-1))
    let nomeusuario = separa_virgula[1].substring(8,separa_virgula[1].length-1)
    

    let sobrenomeusuario= separa_virgula[2].substring(13,separa_virgula[2].length-1)
    // console.log(sobrenomeusuario)

    let emailusuario = separa_virgula[3].substring(17,separa_virgula[3].length-1)
    // console.log(emailusuario)

    let nomeExibicao = document.getElementById("nomeExibicao");
    if (nomeExibicao) nomeExibicao.innerText = nomeusuario; 
    


    iduser.innerHTML=`Id: ${idusuario}`;
    inputNome.value = `${nomeusuario}`;
    inputSobrenome.value = `${sobrenomeusuario}`;
    inputEmail.value = `${emailusuario}`;
    fotoPerfil.src=`${fotousuario.toLowerCase()}`;

}



// <!-- Cookie adicionado para parte do meu perfil, atualização direta -->



  const CPF = document.getElementById("CPF");
  const RG = document.getElementById("RG");
  const Celular = document.getElementById("Celular"); 
  const nascimento = document.getElementById("nascimento");
  const genero = document.getElementById("genero");
  const cep = document.getElementById("cep");
  const endereco = document.getElementById("endereco");
  const numero = document.getElementById("numero");
  const bairro = document.getElementById("bairro");
  const cidade = document.getElementById("cidade");
  const estado = document.getElementById("estado");
  const tipoUsuario = document.getElementById("tipoUsuario");
  const btnSalvar2 = document.getElementById("btnSalvar2");
  const uploadFoto = document.getElementById("uploadFoto");


  let cookie2 = document.cookie.split('; ').find(row => row.startsWith('usuario='));
if (cookie2) {
  let usuario = JSON.parse(cookie.split('=')[1]);

    let separa_igual = cookie.split('=')
    // console.log(separa_igual)
    
    let separa_virgula = separa_igual[1].split(',')
    // console.log(separa_virgula)
    //pegar a quantidade de caracteres do idusuario
    // console.log(separa_virgula[0].length)

    let CPFusuario = separa_virgula[5].substring(6,separa_virgula[5].length-1)
    // console.log(CPFusuario)

    let RGusuario = separa_virgula[6].substring(4,separa_virgula[6].length-1)
    // console.log(RGusuario)

    let Celularusuario = separa_virgula[7].substring(9,separa_virgula[7].length-1)
    // console.log(Celularusuario)

    let nascimentousuario = separa_virgula[8].substring(15,separa_virgula[8].length-1)
    // console.log(nascimentousuario)

    let generousuario = separa_virgula[9].substring(9,separa_virgula[9].length-1)
    // console.log(generousuario)

    let cepusuario = separa_virgula[10].substring(5,separa_virgula[10].length-1)
    // console.log(cepusuario)

    let enderecousuario = separa_virgula[11].substring(10,separa_virgula[11].length-1)
     console.log(enderecousuario)

    let numerousuario = separa_virgula[11].substring(4,separa_virgula[11].length-1)
    // console.log(numerousuario)

    let bairrousuario = separa_virgula[12].substring(8,separa_virgula[12].length-1)
    // console.log(bairrousuario)

    let cidadeusuario = separa_virgula[13].substring(8,separa_virgula[13].length-1)
    // console.log(cidadeusuario)

    let estadousuario = separa_virgula[14].substring(8,separa_virgula[14].length-1)
    // console.log(estadousuario)

    let tipousuario = separa_virgula[15].substring(13,separa_virgula[15].length-1)
    // console.log(tipousuario)

    let uploadFoto = separa_virgula[4].substring(16,separa_virgula[4].length-2)
    console.log(uploadFoto)

    
    
    CPF.value = `${CPFusuario}`;
    RG.value = `${RGusuario}`;
    Celular.value = `${Celularusuario}`;
    nascimento.value = `${nascimentousuario}`;
    genero.value = `${generousuario}`;
    cep.value = `${cepusuario}`;
    endereco.value = `${enderecousuario}`;
    numero.value = `${numerousuario}`;
    bairro.value = `${bairrousuario}`;
    cidade.value = `${cidadeusuario}`;
    estado.value = `${estadousuario}`;
    tipoUsuario.value = `${tipousuario}`;
    uploadFoto.value = `${uploadFoto}`;
}


  const nomeConfig = document.getElementById("nomeConfig");
  const sobrenomeConfig = document.getElementById("sobrenomeConfig");
  const celularConfig = document.getElementById("celularConfig");
  const emailConfig = document.getElementById("emailConfig");
  const btnAtualizar = document.getElementById("btnAtualizarconfig");



document.cookie = "usuario=" + encodeURIComponent(JSON.stringify({ ID_Usuario: 1 })) + "; path=/";
let cookieUsuario = document.cookie.split('; ').find(row => row.startsWith('usuario='));
if (cookieUsuario) {
  let usuario = JSON.parse(cookie.split('=')[1]);

  let separa_igual = cookie.split('=')
    // console.log(separa_igual)
    
    let separa_virgula = separa_igual[1].split(',')

    let nomeConfigusuario = separa_virgula[1].substring(8,separa_virgula[1].length-1);
    // console.log(nomeConfigusuario)

    let sobrenomeConfigusuario = separa_virgula[2].substring(13,separa_virgula[2].length-1);
    // console.log(sobrenomeConfigusuario)

    let celularConfigusuario = separa_virgula[7].substring(9,separa_virgula[7].length-1);
    // console.log(celularConfigusuario)

    let emailConfigusuario = separa_virgula[3].substring(17,separa_virgula[3].length-1);
    // console.log(emailConfigusuario)

    let btnAtualizar = document.getElementById("btnAtualizarconfig");
    if (btnAtualizar) btnAtualizar.innerText = "Atualizar";


    Nome.value = `${nomeConfigusuario}`;
    Sobrenome.value = `${sobrenomeConfigusuario}`;
    celular.value = `${celularConfigusuario}`;
    email.value = `${emailConfigusuario}`;
    btnAtualizar.value = `${btnAtualizarconfig}`;




  }

