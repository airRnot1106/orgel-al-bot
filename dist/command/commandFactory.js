"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandFactory = void 0;
const historyCommand_1 = require("./historyCommand");
const playCommand_1 = require("./playCommand");
const playlistCommand_1 = require("./playlistCommand");
const playnextCommand_1 = require("./playnextCommand");
const prefixCommand_1 = require("./prefixCommand");
const skipCommand_1 = require("./skipCommand");
class CommandFactory {
    static create(commandName, executor, args = []) {
        return this.switchCommand(commandName, executor, args);
    }
    static switchCommand(commandName, executor, args) {
        switch (commandName) {
            case 'p':
                return new playCommand_1.PlayCommand(executor, args);
            case 's':
                return new skipCommand_1.SkipCommand(executor, args);
            case 'pn':
                return new playnextCommand_1.PlaynextCommand(executor, args);
            case 'pl':
                return new playlistCommand_1.PlaylistCommand(executor, args);
            case 'h':
                return new historyCommand_1.HistoryCommand(executor, args);
            case 'pf':
                return new prefixCommand_1.PrefixCommand(executor, args);
            default:
                throw new Error('Fatal Error');
        }
    }
}
exports.CommandFactory = CommandFactory;
