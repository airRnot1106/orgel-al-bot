import Discord from 'discord.js';
import { Commands } from '../type/type';
import { AbsCommand } from './absCommand';
import { HistoryCommand } from './historyCommand';
import { PlayCommand } from './playCommand';
import { PlaylistCommand } from './playlistCommand';
import { PlaynextCommand } from './playnextCommand';
import { PrefixCommand } from './prefixCommand';
import { SkipCommand } from './skipCommand';

export class CommandFactory {
    static create(
        commandName: Commands,
        executor: Discord.Message,
        args: string[] = []
    ) {
        return this.switchCommand(commandName, executor, args);
    }

    private static switchCommand(
        commandName: Commands,
        executor: Discord.Message,
        args: string[]
    ): AbsCommand {
        switch (commandName) {
            case 'p':
                return new PlayCommand(executor, args);
            case 's':
                return new SkipCommand(executor, args);
            case 'pn':
                return new PlaynextCommand(executor, args);
            case 'pl':
                return new PlaylistCommand(executor, args);
            case 'h':
                return new HistoryCommand(executor, args);
            case 'pf':
                return new PrefixCommand(executor, args);
            default:
                throw new Error('Fatal Error');
        }
    }
}
