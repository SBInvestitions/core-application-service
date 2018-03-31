import express from 'express';
import Wallet from '../models/wallet';

const router = express.Router();

router.route('/v1/wallet').get(async (req, res) => {
  try {
    const decoded = req.decoded;
    console.log('decoded = ', decoded);
    if (decoded && decoded.user) {
      const user = decoded.user;
      let walletData = await Wallet.getByUser(user.id);
      res.status(200).send({ walletData });
    } else {
      res.status(400);
      res.send('Error while getting user');
    }
  } catch(e) {
    console.log('error while getting wallet or user', e);
    res.status(500);
    res.send(e);
  }
});

router.route('/v1/wallet').post(async (req, res) => {
  try {
    const decoded = req.decoded;
    if (!req.body.address || !decoded || !decoded.user) {
      return res.status(500).send({
        success: false,
        message: 'Address is required.'
      });
    } else {
      const address = req.body.address;
      let walletData = await Wallet.getOne(address);
      if (walletData) {
        res.status(200).send({walletData});
      } else {
        const user = decoded.user;
        const newWallet = {
          address: address,
          userId: user.id,
          type: 'ext',
          privateKey: '',
        };
        const dbWallet = await Wallet.insertOne(newWallet);
        res.status(200).send("inserted");
      }
    }
  } catch(e) {
    console.log('error while adding wallet', e);
    res.status(500);
    res.send(e);
  }
});

router.route('/v1/wallet').put(async (req, res) => {
  try {
    const decoded = req.decoded;
    if (!req.body.address || !decoded || !decoded.user) {
      return res.status(500).send({
        success: false,
        message: 'Address is required.'
      });
    } else {
      const address = req.body.address;
      let walletData = await Wallet.updateOne(address);
      if (walletData) {
        res.status(200).send({walletData});
      } else {
        console.log('error while adding wallet', e);
        res.status(500);
        res.send(e);
      }
    }
  } catch(e) {
    console.log('error while adding wallet', e);
    res.status(500);
    res.send(e);
  }
});

router.route('/v1/wallet').delete(async (req, res) => {
  try {
    const decoded = req.decoded;
    if (!req.body.address || !decoded || !decoded.user) {
      return res.status(500).send({
        success: false,
        message: 'Address is required.'
      });
    } else {
      const address = req.body.address;
      let walletData = await Wallet.delete(address);
      if (walletData) {
        res.status(200).send('deleted');
      } else {
        console.log('error while adding wallet', e);
        res.status(500);
        res.send(e);
      }
    }
  } catch(e) {
    console.log('error while adding wallet', e);
    res.status(500);
    res.send(e);
  }
});

export default router;