import Discord from 'discord.js';
import {
    entersState,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    StreamType,
    DiscordGatewayAdapterCreator,
    VoiceConnection,
} from '@discordjs/voice';
import { Database } from '../database/database';
import { RequestTable, VideoTable } from '../type/type';
import ytdl from 'ytdl-core';

export class Player {
    private _guild;
    private _connection: VoiceConnection | undefined;
    private _isPlaying;
    private _database;
    constructor(guild: Discord.Guild) {
        this._guild = guild;
        this._isPlaying = false;
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
        await this.play();
    }

    async play() {
        if (!this._connection) return;
        const guildId = this._guild.id;
        const player = createAudioPlayer();
        this._connection.subscribe(player);
        const existsPlaylist = <boolean>(
            (
                await this._database.query(
                    `SELECT EXISTS (SELECT * FROM requests WHERE guild_id = '${guildId}' AND index = 1)`
                )
            ).rows[0].exists
        );
        if (!existsPlaylist) {
            this._connection.destroy();
            this._connection = undefined;
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
        } = tRequestVideo;
        if (!ytdl.validateURL(url)) return;
        const stream = ytdl(url, {
            filter: (format) =>
                format.audioCodec === 'opus' && format.container === 'webm',
            quality: 'highest',
            highWaterMark: 32 * 1024 * 1024,
        });
        const resource = createAudioResource(stream, {
            inputType: StreamType.WebmOpus,
        });
        const message = `#NowPlaying:notes:\nTitle: ${title}\nBy: ${author}`;
        const textChannel = <Discord.TextChannel | null>(
            await this._guild.channels.fetch(textChannelId)
        );
        if (textChannel) textChannel.send(message);
        player.play(resource);
        await entersState(player, AudioPlayerStatus.Playing, 10 * 1000);
        await entersState(player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);
        await this._database.query(
            `DELETE FROM requests WHERE guild_id = '${guildId}' AND index = 0`
        );
        await this.play();
    }
}
