const form = document.forms[0]
form.addEventListener('submit', function(event) {
    event.preventDeafault()

    const data = new FormData(form)
    fetch('/', {
        method: 'POST',
        body: data
    })
})
