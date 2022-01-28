"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsCommand = void 0;
const database_1 = require("../database/database");
const register_1 = require("../database/register");
class AbsCommand {
    _executorMessage;
    _args;
    _database;
    _register;
    constructor(executorMessage, args) {
        this._executorMessage = executorMessage;
        this._args = args;
        this._database = database_1.Database.instance;
        this._register = register_1.Register.instance;
    }
}
exports.AbsCommand = AbsCommand;
