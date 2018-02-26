import express      from 'express';
import bodyParser   from 'body-parser';
import moment       from 'moment';
import cors from 'cors';
import uuid  from 'node-uuid';
import secretKey from './app/utils/secretKey'
import log from './app/utils/log';

import index   from './app/routes/index';

import login   from './app/routes/login';

const app = express();

moment.locale('ru');
moment().format("L");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

secretKey.secret = uuid.v4();

const port = process.env.PORT || 8081;
//Для отладки const port = process.env.PORT || 8081;

//База для вызова API
app.use('/api', login);

app.use('/api', index);

app.use(function(req, res, next){
    log.error('Not found URL: %s',req.url);
    return res.status(404).json(resultAPI(req.url, 404, 'Not found' ));         
});


app.listen(port, function(){
    log.info('Server listening on port '+ port);
});

export default app;
