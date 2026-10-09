# ⚽ FootballStats

**Plataforma de gerenciamento de carreiras e estatísticas do futebol.**

O FootballStats é um projeto web em desenvolvimento com o objetivo de organizar informações sobre jogadores, suas temporadas, estatísticas e conquistas ao longo da carreira.

O projeto está sendo desenvolvido com React, Vite e Firebase, com foco em uma interface intuitiva e na organização dos dados esportivos.

## ✨ Funcionalidades

- **Autenticação:** acesso à aplicação com proteção de rotas.
- **Cadastro de jogadores:** criação e gerenciamento de perfis.
- **Perfil do jogador:** visualização das informações e da trajetória esportiva.
- **Histórico de temporadas:** organização dos dados de cada temporada.
- **Estatísticas da carreira:** consolidação de informações registradas nas temporadas.
- **Títulos e premiações:** registro de títulos por clubes, conquistas por seleções, prêmios individuais e artilharias.
- **Interface responsiva:** estrutura visual com tema escuro e detalhes em verde.

> O projeto está em desenvolvimento e novas funcionalidades e melhorias serão adicionadas progressivamente.

## 🛠️ Tecnologias

- [React](https://react.dev/) — construção da interface.
- [Vite](https://vite.dev/) — ambiente de desenvolvimento e build.
- [Firebase Authentication](https://firebase.google.com/docs/auth) — autenticação de usuários.
- [Cloud Firestore](https://firebase.google.com/docs/firestore) — armazenamento dos dados.
- [React Router](https://reactrouter.com/) — navegação entre páginas.
- [Lucide React](https://lucide.dev/) — ícones da interface.
- JavaScript, HTML e CSS.

## 🚀 Como executar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado.
- npm, incluído na instalação do Node.js.
- Um projeto configurado no Firebase.

### 1. Clone o repositório

```bash
git clone https://github.com/biondipedro388-lang/football-stats.git
```

### 2. Entre na pasta

```bash
cd football-stats
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure o Firebase

Configure as variáveis de ambiente utilizadas pelo projeto de acordo com a implementação em `src/services/firebase`.

Crie seu próprio arquivo `.env` local com as configurações necessárias. Não utilize credenciais de terceiros nem envie arquivos com segredos para o repositório.

### 5. Inicie a aplicação

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local para abrir a aplicação no navegador.

## 📦 Outros comandos

Verificar problemas de lint:

```bash
npm run lint
```

Gerar a versão de produção:

```bash
npm run build
```

Visualizar localmente a versão gerada:

```bash
npm run preview
```

## 📁 Organização do projeto

```text
football-stats/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

*Estrutura resumida das principais pastas; os arquivos podem evoluir durante o desenvolvimento.*

## 🔒 Segurança

- Não envie arquivos `.env` com configurações locais ou credenciais privadas.
- Configure regras de segurança adequadas no Firebase Authentication e no Cloud Firestore.
- Não coloque chaves privadas de contas de serviço no código do frontend.
- Utilize variáveis de ambiente para as configurações esperadas pela aplicação.

## 🎯 Objetivo do projeto

O FootballStats faz parte da minha jornada de desenvolvimento de software e tem como objetivo aplicar conhecimentos de desenvolvimento frontend, autenticação, banco de dados e organização de aplicações web em um projeto prático.

## 📌 Status

**Em desenvolvimento.**

As funcionalidades e a estrutura da aplicação continuam evoluindo.

---

Desenvolvido por [Pedro Biondi](https://github.com/biondipedro388-lang).
