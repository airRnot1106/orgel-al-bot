export type Token = {
    readonly APP_ENV: number;
    readonly DISCORD_BOT_TOKEN: string;
    readonly YOUTUBE_API_KEY: string;
    readonly DB_USER: string;
    readonly DB_HOST: string;
    readonly DB_NAME: string;
    readonly DB_PASSWORD: string;
    readonly DB_PORT: string;
    readonly DB_URL: string;
};

export type VideoInfo = {
    title: string;
    author: string;
    url: string;
};

export type VideoState = {
    status: number;
    detail: string;
    video: VideoInfo | null;
};
