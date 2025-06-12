// Importa a biblioteca 'express' do Node.js para criar o servidor backend
const express = require('express'); 

// Importa a biblioteca 'mysql2' para conectar e interagir com o banco de dados MySQL
const mysql = require('mysql2'); 

// Importa a biblioteca 'cors' para permitir requisições de outros domínios (Cross-Origin Resource Sharing)
const cors = require('cors');

// Importa a biblioteca 'path' para lidar com caminhos de arquivos e diretórios
const path = require('path');

// Importa a biblioteca 'bcrypt' para criptografar senhas
const bcrypt = require("bcrypt");

// Importa a biblioteca 'jsonwebtoken' (JWT) para autenticação baseada em tokens
const jwt = require("jsonwebtoken");

// Importa a função 'pathToFileURL' do módulo 'url' para converter caminhos de arquivos em URLs do tipo file://
const { pathToFileURL } = require('url');

// Cria a conexão com o banco de dados MySQL
const con = mysql.createConnection({
    host: "127.0.0.1",
    port: "3306",
    user: "root",
    password: "",
    database: "dbpethouse"
});

// Verifica se a conexão foi estabelecida com sucesso
con.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
    } else {
        console.log('Conectado ao MySQL!');
    }
});

// Exporta a conexão com o banco de dados para uso em outros arquivos
module.exports = con;

// Cria uma instância da aplicação Express
const app = express();

// Ativa o uso de JSON no corpo das requisições
app.use(express.json());

// Ativa o CORS para permitir requisições de outros domínios
app.use(cors());

// Define a pasta 'fotos' como estática para servir arquivos diretamente
app.use(express.static('fotos'));







// Primeira rota para listar os dados do banco 
app.get('/listar_user', (req, res) => {
  // Aqui estamos criando uma rota para listar todos os usuários
  con.query("SELECT * FROM usuario", (error, result) => {
    if(error) {
      return res.status(500)
        .send({ msg: `Erro ao listar os dados do usuário, ${error}` });
    } else {
      // Se não houver erro, retornamos os dados
      res.status(200).send({ msg: result });
    }
  });
});

// Explicação dos parâmetros:
// req é o request, ou seja, a requisição que o cliente faz para o servidor
// res é a resposta que o servidor envia para o cliente
// A função res.send() envia uma resposta para o cliente
// A função res.status() define o status da resposta; 200 significa que a requisição foi bem sucedida





// Segunda rota para cadastrar um novo usuário no banco
app.post('/cad_user', (req, res) => {
  console.log(req.body);
  let sh = req.body.Senha_usuario;

  // Aqui estamos criando uma rota para cadastrar um novo usuário 
  // O bcrypt é uma biblioteca para criptografar senhas
  // O bcrypt.hash() é uma função que criptografa a senha
  bcrypt.hash(sh, 10, (erro, criptografada) => {
    if (erro) {
      // Se houver erro, retornamos o erro para o cliente
      return res.status(500).send({ error: `Erro ao criptografar a senha, ${erro}` });
      // Com isso, o sistema evita vulnerabilidades
    }

    // Devolve a senha criptografada para o corpo da requisição
    req.body.Senha_usuario = criptografada;

    con.query(
      "INSERT INTO usuario (Email_usuario, Senha_usuario) VALUES (?, ?)",
      [req.body.Email_usuario, req.body.Senha_usuario],
      (error, result) => {
        if (error) {
          // Se houver erro ao cadastrar o usuário, retornamos o erro
          return res.status(500).send({ error: `Erro ao cadastrar os dados, ${error}` });
        }

        let Idusuario = result.insertId;

        con.query(
          "INSERT INTO dados_pessoais (Nome, Sobrenome, ID_Usuario) VALUES (?,?,?)",
          [req.body.Nome, req.body.Sobrenome, Idusuario],
          (erro, resultado) => {
            if (erro) {
              // Se houver erro ao cadastrar dados pessoais, retornamos o erro
              return res.status(500).send({ error: `Erro ao cadastrar os dados, ${erro}` });
            }
          }
        );

        // Se tudo ocorrer bem, enviamos a confirmação de cadastro
        res.status(201).send({ msg: `Usuário cadastrado`, payload: result });
      }
    );
  });
});


