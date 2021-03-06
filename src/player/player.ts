import Discord from 'discord.js';
import play from 'play-dl';
import {
    entersState,
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    DiscordGatewayAdapterCreator,
    VoiceConnection,
} from '@discordjs/voice';
import { Database } from '../database/database';
import { HistoryInfo, RequestTable, VideoTable } from '../type/type';
import { Register } from '../database/register';

export class Player {
    private _guild;
    private _connection: VoiceConnection | null;
    private _player: AudioPlayer | null;
    private _isPlaying;
    private _register;
    private _database;
    constructor(guild: Discord.Guild) {
        this._guild = guild;
        this._connection = null;
        this._player = null;
        this._isPlaying = false;
        this._register = Register.instance;
        this._database = Database.instance;
    }

    get isPlaying() {
        return this._isPlaying;
    }

    disconnect() {
        this._isPlaying = false;
    }

    async wind(voiceChannel: Discord.VoiceChannel) {
        if (this._isPlaying) return;
        const guildId = this._guild.id;
        const connection = joinVoiceChannel({
            adapterCreator: <DiscordGatewayAdapterCreator>(
                voiceChannel.guild.voiceAdapterCreator
            ),
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            selfDeaf: true,
            selfMute: false,
        });
        this._connection = connection;
        const hasDoneAbend = <boolean>(
            (
                await this._database.query(
                    `SELECT EXISTS (SELECT * FROM requests WHERE guild_id = '${guildId}' AND index = 0)`
                )
            ).rows[0].exists
        );
        if (hasDoneAbend) {
            await this._database.query(
                `UPDATE requests SET index = index + 1 WHERE guild_id = '${guildId}'`
            );
        }
        this._isPlaying = true;
        this.play();
    }

    async play() {
        if (!this._connection) return;
        const guildId = this._guild.id;
        this._player = createAudioPlayer();
        this._connection.subscribe(this._player);
        const existsPlaylist = <boolean>(
            (
                await this._database.query(
                    `SELECT EXISTS (SELECT * FROM requests WHERE guild_id = '${guildId}' AND index = 1)`
                )
            ).rows[0].exists
        );
        if (!existsPlaylist) {
            this._connection.destroy();
            this._connection = null;
            this._isPlaying = false;
            return;
        }
        await this._database.query(
            `UPDATE requests SET index = index - 1 WHERE guild_id = '${guildId}'`
        );
        const tRequestVideo = <VideoTable & RequestTable>(
            (
                await this._database.query(
                    `SELECT * FROM requests JOIN videos ON requests.video_id = videos.video_id WHERE guild_id = '${guildId}' AND index = 0`
                )
            ).rows[0]
        );
        const {
            title,
            author,
            url,
            text_channel_id: textChannelId,
            video_id: videoId,
            requester_id: requesterId,
        } = tRequestVideo;
        const historyInfo: HistoryInfo = {
            guildId: guildId,
            videoId: videoId,
            requesterId: requesterId,
        };
        await this._register.registerHistory(historyInfo);
        const playStream = await play.stream(url, {
            discordPlayerCompatibility: true,
        });
        try {
            const resource = createAudioResource(playStream.stream, {
                inputType: playStream.type,
            });
            const message = `#NowPlaying:notes:\nTitle: ${title}\nBy: ${author}`;
            const textChannel = <Discord.TextChannel | null>(
                await this._guild.channels.fetch(textChannelId)
            );
            if (textChannel) textChannel.send(message);
            playStream.stream.on('error', () => {
                textChannel?.send(
                    ':warning:???????????????????????????????????????????????????????????????????????????...'
                );
                if (this._connection) this._connection.destroy();
                this._connection = null;
                this._isPlaying = false;
            });
            this._player.play(resource);
            await entersState(
                this._player,
                AudioPlayerStatus.Playing,
                10 * 1000
            );
            await entersState(
                this._player,
                AudioPlayerStatus.Idle,
                24 * 60 * 60 * 1000
            );
        } catch {
            const message = `#NowPlaying:notes:\nTitle: ${title}\nBy: ${author}`;
            const textChannel = <Discord.TextChannel | null>(
                await this._guild.channels.fetch(textChannelId)
            );
            if (textChannel) textChannel.send(message);
            textChannel?.send(
                ':x:????????????????????????????????????????????????????????????????????????????????????...'
            );
        }

        this.prepareNext();
    }

    async prepareNext() {
        if (!this._player) return;
        if (this._player.state.status === AudioPlayerStatus.Playing)
            this._player.stop();
        await this._database.query(
            `DELETE FROM requests WHERE guild_id = '${this._guild.id}' AND index = 0`
        );
        this.play();
    }
}
