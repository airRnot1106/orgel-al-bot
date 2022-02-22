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
            return <AppResponse<null, CommandInfo>>{
                status: 400,
                detail: 'Not a valid guild',
                body: { isReply: false, message: '無効なサーバーです！' },
            };
        const voiceChannel = <Discord.VoiceChannel | null>(
            this._executorMessage.member?.voice.channel
        );
        if (!voiceChannel)
            return <AppResponse<null, CommandInfo>>{
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
            return <AppResponse<null, null>>{
                status: 200,
                detail: 'Successful winding',
                body: null,
            };
        }
        const searcher = Searcher.instance;
        const searchRes = await searcher.execute(this._args.join(' '));
        if (searchRes.status !== 200)
            return <AppResponse<null, CommandInfo>>{
                status: searchRes.status,
                detail: 'Video searching error',
                body: { isReply: true, message: searchRes.detail },
            };
        const videoInfoRequestInfo: VideoInfoRequestInfo[] = [];
        for (const video of searchRes.body) {
            const { id } = video;
            await this._register.registerVideo(video);
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
            videoInfoRequestInfo.push({
                videoInfo: video,
                requestInfo: requestInfo,
            });
        }
        return <AppResponse<VideoInfoRequestInfo[], null>>{
            status: 200,
            detail: '',
            body: videoInfoRequestInfo,
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
        return `Searching:mag_right:: ${title}`;
    }

    async execute(): Promise<AppResponse<CommandInfo, null>> {
        const beforeRes = await this.before();
        const { status, body } = beforeRes;
        if (status !== 200 || !body)
            return beforeRes as AppResponse<CommandInfo, null>;
        const appRes = [];
        for (const videoInfoRequestInfo of body as VideoInfoRequestInfo[]) {
            const { videoInfo, requestInfo } = videoInfoRequestInfo;
            await this.process(requestInfo);
            appRes.push(this.after(videoInfo));
        }
        const message = (() => {
            let message = '';
            const LENGTH_LIMIT = 500;
            for (const res of appRes) {
                if (message.length > LENGTH_LIMIT) {
                    message += 'And more...';
                    return message;
                }
                message += `${res}\n`;
            }
            return message;
        })();
        return <AppResponse<CommandInfo, null>>{
            status: 200,
            detail: 'Successful request',
            body: { isReply: true, message: message },
        };
    }
}
