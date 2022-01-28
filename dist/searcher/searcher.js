"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Searcher = void 0;
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const youtube_v3_api_1 = require("youtube-v3-api");
const tokenIssuer_1 = require("../issuer/tokenIssuer");
const urlParser_1 = require("../parser/urlParser");
class Searcher {
    static _instance;
    _api;
    _urlParser;
    constructor() {
        this._api = new youtube_v3_api_1.YoutubeDataAPI(tokenIssuer_1.TokenIssuer.instance.tokens.YOUTUBE_API_KEY);
        this._urlParser = urlParser_1.UrlParser.instance;
    }
    static get instance() {
        if (!this._instance) {
            this._instance = new Searcher();
        }
        return this._instance;
    }
    async execute(q) {
        const type = this._urlParser.isUrl(q) ? 'url' : 'keyword';
        switch (type) {
            case 'url': {
                const url = this._urlParser.isMobileUrl(q)
                    ? this._urlParser.convertMobileUrl(q)
                    : q;
                if (!this._urlParser.isValidUrl(url))
                    return {
                        status: 400,
                        detail: 'URLが正しくありません！',
                        body: null,
                    };
                return await this.searchByUrl(url);
            }
            case 'keyword': {
                return await this.searchByKeyword(q);
            }
        }
    }
    async searchByUrl(videoUrl) {
        const res = await ytdl_core_1.default.getBasicInfo(videoUrl).catch(() => null);
        const status = res ? 200 : 404;
        return {
            status: status,
            detail: status === 200 ? '' : '動画が存在しません！',
            body: status === 200
                ? {
                    id: res?.videoDetails.videoId,
                    title: res?.videoDetails.title,
                    author: res?.videoDetails.author.name,
                    url: videoUrl,
                }
                : null,
        };
    }
    async searchByKeyword(videoKeyword) {
        const res = (await this._api.searchAll(videoKeyword, 3, {
            type: 'video',
        }));
        const status = res.items.length ? 200 : 404;
        return {
            status: status,
            detail: status === 200 ? '' : '動画が存在しません！',
            body: status === 200
                ? {
                    id: res.items[0].id.videoId,
                    title: res.items[0].snippet.title,
                    author: res.items[0].snippet.channelTitle,
                    url: `https://www.youtube.com/watch?v=${res.items[0].id.videoId}`,
                }
                : null,
        };
    }
}
exports.Searcher = Searcher;
