import { AppResponse, CommandInfo } from '../type/type';
import { AbsCommand } from './absCommand';

export class PlaynextCommand extends AbsCommand {
    constructor(args: string[]) {
        super(args);
    }

    execute(): AppResponse<CommandInfo> {
        return {
            status: 200,
            detail: '',
            body: { isReply: false, message: 'test' },
        };
    }
}