// Terceira rota para receber os dados e atualizar os dados do banco
app.put('/atualizar_user/:ID_Usuario', (req, res) => {
  // Atualiza os dados do usuário com base no ID_Usuario recebido como parâmetro
  con.query(
    "UPDATE usuario set ? WHERE ID_Usuario = ?",
    [req.body, req.params.ID_Usuario],
    (error, result) => {
      if (error) {
        // Se houver um erro na atualização, retorna o erro com status 500
        return res.status(500).send({ error: `Erro ao atualizar os dados, ${error}` });
      }
      // Se a atualização for bem sucedida, retorna status 200 com mensagem de sucesso
      res.status(200).send({ msg: `dados atualizado`, payload: result });
    }
  );
});


// ==========================================================================================

 app.get('/fotos', (req, res) => {
  // Envia o arquivo "id1photo.png" localizado na pasta "fotos" no diretório raiz do projeto
  res.sendFile(__dirname + "/fotos/id1photo.png");
});


// Login
app.post('/login', (req, res) => {
  const { Email_usuario, Senha_usuario } = req.body;
  console.log(Senha_usuario);

  // Consulta o usuário pelo email e traz dados pessoais para validar login
  con.query(
    `SELECT us.ID_Usuario, us.Email_usuario, us.Senha_usuario, us.Foto_usuario, us.Tipo_usuario, dp.Nome, dp.Sobrenome 
     FROM usuario us 
     INNER JOIN dados_pessoais dp ON us.ID_Usuario = dp.ID_Usuario 
     WHERE us.Email_usuario = ?`, 
    [Email_usuario], 
    (err, results) => {
      if (err || results.length === 0) {
        // Retorna erro caso usuário não encontrado ou erro na query
        return res.status(401).send({ msg: "Usuário ou senha inválidos" });
      }

      const usuario = results[0];
      console.log(usuario);

      // Verifica a senha enviada com a senha armazenada usando bcrypt
      bcrypt.compare(Senha_usuario, usuario.Senha_usuario, (erro, batem) => {
        if (erro || !batem) {
          // Se a senha não bater, retorna erro de autenticação
          return res.status(401).send({ msg: "Usuário ou senha inválidos" });
        }

        // Se o tipo de usuário estiver vazio ou nulo, pede para alterar o perfil
        if (usuario.Tipo_usuario == null || usuario.Tipo_usuario.trim() === '') {
          return res.status(200).send({ 
            msg: "Altere seu tipo de perfil.", 
            usuario: {
              id: usuario.ID_Usuario,
              email: usuario.Email_usuario,
              nome: usuario.Nome,
              sobrenome: usuario.Sobrenome,
              foto: usuario.Foto_usuario
            }
          });
        } else {
          // Login realizado com sucesso, retorna dados do usuário
          return res.status(200).send({ 
            msg: "Login realizado com sucesso", 
            usuario: {
              id: usuario.ID_Usuario,
              email: usuario.Email_usuario,
              nome: usuario.Nome,
              sobrenome: usuario.Sobrenome,
              foto: usuario.Foto_usuario
            }
          });
        }
      });
    }
  );
});

// =============================================================================================================


// Atualizar meu perfil
app.put('/meu-perfil/:id', (req, res) => {
  const id = req.params.id;
  const dados = req.body;

  // Query para atualizar os dados do usuário com base no ID
  const query = "UPDATE usuario SET ? WHERE ID_Usuario = ?";

  con.query(query, [dados, id], (error, result) => {
    if (error) {
      // Retorna erro caso a atualização falhe
      return res.status(500).send({ msg: `Erro OOOOOOOOO ao atualizar os dados: ${error}` });
    }

    // Retorna sucesso na atualização dos dados do usuário
    res.status(200).send({ msg: "Dados do usuário atualizados com sucesso", payload: result });
  });
});


