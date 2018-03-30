import express from 'express';
import request from 'request-promise';
import moment from 'moment';
import config from './../../config';
import Rates   from '../models/rate';

const router = express.Router();

router.route('/v1/rates').get(async (req, res) => {
  try {
    let rubRate = null;
    let ethRate = null;
    let newRubRateData = null;
    let newEthRateData = null;
    let rubRateData = await Rates.getByCurrency('RUB');
    let ethRateData = await Rates.getByCurrency('ETH');
    if (!rubRateData || moment().diff(rubRateData.created, 'days') > 1) {
      newRubRateData =  JSON.parse(await getRubRate());
      if (newRubRateData && newRubRateData.rates) {
        rubRate = newRubRateData.rates.RUB;
        await Rates.insertOne('RUB', rubRate, new Date());
      }
    } else {
      rubRate = rubRateData.rate;
    }
    if (!ethRateData || moment().diff(ethRateData.created, 'days') > 1) {
      newEthRateData =  JSON.parse(await getEthRate());
      if (newEthRateData && newEthRateData.result) {
        ethRate = newEthRateData.result.ethusd;
        await Rates.insertOne('ETH', ethRate, new Date());
      }
    } else {
      ethRate = ethRateData.rate;
    }
    res.status(200).send({ rub: rubRate.toString(), eth: ethRate.toString() });
  } catch(e) {
    console.log('error while getting rates rate ', e);
    res.status(400);
    res.send(e);
  }
});

async function getRubRate() {
  const options = {
    method: 'GET',
    url: config.FIXER_RATE_PATH,
  };
  return await request(options);
}


async function getEthRate() {
  const options = {
    method: 'GET',
    url: `${config.ETHERSCAN_API_URL}${config.ETHERSCAN_STATS_PATH}${config.ETHERSCAN_API_KEY}`,
  };
  return await request(options);
}

export default router;