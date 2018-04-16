import jwt   from 'jsonwebtoken';
import secretKey from '../utils/secretKey'
import log from '../utils/log';

export function checkRequest(req, res, next) {
    // check header or url parameters or post parameters for token
    const token = req.body.token || req.headers['authorization'] || req.query.token;
    log.info('token '+ token);
    // decode token
    // next();
    // return;
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token.replace('Bearer ',''), secretKey.secret, function(err, decoded) {
            if (err) {
                return res.status(401).send({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        // if there is no token
        // return an error
        return res.status(401).send({
            success: false,
            message: 'No token provided.'
        });

    }

} 