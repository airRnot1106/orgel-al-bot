import Discord from 'discord.js';
import {
    AppResponse,
    CommandInfo,
    HistoryTable,
    RequesterTable,
    VideoTable,
} from '../type/type';
import { AbsCommand } from './absCommand';

export class HistoryCommand extends AbsCommand {
    constructor(executorMessage: Discord.Message, args: string[]) {
        super(executorMessage, args);
    }

    async execute(): Promise<AppResponse<CommandInfo, CommandInfo>> {
        const guild = this._executorMessage.guild;
        if (!guild)
            return {
                status: 400,
                detail: 'Not a valid guild',
                body: { isReply: false, message: '無効なサーバーです！' },
            };
        const limit = this._args.join()
            ? this.convertStrToNum(this._args[0])
            : 10;
        if (limit === null)
            return {
                status: 400,
                detail: 'Not a valid limit',
                body: { isReply: true, message: '無効な引数です！' },
            };
        if (!(limit > 0 && limit < 51))
            return {
                status: 400,
                detail: 'Not a valid limit',
                body: { isReply: true, message: '1 ~ 50で指定してください！' },
            };
        const guildId = guild.id;
        const historyList = <(HistoryTable & VideoTable & RequesterTable)[]>(
            (
                await this._database.query(
                    `SELECT title, author, requester_name FROM histories JOIN videos ON histories.video_id = videos.video_id JOIN requesters ON histories.requester_id = requesters.requester_id WHERE guild_id = '${guildId}' ORDER BY history_id DESC LIMIT ${limit};`
                )
            ).rows
        );
        if (!historyList.length)
            return {
                status: 204,
                detail: 'History has no content',
                body: {
                    isReply: false,
                    message: 'History begins here!',
                },
            };
        let historyStr = 'History :clock10:\n';
        historyList.some((history, index) => {
            const { title, author, requester_name } = history;
            historyStr += `${
                index + 1
            }: ${title}, Uploaded by: ${author}, Requested by: ${requester_name}\n`;
            const LENGTH_LIMIT = 1800;
            if (historyStr.length > LENGTH_LIMIT) {
                historyStr += '\nAnd more...\n';
                return true;
            }
        });
        return {
            status: 200,
            detail: 'Successful fetching history',
            body: { isReply: false, message: historyStr },
        };
    }

    private convertStrToNum(str: string) {
        const isNum = /^([1-9]\d*|0)$/.test(str);
        if (!isNum) return null;
        return parseInt(str);
    }
}
