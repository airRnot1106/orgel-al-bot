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
        return /https:\/\/www\.youtube\.com\/watch\?v=\S+/.test(url);
    }

    isMobileUrl(url: string) {
        return /https:\/\/youtu\.be\/\S+/.test(url);
    }

    convertMobileUrl(mobileUrl: string) {
        const id = mobileUrl.split('youtu.be/')[1];
        return `https://www.youtube.com/watch?v=${id}`;
    }
}
