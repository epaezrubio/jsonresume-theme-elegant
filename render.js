#!/usr/bin/env node
//
// Usage:
// `node render SOURCE TARGET`
//

const fs = require('fs')
const path = require('path')
const theme = require('./index.js')
const args = require('minimist')(process.argv.slice(2))
const source = args._[0], target = args._[1]

let dir = source && path.dirname(source) || path.join(__dirname, 'build')
let resume = source && fs.readFileSync(source) || require('resume-schema').resumeJson
let style = {'priority': args.r && 'research', 'media': args.p && 'print'}

if ( !fs.existsSync(dir) )
    fs.mkdirSync(dir)

fs.writeFile(path.join(dir, target || 'resume.html'), theme.render(resume, style), function(err) {
    console.log(err || 'resume.html written to build folder.')
})
