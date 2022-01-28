import Discord from 'discord.js';
import { TokenIssuer } from '../issuer/tokenIssuer';
import { AppResponse, CommandInfo } from '../type/type';
import { AbsCommand } from './absCommand';

export class PrefixCommand extends AbsCommand {
    constructor(executorMessage: Discord.Message, args: string[]) {
        super(executorMessage, args);
    }

    async execute(): Promise<AppResponse<CommandInfo>> {
        const guild = this._executorMessage.guild;
        if (!guild)
            return <AppResponse<CommandInfo>>{
                status: 400,
                detail: 'Not a valid guild',
                body: { isReply: false, message: '無効なサーバーです！' },
            };
        const hasPermission = guild.me?.permissions.has('CHANGE_NICKNAME');
        if (!hasPermission)
            return <AppResponse<CommandInfo>>{
                status: 400,
                detail: 'Permission denied',
                body: {
                    isReply: false,
                    message:
                        ':no_entry_sign: エラー！ :no_entry_sign:\nパーミッションが付与されていません！\nOrgel-Alを一度追放してもう一度サーバに追加し直してください',
                },
            };
        const newPrefix = this._args.join(' ');
        if (!newPrefix)
            return <AppResponse<CommandInfo>>{
                status: 400,
                detail: 'Prefix denied',
                body: { isReply: true, message: '無効なプレフィックスです！' },
            };
        if (/\s\S+/.test(newPrefix))
            return <AppResponse<CommandInfo>>{
                status: 400,
                detail: 'Prefix denied',
                body: {
                    isReply: true,
                    message: 'プレフィックスに空白を含めることはできません！',
                },
            };
        if (newPrefix.length > 5)
            return <AppResponse<CommandInfo>>{
                status: 400,
                detail: 'Too long prefix',
                body: {
                    isReply: true,
                    message: 'プレフィックスは1 ~ 5文字で指定してください！',
                },
            };
        await this._register.registerPrefix(guild.id, newPrefix);
        const BOT_NAME = TokenIssuer.instance.tokens.APP_ENV
            ? 'Orgel-Al'
            : 'Orgel-Al-dev';
        await guild.me?.setNickname(`[${newPrefix}]${BOT_NAME}`);
        return <AppResponse<CommandInfo>>{
            status: 200,
            detail: 'Successful register prefix',
            body: {
                isReply: false,
                message: `新しいプレフィックス"${newPrefix}"を登録しました！`,
            },
        };
    }
}
