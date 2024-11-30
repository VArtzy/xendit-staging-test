const button = document.getElementById('bayar')
let currentInvoiceId = null

async function pollInvoiceStatus() {
    if (!currentInvoiceId) return

    try {
        const response = await fetch(`http://157.245.150.87/check-invoice/${currentInvoiceId}`)
        const invoice = await response.json()

        if (invoice.status === 'PAID') {
            console.log(invoice)
            const el = document.createElement('p')
            el.innerText = `Terimakasih telah membayar invoice sebesar ${invoice.amount} ${invoice.currency}`
            document.body.appendChild(el)
            button.removeAttribute('disabled')   
            currentInvoiceId = null
        }

        setTimeout(pollInvoiceStatus, 5000)
    } catch (error) {
        console.error(error)
    }
}

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

    currentInvoiceId = response.id
    pollInvoiceStatus()
    window.open(response.invoiceUrl)
})
