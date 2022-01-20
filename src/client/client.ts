import dotenv from 'dotenv';
dotenv.config();

import Discord from 'discord.js';

const intents: Discord.IntentsString[] = [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_VOICE_STATES',
];

const client = new Discord.Client({
    intents: intents,
});

client.on('ready', () => {
    console.log('Orgel-Al has woken up');
});

client.login(process.env.DISCORD_BOT_TOKEN);
