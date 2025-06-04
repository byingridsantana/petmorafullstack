// Importar a bliblioteca do node modules express para criar nosso servidor de backend
const express = require('express') 

// Importar a biblioteca do node modules cors para permitir requisições de outros domínios

const mysql = require('mysql2'); 

const cors = require('cors');

const path = require('path');


//importar a biblioteca do bcrypt
//para a criptografia de senha
const bcrypt = require("bcrypt");
// Importar a biblioteca do jwt 
const jwt = require("jsonwebtoken");
// Importa a função 'pathToFileURL' do módulo 'url', usada para converter caminhos de arquivos em URLs no formato file://
const { pathToFileURL } = require('url');


// Carregar a função que manipula dados em formatos JSON, ou seja (Delete, Ler, Gravar, Atualizar)
const con= mysql.createConnection({
    host:"127.0.0.1",
    port:"3306",
    user:"root",
    password:"",
    database:"dbpethouse"
})

con.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao MySQL:', err);
    } else {
      console.log('Conectado ao MySQL!');
    }
  });
  
  module.exports = con;


const app = express(); // Criando uma instância do express


app.use(express.json());

// Ativar o modulo do cors
app.use(cors());

app.use(express.static('fotos'));








// Primeira rota para listar os dados do banco 

app.get('/listar_user', (req, res) => {
    // Aqui estamos criando uma rota para listar todos os usuários
    con. query("SELECT * FROM usuario", (error, result) => {
        if(error) {
            return res.status(500)
            .send({msg: `Erro ao listar os dados do usuário, ${error}`});
        }
        else {
            res.status(200).send({msg:result}) // Se não houver erro, retornamos os dados

        }
    })

    });
// req é o request, ou seja, a requisição que o cliente faz para o servid_clienteor
// res é a resposta que o servid_clienteor envia para o cliente
// A função res.send() envia uma resposta para o cliente
// A função res.status() define o status da resposta, 200 significa que a requisição foi bem sucedid_clientea
// Primeira rota para listar os dados do banco





// Segunda rota para cadastrar um novo usuário no banco
app.post('/cad_user', (req, res) => {
  console.log(req.body)
    let sh = req.body.Senha_usuario;

// Aqui estamos criando uma rota para cadastrar um novo usuário 
    // O bcrypt é uma biblioteca para criptografar senhas
    // O bcrypt.hashSync() é uma função que criptografa a senha
    bcrypt.hash(sh, 10, (erro, criptografada) => {
        if (erro) {
            return res.status(500) .send({error:`Erro ao criptografar a senha, ${erro}`});
            // se houver erro, o sistema fica invulnerável para ataques
        }
        // Devolver o resultado da senha criptografada para o body,
        // porém com a devida criptografia

        req.body.Senha_usuario = criptografada;
    con.query("INSERT INTO usuario (Email_usuario, Senha_usuario) VALUES (?, ?) ",[req.body.Email_usuario, req.body.Senha_usuario], (error, result) => {
        if (error) {
            return res.status(500) // Se houver um erro, retornamos o erro
            .send({error:`Erro ao cadastrar os dados, ${error}`});

        }
        let Idusuario= result.insertId;
        con.query("INSERT INTO dados_pessoais (Nome, Sobrenome, ID_Usuario) VALUES (?,?,?)",[req.body.Nome, req.body.Sobrenome, Idusuario], (erro, resultado) => {
          if (erro) {
            return res.status(500) // Se houver um erro, retornamos o erro
            .send({error:`Erro ao cadastrar os dados, ${erro}`});
          }

        })
            res.status(201).send({msg:`Usuário cadastrado`,payload:result});
    })
})
});

// Terceira rota para receber os dados e atualizar os dados do banco
app.put('/atualizar_user/:ID_Usuario', (req, res) => {
    con.query("UPDATE usuario set ? WHERE ID_Usuario = ?",[req.body,req.params.ID_Usuario], (error, result) => {
        if (error) {
            return res.status(500) // Se houver um erro, retornamos o erro
            .send({error:`Erro ao atualizar os dados, ${error}`});
        }
        res.status(200)
        .send({msg:`dados atualizado`,payload:result});
    });
}); // O :ID é um parâmetro que será passado na URL, por exemplo: /atualizar_user/1

