import { Commands } from '../type/type';
import { AbsCommand } from './absCommand';
import { PlayCommand } from './playCommand';
import { PlaylistCommand } from './playlistCommand';
import { PlaynextCommand } from './playnextCommand';
import { SkipCommand } from './skipCommand';

export class CommandFactory {
    static create(commandName: Commands, args: string[] = []) {
        return this.switchCommand(commandName, args);
    }

    private static switchCommand(
        commandName: Commands,
        args: string[]
    ): AbsCommand {
        switch (commandName) {
            case 'p':
                return new PlayCommand(args);
            case 's':
                return new SkipCommand(args);
            case 'pn':
                return new PlaynextCommand(args);
            case 'pl':
                return new PlaylistCommand(args);
            default:
                throw new Error('Fatal Error');
        }
    }
}
