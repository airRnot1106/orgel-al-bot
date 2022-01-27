import Discord from 'discord.js';
import { RequestInfo } from '../type/type';
import { AbsPlayCommand } from './absPlayCommand';

export class PlaynextCommand extends AbsPlayCommand {
    constructor(executorMessage: Discord.Message, args: string[]) {
        super(executorMessage, args);
    }

    protected async process(requestInfo: RequestInfo) {
        await this._register.registerInterruptionRequest(requestInfo);
    }
}
