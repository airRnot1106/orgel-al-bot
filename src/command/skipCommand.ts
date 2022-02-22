import Discord from 'discord.js';
import { PlayerFactory } from '../player/playerFactory';
import { AppResponse, CommandInfo } from '../type/type';
import { AbsCommand } from './absCommand';

export class SkipCommand extends AbsCommand {
    private static _waitingTimeMap: Map<string, boolean> = new Map();
    constructor(executorMessage: Discord.Message, args: string[]) {
        super(executorMessage, args);
    }

    async execute(): Promise<
        AppResponse<CommandInfo | null, CommandInfo | null>
    > {
        if (!this._executorMessage.guild)
            return {
                status: 400,
                detail: 'Not a valid guild',
                body: { isReply: false, message: '無効なサーバーです！' },
            };
        const voiceChannel = <Discord.VoiceChannel | null>(
            this._executorMessage.member?.voice.channel
        );
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
        const player = PlayerFactory.instance.getPlayer(
            this._executorMessage.guild
        );
        player.prepareNext();
        this.wait(this._executorMessage.guild.id);
        return {
            status: 200,
            detail: 'Successful Skipping',
            body: null,
        };
    }

    private wait(guildId: string) {
        SkipCommand._waitingTimeMap.set(guildId, true);
        setTimeout(() => {
            SkipCommand._waitingTimeMap.set(guildId, false);
        }, 1000);
    }
}
