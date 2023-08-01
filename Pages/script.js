const nomeRfInput = document.querySelector('#img-name')
const btnEnviar = document.querySelector('#btn-enviar')

nomeRfInput.addEventListener('focus', () => {
    nomeRfInput.classList.remove('error')
})

btnEnviar.addEventListener('click', () => {
    if (nomeRfInput.value === '') {
        nomeRfInput.classList.add('error')
    }
})