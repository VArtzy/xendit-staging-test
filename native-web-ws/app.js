const button = document.getElementById('bayar')

button.addEventListener('click', async () => {
    button.disabled = true
    const response = await fetch('http://157.245.150.87/invoice', {
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
