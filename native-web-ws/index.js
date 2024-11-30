import { createServer } from 'http'
import { Invoice as InvoiceClient } from 'xendit-node'
import { Server } from 'socket.io'

const xenditInvoiceClient = new InvoiceClient({secretKey: process.env.XENDIT_SECRET_KEY})

const httpServer = createServer((req, res) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }

    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers)
        res.end()
        return
    }

    if (req.url === '/invoice' && req.method === 'POST') {
        let data = ''
        req.on('data', chunk => {
            data += chunk
        })
        req.on('end', async () => {
            const body = JSON.parse(data)
            data = {
                amount: body.amount,
                invoiceDuration: body.invoiceDuration,
                externalId: body.externalId,
                description: body.description,
                currency: body.currency,
                reminderTime: body.reminderTime
            }
            const invoice = await xenditInvoiceClient.createInvoice({ data })

            res.writeHead(200, headers)
            res.write(JSON.stringify(invoice))
            res.end()
        })
    } else if (req.url === '/webhook' && req.method === 'POST') {
        let data = ''
        req.on('data', chunk => {
            data += chunk
        })
        req.on('end', () => {
            const body = JSON.parse(data)

            io.emit('invoice_paid', body)

            res.writeHead(200, headers)
            res.end(JSON.stringify({status: 'received'}))
        })
    } else {
        res.writeHead(404, headers)
        res.end(JSON.stringify({message: 'Not Found'}))
    }       
})

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

io.on('connection', socket => {
    console.log('Client connected')

    socket.on('disconnect', () => {
        console.log('Client disconnected')
    })
})

httpServer.listen(80, process.env.HOST)
