"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageParser = void 0;
const database_1 = require("../database/database");
class MessageParser {
    _guildId;
    _prefix;
    _commands;
    _requestedCommand;
    _args;
    _database;
    constructor(message) {
        this._guildId = message.guild?.id;
        this._commands = ['p', 's', 'pn', 'pl', 'h', 'pf'];
        [this._requestedCommand, ...this._args] = message.content.split(' ');
        this._database = database_1.Database.instance;
    }
    async execute() {
        if (!this._guildId)
            return {
                status: 400,
                detail: 'Not valid guild',
                body: null,
            };
        const prefix = ((await this._database.query(`SELECT prefix FROM guilds WHERE guild_id = '${this._guildId}'`)).rows[0]?.prefix);
        this._prefix = prefix;
        const isValidRes = this.validateCommand();
        if (isValidRes.status === 400)
            return isValidRes;
        const commandRes = this.discernCommand();
        return commandRes;
    }
    validateCommand() {
        if (!this._requestedCommand.startsWith(this._prefix ? this._prefix : '!!'))
            return {
                status: 400,
                detail: 'Prefix denied',
                body: null,
            };
        if (!this._commands.includes(this._requestedCommand.split(this._prefix ? this._prefix : '!!')[1]))
            return {
                status: 400,
                detail: 'Command denied',
                body: null,
            };
        return {
            status: 200,
            detail: 'Valid command',
            body: null,
        };
    }
    discernCommand() {
        const command = this._requestedCommand.split(this._prefix ? this._prefix : '!!')[1];
        switch (command) {
            case 'p': {
                return {
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 'p', args: this._args },
                };
            }
            case 's': {
                return {
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 's', args: [] },
                };
            }
            case 'pn': {
                return {
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 'pn', args: this._args },
                };
            }
            case 'pl': {
                return {
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 'pl', args: [] },
                };
            }
            case 'h': {
                return {
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 'h', args: this._args },
                };
            }
            case 'pf': {
                return {
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 'pf', args: this._args },
                };
            }
            default:
                throw new Error('Fatal Error');
        }
    }
}
exports.MessageParser = MessageParser;
