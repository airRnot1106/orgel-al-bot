import Discord from 'discord.js';
import { PlayerFactory } from '../player/playerFactory';
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
        const guild = this._executorMessage.guild;
        if (!guild)
            return <AppResponse<CommandInfo>>{
                status: 400,
                detail: 'Not a valid guild',
                body: { isReply: false, message: '無効なサーバーです！' },
            };
        const player = PlayerFactory.instance.getPlayer(guild);
        if (!player.isPlaying)
            return <AppResponse<CommandInfo>>{
                status: 400,
                detail: 'Not a valid voice channel',
                body: { isReply: true, message: '現在再生停止中です...' },
            };
        const guildId = guild.id;
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
                playlistStr += `:headphones:Now: ${title}, Uploaded by: ${author}, Requested by: ${requester_name}\n`;
            } else {
                playlistStr += `${index}: ${title}, Upload by: ${author}, Requested by: ${requester_name}\n`;
            }
            const LENGTH_LIMIT = 1950;
            if (playlistStr.length > LENGTH_LIMIT) {
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
