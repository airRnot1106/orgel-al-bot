import Discord from 'discord.js';
import { CommandFactory } from '../command/commandFactory';
import { TokenIssuer } from '../issuer/tokenIssuer';
import { MessageParser } from '../parser/messageParser';

const intents: Discord.IntentsString[] = [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_VOICE_STATES',
];

const client = new Discord.Client({
    intents: intents,
});

client.on('ready', async () => {
    console.log("Orgel-Al's screw is wound...");
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const messageParser = new MessageParser(message);
    const parseRes = messageParser.execute();
    if (parseRes.status === 400 || !parseRes.body) return;
    const command = CommandFactory.create(
        parseRes.body.command,
        parseRes.body.args
    );
    const commandRes = await command.execute();
    console.log(commandRes);
    if (commandRes.body?.isReply) {
        await message.reply(commandRes.body.message);
    } else if (commandRes.body) {
        await message.channel.send(commandRes.body?.message);
    }
});

client.login(TokenIssuer.instance.tokens.DISCORD_BOT_TOKEN);
