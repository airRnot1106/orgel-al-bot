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

export type Commands = 'p' | 's' | 'pn' | 'pl' | 'h' | 'pf';

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

export type GuildInfo = {
    readonly guildId: string;
    readonly guildName: string;
    readonly ownerId: string;
    readonly ownerName: string;
};

export type RequestInfo = {
    readonly guildId: string;
    readonly videoId: string;
    readonly requesterId: string;
    readonly textChannelId: string;
};

export type RequesterInfo = {
    readonly requesterId: string;
    readonly requesterName: string;
};

export type CommandInfo = {
    readonly isReply: boolean;
    readonly message: string;
};

export type VideoInfoRequestInfo = {
    readonly videoInfo: VideoInfo;
    readonly requestInfo: RequestInfo;
};

export type HistoryInfo = {
    readonly guildId: string;
    readonly videoId: string;
    readonly requesterId: string;
};

export type VideoTable = {
    video_id: string;
    title: string;
    author: string;
    url: string;
    requested_times: number;
};

export type GuildTable = {
    guild_id: string;
    guild_name: string;
    owner_id: string;
    owner_name: string;
    request_times: number;
    prefix: string;
};

export type RequesterTable = {
    requester_id: string;
    requester_name: string;
    request_times: number;
};

export type RequestTable = {
    request_id: string;
    guild_id: string;
    video_id: string;
    index: number;
    requester_id: string;
    text_channel_id: string;
};

export type HistoryTable = {
    readonly guild_id: string;
    readonly video_id: string;
    readonly requester_id: string;
};

export type AppResponse<R, E> =
    | {
          readonly status: 200 | 204;
          readonly detail: string;
          readonly body: R;
      }
    | {
          readonly status: 400 | 403 | 404 | 410 | 500;
          readonly detail: string;
          readonly body: E;
      };
