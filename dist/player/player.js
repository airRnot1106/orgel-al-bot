"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const play_dl_1 = __importDefault(require("play-dl"));
const voice_1 = require("@discordjs/voice");
const database_1 = require("../database/database");
const register_1 = require("../database/register");
class Player {
    _guild;
    _connection;
    _player;
    _isPlaying;
    _register;
    _database;
    constructor(guild) {
        this._guild = guild;
        this._connection = null;
        this._player = null;
        this._isPlaying = false;
        this._register = register_1.Register.instance;
        this._database = database_1.Database.instance;
    }
    get isPlaying() {
        return this._isPlaying;
    }
    disconnect() {
        this._isPlaying = false;
    }
    async wind(voiceChannel) {
        if (this._isPlaying)
            return;
        const guildId = this._guild.id;
        const connection = (0, voice_1.joinVoiceChannel)({
            adapterCreator: (voiceChannel.guild.voiceAdapterCreator),
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            selfDeaf: true,
            selfMute: false,
        });
        this._connection = connection;
        const hasDoneAbend = ((await this._database.query(`SELECT EXISTS (SELECT * FROM requests WHERE guild_id = '${guildId}' AND index = 0)`)).rows[0].exists);
        if (hasDoneAbend) {
            await this._database.query(`UPDATE requests SET index = index + 1 WHERE guild_id = '${guildId}'`);
        }
        this._isPlaying = true;
        this.play();
    }
    async play() {
        if (!this._connection)
            return;
        const guildId = this._guild.id;
        this._player = (0, voice_1.createAudioPlayer)();
        this._connection.subscribe(this._player);
        const existsPlaylist = ((await this._database.query(`SELECT EXISTS (SELECT * FROM requests WHERE guild_id = '${guildId}' AND index = 1)`)).rows[0].exists);
        if (!existsPlaylist) {
            this._connection.destroy();
            this._connection = null;
            this._isPlaying = false;
            return;
        }
        await this._database.query(`UPDATE requests SET index = index - 1 WHERE guild_id = '${guildId}'`);
        const tRequestVideo = ((await this._database.query(`SELECT * FROM requests JOIN videos ON requests.video_id = videos.video_id WHERE guild_id = '${guildId}' AND index = 0`)).rows[0]);
        const { title, author, url, text_channel_id: textChannelId, video_id: videoId, requester_id: requesterId, } = tRequestVideo;
        const historyInfo = {
            guildId: guildId,
            videoId: videoId,
            requesterId: requesterId,
        };
        await this._register.registerHistory(historyInfo);
        const playStream = await play_dl_1.default.stream(url, {
            discordPlayerCompatibility: true,
        });
        try {
            const resource = (0, voice_1.createAudioResource)(playStream.stream, {
                inputType: playStream.type,
            });
            const message = `#NowPlaying:notes:\nTitle: ${title}\nBy: ${author}`;
            const textChannel = (await this._guild.channels.fetch(textChannelId));
            if (textChannel)
                textChannel.send(message);
            playStream.stream.on('error', () => {
                textChannel?.send(':warning:???????????????????????????????????????????????????????????????????????????...');
                if (this._connection)
                    this._connection.destroy();
                this._connection = null;
                this._isPlaying = false;
            });
            this._player.play(resource);
            await (0, voice_1.entersState)(this._player, voice_1.AudioPlayerStatus.Playing, 10 * 1000);
            await (0, voice_1.entersState)(this._player, voice_1.AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);
        }
        catch {
            const message = `#NowPlaying:notes:\nTitle: ${title}\nBy: ${author}`;
            const textChannel = (await this._guild.channels.fetch(textChannelId));
            if (textChannel)
                textChannel.send(message);
            textChannel?.send(':x:????????????????????????????????????????????????????????????????????????????????????...');
        }
        this.prepareNext();
    }
    async prepareNext() {
        if (!this._player)
            return;
        if (this._player.state.status === voice_1.AudioPlayerStatus.Playing)
            this._player.stop();
        await this._database.query(`DELETE FROM requests WHERE guild_id = '${this._guild.id}' AND index = 0`);
        this.play();
    }
}
exports.Player = Player;
