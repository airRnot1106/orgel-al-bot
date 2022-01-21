import express from 'express';

import { TokenIssuer } from '../issuer/tokenIssuer';

const app = express();

const port = process.env.PORT || 3000;

app.listen(port, () => {
    TokenIssuer.instance;
    console.log(`Express Server Listen START at port=${port}`);
});

require('../client/client');
