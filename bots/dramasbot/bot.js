const axios = require('axios').default
const otheBotsUsersModel = require('./database/users')
const botListModel = require('./database/botlist')
const newMovieModel = require('../../models/vue-new-drama');

const imp = {
    shemdoe: 741815228,
    halot: 1473393723,
    mkekaLeo: -1001733907813,
    dstore: -1001245181784,
    airtz1: 1426255234,
    airtz2: 5940671686,
    elibariki: 8479906894
}

// Telegram API helper
const sendMessage = async (token, chatId, text, options = {}) => {
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text,
            ...options
        })
    } catch (error) {
        console.error('Send message error:', error.response?.data || error.message)
    }
}

const deleteMessage = async (token, chatId, messageId) => {
    try {
        await axios.post(`https://api.telegram.org/bot${token}/deleteMessage`, {
            chat_id: chatId,
            message_id: messageId
        })
    } catch (error) {
        console.error('Delete message error:', error.message)
    }
}

// Command handlers
const handleStart = async (token, message, botData) => {
    try {
        const chatId = message.chat.id
        const firstName = message.chat.first_name
        const botname = botData.botname

        // Save user to database
        let user = await otheBotsUsersModel.findOne({ chatid: chatId })
        if (!user) {
            await otheBotsUsersModel.create({
                chatid: chatId,
                first_name: firstName,
                botname,
                token: botData.token
            })
        }

        // Send preparing message
        const prepMsg = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: 'Preparing Invite link...'
        })

        // Wait 1 second
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Delete preparing message
        await deleteMessage(token, chatId, prepMsg.data.result.message_id)

        // Get drama info
        const drama = await newMovieModel.findOne({ chan_id: botData.drama_chanid })

        if (!drama) {
            return await sendMessage(token, chatId, 'Drama not found. Please contact support.')
        }

        // Send drama info
        const linkText = `<a href="${drama.tgChannel}">https://t.me/drama/${drama.id}</a>`
        const text = `Hi, <b>${firstName}</b>\n\nDownload All ${drama.noOfEpisodes} Episodes of <b>${drama.newDramaName}</b> for free with English Subtitles Below\n\n<b>Full Drama 👇👇\n${linkText}</b>`

        await sendMessage(token, chatId, text, {
            parse_mode: 'HTML',
            protect_content: true
        })
    } catch (error) {
        console.error('handleStart error:', error.message)
        await sendMessage(token, message.chat.id, 'An error occurred. Please try again later.')
    }
}

const handleStats = async (token, message) => {
    try {
        const all = await otheBotsUsersModel.countDocuments()
        const lists = await botListModel.find()

        let text = `Total Users Are ${all.toLocaleString('en-US')}\n\n`

        for (let [i, v] of lists.entries()) {
            const num = (await otheBotsUsersModel.countDocuments({ botname: v.botname })).toLocaleString('en-US')
            text += `${i + 1}. @${v.botname} = ${num}\n\n`
        }

        await sendMessage(token, message.chat.id, text)
    } catch (error) {
        console.error('handleStats error:', error.message)
        await sendMessage(token, message.chat.id, 'Error fetching stats.')
    }
}

const handleSetWebhook = async (update_token, message) => {
    try {
        if(!Object.values(imp).includes(message.chat.id)) {
            return await sendMessage(update_token, message.chat.id, 'Not authorized for this command');
        }

        let [, botname] = message.text.split(' ').map(item => item.trim())
        if (!botname || !String(botname).toLowerCase().endsWith('bot')) {
            return await sendMessage(update_token, message.chat.id, 'Wrong setwebhook command');
        }

        const bot = await botListModel.findOne({ botname })
        if (!bot) {
            return await sendMessage(update_token, message.chat.id, `No bot found on DB with ${botname}`);
        }

        const webhookUrl = `https://${process.env.DOMAIN}/telebot/dramastore/${process.env.USER}/${botname}`
        await axios.post(`https://api.telegram.org/bot${bot.token}/setWebhook`, {
            url: webhookUrl,
            drop_pending_updates: true,
            allowed_updates: ["update_id", "message", "callback_query", "channel_post", "inline_query"]
        })
        await sendMessage(update_token, message.chat.id, `Webhook for ${botname} set as ${webhookUrl}`)
    } catch (error) {
        console.error('handleStats error:', error.message)
        await sendMessage(update_token, message.chat.id, 'Error fetching stats.')
    }
}

// handle /other_drama command
const handleOtherDrama = async (token, message) => {
    await sendMessage(token, message.chat.id, 'Download all latest korean dramas at www.dramastore.net')
}

