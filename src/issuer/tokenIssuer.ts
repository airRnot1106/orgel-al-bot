import dotenv from 'dotenv';
dotenv.config();
import { Token } from '../type/type';

export class TokenIssuer {
    private static _instance: TokenIssuer;
    private readonly _tokens!: Token;
    private constructor() {
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
        if (!this.isValid(tokens)) return;
        this._tokens = tokens;
    }

    public static get instance(): TokenIssuer {
        if (!this._instance) {
            this._instance = new TokenIssuer();
        }
        return this._instance;
    }

    private isValid(tokens: {
        [s: string]: string | number | undefined;
    }): tokens is Token {
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
