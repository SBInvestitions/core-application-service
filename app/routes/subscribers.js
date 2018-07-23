import express from 'express';
import subscribersEmailsModel from './../models/subscribersEmails';

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
      const dbSubscriber = await subscribersEmailsModel.insertOne(email);
      res.status(200).send(dbSubscriber);
    }
  } catch(e) {
    console.log('error while adding subscriber email', e);
    res.status(500);
    res.send(e);
  }
});

export default router;
