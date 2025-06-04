# 🐾 Petmora - Projeto Integrador (SENAC)


O **Petmora** é um projeto criado para oferecer uma **plataforma acessível e confiável** voltada a pessoas que têm dificuldade em viajar ou sair, devido à preocupação com seus animais de estimação.

A proposta é conectar tutores a cuidadores, fornecendo **soluções seguras, práticas e afetuosas** para o bem-estar dos pets.

---

## Objetivo do Projeto

- Oferecer **soluções de hospedagem, cuidados e informações** para tutores de pets.
- Criar uma **rede de apoio e compartilhamento de experiências** entre os usuários da plataforma.

---

## Público-Alvo

### Tutores de Pets

Tutores de cães e gatos que:

- Precisam viajar ou se ausentar por um período.
- Procuram serviços **confiáveis de hospedagem ou cuidados**.
- Desejam **informações e dicas** sobre cuidados com animais.

### Cuidadores de Pets

Pessoas que:

- Desejam oferecer serviços como **hospedagem, passeios ou cuidados gerais**.
- Procuram uma **plataforma segura e organizada** para divulgar seus serviços e se conectar com tutores.

---

## Tecnologias utilizadas:

- HTML
- CSS
- Javascript
- Bootstrap
- MySQL
- Nodejs

## Bibliotecas utilizadas

- **express**: Utilizada para criar e gerenciar o servidor backend.
- **mysql2**: Responsável pela conexão e manipulação do banco de dados MySQL.
- **cors**: Permite requisições vindas de outros domínios (por exemplo, frontend em outro endereço).
- **path**: Módulo do Node.js utilizado para trabalhar com caminhos de arquivos e diretórios.
- **bcrypt**: Usada para criptografar senhas antes de armazená-las no banco de dados.
- **jsonwebtoken**: Utilizada para criar e verificar tokens JWT (JSON Web Tokens), geralmente para autenticação.
- **url (pathToFileURL)**: Utilizada para converter caminhos de arquivos em URLs no formato `file://`.

## Funcionalidades do Backend

- Criação e autenticação de usuários
- Criptografia de senha com bcrypt
- Geração de tokens JWT
- Cadastro e edição de pets
- Agendamentos de hospedagem
- Criação de recibos
- Relacionamento completo com o banco de dados MySQL

---

## Configuração

1. Instale as dependências com:

```bash
npm install
```