app.post('/meu-perfil/inserir-endereco/', (req, res) => {
  const {
    ID_Usuario,
    CEP,
    Endereco, // Logradouro
    Numero,
    Complemento,
    Bairro,
    Cidade,
    Estado
  } = req.body;

  // Query para inserir novo endereço na tabela enderecos
  const query = `
    INSERT INTO enderecos 
      (ID_Usuario, CEP, Logradouro, Numero, Complemento, Bairro, Cidade, Estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [ID_Usuario, CEP, Endereco, Numero, Complemento, Bairro, Cidade, Estado];

  console.log("Dados recebidos para inserir:", values);

  con.query(query, values, (error, result) => {
    if (error) {
      // Retorna erro caso falhe a inserção do endereço
      return res.status(500).send({ msg: `Erro ao inserir endereço: ${error}` });
    }

    // Confirma que o endereço foi inserido com sucesso
    res.status(200).send({ msg: "Endereço inserido com sucesso", payload: result });
  });
});


app.put('/meu-perfil/alterar-dados-pessoais/:id', (req, res) => {
  console.log(req.body);
  // console.log(req.params.id);

  // Se o tipo de usuário não for "Tutor", insere um serviço associado ao usuário
  if (req.body.Tipo_usuario != "Tutor") {
    const queryServico = `
      INSERT INTO servicos(Tipo_servico, Preco_servico, Porte_pet, ID_Usuario) VALUES (?, ?, ?, ?)
    `;

    con.query(
      queryServico,
      [
        req.body.Tipo_servico,
        req.body.Preco_servico,
        req.body.Tipo_porte,
        req.params.id
      ],
      (erroServico, resultadoServico) => {
        if (erroServico) {
          return res.status(500).send({ msg: `Erro ao atualizar serviço: ${erroServico}` });
        }
        // Aqui poderia continuar o fluxo após a inserção do serviço, se necessário
      }
    );
  }
});


const id = req.params.id;
const {
  CPF,
  RG,
  Data_Nascimento,
  Genero,
  Celular,
  CEP,
  Endereco,
  Numero,
  Complemento,
  Bairro,
  Cidade,
  Estado,
  Tipo_usuario
} = req.body;

console.log("================================================================================");

// Exibe no console os dados do serviço (se houver)
console.log(req.body.Tipo_servico);
console.log(req.body.Preco_servico);
console.log(req.body.Tipo_porte);

// 1. Atualiza os dados pessoais do usuário na tabela dados_pessoais
const queryDadosPessoais = `
  UPDATE dados_pessoais
  SET CPF = ?, RG = ?, Data_Nascimento = ?, Genero = ?, Celular = ?
  WHERE ID_Usuario = ?
`;

// Se o Tipo_usuario estiver definido, atualiza também o tipo na tabela usuario
const queryTipoUsuario = `
  UPDATE usuario
  SET Tipo_usuario = ?
  WHERE ID_Usuario = ?
`;

// Executa a query para atualizar o tipo do usuário
con.query(queryTipoUsuario, [Tipo_usuario, id], (erroTipo, resultadoTipo) => {
  if (erroTipo) {
    return res.status(500).send({ msg: `Erro ao atualizar tipo de usuário: ${erroTipo}` });
  }
});


  
  // Atualiza os dados pessoais na tabela dados_pessoais
const valoresPessoais = [CPF, RG, Data_Nascimento, Genero, Celular, id];

con.query(queryDadosPessoais, valoresPessoais, (erro1, resultado1) => {
  if (erro1) {
    return res.status(500).send({ msg: `Erro ao atualizar dados pessoais: ${erro1}` });
  }

  // 2. Verifica se já existe um endereço cadastrado para esse usuário
  const queryVerificaEndereco = `SELECT * FROM enderecos WHERE ID_Usuario = ?`;
  con.query(queryVerificaEndereco, [id], (erro2, resultados) => {
    if (erro2) {
      return res.status(500).send({ msg: `Erro ao verificar endereço: ${erro2}` });
    }

    // Se já existe um endereço, atualiza os dados na tabela enderecos
    if (resultados.length > 0) {
      const queryUpdateEndereco = `
        UPDATE enderecos
        SET CEP = ?, Logradouro = ?, Numero = ?, Complemento = ?, Bairro = ?, Cidade = ?, Estado = ?
        WHERE ID_Usuario = ?
      `;
      const valoresEndereco = [CEP, Endereco, Numero, Complemento, Bairro, Cidade, Estado, id];
      console.log("Dados recebidos para atualizar:", valoresEndereco);

      con.query(queryUpdateEndereco, valoresEndereco, (erro3, resultado3) => {
        console.log("Resultado da atualização de endereço:", resultado3);
        if (erro3) {
          return res.status(500).send({ msg: `Erro ao atualizar endereço: ${erro3}` });
        }

        return res.status(200).send({ msg: "Dados atualizados com sucesso!" });
      });

    } else {
      // Se não existe endereço, insere um novo registro na tabela enderecos
      const queryInsertEndereco = `
        INSERT INTO enderecos (CEP, Logradouro, Numero, Bairro, Cidade, Estado, ID_Usuario)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const valoresEndereco = [CEP, Endereco, Numero, Bairro, Cidade, Estado, id];

      con.query(queryInsertEndereco, valoresEndereco, (erro4, resultado4) => {
        if (erro4) {
          return res.status(500).send({ msg: `Erro ao inserir endereço: ${erro4}` });
        }

        return res.status(200).send({ msg: "Dados pessoais e endereço inseridos com sucesso!" });
      });
    }
  });
});

