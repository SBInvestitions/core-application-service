import express from 'express';
import User from '../models/user';
import log from '../utils/log';
import {checkRequest} from '../utils/auth';
import {resultAPI}   from '../utils/utils';

const router = express.Router();

router.use(checkRequest);
    
router.route('/v1/user')
    .get(function(req, res) {
      console.log('req.decoded.user.id', req.decoded.user.id);
      User.findById(req.decoded.user.id,{__v: false, password: false })
            .populate({ path: 'role', select: '-__v'})
            .exec(function(err, result) {
                if (err) {
                    log.error('Internal error(%d): %s', res.statusCode, err.message);
                    res.statusCode = 500;
                    return res.send(resultAPI(err, 500, err.message));
                } else {
                  if (!result) {
                    res.statusCode = 500;
                    return res.send(resultAPI('no user found'));
                  }
                  console.log('result', result);
                  log.info(`Return user: ${result.email}`);
                  return res.json(resultAPI(result));
                }
            });
    });

export default router;