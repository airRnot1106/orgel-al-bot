"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const pg_1 = __importDefault(require("pg"));
const tokenIssuer_1 = require("../issuer/tokenIssuer");
class Database {
    static _instance;
    _client;
    _isValid;
    constructor() {
        this._client = new pg_1.default.Client(tokenIssuer_1.TokenIssuer.instance.tokens.APP_ENV
            ? {
                user: tokenIssuer_1.TokenIssuer.instance.tokens.DB_USER,
                host: tokenIssuer_1.TokenIssuer.instance.tokens.DB_HOST,
                database: tokenIssuer_1.TokenIssuer.instance.tokens.DB_NAME,
                password: tokenIssuer_1.TokenIssuer.instance.tokens.DB_PASSWORD,
                port: parseInt(tokenIssuer_1.TokenIssuer.instance.tokens.DB_PORT, 10),
                connectionString: tokenIssuer_1.TokenIssuer.instance.tokens.DB_URL,
                ssl: {
                    rejectUnauthorized: false,
                },
            }
            : {
                user: tokenIssuer_1.TokenIssuer.instance.tokens.DB_USER,
                host: tokenIssuer_1.TokenIssuer.instance.tokens.DB_HOST,
                database: tokenIssuer_1.TokenIssuer.instance.tokens.DB_NAME,
                password: tokenIssuer_1.TokenIssuer.instance.tokens.DB_PASSWORD,
                port: parseInt(tokenIssuer_1.TokenIssuer.instance.tokens.DB_PORT, 10),
            });
        this._isValid = false;
    }
    static get instance() {
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
    async query(query) {
        if (!this._isValid) {
            throw new Error('No connection to the database');
        }
        const result = await this._client.query(query);
        return result;
    }
}
exports.Database = Database;