//============================================================================================================

// ✅ POST - Cadastrar um novo pet para o usuário
app.post('/meu-perfil/:id/cad-pet', (req, res) => {
  // Extrai os dados do corpo da requisição
  const {
    ID_Usuario,
    Nome,
    Sexo,
    Idade,
    Especie,
    Raca,
    Porte,
    Castrado,
    Restricoes,
    Comportamento,
    Preferencias,
    Foto_pet
  } = req.body;

  console.log("Dados recebidos para cadastrar:", req.body);

  // Query para inserir um novo pet na tabela 'pet'
  const query = `
    INSERT INTO pet (
      ID_Usuario,
      Nome, Sexo, Idade, Especie, Raca, Porte,
      Castrado, Restricoes, Comportamento, Preferencias, Foto_pet
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Valores que serão inseridos na query
  const values = [
    ID_Usuario,
    Nome,
    Sexo,
    Idade,
    Especie,
    Raca,
    Porte,
    Castrado,
    Restricoes,
    Comportamento,
    Preferencias,
    Foto_pet
  ];

  // Executa a query para inserir os dados no banco
  con.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).send({ msg: "Erro ao cadastrar o pet", error: err });
    }
    console.log("Pet cadastrado:", result);
    res.status(201).send({ msg: "Pet cadastrado com sucesso", payload: result });
  });
});


// GET - Listar todos os pets de um usuário específico
app.get('/meu-perfil/:ID_Usuario/listar_pet', (req, res) => {
  // Obtém o ID do usuário dos parâmetros da rota
  const ID_Usuario = req.params.ID_Usuario;

  console.log("Buscando pets do usuário:", ID_Usuario);

  // Consulta os pets no banco de dados que pertencem ao usuário
  con.query(`SELECT * FROM pet WHERE ID_Usuario = ?`, [ID_Usuario], (error, result) => {
    if (error) {
      console.error("Erro ao listar pets:", error);
      return res.status(500).send({ msg: `Erro ao listar pets: ${error}` });
    }
    console.log("Pets encontrados:", result);
    // Retorna a lista de pets encontrados em formato JSON
    res.status(200).json(result);
  });
});


// PUT - Atualizar os dados de um pet específico de um usuário
app.put('/meu-perfil/:ID_Usuario/atualizar-pet/:ID_Pet', (req, res) => {
  // Extrai os parâmetros da rota (ID do usuário e do pet)
  const { ID_Usuario, ID_Pet } = req.params;

  // Exibe no console os dados recebidos para depuração
  console.log(req.body);
  console.log(ID_Usuario);
  console.log(ID_Pet);

  // Extrai os dados do corpo da requisição para atualizar o pet
  const {
    Nome,
    Sexo,
    Idade,
    Especie,
    Raca,
    Porte,
    Castrado,
    Restricoes,
    Comportamento,
    Preferencias,
    Foto_pet
  } = req.body;

  // Query SQL para atualizar o pet no banco de dados
  const query = `
    UPDATE pet SET
      Nome = ?, Sexo = ?, Idade = ?, Especie = ?, Raca = ?, Porte = ?,
      Castrado = ?, Restricoes = ?, Comportamento = ?, Preferencias = ?, Foto_pet = ?
    WHERE ID_Pet = ? AND ID_Usuario = ?
  `;

  // Valores para substituir os placeholders da query
  const values = [
    Nome, Sexo, Idade, Especie, Raca, Porte,
    Castrado, Restricoes, Comportamento, Preferencias, Foto_pet,
    ID_Pet, ID_Usuario
  ];

  // Executa a query de atualização no banco
  con.query(query, values, (error, result) => {
    if (error) {
      console.error("Erro na atualização do pet:", error);
      return res.status(500).send({ msg: `Erro ao atualizar pet: ${error}` });
    }
    // Retorna sucesso com os dados atualizados
    res.status(200).json({ msg: "Pet atualizado com sucesso", payload: result });
  });
});


// DELETE - Remover um pet específico do usuário
app.delete('/meu-perfil/:ID_Usuario/delete-pet/:ID_Pet', (req, res) => {
  // Extrai IDs do pet e do usuário da rota
  const { ID_Pet, ID_Usuario } = req.params;

  console.log(`Tentando deletar pet ID: ${ID_Pet} do usuário ID: ${ID_Usuario}`);

  // Query para deletar o pet
  const query = `DELETE FROM pet WHERE ID_Pet = ? AND ID_Usuario = ?`;

  // Executa a query no banco de dados
  con.query(query, [ID_Pet, ID_Usuario], (error, result) => {
    if (error) {
      console.error("Erro ao deletar pet:", error);
      return res.status(500).send({ error: `Erro ao deletar os dados: ${error}` });
    }

    // Verifica se algum registro foi deletado
    if (result.affectedRows === 0) {
      console.warn("Nenhum pet encontrado para deletar com os parâmetros informados.");
      return res.status(404).send({ msg: "Pet não encontrado ou não pertence ao usuário informado." });
    }

    console.log("Pet deletado com sucesso:", result);
    res.status(200).send({ msg: "Pet deletado com sucesso", payload: result });
  });
});



// ====================================================================================================

//  PUT - Atualizar configurações do usuário

app.put('/meu-perfil/config/:id', (req, res) => {
  const ID_Usuario = req.params.id;

  console.log(req.body);

  const {
    Nome, Sobrenome, Celular, Email_usuario
  } = req.body;

  // Atualiza os dados pessoais na tabela dados_pessoais
  con.query(`
    UPDATE dados_pessoais SET
      Nome = ?, Sobrenome = ?, Celular = ?
    WHERE ID_Usuario = ?
  `, [
    Nome, Sobrenome, Celular, ID_Usuario
  ], (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao atualizar configurações: ${error}` });
    }

    // Atualiza o email na tabela usuario
    con.query(`
      UPDATE usuario SET
       Email_usuario = ?
      WHERE ID_Usuario = ?
    `, [
      Email_usuario, ID_Usuario
    ], (erro, resultado) => {
      if (erro) {
        return res.status(500).send({ msg: `Erro ao atualizar configurações: ${erro}` });
      }

      // Envia resposta de sucesso após as duas atualizações
      res.status(200).json({ msg: "Configurações atualizadas com sucesso", payload: result });
    });
  });
});


