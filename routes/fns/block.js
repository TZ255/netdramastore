const episodeModel = require('../../models/dramastore-episode')
const ipAPILimitChecker = require('../../models/ip-api-limit')
const newDramaModel = require('../../models/vue-new-drama')
const getUserLocation = require('./userIp')

const blockReq = async (req, res) => {
    try {
        let bet_ad_code = '404'
        const latest_episodes = await episodeModel.find().sort('-createdAt').limit(25)
        const popular = await newDramaModel.find().sort('-thisMonth').limit(25)
        return res.status(200).render('maintenance.ejs', { popular, latest_episodes, bet_ad_code })
    } catch (error) {
        console.error(error)
        res.status(404).send("Oh! Shit.. We have a problem. Please comeback later")
    }
}

module.exports = blockReq