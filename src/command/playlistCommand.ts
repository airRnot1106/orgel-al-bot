import Discord from 'discord.js';
import {
    AppResponse,
    CommandInfo,
    RequesterTable,
    RequestTable,
    VideoTable,
} from '../type/type';
import { AbsCommand } from './absCommand';

export class PlaylistCommand extends AbsCommand {
    constructor(executorMessage: Discord.Message, args: string[]) {
        super(executorMessage, args);
    }

    async execute(): Promise<AppResponse<CommandInfo>> {
        const guildId = this._executorMessage.guild?.id;
        if (!guildId)
            return <AppResponse<CommandInfo>>{
                status: 400,
                detail: 'Not a valid guild',
                body: { isReply: false, message: '無効なサーバーです！' },
            };
        const requestList = <(RequestTable & VideoTable & RequesterTable)[]>(
            (
                await this._database.query(
                    `SELECT index, title, author, requester_name FROM requests JOIN videos ON requests.video_id = videos.video_id JOIN requesters ON requests.requester_id = requesters.requester_id WHERE guild_id = '${guildId}' ORDER BY index ASC;`
                )
            ).rows
        );
        if (!requestList.length)
            return <AppResponse<CommandInfo>>{
                status: 204,
                detail: 'Playlist has no request',
                body: {
                    isReply: false,
                    message: ':u7a7a: No request now...',
                },
            };
        let playlistStr = 'Playlist :clipboard:\n';
        requestList.some((request) => {
            const { index, title, author, requester_name } = request;
            if (index === 0) {
                playlistStr += `:headphones:Now: ${title}, Upload by: ${author}, Requested by: ${requester_name}\n`;
            } else {
                playlistStr += `${index}: ${title}, Upload by: ${author}, Requested by: ${requester_name}\n`;
            }
            if (playlistStr.length > 1950) {
                playlistStr += '\nAnd more...\n';
                return true;
            }
        });
        return {
            status: 200,
            detail: 'Successful fetching playlist',
            body: { isReply: false, message: playlistStr },
        };
    }
}
