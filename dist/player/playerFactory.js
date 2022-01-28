"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerFactory = void 0;
const player_1 = require("./player");
class PlayerFactory {
    static _instance;
    _map;
    constructor() {
        this._map = new Map();
    }
    static get instance() {
        if (!this._instance) {
            this._instance = new PlayerFactory();
        }
        return this._instance;
    }
    getPlayer(guild) {
        if (!this._map.has(guild.id)) {
            this._map.set(guild.id, new player_1.Player(guild));
        }
        const player = this._map.get(guild.id);
        if (!player)
            throw new Error('Fatal Error');
        return player;
    }
}
exports.PlayerFactory = PlayerFactory;
