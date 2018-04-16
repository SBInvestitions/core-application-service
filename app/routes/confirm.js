import express from 'express';
import bcrypt from 'bcrypt-nodejs';
import jwt from "jsonwebtoken";
import User from '../models/user';
import log from '../utils/log';
import {resultAPI}   from '../utils/utils';
import secretKey from '../utils/secretKey'

const router = express.Router();

router.route('/v1/confirm')
  .post((req, res) => {
    if (!req.body.confirmationString) {
      return res.status(500).send({
        success: false,
        message: 'Confirmation string is required.'
      });
    } else if (!req.body.newPassword) {
      return res.status(500).send({
        success: false,
        message: 'New password is required.'
      });
    }
    else {
      bcrypt.hash(req.body.password, bcrypt.genSaltSync(SALT_WORK_FACTOR), null, function (err, hash) {
        if (err) {
          log.error('Error on create hash password for user: %s', req.body.email);
          res.statusCode = 500;
          return res.send(resultAPI(err, 500, err.message));
        }

        User.findOne({
          email: req.body.email
        }, function (err, dbUser) {
          if (dbUser.confirmationString && dbUser.confirmationString.length > 0 && dbUser.confirmationString === req.body.confirmationString) {
            dbUser.password = hash;
            dbUser.confirmed = true;
            return res.status(201).json(resultAPI('confirmed'));
          }
        });
      });
    }
  });

router.route('/v1/confirmed')
  .post((req, res) => {
    if (!req.body || !req.body.confirmationString) {
      return res.status(500).send({
        success: false,
        message: 'Confirmation string is required.'
      });
    }
    else {
      const token = req.body.confirmationString;
      jwt.verify(token, secretKey.secret, function(err, decoded) {
        console.log('err', err, 'decoded', decoded);
        if (err) {
          return res.status(401).send({
            success: false,
            message: 'Failed to authenticate token.'
          });
        } else {
          // if everything is good, save to request for use in other routes
          User.findOne({
            email: decoded.email
          }, function (err, dbUser) {
            console.log('dbUser', dbUser);
            if (err) {
              log.error('Error on confirmation user: %s', req.body.email);
              res.statusCode = 500;
              return res.send(resultAPI(err, 500, err.message));
            }
            dbUser.confirmed = true;
            dbUser.save();
            return res.status(201).json(resultAPI('confirmed'));
          });
        }
      });
    }
  });

export default router;