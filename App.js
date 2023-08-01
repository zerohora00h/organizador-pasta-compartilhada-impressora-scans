const express = require('express');
const path = require('path');

const app = express();
const port = 3001;

// Define o caminho para a pasta que contém os arquivos estáticos (por exemplo, imagens, CSS, etc.).
app.use(express.static(path.join(__dirname, 'pages')));

// Define uma rota para servir a página index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Inicia o servidor na porta especificada.
app.listen(port, () => {
  console.log(`Servidor está executando na porta ${port}`);
});
