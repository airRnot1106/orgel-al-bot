import Discord from 'discord.js';
import { Database } from '../database/database';
import { Register } from '../database/register';
import { AppResponse, CommandInfo } from '../type/type';

export abstract class AbsCommand {
    protected _executorMessage;
    protected _args;
    protected _database;
    protected _register;
    constructor(executorMessage: Discord.Message, args: string[]) {
        this._executorMessage = executorMessage;
        this._args = args;
        this._database = Database.instance;
        this._register = Register.instance;
    }

    abstract execute():
        | Promise<AppResponse<CommandInfo>>
        | AppResponse<CommandInfo>;
}
