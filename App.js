const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

function getLocalIPv4() {
  const ipCmd = `ipconfig | findstr /R /C:"IPv4"`;
  const ipOutput = execSync(ipCmd).toString();

  // Utilizando expressão regular para encontrar o endereço IPv4 que começa com "192.168."
  const ipv4Regex = /192\.168\.\d+\.\d+/g;
  const ipv4Matches = ipOutput.match(ipv4Regex);

  return ipv4Matches;
}

const app = express()
let port = 3000

const types = {
  doc: 'doc',
  comprovante: 'comprovante',
  termo: 'termo'
}

const defaultType = types.doc

app.use(bodyParser.urlencoded({ extended: true }))

function renameImage(image, type, newName) {
  const [imageName, ext] = image.split('.')
  const [name, docType] = imageName.split('-')
  let newFile

  if (docType) {
    newFile = `${newName ? newName : name}-${type}.${ext}`
  } else {
    newFile = `${newName ? newName : imageName}-${type}.${ext}`
  }

  const oldPath = path.join(__dirname, 'pages', 'images', image)
  const newPath = path.join(__dirname, 'pages', 'images', newFile)

  fs.renameSync(oldPath, newPath)

  return newFile // Retorna o novo nome do arquivo.
}

app.get('/images', (req, res) => {
  const imageDirectory = path.join(__dirname, 'pages', 'images')
  fs.readdir(imageDirectory, (err, files) => {
    if (err) {
      console.error('Erro ao ler o diretório de imagens:', err)
      return res.status(500).send('Erro ao obter a lista de imagens.')
    }

    const imageList = files
      .filter((file) => file.endsWith('.png') || file.endsWith('.jpg'))
      .map((file) => {
        if (!file.includes('-')) {
          file = renameImage(file, defaultType)
        }

        const [imageName, ext] = file.split('.')
        const [name, type] = imageName.split('-')
        return { file: file, name: name, type: type }
      })

    res.json(imageList)
  })
})

app.post('/rename', (req, res) => {
  //console.log(req.body)
  const originalName = req.body.originalName
  const newName = req.body.newName
  const newType = req.body.newType

  if (!originalName || !newName || !newType) {
    return res.status(400).json({ ok: 0, message: 'Parâmetros inválidos.' })
  }

  const imageDirectory = path.join(__dirname, 'pages', 'images')
  const imageList = fs.readdirSync(imageDirectory)

  if (!imageList.includes(originalName)) {
    return res.status(404).json({ ok: 0, message: 'Imagem não encontrada.' })
  }

  const newImageName = renameImage(originalName, newType, newName)

  // resposta de sucesso
  res.json({ ok: 1, message: 'Arquivo renomeado com sucesso.' })
})

function startServer() {
  app.use(express.static(path.join(__dirname, 'pages')))

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'index.html'))
  })

  app.listen(port, () => {
    // Teste a função
    const ipv4 = getLocalIPv4();

    if (ipv4) {
      console.log(`Endereço local: http://${ipv4}:${port} - compartilhe com os outros na rede (Wifi ou cabo)`);
    } else {
      console.log('Não foi encontrado um endereço IPv4 local que comece com "192.168."');
    }

    console.log(`Servidor está executando em: http://localhost:${port}`)
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Porta ${port} está em uso. Tentando a próxima porta...`)
      port++
      startServer()
    } else {
      console.error('Erro ao iniciar o servidor:', err.message)
    }
  })
}

startServer()
