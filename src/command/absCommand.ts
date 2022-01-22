import { Database } from '../database/database';
import { AppResponse, CommandInfo } from '../type/type';

export abstract class AbsCommand {
    protected _args;
    protected _database;
    constructor(args: string[]) {
        this._args = args;
        this._database = Database.instance;
    }

    abstract execute():
        | Promise<AppResponse<CommandInfo>>
        | AppResponse<CommandInfo>;
}