// // Quarta rota para deletar um usuário do banco
//     app.delete('/delete_user/:ID_Usuario', (req, res) => {
//         con.query("DELETE FROM usuario WHERE ID_Usuario = ?",[req.params.ID_Usuario], (error, result) => {
//             if (error) {
//                 return res.status(500) // Se houver um erro, retornamos o erro
//                 .send({error:`Erro ao deletar os dados, ${error}`});
//             }
//             res.status(200)
//             .send({msg:`dados deletado`,payload:result});
//         });
//     }); // O :ID é um parâmetro que será passado na URL, por exemplo: /delete_user/1


    // ==========================================================================================

    app.get('/fotos', (req, res) => {
    
      // Envia o arquivo "id1photo.png" localizado na pasta "fotos" no diretório raiz do projeto
      res.sendFile(__dirname + "/fotos/id1photo.png");
  });

//Login
app.post('/login', (req, res) => {
  const { Email_usuario, Senha_usuario } = req.body;
  console.log(Senha_usuario)
  con.query("SELECT us.ID_Usuario, us.Email_usuario, us.Senha_usuario, us.Foto_usuario, us.Tipo_usuario, dp.Nome, dp.Sobrenome FROM usuario us INNER JOIN dados_pessoais dp ON us.ID_Usuario = dp.ID_Usuario WHERE  us.Email_usuario = ?", [Email_usuario], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).send({ msg: "Usuário ou senha inválidos" });
    }

    const usuario = results[0];
    console.log(usuario)

    // Verifica a senha com bcrypt
    bcrypt.compare(Senha_usuario, usuario.Senha_usuario, (erro, batem) => {
      if (erro || !batem) {
        return res.status(401).send({ msg: "Usuário ou senha inválidos" });
      }
      if (usuario.Tipo_usuario ==null || usuario.Tipo_usuario.trim() === '') {
        return res.status(200).send({ 
          msg: "Altere seu tipo de perfil.", 
          usuario: {
  
            id: usuario.ID_Usuario,
            email: usuario.Email_usuario,
            nome: usuario.Nome,
            sobrenome: usuario.Sobrenome,
            foto: usuario.Foto_usuario // ajuste conforme o nome do campo
          }})
        }
          else{        
      // Se autenticado com sucesso
      return res.status(200).send({ 
        msg: "Login realizado com sucesso", 
        usuario: {

          id: usuario.ID_Usuario,
          email: usuario.Email_usuario,
          nome: usuario.Nome,
          sobrenome: usuario.Sobrenome, 
          foto: usuario.Foto_usuario // ajuste conforme o nome do campo
        }
      })
    }
  });
});
});



// =============================================================================================================


// Atualizar meu perfil

