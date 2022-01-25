import Discord from 'discord.js';
import { AppResponse, CommandInfo } from '../type/type';
import { AbsCommand } from './absCommand';

export class SkipCommand extends AbsCommand {
    constructor(executorMessage: Discord.Message, args: string[]) {
        super(executorMessage, args);
    }

    execute(): AppResponse<CommandInfo> {
        return {
            status: 200,
            detail: '',
            body: { isReply: false, message: 'test' },
        };
    }
}
