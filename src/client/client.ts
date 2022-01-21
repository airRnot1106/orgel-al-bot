import Discord from 'discord.js';
import { TokenIssuer } from '../issuer/tokenIssuer';

const intents: Discord.IntentsString[] = [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_VOICE_STATES',
];

const client = new Discord.Client({
    intents: intents,
});

client.on('ready', async () => {
    console.log("Orgel-Al's screw is wound.");
});

client.login(TokenIssuer.instance.tokens.DISCORD_BOT_TOKEN);
