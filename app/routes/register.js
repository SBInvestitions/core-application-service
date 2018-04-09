import express from 'express';
import bcrypt from 'bcrypt-nodejs';
import Role from '../models/role';
import User from '../models/user';
import log from '../utils/log';
import {resultAPI}   from '../utils/utils';
import secretKey from "../utils/secretKey";
import jwt from "jsonwebtoken";

const SALT_WORK_FACTOR = 10;
const router = express.Router();

router.route('/v1/register')
/**
     * Create a user.
     * @param {string} name - user name
     */
    .post((req, res) => {
      if (!req.body.email) {
        return res.status(500).send({
          success: false,
          message: 'Email is required.'
        });
      } else if (!req.body.password) {
        return res.status(500).send({
          success: false,
          message: 'Password is required.'
        });
      }
      else {
        bcrypt.hash(req.body.password, bcrypt.genSaltSync(SALT_WORK_FACTOR), null, function (err, hash) {
          if (err){
            log.error('Error on create hash password for user: %s',  req.body.email);
            res.statusCode = 500;
            return res.send(resultAPI(err, 500, err.message));
          }
          Role.find({'name': 'User'}, function(err, Roles){
            if (err) {
              res.statusCode = 404;
              log.error('Role not found: %s',req.body.role);
              return res.send(resultAPI(req.body.role, 404, 'Not found'));
            } else {
              if (!Roles) {
                res.statusCode = 404;
                log.error('Role not found:', 'User');
                return res.send(resultAPI(req.body.role, 404, 'Not found'));
              }else {
                User.findOne({
                  email: req.body.email
                }, function(err, user) {

                  if (err) throw err;

                  if (user) {
                    log.info('User is created: %s', req.body.email);
                    return res.status(500).send({
                      success: false,
                      message: 'User already exists'
                    });
                  } else if (!user) {
                    const userInfo = {
                      'name': req.body.name,
                      'secondName': req.body.secondName,
                      'surName': req.body.surName,
                      'birthDate': req.body.birthDate,
                      'email': req.body.email,
                      'password': hash,
                      'role': Roles[0],
                      'enabled': req.body.enabled
                    };
                    const newUser = new User(userInfo);

                    newUser.save(function(err) {
                      if (err) {
                        if (err.name === 'ValidationError') {
                          res.statusCode = 400;
                          res.send(resultAPI(err, 400, 'Validation error'));
                        } else {
                          res.statusCode = 500;
                          res.send(resultAPI(err, 500, err.message));
                        }
                        log.error('Internal error(%d): %s', res.statusCode, err.message);
                      } else {
                        log.info('Pole is created: %s', req.body.name);
                        delete userInfo.password;
                        delete userInfo.enabled;
                        delete userInfo.birthDate;
                        delete userInfo.surName;
                        userInfo.role = Roles[0].name;
                        return res.status(201).json(resultAPI(userInfo));
                      }
                    })
                  }
                });
              }
            }
          })
        })
      }

    });

router.route('/v1/register/confirm')
  .post((req, res) => {
    if (!req.body.confirmationString) {
      return res.status(500).send({
        success: false,
        message: 'Confirmation string is required.'
      });
    } else if (!req.body.newPassword) {
      return res.status(500).send({
        success: false,
        message: 'Email is required.'
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

export default router;