2. Configure as variáveis de ambiente no arquivo `.env`, como:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=dbpethouse
JWT_SECRET=sua_chave_secreta
```

3. Inicie o servidor com:

```bash
node index.js
```

---

## Banco de Dados `dbpethouse`

### Tabela `usuario`
```sql
CREATE TABLE `usuario` (
  `ID_Usuario` int(11) NOT NULL,
  `Tipo_usuario` enum('Cuidador','Tutor','Cuidador/Tutor') DEFAULT NULL,
  `Experiencia` text DEFAULT NULL,
  `Senha_usuario` varchar(100) NOT NULL,
  `Email_usuario` varchar(100) NOT NULL,
  `Foto_usuario` varchar(50) DEFAULT 'id1photo.png',
  `N_contato` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### Tabela `dados_pessoais`
```sql
CREATE TABLE `dados_pessoais` (
  `ID_DadosPessoais` int(11) NOT NULL,
  `ID_Usuario` int(11) DEFAULT NULL,
  `Nome` varchar(50) NOT NULL,
  `Sobrenome` varchar(50) NOT NULL,
  `CPF` varchar(14) DEFAULT NULL,
  `Rg` varchar(14) DEFAULT NULL,
  `Data_Nascimento` date NOT NULL,
  `Genero` varchar(1) DEFAULT NULL,
  `Celular` varchar(20) DEFAULT NULL,
  `Data_Cadastro` datetime DEFAULT current_timestamp(),
  `Consentimento` enum('sim','não') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### Tabela `enderecos`
```sql
CREATE TABLE `enderecos` (
  `ID_Endereco` int(11) NOT NULL,
  `ID_Usuario` int(11) NOT NULL,
  `CEP` varchar(9) NOT NULL,
  `Logradouro` varchar(100) NOT NULL,
  `Numero` varchar(10) NOT NULL,
  `Complemento` varchar(50) DEFAULT NULL,
  `Bairro` varchar(50) NOT NULL,
  `Cidade` varchar(50) NOT NULL,
  `Estado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### Tabela `pet`
```sql
CREATE TABLE `pet` (
  `ID_Pet` int(11) NOT NULL,
  `ID_Usuario` int(11) DEFAULT NULL,
  `Nome` varchar(100) NOT NULL,
  `Sexo` enum('Macho','Femea') DEFAULT NULL,
  `Idade` varchar(18) NOT NULL,
  `Especie` varchar(50) NOT NULL,
  `Raca` varchar(50) NOT NULL,
  `Porte` enum('Pequeno','Medio','Grande') DEFAULT NULL,
  `Castrado` enum('Sim','Não') DEFAULT NULL,
  `Restricoes` varchar(500) NOT NULL,
  `Comportamento` varchar(500) DEFAULT NULL,
  `Preferencias` varchar(500) DEFAULT NULL,
  `Foto_Pet` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### Tabela `servicos`
```sql
CREATE TABLE `servicos` (
  `ID_Servico` int(11) NOT NULL,
  `Tipo_servico` varchar(50) NOT NULL,
  `Preco_servico` decimal(6,2) NOT NULL,
  `qtd_pets` int(11) NOT NULL,
  `Porte_pet` enum('Pequeno','Medio','Grande') DEFAULT NULL,
  `ID_Usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### Tabela `recibo`
```sql
   CREATE TABLE `recibo` (
  `ID_Recibo` int(11) NOT NULL,
  `Detalhes` text DEFAULT NULL,
  `Cuidador` int(11) DEFAULT NULL,
  `Tutor` int(11) DEFAULT NULL,
  `ID_Pet` int(11) DEFAULT NULL,
  `ID_Servico` int(11) DEFAULT NULL,
  `Data_pagamento` datetime DEFAULT current_timestamp(),
  `Forma_pagamento` enum('Cartao de Credito','PIX') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### Tabela `agendamento`
```sql
CREATE TABLE `agendamento` (
  `ID_agendamento` int(11) NOT NULL,
  `ID_Servico` int(11) DEFAULT NULL,
  `Cuidador` int(11) DEFAULT NULL,
  `Tutor` int(11) DEFAULT NULL,
  `ID_Pet` int(11) DEFAULT NULL,
  `ID_Recibo` int(11) DEFAULT NULL,
  `data_inicio` datetime NOT NULL DEFAULT current_timestamp(),
  `data_conclusao` date NOT NULL,
  `Periodo_entrada` enum('Diurno','Noturno') DEFAULT NULL,
  `Periodo_saida` enum('Diurno','Noturno') DEFAULT NULL,
  `Instru_Pet` varchar(500) DEFAULT NULL,
  `Itens_Pet` varchar(500) DEFAULT NULL,
  `ID_Contato` int(11) DEFAULT NULL,
  `Situacao` enum('Concluido','Pendente','Cancelado','Confirmado') DEFAULT 'Pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### Tabela `contato_emergencia`
```sql
CREATE TABLE `contato_emergencia` (
  `ID_Contato` int(11) NOT NULL,
  `ID_Agendamento` int(11) NOT NULL,
  `ID_Usuario` int(11) NOT NULL,
  `Nome` varchar(100) DEFAULT NULL,
  `Celular` varchar(20) DEFAULT NULL,
  `Tipo_usuario` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### CHAVES PRIMÁRIAS E ÍNDICES


### Adiciona os índices e as constraints (FOREIGN KEYS)
```sql
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`ID_Usuario`),
  ADD UNIQUE KEY `Email_usuario` (`Email_usuario`);
```
```sql
ALTER TABLE `dados_pessoais`
  ADD PRIMARY KEY (`ID_DadosPessoais`),
  ADD UNIQUE KEY `CPF` (`CPF`),
  ADD UNIQUE KEY `Rg` (`Rg`),
  ADD KEY `fk_ddp_pk_usuario` (`ID_Usuario`);
```
```sql
ALTER TABLE `enderecos`
  ADD PRIMARY KEY (`ID_Endereco`),
  ADD KEY `fk_endereco_pk_usuario` (`ID_Usuario`);
```
```sql
ALTER TABLE `pet`
  ADD PRIMARY KEY (`ID_Pet`),
  ADD KEY `fk_pet_pk_usuario` (`ID_Usuario`);
```
```sql
ALTER TABLE `servicos`
  ADD PRIMARY KEY (`ID_Servico`);
```
```sql
ALTER TABLE `recibo`
  ADD PRIMARY KEY (`ID_Recibo`),
  ADD KEY `fk_recibo_pk_usuarioc` (`Cuidador`),
  ADD KEY `fk_recibo_pk_pet` (`ID_Pet`),
  ADD KEY `fk_recibo_tutor` (`Tutor`);
```
```sql
ALTER TABLE `agendamento`
  ADD PRIMARY KEY (`ID_agendamento`),
  ADD KEY `fk_agendamento_pk_servico` (`ID_Servico`),
  ADD KEY `fk_agendamento_pk_usuarioc` (`Cuidador`),
  ADD KEY `fk_agendamento_pk_usuariot` (`Tutor`),
  ADD KEY `fk_agendamento_pk_recibo` (`ID_Recibo`),
  ADD KEY `fk_agendamento_contato` (`ID_Contato`),
  ADD KEY `fk_agendamento_pet` (`ID_Pet`);
```
```sql
ALTER TABLE `contato_emergencia`
  ADD PRIMARY KEY (`ID_Contato`),
  ADD KEY `ID_Agendamento` (`ID_Agendamento`),
  ADD KEY `ID_Usuario` (`ID_Usuario`);
```

### CHAVES ESTRANGEIRAS

```sql
ALTER TABLE `dados_pessoais`
  ADD CONSTRAINT `fk_ddp_pk_usuario` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`) ON DELETE CASCADE;
```
```sql
ALTER TABLE `enderecos`
  ADD CONSTRAINT `fk_endereco_pk_usuario` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`) ON DELETE CASCADE;
```
```sql
ALTER TABLE `pet`
  ADD CONSTRAINT `fk_pet_pk_usuario` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`) ON DELETE CASCADE;
```
```sql
ALTER TABLE `recibo`
  ADD CONSTRAINT `fk
```

---

## Seções do site

- **Home**
- **Encontre um Pet Sitter**
- **Encontre uma Hospedagem**
- **Como Funciona**
- **Login/Cadastrar-se**
- **Escolha o periodo ideal**
- **Filtro**
- **Revise e confirme sua reserva** 
- **Pagamento**
- **Confirmação**
- **Contato**




---

### Home

![home](/petmora/assets/img/home.gif)

---

### Encontre uma Pet Sitter

![Encontre um Pet Sitter](/petmora/assets/img/petsitter.gif)

---

### Encontre uma Hospedagem

![Encontre uma Hospedagem](/petmora/assets/img/hospedagem.gif)

---

### Como Funciona

![Como funciona](/petmora/assets/img/como-funciona.gif)

---

### Login/Cadastrar-se

![Login/Cadastro](/petmora/assets/img/login.gif)

---

### Escolha o periodo ideal

![Escolha o Periodo](/petmora/assets/img/escolha-pet.png)

---

### Filtro

![Filtro](/petmora/assets/img/filtro.png)

---

### Revise e confirme sua reserva

![Filtro](/petmora/assets/img/revise-confirme.png)

---

### Pagamento

![Pagamento](/petmora/assets/img/pagamento.png)

---

### Confirmação

![Confirmacao](/petmora/assets/img/confirmacao1.png)

---

### Contato

![Contato](/petmora/assets/img/contato.png)

---

## Status do Projeto

> Em desenvolvimento

---




