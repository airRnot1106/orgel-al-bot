import ytdl from 'ytdl-core';
import Discord from 'discord.js';
import { Searcher } from '../searcher/searcher';
import {
    AppResponse,
    CommandInfo,
    RequesterInfo,
    RequestInfo,
} from '../type/type';
import { AbsCommand } from './absCommand';
import { PlayerFactory } from '../player/playerFactory';

export class PlayCommand extends AbsCommand {
    constructor(executorMessage: Discord.Message, args: string[]) {
        super(executorMessage, args);
    }

    async execute(): Promise<AppResponse<CommandInfo>> {
        if (!this._executorMessage.guild)
            return <AppResponse<CommandInfo>>{
                status: 400,
                detail: 'Not a valid guild',
                body: { isReply: false, message: '無効なサーバーです！' },
            };
        const voiceChannel = <Discord.VoiceChannel>(
            this._executorMessage.member?.voice.channel
        );
        if (!voiceChannel)
            return <AppResponse<CommandInfo>>{
                status: 400,
                detail: 'Not a valid voice channel',
                body: {
                    isReply: true,
                    message: '先にボイスチャンネルに入ってください！',
                },
            };
        const player = PlayerFactory.instance.getPlayer(
            this._executorMessage.guild
        );
        if (!this._args.length) {
            player.wind(voiceChannel);
            return <AppResponse<CommandInfo>>{
                status: 200,
                detail: 'Successful winding',
                body: null,
            };
        }
        const searcher = Searcher.instance;
        const searchRes = await searcher.execute(this._args.join(' '));
        if (
            searchRes.status === 400 ||
            searchRes.status === 404 ||
            !searchRes.body
        )
            return <AppResponse<CommandInfo>>{
                status: searchRes.status,
                detail: 'Video searching error',
                body: { isReply: true, message: searchRes.detail },
            };
        const { id, title, url } = searchRes.body;
        if (!ytdl.validateURL(url))
            return <AppResponse<CommandInfo>>{
                status: 403,
                detail: 'Streaming denied',
                body: { isReply: true, message: 'この動画は再生できません！' },
            };
        await this._register.registerVideo(searchRes.body);
        const requesterInfo: RequesterInfo = {
            requesterId: this._executorMessage.author.id,
            requesterName: this._executorMessage.author.username,
        };
        await this._register.registerRequester(requesterInfo);
        const requestInfo: RequestInfo = {
            guildId: this._executorMessage.guild.id,
            videoId: id,
            requesterId: this._executorMessage.author.id,
            textChannelId: this._executorMessage.channel.id,
        };
        await this._register.registerRequest(requestInfo);
        player.wind(voiceChannel);
        return <AppResponse<CommandInfo>>{
            status: 200,
            detail: 'Successful request',
            body: { isReply: true, message: `Searching:mag_right:: ${title}` },
        };
    }
}
