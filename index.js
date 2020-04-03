const markdownit = require('markdown-it')({ breaks: true }).use(require('markdown-it-abbr'))
const moment = require('./lib/moment-precise-range')
const utils = require('jsonresume-themeutils')
const puppeteer = require('puppeteer')
const pdfparse = require('pdf-parse')
const _ = require('lodash')
const pug = require('pug')
const fs = require('fs')

utils.setConfig({ date_format: 'MMM, YYYY' })

function markdown(str) {
    return str != null && markdownit.renderInline(str) || null
}

function orderBy(list, key = null) {
    let orderedList = [...list]

    if (key) {
        let descending = key[0] === '-'

        if (key[0] === '-' || key[0] === '+') {
            key = key.slice(1)
        }

        orderedList = _.orderBy(orderedList, key)

        if (descending) {
            orderedList = orderedList.reverse()
        }
    }

    return orderedList
}

function limitTo(list, limit = Infinity) {
    return list.slice(0, limit)
}

function mapItems(items, meta) {
    if (!meta) {
        return items
    }

    let mappedItems = {
        ...items
    }

    for (let key in meta) {
        let order = _.get(meta, `${key}.orderBy`, null)
        let limit = _.get(meta, `${key}.limitTo`, Infinity)

        let keyList = _.get(mappedItems, key)
        let keyMeta = _.get(meta, `${key}._meta`, null)

        let mappedList = limitTo(orderBy(keyList, order), limit)

        if (keyMeta) {
            mappedList = mappedList.map((item) => {
                return mapItems(item, keyMeta)
            })
        }

        _.set(mappedItems, key, mappedList)
    }

    return mappedItems
}

function html(resume, static) {
    const addressAttrs = ['address', 'city', 'region', 'countryCode', 'postalCode']
    let mappedResume = mapItems(resume, resume._meta)
    let addressValues = _.map(addressAttrs, key => mappedResume.basics.location[key])
    let css = fs.readFileSync(__dirname + '/assets/css/theme.css', 'utf-8')

    mappedResume.basics.picture = utils.getUrlForPicture(mappedResume)
    mappedResume.basics.computed_location = _.compact(addressValues).join(', ')

    if (mappedResume.languages) {
        mappedResume.basics.languages = _.map(mappedResume.languages, 'language').join(', ')
    }

    _.each(mappedResume.basics.profiles, profile => {
        let label = profile.network.toLowerCase()
        profile.url = utils.getUrlForProfile(mappedResume, label)
        profile.label = label
    })

    _.each(mappedResume.work, job => {
        let startDate = moment(job.startDate, 'YYYY-MM-DD')
        let endDate = moment(job.endDate, 'YYYY-MM-DD')

        if (startDate.isValid()) {
            job.startDate = utils.getFormattedDate(startDate)
        }

        if (endDate.isValid()) {
            job.endDate = utils.getFormattedDate(endDate)
        }
    })

    _.each(mappedResume.skills, skill => {
        const levels = ['Beginner', 'Intermediate', 'Advanced', 'Master']

        if (skill.type) {
            skill.subtitle = skill.type.toLowerCase()
        }

        if (skill.level) {
            skill.display_progress_bar = _.includes(levels, skill.level)
        }
    })

    _.each(mappedResume.education, education => {
        _.each(['startDate', 'endDate'], type => {
            let date = education[type]
            if (date) {
                education[type] = utils.getFormattedDate(date)
            }
        })
    })

    _.each(mappedResume.awards, award => {
        let date = award.date

        if (date) {
            award.date = utils.getFormattedDate(date, 'MMM DD, YYYY')
        }
    })

    _.each(mappedResume.volunteer, volunteer => {
        _.each(['startDate', 'endDate'], type => {
            let date = volunteer[type]
            if (date) {
                volunteer[type] = utils.getFormattedDate(date)
            }
        })
    })

    _.each(mappedResume.publications, publication => {
        let date = publication.releaseDate
        if (date) {
            publication.releaseDate = utils.getFormattedDate(date, 'MMM DD, YYYY')
        }
    })

    let backgroundOrder = Object.keys(mappedResume._meta || {}).reduce((acc, cur) => {
        if (typeof mappedResume._meta[cur].position !== undefined) {
            acc[cur] = mappedResume._meta[cur].position
        }

        return acc
    }, {})

    const data = {
        basedir: __dirname,
        resume: mappedResume,
        backgroundOrder,
        static,
        css,
        _,
        markdown
    }

    return pug.renderFile(__dirname + '/pug/index.pug', data)
}

async function pdf(resume) {
    let browser = await puppeteer.launch()
    let file = await browser.newPage()
    let htmlResume = html(resume, true)

    await file.setContent(htmlResume, { waitUntil: 'networkidle2' })
    await file.emulateMedia('screen')

    let buffer = await file.pdf({
        width: '210mm',
        height: '297mm',
        printBackground: true
    })

    await browser.close()
    return buffer
}

module.exports = {
    render: html,
    html: html,
    pdf: pdf
}
