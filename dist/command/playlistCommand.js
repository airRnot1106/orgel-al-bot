"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaylistCommand = void 0;
const playerFactory_1 = require("../player/playerFactory");
const absCommand_1 = require("./absCommand");
class PlaylistCommand extends absCommand_1.AbsCommand {
    constructor(executorMessage, args) {
        super(executorMessage, args);
    }
    async execute() {
        const guild = this._executorMessage.guild;
        if (!guild)
            return {
                status: 400,
                detail: 'Not a valid guild',
                body: { isReply: false, message: '無効なサーバーです！' },
            };
        const player = playerFactory_1.PlayerFactory.instance.getPlayer(guild);
        if (!player.isPlaying)
            return {
                status: 400,
                detail: 'Not a valid voice channel',
                body: { isReply: true, message: '現在再生停止中です...' },
            };
        const guildId = guild.id;
        const requestList = ((await this._database.query(`SELECT index, title, author, requester_name FROM requests JOIN videos ON requests.video_id = videos.video_id JOIN requesters ON requests.requester_id = requesters.requester_id WHERE guild_id = '${guildId}' ORDER BY index ASC;`)).rows);
        if (!requestList.length)
            return {
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
            }
            else {
                playlistStr += `${index}: ${title}, Upload by: ${author}, Requested by: ${requester_name}\n`;
            }
            const LENGTH_LIMIT = 1800;
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
exports.PlaylistCommand = PlaylistCommand;
