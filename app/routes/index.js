import express      from 'express';
import log from '../utils/log';
import {checkRequest} from '../utils/auth';

const router = express.Router();
router.use(checkRequest);

router.use(function(req, res, next) {
    // do logging
    log.debug('API request excuted: %s', req.originalUrl);
    next(); //следующий обработчик по цепочке
});

router.get('/', function(req, res) {
    return res.json({ message: 'API is running' });
});

router.get('/v1/', function(req, res) {
    return res.json({ message: 'API version 1 is running!' });
});

export default router;
