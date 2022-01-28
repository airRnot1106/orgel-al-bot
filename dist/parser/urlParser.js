"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlParser = void 0;
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
        return /https:\/\/www\.youtube\.com\/watch\?v=\S+/.test(url);
    }
    isMobileUrl(url) {
        return /https:\/\/youtu\.be\/\S+/.test(url);
    }
    convertMobileUrl(mobileUrl) {
        const id = mobileUrl.split('youtu.be/')[1];
        return `https://www.youtube.com/watch?v=${id}`;
    }
}
exports.UrlParser = UrlParser;
