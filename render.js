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

const resumePath = process.env.RESUME_PATH || 'resume-schema/resume.json';

(async () => {
  let source = args['source'] || resumePath
  let target = args['target'] || args._[1] || source && (path.basename(source, '.json') + '.html') || 'index.html'
  let ext = path.extname(target)

  let dir = path.join(__dirname, 'build')
  let resume = require(source)
  let result = ext == '.pdf' && await theme.pdf(resume) || theme.html(resume)

  if (!fs.existsSync(dir))
      fs.mkdirSync(dir)

  fs.writeFile(path.join(dir, target), result, err => {
      console.log(err && c.red(err) || c`Wrote {green ${target}} to {green ${dir}}.`)
  })
})()
