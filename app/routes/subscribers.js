import express from 'express';
import subscribersEmailsModel from './../models/subscribersEmails';
import { resultAPI }   from '../utils/utils';
import { sendSubscribeEmail } from './../utils/mailer';

const router = express.Router();

// controller that handles subscribers listings.

// controller that add single subscriber fetch request.
router.route('/v1/subscribe').post(async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(500).send({
        success: false,
        message: 'Email is required.'
      });
    } else {
      const email = req.body.email;
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line
      if (typeof email === 'string' && re.test(email)) {
        const dbSubscriber = await subscribersEmailsModel.insertOne(email);
        sendSubscribeEmail(dbSubscriber, email);
        if (!dbSubscriber) {
          return res.status(500).send({
            success: false,
            message: 'Email send failed.'
          });
        }
        return res.status(201).json(resultAPI('email was sent'));
      } else {
        return res.status(500).send({
          success: false,
          message: 'Email is not valid.'
        });
      }
    }
  } catch(e) {
    console.log('error while adding subscriber email', e);
    res.status(500);
    res.send(e);
  }
});

export default router;
