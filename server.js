/* eslint-disable @typescript-eslint/no-require-imports */
// Reduce thread pool to minimize process usage on shared hosting
process.env.UV_THREADPOOL_SIZE = 1;

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true)
        handle(req, res, parsedUrl)
    }).listen(process.env.PORT || 3000, (err) => {
        if (err) throw err
        console.log('> Ready')
    })
})
