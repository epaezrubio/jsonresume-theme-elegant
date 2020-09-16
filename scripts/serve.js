const http = require('http')
const theme = require('../index.js')

const port = process.env.PORT || 8889
const resumePath = process.env.RESUME_PATH || 'resume-schema/resume.json'


async function render(func) {
    delete require.cache[require.resolve(resumePath)]

    const resume = require(resumePath)

    try {
        return await func(JSON.parse(JSON.stringify(resume)))
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

console.log(`Preview: http://localhost:${port}/`)
console.log('Serving..')
