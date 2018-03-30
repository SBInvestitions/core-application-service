import mongoose, {Schema} from 'mongoose';
const q = require('q');
const listOfCurrencies =  ["BTC", "ETH", "USD", "EUR", "RUB"];

const ratesSchema = new Schema({
  currency: { type: String, enum: listOfCurrencies },
  rate: Number,
  created: Number,
  isDeleted: { type: Boolean, default: false },
});

//To use our schema definition, we need to convert our schema into a Model we can work with
const Rate = mongoose.model('rates', ratesSchema);

//Initlizing interface object of this model.
const rateModel = {};

//function to get rate listings
rateModel.get = function(skip, limit) {
  var results = q.defer();
  skip = parseInt(skip) || 0;
  limit = parseInt(limit) || 999999999;
  Rate.find({}, function(err, dbRates) {
    if (err){
      console.log('err =', err);
      results.reject(err);
    }
    results.resolve(dbRates);
  }).skip(skip).limit(limit);
  return results.promise;
};


// Get current rate by currency.
rateModel.getByCurrency = function(_currency) {
  var results = q.defer();
  Rate.findOne({ currency: _currency }).sort({ created: -1 }).exec(function(err, dbRate) {
    if (err){
      results.reject(err);
    }
    if(dbRate){
      results.resolve(dbRate);
    } else{
      console.log('there are no items of ' + _currency + ' currency rates');
      results.resolve(null);
    }
  });
  return results.promise;
};

// Insert rate into database
rateModel.insertOne = function(_currency, _rate, _timestamp) {
  const results = q.defer();
  const targetCurrency = _currency.toUpperCase();
  var currentDate = new Date();
  var openTimeStamp = parseInt(currentDate.getTime() / 1000);
  if (typeof _timestamp !== 'undefined')
    openTimeStamp = _timestamp;
  const rates = [{
    currency: targetCurrency,
    rate: parseFloat(_rate),
    created: openTimeStamp,
    isDeleted: false,
  }];
  // Insert rate
  // we should update the latest rate to set andDate before insert
  rateModel.getByCurrency(targetCurrency).then(function(previousRates) {
    if (previousRates && previousRates.length) {
      // set every endDate
      rateModel.updateRatesEndDate(previousRates, openTimeStamp).then(function() {
        insertRate();
      })
    } else {
      insertRate();
    }
  });
  function insertRate() {
    Rate.collection.insert(rates, function(err, dbRates) {
      if(err){
        console.log('error inserting rate', err);
      }
      else{
        results.resolve(dbRates);
      }
    });
  }
  return results.promise;
};

export default rateModel;
