import play from 'play-dl';
import { UrlParser } from '../parser/urlParser';
import { AppResponse, VideoInfo } from '../type/type';

export class Searcher {
    private static _instance: Searcher;
    private readonly _urlParser;
    private constructor() {
        this._urlParser = UrlParser.instance;
    }

    public static get instance(): Searcher {
        if (!this._instance) {
            this._instance = new Searcher();
        }
        return this._instance;
    }

    async execute(q: string) {
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
                return <AppResponse<VideoInfo[], null>>{
                    status: 400,
                    detail: 'URLが正しくありません！',
                    body: null,
                };
            }
        }
    }

    async searchByVideoUrl(videoUrl: string) {
        const res = await play
            .video_basic_info(videoUrl)
            .then((res) => {
                const { id, title, url } = res.video_details;
                const author = res.video_details.channel?.name;
                if (!id || !title || !author) throw 410;
                return <AppResponse<VideoInfo[], null>>{
                    status: 200,
                    detail: '',
                    body: [{ id: id, title: title, author: author, url: url }],
                };
            })
            .catch((error) => {
                if (/This is not a YouTube Watch URL/.test(error))
                    return <AppResponse<VideoInfo[], null>>{
                        status: 404,
                        detail: '動画が存在しません！',
                        body: null,
                    };
                if (/While getting info from url/.test(error) || error === 410)
                    return <AppResponse<VideoInfo[], null>>{
                        status: 410,
                        detail: 'この動画は再生できません！\nHint: キーワード検索なら再生できる可能性があります',
                        body: null,
                    };
                return <AppResponse<VideoInfo[], null>>{
                    status: 500,
                    detail: '不明なエラー',
                    body: null,
                };
            });
        return res;
    }

    async searchByKeyword(videoKeyword: string) {
        const res = await play
            .search(videoKeyword, {
                source: { youtube: 'video' },
                limit: 1,
            })
            .then((res) => {
                const target = res[0];
                if (!target) throw 404;
                const { id, title, url } = target;
                const author = target.channel?.name;
                if (!id || !title || !author) throw 410;
                return <AppResponse<VideoInfo[], null>>{
                    status: 200,
                    detail: '',
                    body: [{ id: id, title: title, author: author, url: url }],
                };
            })
            .catch((error) => {
                if (error === 404)
                    return <AppResponse<VideoInfo[], null>>{
                        status: 404,
                        detail: '動画が存在しません！',
                        body: null,
                    };
                return <AppResponse<VideoInfo[], null>>{
                    status: 410,
                    detail: 'この動画は再生できません！',
                    body: null,
                };
            });
        return res;
    }

    async searchByPlaylist(url: string) {
        const res = await play
            .playlist_info(url)
            .then(async (res) => {
                const targets: VideoInfo[] = (await res.all_videos()).map(
                    (target) => {
                        const { id, title, url } = target;
                        const author = target.channel?.name;
                        if (!id || !title || !author) throw 410;
                        return {
                            id: id,
                            title: title,
                            author: author,
                            url: url,
                        };
                    }
                );
                return <AppResponse<VideoInfo[], null>>{
                    status: 200,
                    detail: '',
                    body: targets,
                };
            })
            .catch((error) => {
                if (/The playlist does not exist/.test(error))
                    return <AppResponse<VideoInfo[], null>>{
                        status: 404,
                        detail: 'プレイリストが存在しません！',
                        body: null,
                    };
                if (/unavailable video is hidden/.test(error) || error === 410)
                    return <AppResponse<VideoInfo[], null>>{
                        status: 410,
                        detail: 'プレイリストに再生できない動画が含まれています！',
                        body: null,
                    };
                return <AppResponse<VideoInfo[], null>>{
                    status: 500,
                    detail: '不明なエラー',
                    body: null,
                };
            });
        return res;
    }
}
