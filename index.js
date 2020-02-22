const markdownit = require('markdown-it')({ breaks: true }).use(require('markdown-it-abbr'))
const moment = require('./lib/moment-precise-range')
const utils = require('jsonresume-themeutils')
const puppeteer = require('puppeteer')
const pdfparse = require('pdf-parse')
const _ = require('lodash')
const pug = require('pug')
const fs = require('fs')

utils.setConfig({ date_format: 'MMM, YYYY' })

function interpolate(object, keyPath) {
    return _.reduce(keyPath.split('.'), (res, key) => (res || {})[key], object)
}

function capitalize(str) {
    if (str) {
        str = str.toString()
        return str[0].toUpperCase() + str.slice(1).toLowerCase()
    }
    return str
}

function markdown(str) {
    return str != null && markdownit.render(str) || null
}

function floatingNavItems(resume) {
    var items
    if (resume.basics.priority == 'research')
        items = [
            { label: 'About', target: 'about', icon: 'board', requires: 'basics.summary' },
            { label: 'Publications', target: 'publications', icon: 'newspaper', requires: 'publications' },
            { label: 'Awards', target: 'awards', icon: 'trophy', requires: 'awards' },
            { label: 'Education', target: 'education', icon: 'graduation-cap', requires: 'education' },
            { label: 'References', target: 'references', icon: 'thumbs-up', requires: 'references' },
            { label: 'Work Experience', target: 'work-experience', icon: 'office', requires: 'work' },
            { label: 'Volunteer Work', target: 'volunteer-work', icon: 'child', requires: 'volunteer' },
            { label: 'Skills', target: 'skills', icon: 'tools', requires: 'skills' },
            { label: 'Interests', target: 'interests', icon: 'heart', requires: 'interests' }
        ]
    else
        items = [
            { label: 'About', target: 'about', icon: 'board', requires: 'basics.summary' },
            { label: 'Work Experience', target: 'work-experience', icon: 'office', requires: 'work' },
            { label: 'Volunteer Work', target: 'volunteer-work', icon: 'child', requires: 'volunteer' },
            { label: 'Publications', target: 'publications', icon: 'newspaper', requires: 'publications' },
            { label: 'Awards', target: 'awards', icon: 'trophy', requires: 'awards' },
            { label: 'Education', target: 'education', icon: 'graduation-cap', requires: 'education' },
            { label: 'References', target: 'references', icon: 'thumbs-up', requires: 'references' },
            { label: 'Skills', target: 'skills', icon: 'tools', requires: 'skills' },
            { label: 'Interests', target: 'interests', icon: 'heart', requires: 'interests' }
        ]

    return _.filter(items, item => !_.isEmpty(interpolate(resume, item.requires)))
}

function html(resume, static) {
    const addressAttrs = ['address', 'city', 'region', 'countryCode', 'postalCode']
    let addressValues = _.map(addressAttrs, key => resume.basics.location[key])
    let css = fs.readFileSync(__dirname + '/assets/css/theme.css', 'utf-8')

    resume.basics.picture = utils.getUrlForPicture(resume)
    resume.basics.summary = markdown(resume.basics.summary)
    resume.basics.computed_location = _.compact(addressValues).join(', ')

    if (resume.languages)
        resume.basics.languages = _.map(resume.languages, 'language').join(', ')

    _.each(resume.basics.profiles, profile => {
        let label = profile.network.toLowerCase()
        profile.url = utils.getUrlForProfile(resume, label)
        profile.label = label
    })

    resume.basics.top_five_profiles = resume.basics.profiles.slice(0, 5)
    resume.basics.remaining_profiles = resume.basics.profiles.slice(5)

    _.each(resume.work, job => {
        let start_date = moment(job.startDate, 'YYYY-MM-DD')
        let end_date = moment(job.endDate, 'YYYY-MM-DD')
        let can_calculate_period = start_date.isValid() && end_date.isValid()

        if (can_calculate_period)
            job.duration = moment.preciseDiff(start_date, end_date)

        if (start_date.isValid())
            job.startDate = utils.getFormattedDate(start_date)

        if (end_date.isValid())
            job.endDate = utils.getFormattedDate(end_date)

        job.summary = markdown(job.summary)
        job.highlights = _.map(job.highlights, markdown)
    })

    _.each(resume.skills, skill => {
        const levels = ['Beginner', 'Intermediate', 'Advanced', 'Master']

        if (skill.type)
            skill.subtitle = skill.type.toLowerCase()
        if (skill.level) {
            skill.class = skill.level.toLowerCase()
            skill.level = capitalize(skill.level.trim())
            skill.display_progress_bar = _.includes(levels, skill.level)
        }
    })

    _.each(resume.education, education => {
        _.each(['startDate', 'endDate'], type => {
            let date = education[type]
            if (date)
                education[type] = utils.getFormattedDate(date)
        })
    })

    _.each(resume.awards, award => {
        let date = award.date
        if (date)
            award.date = utils.getFormattedDate(date, 'MMM DD, YYYY')

        award.summary = markdown(award.summary)
    })

    _.each(resume.volunteer, volunteer => {
        volunteer.summary = markdown(volunteer.summary)
        volunteer.highlights = _.map(volunteer.highlights, markdown)

        _.each(['startDate', 'endDate'], type => {
            let date = volunteer[type]
            if (date)
                volunteer[type] = utils.getFormattedDate(date)
        })
    })

    _.each(resume.publications, publication => {
        let date = publication.releaseDate
        if (date)
            publication.releaseDate = utils.getFormattedDate(date, 'MMM DD, YYYY')

        publication.summary = markdown(publication.summary)
    })

    _.each(resume.references, reference =>
        reference.reference = markdown(reference.reference))

    return pug.renderFile(__dirname + '/pug/index.pug', {
        basedir: __dirname,
        nav_items: floatingNavItems(resume),
        resume: resume,
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

    await file.setContent(html(resume, true), { waitUntil: 'networkidle2' })
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
