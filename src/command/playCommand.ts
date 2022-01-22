import { Searcher } from '../searcher/searcher';
import { AppResponse, CommandInfo } from '../type/type';
import { AbsCommand } from './absCommand';

export class PlayCommand extends AbsCommand {
    constructor(args: string[]) {
        super(args);
    }

    async execute(): Promise<AppResponse<CommandInfo>> {
        const searcher = Searcher.instance;
        const searchRes = await searcher.execute(this._args.join(' '));
        if (searchRes.status === 400 || searchRes.status === 404)
            return <AppResponse<CommandInfo>>{
                status: searchRes.status,
                detail: 'Video searching error',
                body: { isReply: true, message: searchRes.detail },
            };

        return {
            status: 200,
            detail: '',
            body: { isReply: false, message: 'test' },
        };
    }
}
