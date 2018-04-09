import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import {resultAPI}   from '../utils/utils';
import secretKey from '../utils/secretKey'
import bcrypt from 'bcrypt-nodejs';
import { sendRecoverEmail } from './../utils/mailer';

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
                    const data = {
                      user: {
                        id: user._id
                      }
                    };
                    var token = jwt.sign(data, secretKey.secret, {
                      expiresIn: '24h',
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

router.route('/v1/login/restore')
  .post((req, res) => {
    if (!req.body.confirmationString) {
      return res.status(500).send({
        success: false,
        message: 'Email is required.'
      });
    } else if (!req.body.email) {
      return res.status(500).send({
        success: false,
        message: 'Password is required.'
      });
    }
    User.findOne({
      email: req.body.email
    }, function (err, dbUser) {
      const data = {
        user: {
          id: dbUser._id
        }
      };
      var token = jwt.sign(data, secretKey.secret, {
        expiresIn: '24h',
      });
      User.confirmationString = token;
      User.save(function(err) {
        if (err) {
          return res.status(500).send({
            success: false,
            message: 'User save failed.'
          });
        } else {
          sendRecoverEmail(token, dbUser.email).then((status) => {
            if (!status) {
              return res.status(500).send({
                success: false,
                message: 'Email send failed.'
              });
            }
            return res.status(201).json(resultAPI('email was sent'));
          });
        }
      });
    })
  });

export default router;