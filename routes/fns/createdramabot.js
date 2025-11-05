const botListModel = require("../../bots/dramasbot/database/botlist")

const token = ''
const botname = 'TyphoonFamilyKoreaDramaBot'
const chan_id = -1003116326981

const insertOtherDramaBot = async () => {
    try {
        let bot = await botListModel.findOne({drama_chanid: chan_id})
        if(bot) return console.log('Bot with the channel id already exist')

        await botListModel.create({
            token, botname, drama_chanid: chan_id
        })
        console.log('✅ Bot created')
    } catch (error) {
        console.log('Insert Bot Error:', error?.message)
    }
}

module.exports = {
    insertOtherDramaBot
}