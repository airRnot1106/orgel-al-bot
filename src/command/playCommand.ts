import Discord from 'discord.js';
import { RequestInfo } from '../type/type';
import { AbsPlayCommand } from './absPlayCommand';

export class PlayCommand extends AbsPlayCommand {
    constructor(executorMessage: Discord.Message, args: string[]) {
        super(executorMessage, args);
    }

    protected async process(requestInfo: RequestInfo) {
        await this._register.registerRequest(requestInfo);
    }
}
