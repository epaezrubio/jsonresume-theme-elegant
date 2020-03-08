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
    mappedResume.basics.summary = markdown(mappedResume.basics.summary)
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
        let start_date = moment(job.startDate, 'YYYY-MM-DD')
        let end_date = moment(job.endDate, 'YYYY-MM-DD')

        if (start_date.isValid()) {
            job.startDate = utils.getFormattedDate(start_date)
        }

        if (end_date.isValid()) {
            job.endDate = utils.getFormattedDate(end_date)
        }

        job.summary = markdown(job.summary)
        job.highlights = _.map(job.highlights, markdown)
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
            if (date)
                education[type] = utils.getFormattedDate(date)
        })
    })

    _.each(mappedResume.awards, award => {
        let date = award.date
        if (date)
            award.date = utils.getFormattedDate(date, 'MMM DD, YYYY')

        award.summary = markdown(award.summary)
    })

    _.each(mappedResume.volunteer, volunteer => {
        volunteer.summary = markdown(volunteer.summary)
        volunteer.highlights = _.map(volunteer.highlights, markdown)

        _.each(['startDate', 'endDate'], type => {
            let date = volunteer[type]
            if (date)
                volunteer[type] = utils.getFormattedDate(date)
        })
    })

    _.each(mappedResume.publications, publication => {
        let date = publication.releaseDate
        if (date)
            publication.releaseDate = utils.getFormattedDate(date, 'MMM DD, YYYY')

        publication.summary = markdown(publication.summary)
    })

    _.each(mappedResume.references, reference => {
        reference.reference = markdown(reference.reference)
    })

    return pug.renderFile(__dirname + '/pug/index.pug', {
        basedir: __dirname,
        resume: mappedResume,
        static: static,
        css: css,
        _: _
    })
}

async function numPages(file, height) {
    let buffer = await file.pdf({ width: '1025px', height: height + 'px', printBackground: true })
    let data = await pdfparse(buffer)
    return data.numpages
}

async function pdf(resume) {
    let browser = await puppeteer.launch()
    let file = await browser.newPage()
    let htmlResume = html(resume, true)

    await file.setContent(htmlResume, { waitUntil: 'networkidle2' })
    await file.emulateMedia('screen')

    let high = await numPages(file, 100) * 100
    let low = await numPages(file, 10) * 10

    while (high > (low + 1)) {
        let mean = Math.round((high + low) / 2)
        let count = await numPages(file, mean)
        if (count > 1)
            low = mean
        else
            high = mean
    }

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
