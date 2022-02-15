import play from 'play-dl';

export class UrlParser {
    private static _instance: UrlParser;
    private constructor() {}

    public static get instance(): UrlParser {
        if (!this._instance) {
            this._instance = new UrlParser();
        }
        return this._instance;
    }

    isUrl(str: string) {
        return /https?:\/\/[\w!?/+\-_~=;.,*&@#$%()'[\]]+/.test(str);
    }

    isValidUrl(url: string) {
        return play.yt_validate(url) === 'video';
    }
}
