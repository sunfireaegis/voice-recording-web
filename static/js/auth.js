function redirectOnAuth(event) {
    const form = document.forms[0]

    event.preventDeafault()
    // console.log("JavaScript works -agkadkgakdog")

    const data = new FormData(form)
    fetch('/', {
        method: 'POST',
        body: data
    })
}
