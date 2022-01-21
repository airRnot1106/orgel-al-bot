import Pg from 'pg';
import { TokenIssuer } from '../issuer/tokenIssuer';

export class Database {
    private static _instance: Database;
    private _client;
    private _isValid: boolean;
    private constructor() {
        this._client = new Pg.Client(
            TokenIssuer.instance.tokens.APP_ENV
                ? {
                      user: TokenIssuer.instance.tokens.DB_USER,
                      host: TokenIssuer.instance.tokens.DB_HOST,
                      database: TokenIssuer.instance.tokens.DB_NAME,
                      password: TokenIssuer.instance.tokens.DB_PASSWORD,
                      port: parseInt(TokenIssuer.instance.tokens.DB_PORT, 10),
                      connectionString: TokenIssuer.instance.tokens.DB_URL,
                      ssl: {
                          rejectUnauthorized: false,
                      },
                  }
                : {
                      user: TokenIssuer.instance.tokens.DB_USER,
                      host: TokenIssuer.instance.tokens.DB_HOST,
                      database: TokenIssuer.instance.tokens.DB_NAME,
                      password: TokenIssuer.instance.tokens.DB_PASSWORD,
                      port: parseInt(TokenIssuer.instance.tokens.DB_PORT, 10),
                  }
        );
        this._isValid = false;
    }

    public static get instance(): Database {
        if (!this._instance) {
            this._instance = new Database();
        }
        return this._instance;
    }

    async connect() {
        if (this._isValid) {
            return;
        }
        await this._client.connect();
        this._isValid = true;
        console.log('Connected to database');
    }

    async query(query: string) {
        if (!this._isValid) {
            throw new Error('No connection to the database');
        }
        const result = await this._client.query(query);
        return result;
    }
}
