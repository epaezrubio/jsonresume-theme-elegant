//
// This script will run a local development server. This is useful when
// developing the theme.
//
// Usage:
// `node serve`
//

const fs = require('fs')
const path = require('path')
const http = require('http')
const theme = require('./index.js')

const resume = require('resume-schema').resumeJson
const port = 8888

async function render(func) {
    try {
        return await func(resume)
    } catch (e) {
        console.log(e.message)
        return ''
    }
}

http.createServer(async (req, res) => {
  if (req.url == '/') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(await render(theme.html))
  } else if (req.url == '/pdf') {
    res.writeHead(200, {'Content-Type': 'application/pdf'})
    res.end(await render(theme.pdf))
  }
}).listen(port)

console.log('Preview: http://localhost:8888/')
console.log('Serving..')
