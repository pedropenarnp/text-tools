# 📘 Projeto Final - Aplicação Web3 com Cartesi

Este repositório contém o **projeto final da disciplina**, composto por:

- ⚙️ **Backend (DApp Cartesi)** em Python (`text-tools/`)
- 💻 **Frontend React** (`text-tools-frontend/`)
- 🔗 **Integração com blockchain de teste (Anvil/chain 31337)**

A aplicação é um **Text Tools DApp**, que processa entradas de texto e retorna resultados on-chain como **NOTICEs**:

- 📝 `stats`: estatísticas de palavras, caracteres e hash SHA256.  
- 🔊 `shout`: retorna o texto em maiúsculas.  
- 🔄 `palindrome`: verifica se o texto é um palíndromo.  

---

## 📂 Estrutura do projeto
```bash
text-tools
 ├── text-tools/            # Backend Cartesi DApp em Python
 │    ├── dapp.py
 │    ├── requirements.txt
 │    └── Dockerfile
 │
 ├── text-tools-frontend/   # Frontend React (Vite + Wagmi + MetaMask)
 │    ├── src/App.jsx
 │    ├── src/index.css
 │    └── ...
 │
 └── README.md
```

## ⚙️ Pré-requisitos

🐳 Docker

🟣 Cartesi CLI

🟢 Node.js

🦊 MetaMask

## 🚀 Rodando o Backend (DApp)

# Entre na pasta
cd text-tools/text-tools

# Build da aplicação
cartesi build

# Executar o node local
cartesi run

# Em um novo terminal entre na pasta
cd text-tools/text-tools-frontend

# Instale dependências
npm install

# Rode em modo dev
npm run dev

## Acesse no navegador:
👉 http://localhost:5173

5173

🔗 Configuração da MetaMask

Abra MetaMask → Configurações → Redes → Adicionar rede manualmente

Preencha:

🌐 Nome da rede: Cartesi Local

🆔 Chain ID: 31337

⛽ Moeda nativa: ETH

🔗 RPC URL: http://localhost:8545

🛰 Block explorer: (opcional) http://localhost:5555

Importe a conta de teste (já com saldo):

0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97

📝 Exemplo de uso (Frontend)

Conecte a carteira (MetaMask → Cartesi Local).

Escolha a operação (stats, shout, palindrome).

Digite o texto e clique em Enviar input.

Confirme a transação na MetaMask.

Veja no terminal do cartesi run o NOTICE emitido.

