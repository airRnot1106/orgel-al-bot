import Discord from 'discord.js';
import { Database } from '../database/database';
import { AppResponse, MessageInfo, Commands } from '../type/type';

export class MessageParser {
    private _guildId;
    private _prefix: string | undefined;
    private readonly _commands: Commands[];
    private _requestedCommand;
    private _args;
    private _database;
    constructor(message: Discord.Message) {
        this._guildId = message.guild?.id;
        this._commands = ['p', 's', 'pn', 'pl', 'h', 'pf'];
        [this._requestedCommand, ...this._args] = message.content.split(' ');
        this._database = Database.instance;
    }

    async execute() {
        if (!this._guildId)
            return <AppResponse<null>>{
                status: 400,
                detail: 'Not valid guild',
                body: null,
            };
        const prefix = <string | undefined>(
            (
                await this._database.query(
                    `SELECT prefix FROM guilds WHERE guild_id = '${this._guildId}'`
                )
            ).rows[0]?.prefix
        );
        this._prefix = prefix;
        const isValidRes = this.validateCommand();
        if (isValidRes.status === 400) return isValidRes;
        const commandRes = this.discernCommand();
        return commandRes;
    }

    private validateCommand() {
        if (
            !this._requestedCommand.startsWith(
                this._prefix ? this._prefix : '!!'
            )
        )
            return <AppResponse<null>>{
                status: 400,
                detail: 'Prefix denied',
                body: null,
            };
        if (
            !this._commands.includes(
                this._requestedCommand.split(
                    this._prefix ? this._prefix : '!!'
                )[1] as Commands
            )
        )
            return <AppResponse<null>>{
                status: 400,
                detail: 'Command denied',
                body: null,
            };
        return <AppResponse<null>>{
            status: 200,
            detail: 'Valid command',
            body: null,
        };
    }

    private discernCommand() {
        const command = this._requestedCommand.split(
            this._prefix ? this._prefix : '!!'
        )[1];
        switch (command) {
            case 'p': {
                return <AppResponse<MessageInfo>>{
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 'p', args: this._args },
                };
            }
            case 's': {
                return <AppResponse<MessageInfo>>{
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 's', args: [] },
                };
            }
            case 'pn': {
                return <AppResponse<MessageInfo>>{
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 'pn', args: this._args },
                };
            }
            case 'pl': {
                return <AppResponse<MessageInfo>>{
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 'pl', args: [] },
                };
            }
            case 'h': {
                return <AppResponse<MessageInfo>>{
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 'h', args: this._args },
                };
            }
            case 'pf': {
                return <AppResponse<MessageInfo>>{
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
