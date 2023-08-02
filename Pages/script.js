const imgContainer = document.querySelector('.img-container')

function removeError(element) {
    element.classList.remove('error')
}

async function renameImage(event) {
    event.preventDefault() // Impede o envio tradicional do formulário

    const form = event.target

    //verifica se o campo está vazio
    const inputName = form.querySelector('input[name="img-name"]')

    if (inputName.value === '') {
        inputName.classList.add('error')
        return
    }

    const formData = new FormData(form)
    const originalName = formData.get('original-name')
    const newName = formData.get('img-name')
    const newType = formData.get('img-type')

    const requestData = new URLSearchParams()
    requestData.append('originalName', originalName)
    requestData.append('newName', newName)
    requestData.append('newType', newType)

    try {
        const response = await fetch('/rename', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: requestData.toString()
        })

        if (!response.ok) {
            throw new Error('Erro na requisição.')
        }

        const data = await response.json()

        if (data.ok === 1) {
            alert('Imagem renomeada com sucesso.')

            // Atualizar a lista de imagens após renomear (opcional)
            populateImgContainer()
        } else {
            alert('Erro ao renomear o arquivo: ' + data.message)
        }
    } catch (error) {
        console.error('Erro na requisição:', error.message)
        alert('Erro na requisição. Verifique o console para mais detalhes.')
    }
}

function moveFile(file) {
    const formData = new FormData();
    formData.append('originalName', file);
  
    fetch('/move', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          console.log('Arquivo movido com sucesso:', file);
        } else {
          console.error('Erro ao mover arquivo:', data.message);
        }
      })
      .catch((error) => {
        console.error('Erro ao realizar a requisição:', error);
      });
  }
  

// Função para popular a img-container
async function populateImgContainer() {
    try {
        const response = await fetch('/images')
        if (!response.ok) {
            throw new Error('Erro ao obter a lista de imagens.')
        }

        const imageList = await response.json()

        // Limpar o conteúdo atual da img-container
        imgContainer.innerHTML = ''

        // Criar os elementos para cada imagem
        imageList.forEach((image) => {
            const imgCardHTML = `
            <div class="img-card">
                <picture>
                    <img src="images/${image.file}" alt="Documento" width="200px">
                    <button class="btn-ok" onclick="moveFile(${image.file})">
                        <img src="assets/ok.svg" alt="Confirmar e Mover">
                    </button>
                </picture>
                <div>
                <form class="img-form" onsubmit="renameImage(event)">
                    <input type="hidden" name="original-name" value="${image.file}">
                    <select name="img-type">
                        <option value="doc" ${image.type === 'doc' ? 'selected' : ''}>Documento com Foto</option>
                        <option value="comprovante" ${image.type === 'comprovante' ? 'selected' : ''}>Comprovante de Residência</option>
                        <option value="termo" ${image.type === 'termo' ? 'selected' : ''}>Termo de Responsabilidade</option>
                    </select>
                    <div class="img-name">
                        <input type="text" name="img-name" placeholder="Nome do RF" value="${image.name}" onfocus="removeError(this)">
                        <button type="submit" class="btn-enviar">
                            <img src="assets/save.svg">
                        </button>
                    </div>
                </form>
                </div>
            </div>
            `

            const range = document.createRange()
            const fragment = range.createContextualFragment(imgCardHTML)

            imgContainer.appendChild(fragment)
        })
    } catch (error) {
        console.error('Erro na requisição:', error.message)
    }
}

// Chama a função para popular a img-container ao carregar a página
populateImgContainer()