"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsPlayCommand = void 0;
const searcher_1 = require("../searcher/searcher");
const absCommand_1 = require("./absCommand");
const playerFactory_1 = require("../player/playerFactory");
class AbsPlayCommand extends absCommand_1.AbsCommand {
    constructor(executorMessage, args) {
        super(executorMessage, args);
    }
    async before() {
        if (!this._executorMessage.guild)
            return {
                status: 400,
                detail: 'Not a valid guild',
                body: { isReply: false, message: '無効なサーバーです！' },
            };
        const voiceChannel = (this._executorMessage.member?.voice.channel);
        if (!voiceChannel)
            return {
                status: 400,
                detail: 'Not a valid voice channel',
                body: {
                    isReply: true,
                    message: '先にボイスチャンネルに入ってください！',
                },
            };
        const player = playerFactory_1.PlayerFactory.instance.getPlayer(this._executorMessage.guild);
        if (!this._args.length) {
            player.wind(voiceChannel);
            return {
                status: 200,
                detail: 'Successful winding',
                body: null,
            };
        }
        const searcher = searcher_1.Searcher.instance;
        const searchRes = await searcher.execute(this._args.join(' '));
        if (searchRes.status !== 200)
            return {
                status: searchRes.status,
                detail: 'Video searching error',
                body: { isReply: true, message: searchRes.detail },
            };
        const videoInfoRequestInfo = [];
        for (const video of searchRes.body) {
            const { id } = video;
            await this._register.registerVideo(video);
            const requesterInfo = {
                requesterId: this._executorMessage.author.id,
                requesterName: this._executorMessage.author.username,
            };
            await this._register.registerRequester(requesterInfo);
            const requestInfo = {
                guildId: this._executorMessage.guild.id,
                videoId: id,
                requesterId: this._executorMessage.author.id,
                textChannelId: this._executorMessage.channel.id,
            };
            await this._register.registerGuildVideo(this._executorMessage.guild.id, id);
            videoInfoRequestInfo.push({
                videoInfo: video,
                requestInfo: requestInfo,
            });
        }
        return {
            status: 200,
            detail: '',
            body: videoInfoRequestInfo,
        };
    }
    after(videoInfo) {
        const voiceChannel = this._executorMessage.member?.voice
            .channel;
        const player = playerFactory_1.PlayerFactory.instance.getPlayer(this._executorMessage.guild);
        player.wind(voiceChannel);
        const { title } = videoInfo;
        return `Searching:mag_right:: ${title}`;
    }
    async execute() {
        const beforeRes = await this.before();
        const { status, body } = beforeRes;
        if (status !== 200 || !body)
            return beforeRes;
        const appRes = [];
        for (const videoInfoRequestInfo of body) {
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
        })();
        return {
            status: 200,
            detail: 'Successful request',
            body: { isReply: true, message: message },
        };
    }
}
exports.AbsPlayCommand = AbsPlayCommand;
