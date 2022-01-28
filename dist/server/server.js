"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../database/database");
const tokenIssuer_1 = require("../issuer/tokenIssuer");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.listen(port, async () => {
    tokenIssuer_1.TokenIssuer.instance;
    console.log(`Express Server Listen START at port=${port}`);
    await database_1.Database.instance.connect();
});
require('../client/client');
