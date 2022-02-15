import Discord from 'discord.js';
import { Searcher } from '../searcher/searcher';
import {
    AppResponse,
    CommandInfo,
    RequesterInfo,
    RequestInfo,
    VideoInfo,
    VideoInfoRequestInfo,
} from '../type/type';
import { AbsCommand } from './absCommand';
import { PlayerFactory } from '../player/playerFactory';

export abstract class AbsPlayCommand extends AbsCommand {
    constructor(executorMessage: Discord.Message, args: string[]) {
        super(executorMessage, args);
    }

    protected async before() {
        if (!this._executorMessage.guild)
            return <AppResponse<CommandInfo>>{
                status: 400,
                detail: 'Not a valid guild',
                body: { isReply: false, message: '無効なサーバーです！' },
            };
        const voiceChannel = <Discord.VoiceChannel | null>(
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
            searchRes.status === 410 ||
            !searchRes.body
        )
            return <AppResponse<CommandInfo>>{
                status: searchRes.status,
                detail: 'Video searching error',
                body: { isReply: true, message: searchRes.detail },
            };
        const { id } = searchRes.body;
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
        await this._register.registerGuildVideo(
            this._executorMessage.guild.id,
            id
        );
        return <AppResponse<VideoInfoRequestInfo>>{
            status: 200,
            detail: '',
            body: {
                videoInfo: searchRes.body,
                requestInfo: requestInfo,
            },
        };
    }

    protected abstract process(requestInfo: RequestInfo): Promise<void>;

    protected after(videoInfo: VideoInfo) {
        const voiceChannel = this._executorMessage.member?.voice
            .channel as Discord.VoiceChannel;
        const player = PlayerFactory.instance.getPlayer(
            this._executorMessage.guild as Discord.Guild
        );
        player.wind(voiceChannel);
        const { title } = videoInfo;
        return <AppResponse<CommandInfo>>{
            status: 200,
            detail: 'Successful request',
            body: { isReply: true, message: `Searching:mag_right:: ${title}` },
        };
    }

    async execute(): Promise<AppResponse<CommandInfo>> {
        const beforeRes = await this.before();
        const { status, body } = beforeRes;
        if (status === 400 || status === 404 || status === 410 || !body)
            return beforeRes as AppResponse<CommandInfo>;
        const { videoInfo, requestInfo } = body as VideoInfoRequestInfo;
        await this.process(requestInfo);
        const appRes = this.after(videoInfo);
        return appRes;
    }
}
