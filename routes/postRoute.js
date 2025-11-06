const express = require('express')
const mongoose = require('mongoose')
const blogModel = require('../models/postmodel')
const router = express.Router()
const dramasModel = require('../models/vue-new-drama')
const homeModel = require('../models/vue-home-db')
const {nanoid} = require('nanoid')

// TELEGRAPH
const telegraph = require('telegraph-node')
const movieModel = require('../models/movieModel')
const ph = new telegraph()

router.post('/blog-post', async (req, res) => {
    let title = req.body.title
    let body = req.body.body
    let rawTags = req.body.tags

    console.log('working')

    try {
        let tags = rawTags.split(',')

        let post = await blogModel.create({
            title, body, tags
        })
        console.log('Post created')
        console.log(post.body)
        res.sendStatus(200)

    } catch (err) {
        console.log(err.message)
        res.sendStatus(300)
    }
})

router.post('/post/drama', async (req, res) => {
    try {
        // Destructure posted fields from the form
        const { dramaName, photo, synopsis, details, secret } = req.body;

        // Check for the correct secret value
        if (secret !== '5654') {
            return res.status(403).json({ error: 'Unauthorized: Incorrect secret.' });
        }

        // Parse the details field into a key-value object
        const detailsObj = {};
        details.split('\n').forEach(line => {
            line = line.trim();
            if (!line) return; // Skip empty lines
            // Split only on the first colon in case the value contains colons
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const key = line.slice(0, colonIndex).trim();
                const value = line.slice(colonIndex + 1).trim();
                detailsObj[key] = value;
            }
        });

        // Extract year from dramaName. Example: "For Eagle Brothers (2025)"
        let year = null;
        const yearMatch = dramaName.match(/\((\d{4})\)/);
        if (yearMatch) {
            year = parseInt(yearMatch[1], 10);
        }

        // Build the output object using the data from the form and parsed details
        const output = {
            drama_name: dramaName,
            synopsis: synopsis,
            photo_url: photo,
            year: year,
            country: detailsObj["Country"] || "",
            episodes: detailsObj["Episodes"] ? parseInt(detailsObj["Episodes"], 10) : null,
            aired_date: detailsObj["Aired"] || "",
            aired_days: detailsObj["Aired On"] || "",
            genre: detailsObj["Genres"] || "",
            director: detailsObj["Director"] || "",
            also_known: detailsObj["Also Known As"] || ""
        };

        console.log(output)


        // Create a Telegraph page with the drama information
        let page = await ph.createPage(
            process.env.PH_TOKEN,
            dramaName,
            [
                { tag: 'img', attrs: { src: output.photo_url } },
                { tag: 'h3', children: ['Details'] },
                {
                    tag: 'ul',
                    children: [
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Drama: '] },
                                { tag: 'i', children: [output.drama_name] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Also Known As: '] },
                                { tag: 'i', children: [output.also_known] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Episodes: '] },
                                { tag: 'i', children: [String(output.episodes)] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Subtitle: '] },
                                { tag: 'i', children: ['English'] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Aired: '] },
                                { tag: 'i', children: [output.aired_date] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Aired On: '] },
                                { tag: 'i', children: [output.aired_days] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Genres: '] },
                                { tag: 'i', children: [output.genre] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Country: '] },
                                { tag: 'i', children: [output.country] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Director: '] },
                                { tag: 'i', children: [output.director] },
                            ],
                        },
                    ],
                },
                { tag: 'h3', children: ['Synopsis'] },
                {
                    tag: 'em',
                    children: [
                        {
                            tag: 'i',
                            children: [output.synopsis],
                        },
                    ],
                },
            ],
            {
                author_name: '@shemdoe',
                author_url: 'https://t.me/shemdoe',
            }
        )
        let telegraph_link = page.url

        // Create database entries
        let drama_doc = await dramasModel.create({
            newDramaName: dramaName,
            noOfEpisodes: output.episodes,
            genre: output.genre,
            aired: output.aired_date,
            subtitle: 'English',
            coverUrl: output.photo_url,
            synopsis: output.synopsis.replace(/\n/g, '<br>'),
            status: 'Ongoing',
            tgChannel: 'unknown',
            telegraph: telegraph_link,
            timesLoaded: 1,
            nano: nanoid(5),
            chan_id: null,
            country: output.country,
            notify: true,
        });

        //create homepgae
        await homeModel.create({
            year: output.year,
            dramaName: output.drama_name,
            imageUrl: output.photo_url,
        });
        res.send(`<h1>200 OK - ID: ${drama_doc._id}</h1>`)
    } catch (error) {
        console.error(error)
        res.send(error.message)
    }
})

router.post('/post/movie', async (req, res) => {
    try {
        // Destructure posted fields from the form
        const { msg_id, dramaName, photo, synopsis, details, secret } = req.body;

        // Check for the correct secret value
        if (secret !== '5654') {
            return res.status(403).json({ error: 'Unauthorized: Incorrect secret.' });
        }

        // Parse the details field into a key-value object
        const detailsObj = {};
        details.split('\n').forEach(line => {
            line = line.trim();
            if (!line) return; // Skip empty lines
            // Split only on the first colon in case the value contains colons
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const key = line.slice(0, colonIndex).trim();
                const value = line.slice(colonIndex + 1).trim();
                detailsObj[key] = value;
            }
        });

        // Extract year from dramaName. Example: "For Eagle Brothers (2025)"
        let year = null;
        const yearMatch = dramaName.match(/\((\d{4})\)/);
        if (yearMatch) {
            year = parseInt(yearMatch[1], 10);
        }

        // Build the output object using the data from the form and parsed details
        const output = {
            movie_name: dramaName,
            synopsis: synopsis,
            photo_url: photo,
            year: year,
            country: detailsObj["Country"] || "",
            release_date: detailsObj["Release Date"] || "",
            genre: detailsObj["Genres"] || "",
            duration: detailsObj["Duration"] || "",
            also_known: detailsObj["Also Known As"] || ""
        };

        console.log(output)


        // Create a Telegraph page with the drama information
        let page = await ph.createPage(
            process.env.PH_TOKEN,
            dramaName,
            [
                { tag: 'img', attrs: { src: output.photo_url } },
                { tag: 'h3', children: ['Details'] },
                {
                    tag: 'ul',
                    children: [
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Movie: '] },
                                { tag: 'i', children: [output.movie_name] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Also Known As: '] },
                                { tag: 'i', children: [output.also_known] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Duration: '] },
                                { tag: 'i', children: [String(output.duration)] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Subtitle: '] },
                                { tag: 'i', children: ['English'] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Released: '] },
                                { tag: 'i', children: [output.release_date] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Genres: '] },
                                { tag: 'i', children: [output.genre] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Country: '] },
                                { tag: 'i', children: [output.country] },
                            ],
                        },
                    ],
                },
                { tag: 'h3', children: ['Synopsis'] },
                {
                    tag: 'em',
                    children: [
                        {
                            tag: 'i',
                            children: [output.synopsis],
                        },
                    ],
                },
            ],
            {
                author_name: '@shemdoe',
                author_url: 'https://t.me/shemdoe',
            }
        )
        let telegraph_link = page.url

        // Create database entries
        let movie_doc = await movieModel.create({
            movie_name: output.movie_name,
            genre: output.genre,
            released: output.release_date,
            subtitle: 'English',
            coverUrl: output.photo_url,
            synopsis: output.synopsis.replace(/\n/g, '<br>'),
            msgId: Number(msg_id),
            backup: null,
            telegraph: telegraph_link,
            timesLoaded: 1,
            nano: nanoid(5),
            country: output.country,
            notify: true,
        });

        res.send(`<h1>200 OK - ID: ${movie_doc._id}</h1>`)
    } catch (error) {
        console.error(error)
        res.send(error.message)
    }
})

module.exports = router