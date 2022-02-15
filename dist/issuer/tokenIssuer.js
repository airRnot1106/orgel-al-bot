"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenIssuer = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class TokenIssuer {
    static _instance;
    _tokens;
    constructor() {
        const tokens = {
            APP_ENV: process.env.APP_ENV
                ? parseInt(process.env.APP_ENV)
                : undefined,
            DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
            DB_USER: process.env.DB_USER,
            DB_HOST: process.env.DB_HOST,
            DB_NAME: process.env.DB_NAME,
            DB_PASSWORD: process.env.DB_PASSWORD,
            DB_PORT: process.env.DB_PORT,
            DB_URL: process.env.DB_URL,
        };
        if (!this.isValid(tokens))
            return;
        this._tokens = tokens;
    }
    static get instance() {
        if (!this._instance) {
            this._instance = new TokenIssuer();
        }
        return this._instance;
    }
    isValid(tokens) {
        for (const token in tokens) {
            if (token in tokens && tokens[token] === undefined)
                throw new Error(`Environmental Error: ${token} is not defined`);
        }
        return true;
    }
    get tokens() {
        return this._tokens;
    }
}
exports.TokenIssuer = TokenIssuer;
