import dotenv from 'dotenv';
dotenv.config();

export class TokenIssuer {
    private static _instance: TokenIssuer;
    private readonly _tokens!: { [s: string]: string };
    private constructor() {
        const tokens = {
            DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
            YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
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
        [s: string]: string | undefined;
    }): tokens is { [s: string]: string } {
        for (const token in tokens) {
            if (token in tokens && !tokens[token])
                throw new Error(`Environmental Error: ${token} is not defined`);
        }
        return true;
    }

    get tokens() {
        return this._tokens;
    }
}
