const usersModel = require('../../models/botusers');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const BroadcastConvoFn = async (bot, ctx, dt) => {
    const admins = [dt.shd, dt.htlt];
    const wapuuzi = [1006615854, 1937862156, 1652556985];

    if (!admins.includes(ctx.chat.id) || !ctx.match) {
        return await ctx.reply('Not admin or no match');
    }

    const msg_id = Number(ctx.match.trim());
    if (isNaN(msg_id)) {
        return await ctx.reply('⚠ Invalid message ID.');
    }

    const rtcopyDB = dt.rtcopyDB;
    const bads = ['deactivated', 'blocked', 'initiate', 'chat not found'];

    try {
        const count = await usersModel.countDocuments();
        const cursor = usersModel.find().select('userId -_id').cursor();

        await ctx.reply(`🚀 Starting broadcasting for ${count} users`);

        let batch = [];
        for await (const user of cursor) {
            const chatid = user.userId;
            if (wapuuzi.includes(chatid)) continue;

            batch.push(chatid);

            if (batch.length === 20) {
                await Promise.all(batch.map(async (chatid) => {
                    try {
                        await bot.api.copyMessage(chatid, rtcopyDB, msg_id);
                    } catch (err) {
                        const errorMsg = err?.message?.toLowerCase() || '';
                        console.log(err?.message || 'Unknown error');

                        if (bads.some((b) => errorMsg.includes(b))) {
                            await usersModel.findOneAndDelete({ userId: chatid });
                            console.log(`🗑 User ${chatid} deleted for ${errorMsg}`);
                        } else {
                            console.log(`🤷‍♂️ Unexpected error for ${chatid}: ${err.message}`);
                        }
                    }
                }));

                batch = []; // Reset batch
                await sleep(1000); // Wait 1 second between batches
            }
        }

        // Handle remaining users in the last batch (if any)
        if (batch.length > 0) {
            await Promise.all(batch.map(async (chatid) => {
                try {
                    await bot.api.copyMessage(chatid, rtcopyDB, msg_id);
                } catch (err) {
                    const errorMsg = err?.message?.toLowerCase() || '';
                    console.log(err?.message || 'Unknown error');

                    if (bads.some((b) => errorMsg.includes(b))) {
                        await usersModel.findOneAndDelete({ userId: chatid });
                        console.log(`🗑 User ${chatid} deleted for ${errorMsg}`);
                    } else {
                        console.log(`🤷‍♂️ Unexpected error for ${chatid}: ${err.message}`);
                    }
                }
            }));
        }

        return await ctx.reply('✅ Finished broadcasting');
    } catch (err) {
        console.error('Broadcasting error:', err?.message || err);
        await ctx.reply('❌ Broadcasting failed');
    }
};

module.exports = { BroadcastConvoFn };
