"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayCommand = void 0;
const absPlayCommand_1 = require("./absPlayCommand");
class PlayCommand extends absPlayCommand_1.AbsPlayCommand {
    constructor(executorMessage, args) {
        super(executorMessage, args);
    }
    async process(requestInfo) {
        await this._register.registerRequest(requestInfo);
    }
}
exports.PlayCommand = PlayCommand;
