"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Searcher = void 0;
const play_dl_1 = __importDefault(require("play-dl"));
const urlParser_1 = require("../parser/urlParser");
class Searcher {
    static _instance;
    _urlParser;
    constructor() {
        this._urlParser = urlParser_1.UrlParser.instance;
    }
    static get instance() {
        if (!this._instance) {
            this._instance = new Searcher();
        }
        return this._instance;
    }
    async execute(q) {
        const type = this._urlParser.validateType(q);
        switch (type) {
            case 'video': {
                const url = q;
                return await this.searchByVideoUrl(url);
            }
            case 'search': {
                return await this.searchByKeyword(q);
            }
            case 'playlist': {
                const url = q;
                return await this.searchByPlaylist(url);
            }
            default: {
                return {
                    status: 400,
                    detail: 'URLが正しくありません！',
                    body: null,
                };
            }
        }
    }
    async searchByVideoUrl(videoUrl) {
        const res = await play_dl_1.default
            .video_basic_info(videoUrl)
            .then((res) => {
            const { id, title, url } = res.video_details;
            const author = res.video_details.channel?.name;
            if (!id || !title || !author)
                throw 410;
            return {
                status: 200,
                detail: '',
                body: [{ id: id, title: title, author: author, url: url }],
            };
        })
            .catch((error) => {
            if (/This is not a YouTube Watch URL/.test(error))
                return {
                    status: 404,
                    detail: '動画が存在しません！',
                    body: null,
                };
            if (/While getting info from url/.test(error) || error === 410)
                return {
                    status: 410,
                    detail: 'この動画は再生できません！\nHint: キーワード検索なら再生できる可能性があります',
                    body: null,
                };
            return {
                status: 500,
                detail: '不明なエラー',
                body: null,
            };
        });
        return res;
    }
    async searchByKeyword(videoKeyword) {
        const res = await play_dl_1.default
            .search(videoKeyword, {
            source: { youtube: 'video' },
            limit: 1,
        })
            .then((res) => {
            const target = res[0];
            if (!target)
                throw 404;
            const { id, title, url } = target;
            const author = target.channel?.name;
            if (!id || !title || !author)
                throw 410;
            return {
                status: 200,
                detail: '',
                body: [{ id: id, title: title, author: author, url: url }],
            };
        })
            .catch((error) => {
            if (error === 404)
                return {
                    status: 404,
                    detail: '動画が存在しません！',
                    body: null,
                };
            return {
                status: 410,
                detail: 'この動画は再生できません！',
                body: null,
            };
        });
        return res;
    }
    async searchByPlaylist(url) {
        const res = await play_dl_1.default
            .playlist_info(url)
            .then(async (res) => {
            const targets = (await res.all_videos()).map((target) => {
                const { id, title, url } = target;
                const author = target.channel?.name;
                if (!id || !title || !author)
                    throw 410;
                return {
                    id: id,
                    title: title,
                    author: author,
                    url: url,
                };
            });
            return {
                status: 200,
                detail: '',
                body: targets,
            };
        })
            .catch((error) => {
            if (/The playlist does not exist/.test(error))
                return {
                    status: 404,
                    detail: 'プレイリストが存在しません！',
                    body: null,
                };
            if (/unavailable video is hidden/.test(error) || error === 410)
                return {
                    status: 410,
                    detail: 'プレイリストに再生できない動画が含まれています！',
                    body: null,
                };
            return {
                status: 500,
                detail: '不明なエラー',
                body: null,
            };
        });
        return res;
    }
}
exports.Searcher = Searcher;
