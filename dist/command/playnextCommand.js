"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaynextCommand = void 0;
const absPlayCommand_1 = require("./absPlayCommand");
class PlaynextCommand extends absPlayCommand_1.AbsPlayCommand {
    constructor(executorMessage, args) {
        super(executorMessage, args);
    }
    async process(requestInfo) {
        await this._register.registerInterruptionRequest(requestInfo);
    }
}
exports.PlaynextCommand = PlaynextCommand;
