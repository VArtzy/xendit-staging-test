import http from 'http'

http.createServer((req, res) => {
        req.on('data', (d) => console.log(d.toString()))
        res.writeHead(200, {'content-type': 'application/json'})
        res.write('{"message": "Hi xendit!"}')
        res.end()
}).listen(80)
