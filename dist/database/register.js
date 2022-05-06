"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Register = void 0;
const database_1 = require("./database");
class Register {
    static _instance;
    _database;
    constructor() {
        this._database = database_1.Database.instance;
    }
    static get instance() {
        if (!this._instance) {
            this._instance = new Register();
        }
        return this._instance;
    }
    async registerGuild(guild) {
        const { guildId, guildName, ownerId, ownerName } = guild;
        const isExists = ((await this._database.query(`SELECT EXISTS (SELECT * FROM guilds WHERE guild_id = '${guildId}')`)).rows[0].exists);
        if (isExists) {
            await this.deleteGuild(guildId);
        }
        await this._database.query(`INSERT INTO guilds (guild_id, guild_name, owner_id, owner_name) VALUES ('${guildId}', '${guildName.replaceAll("'", "''")}', '${ownerId}', '${ownerName.replaceAll("'", "''")}')`);
    }
    async deleteGuild(guildId) {
        await this._database.query(`DELETE FROM guilds WHERE guild_id = '${guildId}'`);
    }
    async registerPrefix(guildId, prefix) {
        await this._database.query(`UPDATE guilds SET prefix = '${prefix}' WHERE guild_id = '${guildId}'`);
    }
    async registerVideo(video) {
        const { id, title, author, url } = video;
        const isExists = ((await this._database.query(`SELECT EXISTS (SELECT * FROM videos WHERE video_id = '${id}')`)).rows[0].exists);
        if (isExists) {
            await this._database.query(`UPDATE videos SET requested_times = requested_times + 1 WHERE video_id = '${id}'`);
        }
        else {
            await this._database.query(`INSERT INTO videos (video_id, title, author, url) VALUES ('${id}', '${title.replaceAll("'", "''")}', '${author.replaceAll("'", "''")}', '${url}')`);
        }
    }
    async registerGuildVideo(guildId, videoId) {
        const isExists = ((await this._database.query(`SELECT EXISTS (SELECT * FROM guilds_videos WHERE guild_id = '${guildId}' AND video_id = '${videoId}')`)).rows[0].exists);
        if (isExists) {
            await this._database.query(`UPDATE guilds_videos SET requested_times = requested_times + 1 WHERE guild_id = '${guildId}' AND video_id = '${videoId}'`);
        }
        else {
            await this._database.query(`INSERT INTO guilds_videos (guild_id, video_id) VALUES ('${guildId}', '${videoId}')`);
        }
    }
    async registerRequest(request) {
        const { guildId, videoId, requesterId, textChannelId } = request;
        const tail = ((await this._database.query(`SELECT MAX(index) AS tail_index FROM requests WHERE guild_id = '${guildId}'`)).rows[0].tail_index);
        const index = tail ? tail + 1 : 1;
        await this._database.query(`INSERT INTO requests (guild_id, video_id, index, requester_id, text_channel_id) VALUES ('${guildId}', '${videoId}', ${index}, '${requesterId}', '${textChannelId}')`);
        await this._database.query(`UPDATE guilds SET request_times = request_times + 1 WHERE guild_id = '${guildId}'`);
    }
    async registerInterruptionRequest(request) {
        const { guildId, videoId, requesterId, textChannelId } = request;
        await this._database.query(`UPDATE requests SET index = index + 1 WHERE guild_id = '${guildId}' AND index > 0`);
        await this._database.query(`INSERT INTO requests (guild_id, video_id, index, requester_id, text_channel_id) VALUES ('${guildId}', '${videoId}', 1, '${requesterId}', '${textChannelId}')`);
        await this._database.query(`UPDATE guilds SET request_times = request_times + 1 WHERE guild_id = '${guildId}'`);
    }
    async registerRequester(requester) {
        const { requesterId, requesterName } = requester;
        const isExists = ((await this._database.query(`SELECT EXISTS (SELECT * FROM requesters WHERE requester_id = '${requesterId}')`)).rows[0].exists);
        if (isExists) {
            await this._database.query(`UPDATE requesters SET request_times = request_times + 1 WHERE requester_id = '${requesterId}'`);
        }
        else {
            await this._database.query(`INSERT INTO requesters (requester_id, requester_name) VALUES ('${requesterId}', '${requesterName.replaceAll("'", "''")}')`);
        }
    }
    async registerHistory(history) {
        await this._database.query(`INSERT INTO histories (guild_id, video_id, requester_id) VALUES ('${history.guildId}', '${history.videoId}', '${history.requesterId}')`);
    }
    async isValidGuild(guildId) {
        const isValid = ((await this._database.query(`SELECT EXISTS (SELECT * FROM guilds WHERE guild_id = '${guildId}')`)).rows[0].exists);
        return isValid;
    }
}
exports.Register = Register;
