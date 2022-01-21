import express from 'express';
import { Database } from '../database/database';

import { TokenIssuer } from '../issuer/tokenIssuer';

const app = express();

const port = process.env.PORT || 3000;

app.listen(port, async () => {
    TokenIssuer.instance;
    console.log(`Express Server Listen START at port=${port}`);
    await Database.instance.connect();
});

require('../client/client');
