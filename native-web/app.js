const button = document.getElementById('bayar')

class SimpleWebSocket {
    constructor(url) {
        this.url = url
        this.socket = null
        this.connect()
    }

    connect() {
        this.socket = new WebSocket(this.url)

        this.socket.onopen = () => {
            console.log('Connected to server')
        }

        this.socket.onmessage = event => {
            try {
                const message = JSON.parse(event.data)

                if (message.external_id === 'test1234') {
                    const el = document.createElement('p')
                    el.innerText = `Terimakasih telah membayar invoice sebesar ${message.amount} ${message.currency}`
                    document.body.appendChild(el)
                    button.removeAttribute('disabled')
                }
            } catch (error) {
                console.error(error)
            }
        }

        this.socket.onerror = error => {
            console.error(error)
        }

        this.socket.onclose = () => {
            console.log('Connection closed')
            setTimeout(() => this.connect(), 3000)
        }
    }
}

const ws = new SimpleWebSocket('ws://localhost')

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
