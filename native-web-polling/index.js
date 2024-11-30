import { createServer } from 'http'
import { Invoice as InvoiceClient } from 'xendit-node'

const xenditInvoiceClient = new InvoiceClient({secretKey: process.env.XENDIT_SECRET_KEY})

const invoiceStatus = new Map()

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

    if (req.url.startsWith('/check-invoice') && req.method === 'GET') {
        const invoiceId = req.url.split('/')[2]
        const status = invoiceStatus.get(invoiceId)

        res.writeHead(200, headers)
        res.end(JSON.stringify(status))
    } else if (req.url === '/invoice' && req.method === 'POST') {
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

            invoiceStatus.set(invoice.id, { status: 'pending', invoiceId: invoice.id })

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

            invoiceStatus.set(body.id, { status: body.status, invoiceId: body.id })

            res.writeHead(200, headers)
            res.end(JSON.stringify({status: 'received'}))
        })
    } else {
        res.writeHead(404, headers)
        res.end(JSON.stringify({message: 'Not Found'}))
    }       
})

httpServer.listen(80, process.env.HOST)
