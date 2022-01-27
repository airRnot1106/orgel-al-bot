import { GuildInfo, RequesterInfo, VideoInfo, RequestInfo } from '../type/type';
import { Database } from './database';

export class Register {
    private static _instance: Register;
    private _database;
    private constructor() {
        this._database = Database.instance;
    }

    public static get instance(): Register {
        if (!this._instance) {
            this._instance = new Register();
        }
        return this._instance;
    }

    async registerGuild(guild: GuildInfo) {
        const { guildId, guildName, ownerId, ownerName } = guild;
        const isExists = <boolean>(
            (
                await this._database.query(
                    `SELECT EXISTS (SELECT * FROM guilds WHERE guild_id = '${guildId}')`
                )
            ).rows[0].exists
        );
        if (isExists) {
            await this.deleteGuild(guildId);
        }
        await this._database.query(
            `INSERT INTO guilds (guild_id, guild_name, owner_id, owner_name) VALUES ('${guildId}', '${guildName}', '${ownerId}', '${ownerName}')`
        );
    }

    async deleteGuild(guildId: string) {
        await this._database.query(
            `DELETE FROM guilds WHERE guild_id = '${guildId}'`
        );
    }

    async registerVideo(video: VideoInfo) {
        const { id, title, author, url } = video;
        const isExists = <boolean>(
            (
                await this._database.query(
                    `SELECT EXISTS (SELECT * FROM videos WHERE video_id = '${id}')`
                )
            ).rows[0].exists
        );
        if (isExists) {
            await this._database.query(
                `UPDATE videos SET requested_times = requested_times + 1 WHERE video_id = '${id}'`
            );
        } else {
            await this._database.query(
                `INSERT INTO videos (video_id, title, author, url) VALUES ('${id}', '${title}', '${author}', '${url}')`
            );
        }
    }

    async registerRequest(request: RequestInfo) {
        const { guildId, videoId, requesterId } = request;
        const tail = <number | null>(
            (
                await this._database.query(
                    `SELECT MAX(index) AS tail_index FROM requests WHERE guild_id = '${guildId}'`
                )
            ).rows[0].tail_index
        );
        const index = tail ? tail + 1 : 1;
        await this._database.query(
            `INSERT INTO requests (guild_id, video_id, index, requester_id) VALUES ('${guildId}', '${videoId}', ${index}, '${requesterId}')`
        );
    }

    async registerRequester(requester: RequesterInfo) {
        const { requesterId, requesterName } = requester;
        const isExists = (
            await this._database.query(
                `SELECT EXISTS (SELECT * FROM requesters WHERE requester_id = '${requesterId}')`
            )
        ).rows[0].exists;
        if (isExists) {
            await this._database.query(
                `UPDATE requesters SET request_times = request_times + 1 WHERE requester_id = '${requesterId}'`
            );
        } else {
            await this._database.query(
                `INSERT INTO requesters (requester_id, requester_name) VALUES ('${requesterId}', '${requesterName}')`
            );
        }
    }
}