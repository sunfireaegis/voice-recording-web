const form = document.getElementById('auth')
form.addEventListener('submit', function(event) {
    event.preventDefault()
    const data = new FormData(form)
    fetch('/', {
        method: 'POST',
        body: data
    })
})
