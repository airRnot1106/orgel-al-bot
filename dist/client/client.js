"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const commandFactory_1 = require("../command/commandFactory");
const register_1 = require("../database/register");
const helper_1 = require("../helper/helper");
const tokenIssuer_1 = require("../issuer/tokenIssuer");
const messageParser_1 = require("../parser/messageParser");
const playerFactory_1 = require("../player/playerFactory");
const intents = [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_VOICE_STATES',
];
const client = new discord_js_1.default.Client({
    intents: intents,
});
client.on('ready', async () => {
    const helper = helper_1.Helper.instance;
    helper.initialize(client);
    const helperRes = helper.toggleHelpStatus();
    if (helperRes.status === 403)
        throw new Error(helperRes.detail);
    console.log(helperRes.detail);
    console.log("Orgel-Al's screw is wound...");
});
client.on('guildCreate', async (guild) => {
    const hasPermission = guild?.me?.permissions.has('CHANGE_NICKNAME');
    if (!hasPermission) {
        const channel = guild.channels.cache;
        const textChannel = channel.find((channel) => channel.type === 'GUILD_TEXT');
        if (!textChannel)
            return;
        textChannel.send('パーミッションが付与されていません！\nOrgel-Alを一度追放してもう一度サーバに追加し直してください');
        return;
    }
    const register = register_1.Register.instance;
    const { id: guildId, name: guildName } = guild;
    const owner = (await guild.fetchOwner()).user;
    const { id: ownerId, username: ownerName } = owner;
    const guildInfo = {
        guildId: guildId,
        guildName: guildName,
        ownerId: ownerId,
        ownerName: ownerName,
    };
    await register.registerGuild(guildInfo);
    const BOT_NAME = tokenIssuer_1.TokenIssuer.instance.tokens.APP_ENV
        ? 'Orgel-Al'
        : 'Orgel-Al-dev';
    await guild.me?.setNickname(`[!!]${BOT_NAME}`);
});
client.on('guildDelete', async (guild) => {
    const register = register_1.Register.instance;
    const id = guild.id;
    await register.deleteGuild(id);
});
client.on('messageCreate', async (message) => {
    if (!message.guild?.id)
        return;
    if (message.author.bot)
        return;
    const messageParser = new messageParser_1.MessageParser(message);
    const parseRes = await messageParser.execute();
    if (parseRes.status === 400 || !parseRes.body)
        return;
    const register = register_1.Register.instance;
    if (!(await register.isValidGuild(message.guild?.id))) {
        message.channel.send(':no_entry_sign: エラー！ :no_entry_sign:\nサーバ情報が正しく登録されていません！\nOrgel-Alを一度追放してもう一度サーバに追加し直してください');
        return;
    }
    const command = commandFactory_1.CommandFactory.create(parseRes.body.command, message, parseRes.body.args);
    const commandRes = await command.execute();
    console.log(commandRes);
    if (commandRes.body?.isReply) {
        await message.reply(commandRes.body.message);
    }
    else if (commandRes.body) {
        await message.channel.send(commandRes.body?.message);
    }
});
client.on('voiceStateUpdate', async (oldState, newState) => {
    const myId = newState.guild.me?.id;
    const stateId = newState.member?.id;
    if (!myId || !stateId)
        return;
    if (!(oldState.channel && !newState.channel))
        return;
    const player = playerFactory_1.PlayerFactory.instance.getPlayer(newState.guild);
    player.disconnect();
});
client.login(tokenIssuer_1.TokenIssuer.instance.tokens.DISCORD_BOT_TOKEN);