const handleMessages = async (token, message) => {
    const chatId = message.chat.id

    if (!message.reply_to_message || message.chat.type !== 'private' || !Object.values(imp).includes(chatId)) {
        return await sendMessage(token, chatId, 'Hello,\nClick /start to start downloading or check the menu for other options')
    }

    const replyText = message.reply_to_message.text
    const text = message.text

    try {
        if (replyText.toLowerCase() === 'token') {
            await botListModel.create({ token: text, botname: 'unknown', drama_chanid: 0 })
            await sendMessage(token, chatId, `Token Added: 👉 ${text} 👈\n\nReply with username of bot and the channel id e.g: <examplebot> <-1234567890>`)
        }
        else if (replyText.includes('Token Added:')) {
            const [botname, chan_id] = text.split(' ').map(item => item.trim())

            if (!botname || !chan_id || !String(chan_id).startsWith('-')) {
                return await sendMessage(token, chatId, 'Wrong reply... Reply with botname and drama channel id in this format\n<example_bot> <channel_id>')
            }

            const botToken = replyText.split('👉 ')[1].split(' 👈')[0].trim()
            const drama = await newMovieModel.findOne({ chan_id: Number(chan_id) })

            if (!drama) {
                return await sendMessage(token, chatId, `No drama found with channel id ${chan_id}`)
            }

            const updatedBot = await botListModel.findOneAndUpdate(
                { token: botToken },
                { $set: { botname, drama_chanid: Number(chan_id) } },
                { new: true }
            )

            // Set webhook
            const domain = process.env.DOMAIN
            const hookPath = `/telebot/dramastore/${process.env.USER}/${botname}`
            const webhookUrl = `https://${domain}${hookPath}`

            await axios.post(`https://api.telegram.org/bot${botToken}/setWebhook`, {
                url: webhookUrl,
                drop_pending_updates: true,
                allowed_updates: ["update_id", "message", "callback_query", "channel_post", "inline_query"]
            })

            // Set bot description
            await axios.post(`https://api.telegram.org/bot${botToken}/setMyDescription`, {
                description: `Hey Chingu! Welcome 🤗\n\nClick START to download all episodes of ${drama.newDramaName}`
            })

            // Set commands
            await axios.post(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
                commands: [
                    { command: 'other_drama', description: '🔥 Other Korean Dramas' },
                ]
            })

            const finalMessage = `New Bot added successfully! ✅\n\n✨ Botname: @${updatedBot.botname}\n✨ Token: ${updatedBot.token.substring(0, 15)}...\n✨ Channel: ${drama.newDramaName} (${drama.chan_id})\n✨ Webhook: ${webhookUrl}\n\n🔥 Bot is now live and ready to use!`

            await sendMessage(token, chatId, finalMessage)
        }
    } catch (error) {
        console.error('handleMessages error:', error.message)
        await sendMessage(token, chatId, 'An error occurred while processing your message.')
    }
}

// Main webhook handler
const handleWebhook = async (token, update, botData) => {
    try {
        // Extract message
        const message = update.message || update.edited_message || update.channel_post
        if (!message) return

        const userId = message.from.id

        //Type: Type of the chat, can be either “private”, “group”, “supergroup” or “channel”
        const chat_type = message.chat.type

        // Handle commands
        if (message.text) {
            if (message.text.startsWith('/start')) {
                return await handleStart(token, message, botData)
            }
            if (message.text.startsWith('/stats')) {
                return await handleStats(token, message)
            }
            if (message.text.startsWith('/other_drama')) {
                return await handleOtherDrama(token, message)
            }
            if (message.text.startsWith('/setwebhook')) {
                return await handleSetWebhook(token, message)
            }

            // Handle admin messages
            return await handleMessages(token, message)
        }

    } catch (error) {
        console.error('handleWebhook error:', error.message)
    }
}

// Main setup function
const myBotsFn = async (app) => {
    try {
        const hookPath = `/telebot/dramastore/${process.env.USER}/:botname`

        app.post(hookPath, async (req, res) => {
            const { botname } = req.params
            const update = req.body

            // Always respond 200 OK to Telegram immediately
            res.status(200).json({ ok: true })

            try {
                // Fetch bot from database
                const botData = await botListModel.findOne({ botname })

                if (!botData) {
                    console.error(`❌ Bot not found: ${botname}`)
                    return
                }

                // Handle the update
                await handleWebhook(botData.token, update, botData)

            } catch (error) {
                console.error(`❌ Webhook error for ${botname}:`, error.message)
            }
        })

        console.log(`✅ Dynamic webhook route registered: ${hookPath}`)

    } catch (err) {
        console.error('❌ DramaBots initialization error:', err.message)
    }
}

module.exports = {
    DramaBots: myBotsFn
}