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
        if (searchRes.status === 400 ||
            searchRes.status === 404 ||
            searchRes.status === 410 ||
            !searchRes.body)
            return {
                status: searchRes.status,
                detail: 'Video searching error',
                body: { isReply: true, message: searchRes.detail },
            };
        const { id } = searchRes.body;
        await this._register.registerVideo(searchRes.body);
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
        return {
            status: 200,
            detail: '',
            body: {
                videoInfo: searchRes.body,
                requestInfo: requestInfo,
            },
        };
    }
    after(videoInfo) {
        const voiceChannel = this._executorMessage.member?.voice
            .channel;
        const player = playerFactory_1.PlayerFactory.instance.getPlayer(this._executorMessage.guild);
        player.wind(voiceChannel);
        const { title } = videoInfo;
        return {
            status: 200,
            detail: 'Successful request',
            body: { isReply: true, message: `Searching:mag_right:: ${title}` },
        };
    }
    async execute() {
        const beforeRes = await this.before();
        const { status, body } = beforeRes;
        if (status === 400 || status === 404 || status === 410 || !body)
            return beforeRes;
        const { videoInfo, requestInfo } = body;
        await this.process(requestInfo);
        const appRes = this.after(videoInfo);
        return appRes;
    }
}
exports.AbsPlayCommand = AbsPlayCommand;
