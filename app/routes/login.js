import express      from 'express';
import jwt   from 'jsonwebtoken';
import User   from '../models/user';
import Role from '../models/role';
import secretKey from '../utils/secretKey'
import bcrypt       from 'bcrypt-nodejs';

const router = express.Router();

router.route('/v1/login')
    .post((req, res) => {
        User.findOne({
            email: req.body.email
        }, function(err, user) {

            if (err) throw err;

            if (!user) {
              res.status(401).send({
                success: false,
                message: 'Authentication failed. User not found.'
              });
            } else if (user) {
                // check if password matches
                bcrypt.compare(req.body.password, user.password, function (err, valid) {
                    if (err) { return next(err); }
                    if (!valid) {
                        return res.status(401).send({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
                    }

                    var token = jwt.sign({}, secretKey.secret, {
                        expiresIn: '24h'
                    });

                    User.findById(user._id, {password: false, __v: false, enabled: false})
                        .populate({ path: 'role', select: '-__v'})
                        .exec(function(err, result) {
                            res.json({ token: token, user: result});
                        });
                });
            }

        });

    });

export default router;