// para atualizar a senha do usuário
app.put('/meu-perfil/config/senha/:ID_Usuario', async (req, res) => {

  console.log(req.body);

  const ID_Usuario = req.params.ID_Usuario;
  const { Senha_usuario } = req.body;

  try {
    // Gera o hash da nova senha com bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Senha_usuario, saltRounds);

    // Atualiza a senha criptografada no banco de dados
    con.query(`
      UPDATE usuario SET
      Senha_usuario = ? 
      WHERE ID_Usuario = ?
    `, [hashedPassword, ID_Usuario], (erro, result) => {
      if (erro) {
        return res.status(500).send({ msg: "Erro ao atualizar a senha", error: erro });
      }

      // Verifica se algum registro foi alterado (usuário existe)
      if (result.affectedRows === 0) {
        return res.status(404).send({ msg: "Usuário não encontrado para atualizar a senha." });
      }

      // Retorna sucesso na atualização da senha
      res.status(200).json({ msg: "Senha atualizada com sucesso!" });
    });

  } catch (error) {
    // Trata erro na criptografia da senha
    res.status(500).send({ msg: "Erro ao criptografar a senha", error });
  }
});



  // para deletar a conta do usuário
app.delete('/meu-perfil/config/:ID_Usuario', (req, res) => {
  const ID_Usuario = req.params.ID_Usuario;

  // 1. Excluir todos os endereços associados ao usuário
  const deleteEnderecos = 'DELETE FROM enderecos WHERE ID_Usuario = ?';

  con.query(deleteEnderecos, [ID_Usuario], (err1) => {
    if (err1) {
      return res.status(500).send({ msg: 'Erro ao deletar endereços', error: err1 });
    }

    // 2. Excluir os dados pessoais do usuário
    con.query(`DELETE FROM dados_pessoais WHERE ID_Usuario = ?`, [ID_Usuario], (err2, result1) => {
      if (err2) {
        return res.status(500).send({ msg: `Erro ao deletar dados pessoais: ${err2}` });
      }

      // 3. Excluir o usuário da tabela principal
      con.query(`DELETE FROM usuario WHERE ID_Usuario = ?`, [ID_Usuario], (err3, result2) => {
        if (err3) {
          return res.status(500).send({ msg: `Erro ao deletar usuário: ${err3}` });
        }

        // Verifica se o usuário existia e foi deletado
        if (result2.affectedRows === 0) {
          return res.status(404).send({ msg: "Usuário não encontrado." });
        }

        // Retorna sucesso na exclusão da conta
        res.status(200).send({ msg: "Conta deletada com sucesso." });
      });
    });
  });
});
 


