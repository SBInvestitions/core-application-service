import express from 'express';
import bcrypt from 'bcrypt-nodejs';
import jwt from "jsonwebtoken";
import Role from '../models/role';
import User from '../models/user';
import log from '../utils/log';
import {resultAPI}   from '../utils/utils';
import secretKey from "../utils/secretKey";
import { sendRegisterEmail } from './../utils/mailer';

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
              log.error('Role not found: %s Группа не найдена',req.body.role);
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
                    log.info('User is created: %s Пользователь уже был создан', req.body.email);
                    return res.status(500).send({
                      success: false,
                      message: 'User with same email address already exists. Пользователь с таким email уже существует'
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
                      'confirmed': false,
                    };
                    const newUser = new User(userInfo);

                    newUser.save(function(err, dbUser) {
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
                        console.log('dbUser', dbUser);
                        log.info('Pole is created: %s', req.body.name);
                        const data = {
                          email: req.body.email,
                        };
                        // send email with confirmation string
                        const key = jwt.sign(data, secretKey.secret);
                        sendRegisterEmail(key, req.body.email);
                        const tokenData = {
                          user: {
                            id: dbUser._id
                          }
                        };
                        var token = jwt.sign(tokenData, secretKey.secret, {
                          expiresIn: '24h',
                        });
                        delete userInfo.password;
                        delete userInfo.enabled;
                        delete userInfo.birthDate;
                        delete userInfo.surName;
                        userInfo.role = Roles[0].name;
                        return res.status(201).json({ token: token, user: userInfo });
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

export default router;