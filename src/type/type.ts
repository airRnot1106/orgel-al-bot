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

export type Commands = 'p' | 's' | 'pn' | 'pl';

export type VideoInfo = {
    readonly id: string;
    readonly title: string;
    readonly author: string;
    readonly url: string;
};

export type MessageInfo = {
    readonly command: Commands;
    readonly args: string[];
};

export type CommandInfo = {
    readonly isReply: boolean;
    readonly message: string;
};

export type AppResponse<T> = {
    readonly status: number;
    readonly detail: string;
    readonly body: T | null;
};
