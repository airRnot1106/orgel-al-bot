"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlParser = void 0;
const play_dl_1 = __importDefault(require("play-dl"));
class UrlParser {
    static _instance;
    constructor() { }
    static get instance() {
        if (!this._instance) {
            this._instance = new UrlParser();
        }
        return this._instance;
    }
    isUrl(str) {
        return /https?:\/\/[\w!?/+\-_~=;.,*&@#$%()'[\]]+/.test(str);
    }
    isValidUrl(url) {
        return play_dl_1.default.yt_validate(url) === 'video';
    }
}
exports.UrlParser = UrlParser;
