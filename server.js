import express      from 'express';
import bodyParser   from 'body-parser';
import moment       from 'moment';
import cors from 'cors';
import uuid  from 'node-uuid';
import db from './app/servcies/db'
import secretKey from './app/utils/secretKey'
import log from './app/utils/log';
import { resultAPI } from './app/utils/utils';

import index from './app/routes/index';

import login from './app/routes/login';
import register from './app/routes/register';
import users from './app/routes/users';
import rates from './app/routes/rates';
import wallet from './app/routes/wallet';
import news from './app/routes/news';

const app = express();

moment.locale('ru');
moment().format("L");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

secretKey.secret = 'test'; // uuid.v4();

const port = 3000;
//Для отладки const port = process.env.PORT || 8081;

//База для вызова API
app.use('/api', login);
app.use('/api', register);
app.use('/api', users);
app.use('/api', wallet);
app.use('/api', rates);
app.use('/api', index);
app.use('/api', news);

app.use(function(req, res, next){
    log.error('Not found URL: %s',req.url);
    return res.status(404).json(resultAPI(req.url, 404, 'Not found' ));         
});


app.listen(port, function(){
    log.info('Server listening on port '+ port);
});

export default app;
