const episodeModel = require('../../models/dramastore-episode')
const newDramaModel = require('../../models/vue-new-drama')

const blockReq = async (req, res) => {
    try {
        //const myip = req.ip
        const userIp = req?.clientIp
        console.log(userIp)
        const latest_episodes = await episodeModel.find().sort('-createdAt').limit(25)
        const popular = await newDramaModel.find().sort('-thisMonth').limit(25)
        return res.status(200).render('maintenance.ejs', { popular, latest_episodes })
    } catch (error) {
        console.error(error)
        res.status(404).send("Oh! Shit.. We have a problem. Please comeback later")
    }
}

module.exports = blockReq