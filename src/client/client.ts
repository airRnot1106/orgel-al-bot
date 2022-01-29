import Discord from 'discord.js';
import { CommandFactory } from '../command/commandFactory';
import { Register } from '../database/register';
import { Helper } from '../helper/helper';
import { TokenIssuer } from '../issuer/tokenIssuer';
import { MessageParser } from '../parser/messageParser';
import { PlayerFactory } from '../player/playerFactory';
import { GuildInfo } from '../type/type';

const intents: Discord.IntentsString[] = [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_VOICE_STATES',
];

const client = new Discord.Client({
    intents: intents,
});

client.on('ready', async () => {
    const helper = Helper.instance;
    helper.initialize(client);
    const helperRes = helper.toggleHelpStatus();
    if (helperRes.status === 403) throw new Error(helperRes.detail);
    console.log(helperRes.detail);
    console.log("Orgel-Al's screw is wound...");
});

client.on('guildCreate', async (guild) => {
    const hasPermission = guild?.me?.permissions.has('CHANGE_NICKNAME');
    if (!hasPermission) {
        const channel = guild.channels.cache;
        const textChannel = channel.find(
            (channel) => channel.type === 'GUILD_TEXT'
        ) as Discord.TextChannel | undefined;
        if (!textChannel) return;
        textChannel.send(
            'パーミッションが付与されていません！\nOrgel-Alを一度追放してもう一度サーバに追加し直してください'
        );
        return;
    }
    const register = Register.instance;
    const { id: guildId, name: guildName } = guild;
    const owner = (await guild.fetchOwner()).user;
    const { id: ownerId, username: ownerName } = owner;
    const guildInfo: GuildInfo = {
        guildId: guildId,
        guildName: guildName,
        ownerId: ownerId,
        ownerName: ownerName,
    };
    await register.registerGuild(guildInfo);
    const BOT_NAME = TokenIssuer.instance.tokens.APP_ENV
        ? 'Orgel-Al'
        : 'Orgel-Al-dev';
    await guild.me?.setNickname(`[!!]${BOT_NAME}`);
});

client.on('guildDelete', async (guild) => {
    const register = Register.instance;
    const id = guild.id;
    await register.deleteGuild(id);
});

client.on('messageCreate', async (message) => {
    if (!message.guild?.id) return;
    if (message.author.bot) return;
    const messageParser = new MessageParser(message);
    const parseRes = await messageParser.execute();
    if (parseRes.status === 400 || !parseRes.body) return;
    const register = Register.instance;
    if (!(await register.isValidGuild(message.guild?.id))) {
        message.channel.send(
            ':no_entry_sign: エラー！ :no_entry_sign:\nサーバ情報が正しく登録されていません！\nOrgel-Alを一度追放してもう一度サーバに追加し直してください'
        );
        return;
    }
    const command = CommandFactory.create(
        parseRes.body.command,
        message,
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

client.on('voiceStateUpdate', async (oldState, newState) => {
    const myId = newState.guild.me?.id;
    const stateId = newState.member?.id;
    if (!myId || !stateId) return;
    if (!(oldState.channel && !newState.channel)) return;
    const player = PlayerFactory.instance.getPlayer(newState.guild);
    player.disconnect();
});

client.login(TokenIssuer.instance.tokens.DISCORD_BOT_TOKEN);
