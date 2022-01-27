import Discord from 'discord.js';
import { Player } from './player';

export class PlayerFactory {
    private static _instance: PlayerFactory;
    private _map: Map<Discord.Guild, Player>;
    private constructor() {
        this._map = new Map();
    }

    public static get instance(): PlayerFactory {
        if (!this._instance) {
            this._instance = new PlayerFactory();
        }
        return this._instance;
    }

    getPlayer(guild: Discord.Guild) {
        if (!this._map.has(guild)) {
            this._map.set(guild, new Player(guild));
        }
        const player = this._map.get(guild);
        if (!player) throw new Error('Fatal Error');
        return player;
    }
}
