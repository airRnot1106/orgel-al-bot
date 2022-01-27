import Discord from 'discord.js';
import { PlayerFactory } from '../player/playerFactory';
import { AppResponse, CommandInfo } from '../type/type';
import { AbsCommand } from './absCommand';

export class SkipCommand extends AbsCommand {
    constructor(executorMessage: Discord.Message, args: string[]) {
        super(executorMessage, args);
    }

    execute(): AppResponse<CommandInfo> {
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
        player.prepareNext();
        return {
            status: 200,
            detail: 'Successful Skipping',
            body: null,
        };
    }
}
