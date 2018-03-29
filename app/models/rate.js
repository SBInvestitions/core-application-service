import mongoose, {Schema} from 'mongoose';
const q = require('q');
const listOfCurrencies =  ["BTC", "ETH", "USD", "EUR", "RUB"];

const ratesSchema = new Schema({
  currency: { type: String, enum: listOfCurrencies },
  rate: Number,
  startDate: Number,
  endDate: Number,
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
  Rate.find({ endDate: null, currency: _currency }, function(err, dbRate) {
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

// Get rate by currency and date
rateModel.getByCurrencyAndDate = function(_currency, _timestamp) {
  var results = q.defer();
  // First, try if there are closed intervals for the timestamp (where endDate is not null)
  Rate.find({
    endDate: {$gt: _timestamp},
    startDate: {$lte: _timestamp},
    currency: _currency
  }, function(err, dbRate) {
    if (err || (dbRate.length == 0)) {
      // Then try if there are open intervals for the timestamp
      Rate.find({ endDate: null, currency: _currency }, function(errOpen, dbRateOpen) {
        if (errOpen || (dbRateOpen.length == 0)) {
          results.reject(errOpen);
        } else {
          results.resolve(dbRateOpen[0].rate);
        }
      });
    } else {
      results.resolve(dbRate[0].rate);
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
    startDate: openTimeStamp,
    endDate: null,
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

// update rate
rateModel.updateRatesEndDate = function(rates, endTimestamp) {
  const results = q.defer();
  const promiseArray = [];
  // find and update rate
  rates.forEach(function(rate) {
    rate.set({endDate: endTimestamp});
    promiseArray.push(rate.save());
  });
  Promise.all(promiseArray).then(function(values) {
    results.resolve(values);
  }, function(err) {
    results.reject(err);
  });
  return results.promise;
};

//delete rate
rateModel.delete = function(rateId) {
  const results = q.defer();
  let error = false;
  if(!rateId){
    results.reject({ status:'error', error:error });
    error = true;
  }
  if(!error){
    Rate.findOne({ _id:rateId }, function(err, dbRate) {
      dbRate.set({isDeleted: true});
      // find max of not deleted items, witch has endDate lower or equal than current startDate
      Rate.findOne({ endDate: { $lte: dbRate.startDate }, isDeleted: false })
        .sort('-score')
        .exec(function (err, dbRate2) {
          // set end date equal to current end date, if it is null too
          dbRate2.set({ endDate: dbRate.endDate });
          const promiseArray = [dbRate2.save(),  dbRate.save()];
          Promise.all(promiseArray).then(function() {
            results.resolve('deleted');
          }, function(err) {
            results.reject(err);
          });
        });
      if (err){
        results.reject(err);
      }
    });
  }
  return results.promise;
};

//check input validation
function checkInputError(rate) {
  return false;
}


export default mongoose.model('Rate', ratesSchema);