app.put('/meu-perfil/:id', (req, res) => {
  const id = req.params.id;
  const dados = req.body;

  const query = "UPDATE usuario SET ? WHERE ID_Usuario = ?";

  con.query(query, [dados, id], (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro OOOOOOOOO ao atualizar os dados: ${error}` });
    }

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

  const query = `
    INSERT INTO enderecos 
      (ID_Usuario, CEP, Logradouro, Numero, Complemento, Bairro, Cidade, Estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [ID_Usuario, CEP, Endereco, Numero, Complemento, Bairro, Cidade, Estado];

  console.log("Dados recebidos para inserir:", values);

  con.query(query, values, (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao inserir endereço: ${error}` });
    }

    res.status(200).send({ msg: "Endereço inserido com sucesso", payload: result });
  });
});

app.put('/meu-perfil/alterar-dados-pessoais/:id', (req, res) => {
  console.log(req.body)
  //console.log(req.params.id)

  if(req.body.Tipo_usuario!="Tutor"){
    const queryServico = `
    INSERT INTO servicos(Tipo_servico, Preco_servico, Porte_pet, ID_Usuario)values(?,?,?,?) `;
    con.query(queryServico, 
      [
        req.body.Tipo_servico, req.body.Preco_servico, req.body.Tipo_porte, req.params.id], 
      (erroServico, resultadoServico) => {
      if (erroServico) {
        return res.status(500).send({ msg: `Erro ao atualizar serviço: ${erroServico}` });
      }
    });
  }


  // const queryServico = `
  //   DELETE FROM servicos WHERE ID_Usuario=?`;
  //   con.query(queryServico, 
  //       req.params.id,
  //     (erroServico, resultadoServico) => {
  //     if (erroServico) {
  //       return res.status(500).send({ msg: `Erro ao atualizar serviço: ${erroServico}` });
  //     }
  //   });




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

  console.log(req.body.Tipo_servico);
  console.log(req.body.Preco_servico);
  console.log(req.body.Tipo_porte);


  

  // 1. Atualiza dados pessoais
  const queryDadosPessoais = `
    UPDATE dados_pessoais
    SET CPF = ?, RG = ?, Data_Nascimento = ?, Genero = ?, Celular = ? 
    WHERE ID_Usuario = ?
  `;

  // Se o Tipo_usuario for diferente de null, atualiza também na tabela usuario
    const queryTipoUsuario = `
      UPDATE usuario
      SET Tipo_usuario = ?
      WHERE ID_Usuario = ? 
    `;
    con.query(queryTipoUsuario, [Tipo_usuario, id], (erroTipo, resultadoTipo) => {
      if (erroTipo) {
        return res.status(500).send({ msg: `Erro ao atualizar tipo de usuário: ${erroTipo}` });
      }    
    });


  
  // Atualiza os dados pessoais


  const valoresPessoais = [CPF, RG, Data_Nascimento, Genero, Celular, id];

  con.query(queryDadosPessoais, valoresPessoais, (erro1, resultado1) => {
    if (erro1) {
      return res.status(500).send({ msg: `Erro ao atualizar dados pessoais: ${erro1}` });
    }

    // 2. Verifica se já existe endereço para esse usuário
    const queryVerificaEndereco = `SELECT * FROM enderecos WHERE ID_Usuario = ?`;
    con.query(queryVerificaEndereco, [id], (erro2, resultados) => {
      if (erro2) {
        return res.status(500).send({ msg: `Erro ao verificar endereço: ${erro2}` });
      }

      // Se já existe, faz UPDATE
      if (resultados.length > 0) {
        const queryUpdateEndereco = `
          UPDATE enderecos
          SET CEP = ?, Logradouro = ?, Numero = ?, Complemento = ?, Bairro = ?, Cidade = ?, Estado = ?
          WHERE ID_Usuario = ?
        `;
        const valoresEndereco = [CEP, Endereco, Numero, Complemento, Bairro, Cidade, Estado, id];
        console.log("Dados recebidos para atualizar:", valoresEndereco);

        con.query(queryUpdateEndereco, valoresEndereco, (erro3, resultado3) => {
          console.log("Dados recebidos para atualizar:", resultado3);
          if (erro3) {
            return res.status(500).send({ msg: `Erro ao atualizar endereço: ${erro3}` });
          }

          return res.status(200).send({ msg: "Dados atualizados com sucesso!" });
        });

      } else {
        // Senão, faz INSERT
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
});

//============================================================================================================

// ✅ POST - Cadastrar pet
app.post('/meu-perfil/:id/cad-pet', (req, res) => {
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

  const query = `
    INSERT INTO pet (
      ID_Usuario,
      Nome, Sexo, Idade, Especie, Raca, Porte,
      Castrado, Restricoes, Comportamento, Preferencias, Foto_pet
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

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

  con.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).send({ msg: "Erro ao cadastrar o pet", error: err });
    }
    console.log("✅ Pets encontrados:", result);
    res.status(201).send({ msg: "Pet cadastrado com sucesso", payload: result });
  });
});


app.get('/meu-perfil/:ID_Usuario/listar_pet', (req, res) => {
  const ID_Usuario = req.params.ID_Usuario;

  console.log("🔎 Buscando pets do usuário:", ID_Usuario);

  con.query(`SELECT * FROM pet WHERE ID_Usuario = ?`, [ID_Usuario], (error, result) => {
    if (error) {
      console.error("❌ Erro ao listar pets:", error);
      return res.status(500).send({ msg: `Erro ao listar pets: ${error}` });
    }
    console.log("✅ Pets encontrados:", result);
    res.status(200).json(result);
  });
});




app.put('/meu-perfil/:ID_Usuario/atualizar-pet/:ID_Pet', (req, res) => {
  const { ID_Usuario, ID_Pet } = req.params;

  console.log(req.body);
  console.log(ID_Usuario);
  console.log(ID_Pet);

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

  const query = `
    UPDATE pet SET
      Nome = ?, Sexo = ?, Idade = ?, Especie = ?, Raca = ?, Porte = ?,
      Castrado = ?, Restricoes = ?, Comportamento = ?, Preferencias = ?, Foto_pet = ?
    WHERE ID_Pet = ? AND ID_Usuario = ?
  `;

  const values = [
    Nome, Sexo, Idade, Especie, Raca, Porte,
    Castrado, Restricoes, Comportamento, Preferencias, Foto_pet,
    ID_Pet, ID_Usuario
  ];

  con.query(query, values, (error, result) => {
    if (error) {
      console.error("❌ Erro na atualização do pet:", error);
      return res.status(500).send({ msg: `Erro ao atualizar pet: ${error}` });
    }
    res.status(200).json({ msg: "Pet atualizado com sucesso", payload: result });
  });
});




// ✅ DELETE - Remover pet
app.delete('/meu-perfil/:ID_Usuario/delete-pet/:ID_Pet', (req, res) => {
  const { ID_Pet, ID_Usuario } = req.params;

  console.log(`Tentando deletar pet ID: ${ID_Pet} do usuário ID: ${ID_Usuario}`);

  const query = `DELETE FROM pet WHERE ID_Pet = ? AND ID_Usuario = ?`;

  con.query(query, [ID_Pet, ID_Usuario], (error, result) => {
    if (error) {
      console.error("Erro ao deletar pet:", error);
      return res.status(500).send({ error: `Erro ao deletar os dados: ${error}` });
    }

    if (result.affectedRows === 0) {
      console.warn("Nenhum pet encontrado para deletar com os parâmetros informados.");
      return res.status(404).send({ msg: "Pet não encontrado ou não pertence ao usuário informado." });
    }

    console.log("Pet deletado com sucesso:", result);
    res.status(200).send({ msg: "Pet deletado com sucesso", payload: result });
  });
});


// ====================================================================================================

// Area de configurações
// Na Area de configurações somente iremos atualizar às informações do usuario,
// na parte final apresenta apenas o botão de delete 

// ✅ Get - Listando as configurações do usuário

// app.get('/meu-perfil/config/:id', (req, res) => {
//   const ID_Usuario = req.params.id;

//   con.query(`
//     SELECT * FROM usuario us
//     INNER JOIN dados_pessoais dp ON us.ID_Usuario = dp.ID_Usuario
//     WHERE us.ID_Usuario = ?
//   `, [ID_Usuario], (error, result) => {
//     if (error) {
//       return res.status(500).send({ msg: `Erro ao listar configurações: ${error}` });
//     }
//     res.status(200).json(result);
//   });
// });


//  PUT - Atualizar configurações do usuário

app.put('/meu-perfil/config/:id', (req, res) => {
  const ID_Usuario = req.params.id;

  console.log(req.body)


  const {
    Nome, Sobrenome, Celular, Email_usuario
  } = req.body;

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
    res.status(200).json({ msg: "Configurações atualizadas com sucesso", payload: result });
    });
  });
})

// Aqui estamos atualizando a senha. 

app.put('/meu-perfil/config/senha/:ID_Usuario', async (req, res) => {

  console.log(req.body)

  const ID_Usuario = req.params.ID_Usuario;
  const { Senha_usuario } = req.body;

  try {
    // Gera o hash da nova senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Senha_usuario, saltRounds);

    // Atualiza a senha no banco de dados com o hash
    con.query(`
      UPDATE usuario SET
      Senha_usuario = ? 
      WHERE ID_Usuario = ?
    `, [hashedPassword, ID_Usuario], (erro, result) => {
      if (erro) {
        return res.status(500).send({ msg: "Erro ao atualizar a senha", error: erro });
      }

      if (result.affectedRows === 0) {
        return res.status(404).send({ msg: "Usuário não encontrado para atualizar a senha." });
      }

      res.status(200).json({ msg: "Senha atualizada com sucesso!" });
    });

  } catch (error) {
    res.status(500).send({ msg: "Erro ao criptografar a senha", error });
  }
});


  // funcionandoooooooo
  // Deletando a conta do usuário
  app.delete('/meu-perfil/config/:ID_Usuario', (req, res) => {
    const ID_Usuario = req.params.ID_Usuario;

    // 1. Excluir da tabela de endereços
  const deleteEnderecos = 'DELETE FROM enderecos WHERE ID_Usuario = ?';

  con.query(deleteEnderecos, [ID_Usuario], (err1) => {
    if (err1) {
      return res.status(500).send({ msg: 'Erro ao deletar endereços', error: err1 });
    }
    

  
    // Primeiro remove os dados pessoais
    con.query(`DELETE FROM dados_pessoais WHERE ID_Usuario = ?`, [ID_Usuario], (err1, result1) => {
      if (err1) {
        return res.status(500).send({ msg: `Erro ao deletar dados pessoais: ${err1}` });
      }
  
      // Depois remove o usuário
      con.query(`DELETE FROM usuario WHERE ID_Usuario = ?`, [ID_Usuario], (err2, result2) => {
        if (err2) {
          return res.status(500).send({ msg: `Erro ao deletar usuário: ${err2}` });
        }
  
        if (result2.affectedRows === 0) {
          return res.status(404).send({ msg: "Usuário não encontrado." });
        }
  
        res.status(200).send({ msg: "Conta deletada com sucesso." });
      });
    });
  });
});
  
  


  // =============================================================================
   // Area de pesquisa da hospedagem
   // ✅ Post - Pesquisar hospedagem

  //  app.post('/escolha-hospedagem-petsitter/servicos', (req, res) => {
  //   const {
  //     dataInicio,
  //     dataFim,
  //     servico,
  //     estado,
  //     cidade,
  //     tipoPet,
  //     quantidade
  //   } = req.body;
  
  //   con.query(`
  //     INSERT INTO agendamento 
  //     ( Data_Inicio, Data_conclusao, Servico, Estado, Cidade, TipoPet, Quantidade) 
  //     VALUES (?, ?, ?, ?, ?, ?, ?)`, 
  //     [ dataInicio, dataFim, servico, estado, cidade, tipoPet, quantidade],
  //     (error, result) => {
  //       if (error) {
  //         console.error(error);
  //         return res.status(500).json({ msg: 'Erro ao registrar reserva' });
  //       }
  
  //       res.status(201).json({ msg: 'Reserva criada com sucesso', idReserva: result.insertId });
  //     });
  // });

  app.post('/escolha-hospedagem-petsitter/servicos', (req, res) => {
    const {
      Tipo_servico,
      Preco_servico,
      qtd_pets,
      Porte_pet,
      Situacao,
      ID_Usuario // ID do cuidador
    } = req.body;
  
    const query = `
      INSERT INTO servicos (Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao, ID_Usuario)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao, ID_Usuario];
  
    con.query(query, values, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Erro ao registrar reserva' });
      }
  
      res.status(201).json({ msg: 'Reserva criada com sucesso', idReserva: result.insertId });
    });
  });
  

  // =============================================================================
  // Area de Hospedagem para Reserva
  // ✅ GET - Listar Hospedagem para a reserva

  // 📦 Listar serviços disponíveis (hospedagem)
app.get('/listar_hosp', (req, res) => {
  con.query("SELECT * FROM servicos", (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao listar serviços: ${error}` });
    }
    res.status(200).json(result);
  });
});



// ############################# Filtro ###############################################
app.post("/reserva/filtro",(req,res)=>{
  con.query(`	SELECT us.ID_Usuario, us.Tipo_usuario, us.Foto_usuario,
	dp.Nome,dp.Sobrenome, en.Cidade,en.Estado, se.ID_servico,se.Tipo_servico, se.Preco_servico
	FROM usuario us INNER JOIN dados_pessoais dp ON us.ID_Usuario = dp.ID_Usuario
	INNER JOIN enderecos en ON us.ID_Usuario = en.ID_Usuario INNER JOIN agendamento ag ON 
	us.ID_Usuario = ag.Cuidador INNER JOIN servicos se ON ag.ID_Servico = se.ID_Servico
	WHERE us.Tipo_usuario = "Cuidador" OR us.Tipo_usuario = "Cuidador/Tutor" AND en.Cidade = ? 
	AND en.Estado = ? AND se.Tipo_servico = ?`,[req.body.cidade,req.body.estado,req.body.tiposervico],(err,result)=>{
    if(err){
      return res.status(500).send({ msg: `Erro ao filtrar serviços: ${err}` });
    }
    res.status(200).send({msg:`Cuidadores encontrados`, payload: result});
  })
})



// Listar cuidadores por ID

app.get('/listar_cuidador/:ID_Usuario', (req, res) => {
  con.query(`SELECT us.ID_Usuario, us.Tipo_usuario, us.Foto_usuario, dp.Nome, dp.Sobrenome, end.Estado, end.Cidade, ser.ID_servico, ser.Tipo_servico, ser.Preco_servico
from usuario us INNER JOIN dados_pessoais dp
ON us.ID_Usuario = dp.ID_Usuario
INNER JOIN enderecos end ON us.ID_Usuario = end.ID_Usuario
INNER JOIN servicos ser ON ser.ID_Usuario = us.ID_Usuario 
WHERE us.ID_Usuario = ? AND (us.Tipo_usuario = 'Cuidador' OR us.Tipo_usuario = 'Cuidador/Tutor')`, req.params.ID_Usuario, (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao listar cuidadores: ${error}` });
    }    
    
    res.status(200).send({ msg: "Cuidadores encontrados", payload: result });
  })

})


app.get('/listar_recibo/:ID_Usuario', (req, res) => {
  con.query(`SELECT us.ID_Usuario, dp.Nome, dp.Sobrenome, ag.Instru_Pet, ag.Itens_Pet, ag.data_inicio, ag.data_conclusao, end.Estado, end.Cidade, end.Logradouro, end.Numero, ser.Preco_servico
    from usuario us INNER JOIN dados_pessoais dp 
    ON us.ID_Usuario = dp.ID_Usuario
    INNER JOIN enderecos end ON us.ID_Usuario = end.ID_Usuario
    INNER JOIN agendamento ag ON us.ID_Usuario = ag.Cuidador
    INNER JOIN servicos ser ON ag.ID_Servico = ser.ID_Servico
    WHERE us.ID_Usuario = ? AND (us.Tipo_usuario = 'Cuidador' OR us.Tipo_usuario = 'Cuidador/Tutor')`, req.params.ID_Usuario, (error, result) => {
    if (error) {
      return res.status(500).send({ msg: `Erro ao listar reservas: ${error}` });
    }
    res.status(200).send({ msg: "Reservas encontradas", payload: result });
  })
});








// 📝 Cadastrar uma nova hospedagem (reserva) feita por um tutor específico
// app.post('/reserva/cad-hosp/:id', (req, res) => {
//   const Tutor = req.params.id; // ID do tutor (usuário logado)
//   const Cuidador = req.body.ID_Usuario; // ID do cuidador que oferece o serviço

//   const {
//     Tipo_servico,
//     Preco_servico,
//     qtd_pets,
//     Porte_pet,
//     Situacao,
//     ID_Usuario, // ID do cuidador

//     // Dados para o agendamento
//     data_inicio,
//     data_conclusao,
//     ID_Pet,
//     ID_Endereco,
//     Periodo_entrada,
//     Periodo_saida,
//     Instru_Pet,
//     Itens_Pet
//   } = req.body;

//   // 1️⃣ Verificar se Cuidador existe e é do tipo certo
//   const checkCuidadorSQL = `
//     SELECT ID_Usuario FROM usuario 
//     WHERE ID_Usuario = ? AND (Tipo_usuario = 'Cuidador' OR Tipo_usuario = 'Cuidador/Tutor')
//   `;

//   con.query(checkCuidadorSQL, [ID_Usuario], (errCheck, resultCheck) => {
//     if (errCheck) {
//       return res.status(500).send({ msg: "Erro ao validar cuidador", error: errCheck });
//     }

//     if (resultCheck.length === 0) {
//       return res.status(400).send({ msg: "O ID informado não é um cuidador válido" });
//     }})



//   // 1️⃣ Inserir serviço
//   const insertServicoSQL = `
//     INSERT INTO servicos (Cuidador, Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao)
//     VALUES (?, ?, ?, ?, ?, ?)
//   `;

//   const servicoValues = [Cuidador, Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao];

//   con.query(insertServicoSQL, servicoValues, (errServico, resultServico) => {
//     if (errServico) {
//       return res.status(500).send({ msg: "Erro ao cadastrar serviço", error: errServico });
//     }

//     const ID_Servico = resultServico.insertId;

//     // 2️⃣ Inserir agendamento com o ID_Servico recém criado
//     const insertAgendamentoSQL = `
//       INSERT INTO agendamento (
//         ID_Servico, Cuidador, Tutor, ID_Recibo,
//         data_inicio, data_conclusao,
//         ID_Pet, ID_Endereco,
//         Periodo_entrada, Periodo_saida,
//         Instru_Pet, Itens_Pet
//       ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const agendamentoValues = [
//       ID_Servico, Cuidador, Tutor,
//       data_inicio, data_conclusao,
//       ID_Pet, ID_Endereco,
//       Periodo_entrada, Periodo_saida,
//       Instru_Pet, Itens_Pet
//     ];

//     con.query(insertAgendamentoSQL, agendamentoValues, (errAgendamento, resultAgendamento) => {
//       if (errAgendamento) {
//         return res.status(500).send({ msg: "Erro ao cadastrar agendamento", error: errAgendamento });
//       }

//       res.status(201).send({
//         msg: "Serviço e agendamento cadastrados com sucesso!",
//         ID_Servico,
//         ID_Agendamento: resultAgendamento.insertId
//       });
//     });
//   });
// });

app.post('/reserva/cad-hosp/', (req, res) => {

  const {
    Cuidador,
    Tutor,
    ID_Servico,
    Preco_servico,
    qtd_pets,
    Porte_pet,
    Situacao,
    data_inicio,
    data_conclusao,
    ID_Pet,
    Periodo_entrada,
    Periodo_saida,
    Instru_Pet,
    Itens_Pet
  } = req.body;

  // // Inserir serviço
  // const insertServicoQuery = `
  //   INSERT INTO servicos (Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao)
  //   VALUES (?, ?, ?, ?, ?)
  // `;
  // const servicoValues = [Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao];

  // con.query(insertServicoQuery, servicoValues, (err, servicoResult) => {
  //   if (err) {
  //     console.error("Erro ao inserir serviço:", err);
  //     return res.status(500).send({ error: "Erro ao cadastrar o serviço", detalhes: err.message });
  //   }

  //   const ID_Servico = servicoResult.insertId;

    // Inserir agendamento
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









// ✏️ Atualizar um serviço de hospedagem
app.put('/atualizar_Hosp/:ID_Servico', (req, res) => {
  const ID_Servico = req.params.ID_Servico;
  const { Cuidador, Tipo_servico, Preco_servico, qtd_pets, Porte_pet, Situacao } = req.body;

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


// 🗑️ Deletar um serviço de hospedagem
app.delete('/delete_Hosp/:ID_Servico', (req, res) => {
  const ID_Servico = req.params.ID_Servico;

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
