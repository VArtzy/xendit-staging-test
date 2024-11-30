const button = document.getElementById('bayar')
let currentInvoiceId = null

async function pollInvoiceStatus() {
    if (!currentInvoiceId) return

    try {
        const response = await fetch(`http://localhost/check-invoice/${currentInvoiceId}`)
        const status = await response.json()

        if (status.status === 'paid') {
            const el = document.createElement('p')
            el.innerText = `Terimakasih telah membayar invoice sebesar ${message.amount} ${message.currency}`
            document.body.appendChild(el)
            button.removeAttribute('disabled')   
        } else {
            currentInvoiceId = null
            return
        }

        setTimeout(pollInvoiceStatus, 5000)
    } catch (error) {
        console.error(error)
    }
}

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

    currentInvoiceId = response.id
    pollInvoiceStatus()
    window.open(response.invoiceUrl)
})