// para cadastrar um novo serviço de hospedagem por petsitter
app.post('/escolha-hospedagem-petsitter/servicos', (req, res) => {
  const {
    Tipo_servico,
    Preco_servico,
    qtd_pets,
    Porte_pet,
    Situacao,
    ID_Usuario // ID do cuidador
  } = req.body;

  // Query para inserir novo serviço na tabela 'servicos'
  const query = `
    INSERT INTO servicos (Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao, ID_Usuario)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const values = [Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao, ID_Usuario];

  // Executa a query com os valores recebidos
  con.query(query, values, (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Erro ao registrar reserva' });
    }

    // Retorna sucesso e o ID do serviço criado
    res.status(201).json({ msg: 'Reserva criada com sucesso', idReserva: result.insertId });
  });
});


  // =============================================================================
// Área de Hospedagem para Reserva
// 

// Para listar todos os serviços cadastrados na tabela 'servicos'
app.get('/listar_hosp', (req, res) => {
  con.query("SELECT * FROM servicos", (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao listar serviços: ${error}` });
    }
    // Retorna a lista de serviços encontrados
    res.status(200).json(result);
  });
});




// ############################# Filtro ###############################################
// POST - Filtrar cuidadores com base em cidade, estado e tipo de serviço
app.post("/reserva/filtro", (req, res) => {
  const { cidade, estado, tiposervico } = req.body;

  const query = `
    SELECT 
      us.ID_Usuario, us.Tipo_usuario, us.Foto_usuario,
      dp.Nome, dp.Sobrenome,
      en.Cidade, en.Estado,
      se.ID_servico, se.Tipo_servico, se.Preco_servico
    FROM usuario us
    INNER JOIN dados_pessoais dp ON us.ID_Usuario = dp.ID_Usuario
    INNER JOIN enderecos en ON us.ID_Usuario = en.ID_Usuario
    INNER JOIN agendamento ag ON us.ID_Usuario = ag.Cuidador
    INNER JOIN servicos se ON ag.ID_Servico = se.ID_Servico
    WHERE (us.Tipo_usuario = "Cuidador" OR us.Tipo_usuario = "Cuidador/Tutor")
      AND en.Cidade = ?
      AND en.Estado = ?
      AND se.Tipo_servico = ?
  `;

  con.query(query, [cidade, estado, tiposervico], (err, result) => {
    if (err) {
      return res.status(500).send({ msg: `Erro ao filtrar serviços: ${err}` });
    }
    res.status(200).send({ msg: "Cuidadores encontrados", payload: result });
  });
});
// =============================================================================


