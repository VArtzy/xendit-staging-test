const button = document.getElementById('bayar')

const socket = io('http://localhost:3000')

button.addEventListener('click', async () => {
    button.disabled = true
    const response = await fetch('http://localhost/invoice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: 10000,
            invoiceDuration: 172800,
            externalId: 'test1234',
            description: 'Test Invoice',
            currency: 'IDR',
            reminderTime: 1
        })
    }).then(res => res.json())

    window.open(response.invoiceUrl)
})

socket.on('invoice_paid', data => {
        const el = document.createElement('p')
        el.innerText = `Terimakasih telah membayar invoice sebesar ${data.amount} ${data.currency}`
        document.body.appendChild(el)
        button.removeAttribute('disabled')
})
