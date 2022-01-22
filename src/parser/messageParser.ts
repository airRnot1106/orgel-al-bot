import Discord from 'discord.js';
import { AppResponse, CommandInfo } from '../type/type';

export class MessageParser {
    private readonly _prefix;
    private readonly _commands;
    private _requestedCommand;
    private _args;
    constructor(message: Discord.Message) {
        this._prefix = '!!';
        this._commands = ['p', 's', 'pn', 'pl'];
        [this._requestedCommand, ...this._args] = message.content.split(' ');
    }

    execute() {
        const isValidRes = this.validateCommand();
        if (isValidRes.status === 400) return isValidRes;
        const commandRes = this.switchCommand();
        return commandRes;
    }

    private validateCommand() {
        if (!this._requestedCommand.startsWith(this._prefix))
            return <AppResponse<null>>{
                status: 400,
                detail: 'Prefix denied',
                body: null,
            };
        if (
            !this._commands.includes(
                this._requestedCommand.split(this._prefix)[1]
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

    private switchCommand() {
        const command = this._requestedCommand.split(this._prefix)[1];
        switch (command) {
            case 'p': {
                return <AppResponse<CommandInfo>>{
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 'p', args: this._args },
                };
            }
            case 's': {
                return <AppResponse<CommandInfo>>{
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 's', args: [] },
                };
            }
            case 'pn': {
                return <AppResponse<CommandInfo>>{
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 'pn', args: [] },
                };
            }
            case 'pl': {
                return <AppResponse<CommandInfo>>{
                    status: 200,
                    detail: 'Valid command',
                    body: { command: 'pl', args: [] },
                };
            }
            default:
                throw new Error('Fatal Error');
        }
    }
}