// Listar dados do cuidador pelo ID do usuário
app.get('/listar_cuidador/:ID_Usuario', (req, res) => {
  const ID_Usuario = req.params.ID_Usuario;

  const query = `
    SELECT 
      us.ID_Usuario, us.Tipo_usuario, us.Foto_usuario,
      dp.Nome, dp.Sobrenome,
      end.Estado, end.Cidade,
      ser.ID_servico, ser.Tipo_servico, ser.Preco_servico
    FROM usuario us
    INNER JOIN dados_pessoais dp ON us.ID_Usuario = dp.ID_Usuario
    INNER JOIN enderecos end ON us.ID_Usuario = end.ID_Usuario
    INNER JOIN servicos ser ON ser.ID_Usuario = us.ID_Usuario
    WHERE us.ID_Usuario = ?
      AND (us.Tipo_usuario = 'Cuidador' OR us.Tipo_usuario = 'Cuidador/Tutor')
  `;

  con.query(query, [ID_Usuario], (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao listar cuidadores: ${error}` });
    }    
    
    res.status(200).send({ msg: "Cuidador encontrado", payload: result });
  });
});



// Listar recibos/reservas do cuidador pelo ID do usuário
app.get('/listar_recibo/:ID_Usuario', (req, res) => {
  const ID_Usuario = req.params.ID_Usuario;

  const query = `
    SELECT 
      us.ID_Usuario, dp.Nome, dp.Sobrenome,
      ag.Instru_Pet, ag.Itens_Pet, ag.data_inicio, ag.data_conclusao,
      end.Estado, end.Cidade, end.Logradouro, end.Numero,
      ser.Preco_servico
    FROM usuario us
    INNER JOIN dados_pessoais dp ON us.ID_Usuario = dp.ID_Usuario
    INNER JOIN enderecos end ON us.ID_Usuario = end.ID_Usuario
    INNER JOIN agendamento ag ON us.ID_Usuario = ag.Cuidador
    INNER JOIN servicos ser ON ag.ID_Servico = ser.ID_Servico
    WHERE us.ID_Usuario = ? 
      AND (us.Tipo_usuario = 'Cuidador' OR us.Tipo_usuario = 'Cuidador/Tutor')
  `;

  con.query(query, [ID_Usuario], (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao listar reservas: ${error}` });
    }
    res.status(200).send({ msg: "Reservas encontradas", payload: result });
  });
});



// POST - Cadastrar nova reserva de hospedagem (agendamento)
app.post('/reserva/cad-hosp/', (req, res) => {
  const {
    Cuidador,
    Tutor,
    ID_Servico,  
    data_inicio,
    data_conclusao,
    ID_Pet,
    Periodo_entrada,
    Periodo_saida,
    Instru_Pet,
    Itens_Pet
  } = req.body;

  // Inserir o agendamento no banco de dados
  const insertAgendamentoQuery = `
    INSERT INTO agendamento (
      ID_Servico, Cuidador, Tutor, data_inicio, data_conclusao,
      ID_Pet, Periodo_entrada, Periodo_saida,
      Instru_Pet, Itens_Pet
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const agendamentoValues = [
    ID_Servico, Cuidador, Tutor,
    data_inicio, data_conclusao,
    ID_Pet,
    Periodo_entrada, Periodo_saida,
    Instru_Pet, Itens_Pet
  ];

  con.query(insertAgendamentoQuery, agendamentoValues, (err2) => {
    if (err2) {
      console.error("Erro ao inserir agendamento:", err2);
      return res.status(500).send({ error: "Erro ao cadastrar o agendamento", detalhes: err2.message });
    }

    res.status(201).send({
      message: "Reserva e agendamento criados com sucesso!!!",
      ID_Servico: ID_Servico
    });
  });
});

// ✏️ Atualizar os dados de um serviço de hospedagem específico
app.put('/atualizar_Hosp/:ID_Servico', (req, res) => {
  const ID_Servico = req.params.ID_Servico;
  const { Cuidador, Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao } = req.body;

  // Query para atualizar os campos do serviço com base no ID_Servico
  const sql = `
    UPDATE servicos SET 
      Cuidador = ?, Tipo_servico = ?, Preco_servico = ?, 
      qtd_pets = ?, Porte_pet = ?, Situacao = ?
    WHERE ID_Servico = ?
  `;

  const values = [
    Cuidador, Tipo_servico, Preco_servico,
    qtd_pets, Porte_pet, Situacao, ID_Servico
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).send({ msg: `Erro ao atualizar serviço: ${err}` });
    }
    res.status(200).send({ msg: "Serviço atualizado com sucesso", payload: result });
  });
});



// 🗑️ Remover um serviço de hospedagem pelo ID
app.delete('/delete_Hosp/:ID_Servico', (req, res) => {
  const ID_Servico = req.params.ID_Servico;

  // Executa a exclusão do serviço na tabela 'servicos' pelo ID_Servico
  con.query("DELETE FROM servicos WHERE ID_Servico = ?", [ID_Servico], (err, result) => {
    if (err) {
      return res.status(500).send({ msg: `Erro ao deletar serviço: ${err}` });
    }
    res.status(200).send({ msg: "Serviço deletado com sucesso", payload: result });
  });
});


// ======================================================================================================
// Vamos subir o servidor na porta 3000
app.listen(3000,()=>{
    console.log("Servidor online http://127.0.0.1:3000");   
});