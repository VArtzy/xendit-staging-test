import { createServer } from 'http'
import { Invoice as InvoiceClient } from 'xendit-node'
import crypto from 'crypto'

const xenditInvoiceClient = new InvoiceClient({secretKey: process.env.XENDIT_SECRET_KEY})

function setupWebSocketServer(server) {
    const clients = new Set()

    server.on('upgrade', (req, socket) => {
        if (req.headers['upgrade'] === 'websocket') {
            const acceptKey = crypto.createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64')

            socket.write(
                'HTTP/1.1 101 Switching Protocols\r\n' +
                'Upgrade: websocket\r\n' +
                'Connection: Upgrade\r\n' +
                `Sec-WebSocket-Accept: ${acceptKey}\r\n\r\n`
            )

            clients.add(socket)

            socket.on('close', () => {
                clients.delete(socket)
            })

            socket.on('data', data => {
                const firstByte = data[0]
                const opCode = firstByte & 0x0F

                if (opCode === 0x8) {
                    clients.delete(socket)
                    socket.end()
                }
            })
        }
    })

    function broadcast(message) {
        clients.forEach(client => {
            const msgBuffer = Buffer.from(message)
            const frameHeader = Buffer.alloc(2)

            frameHeader[0] = 0x81
            frameHeader[1] = msgBuffer.length

            try {
                client.write(Buffer.concat([frameHeader, msgBuffer]))
            } catch (error) {
                clients.delete(client)
            }
        })
    }

    return { broadcast }
}

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

            wsServer.broadcast(JSON.stringify(body))

            res.writeHead(200, headers)
            res.end(JSON.stringify({status: 'received'}))
        })
    } else {
        res.writeHead(404, headers)
        res.end(JSON.stringify({message: 'Not Found'}))
    }       
})

const wsServer = setupWebSocketServer(httpServer)

httpServer.listen(80, process.env.HOST)
