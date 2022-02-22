"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipCommand = void 0;
const playerFactory_1 = require("../player/playerFactory");
const absCommand_1 = require("./absCommand");
class SkipCommand extends absCommand_1.AbsCommand {
    static _waitingTimeMap = new Map();
    constructor(executorMessage, args) {
        super(executorMessage, args);
    }
    async execute() {
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
        if (SkipCommand._waitingTimeMap.get(this._executorMessage.guild.id)) {
            return {
                status: 400,
                detail: 'Invalid skipping',
                body: null,
            };
        }
        const player = playerFactory_1.PlayerFactory.instance.getPlayer(this._executorMessage.guild);
        player.prepareNext();
        this.wait(this._executorMessage.guild.id);
        return {
            status: 200,
            detail: 'Successful Skipping',
            body: null,
        };
    }
    wait(guildId) {
        SkipCommand._waitingTimeMap.set(guildId, true);
        setTimeout(() => {
            SkipCommand._waitingTimeMap.set(guildId, false);
        }, 1000);
    }
}
exports.SkipCommand = SkipCommand;
