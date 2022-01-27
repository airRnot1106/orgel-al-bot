import ytdl from 'ytdl-core';
import { YoutubeDataAPI } from 'youtube-v3-api';
import { TokenIssuer } from '../issuer/tokenIssuer';
import { UrlParser } from '../parser/urlParser';
import { AppResponse, VideoInfo } from '../type/type';

export class Searcher {
    private static _instance: Searcher;
    private readonly _api;
    private readonly _urlParser;
    private constructor() {
        this._api = new YoutubeDataAPI(
            TokenIssuer.instance.tokens.YOUTUBE_API_KEY
        );
        this._urlParser = UrlParser.instance;
    }

    public static get instance(): Searcher {
        if (!this._instance) {
            this._instance = new Searcher();
        }
        return this._instance;
    }

    async execute(q: string) {
        const type = this._urlParser.isUrl(q) ? 'url' : 'keyword';
        switch (type) {
            case 'url': {
                const url = this._urlParser.isMobileUrl(q)
                    ? this._urlParser.convertMobileUrl(q)
                    : q;
                if (!this._urlParser.isValidUrl(url))
                    return <AppResponse<null>>{
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

    async searchByUrl(videoUrl: string) {
        const res = await ytdl.getBasicInfo(videoUrl).catch(() => null);
        const status = res ? 200 : 404;
        return <AppResponse<VideoInfo>>{
            status: status,
            detail: status === 200 ? '' : '動画が存在しません！',
            body:
                status === 200
                    ? {
                          id: res?.videoDetails.videoId,
                          title: res?.videoDetails.title,
                          author: res?.videoDetails.author.name,
                          url: videoUrl,
                      }
                    : null,
        };
    }

    async searchByKeyword(videoKeyword: string) {
        const res = (await this._api.searchAll(videoKeyword, 3, {
            type: 'video',
        })) as {
            items: {
                id: { videoId: string };
                snippet: { title: string; channelTitle: string };
            }[];
        };
        const status = res.items.length ? 200 : 404;
        return <AppResponse<VideoInfo>>{
            status: status,
            detail: status === 200 ? '' : '動画が存在しません！',
            body:
                status === 200
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
