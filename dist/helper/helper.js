"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helper = void 0;
class Helper {
    static _instance;
    _helps;
    _index;
    _client;
    _isValid;
    _intervalId;
    constructor() {
        this._helps = {
            p: '[URL | Keyword] - 指定した動画をプレイリストに登録',
            s: '- 再生中の動画をスキップ',
            pn: '[URL | Keyword] - 指定した動画をプレイリストに割り込み登録',
            pl: '- 現在のプレイリストを表示',
            h: '[1 ~ 50] - 再生履歴を表示',
            pf: '[new prefix] - 指定したプレフィックスを登録',
        };
        this._index = 0;
        this._isValid = false;
    }
    static get instance() {
        if (!this._instance) {
            this._instance = new Helper();
        }
        return this._instance;
    }
    set client(client) {
        this._client = client;
    }
    initialize(client) {
        this.client = client;
        this._isValid = true;
    }
    toggleHelpStatus() {
        if (!this._client)
            return {
                status: 403,
                detail: 'Not initialized',
                body: null,
            };
        const intervalId = setInterval(() => {
            if (!this._client)
                return;
            this.displayHelp(this._client);
            this._index++;
            if (this._index >= Object.keys(this._helps).length)
                this._index = 0;
        }, 5000);
        this._intervalId = intervalId;
        return {
            status: 200,
            detail: 'Successful setting interval',
            body: null,
        };
    }
    displayHelp(client) {
        const command = Object.keys(this._helps)[this._index];
        const description = this._helps[command];
        client.user?.setPresence({
            activities: [{ name: `${command} ${description}` }],
            status: 'online',
        });
    }
}
exports.Helper = Helper;
