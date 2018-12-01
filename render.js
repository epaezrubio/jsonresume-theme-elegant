#!/usr/bin/env node
//
// Usage:
// `node render SOURCE TARGET`
//

const fs = require('fs')
const c = require('chalk')
const path = require('path')
const theme = require('./index.js')
const args = require('minimist')(process.argv.slice(2));

(async () => {
  let source = args._[0]
  let target = args._[1] || source && (path.basename(source, '.json') + '.html') || 'index.html'
  let ext = path.extname(target)

  let dir = source && path.dirname(source) || path.join(__dirname, 'build')
  let resume = source && JSON.parse(fs.readFileSync(source)) || require('resume-schema').resumeJson
  let result = ext == '.pdf' && await theme.pdf(resume) || theme.html(resume)

  if (!fs.existsSync(dir))
      fs.mkdirSync(dir)

  fs.writeFile(path.join(dir, target), result, err => {
      console.log(err && c.red(err) || c`Wrote {green ${target}} to {green ${dir}}.`)
  })
})()
