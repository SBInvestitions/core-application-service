import mongoose, {Schema}   from 'mongoose';
const q = require('q');
const walletTypes = ['int', 'ext'];

const walletSchema = new Schema({
  address: { type: String },
  userId: { type: String },
  type: { type: String, enum: walletTypes, default: walletTypes[1] },
  privateKey: { type: String },
});

//To use our schema definition, we need to convert our schema into a Model we can work with
const Wallet = mongoose.model('wallets', walletSchema);

//Initlizing interface object of this model.
const walletModel = {};

//function to get wallets listings
walletModel.get = function(skip, limit){
  var results = q.defer();
  skip = parseInt(skip) || 0;
  limit = parseInt(limit) || 999999999;
  Wallet.find({}, function(err, dbWallet) {
    if (err){
      results.reject(err);
    }
    results.resolve(dbWallet);
  }).skip(skip).limit(limit);
  return results.promise;
};

walletModel.getByUser = function (userId) {
  var results = q.defer();
  if(!userId){
    results.reject({ status:'error', error:'Wallet userId not supplied.' });
  }
  Wallet.findOne({ userId: userId }, function(err, dbWallet) {
    if (err){
      results.reject(err);
    }

    if(dbWallet){
      results.resolve(dbWallet);
    } else{
      results.resolve([]);
    }
  });
  return results.promise;
};

// Get single wallet by its address.
walletModel.getOne = function(address){
  var results = q.defer();

  if(!address){
    results.reject({ status:'error', error:'Wallet address not supplied.' });
  }
  Wallet.findOne({ address: address }, function(err, dbWallet) {
    if (err){
      results.reject(err);
    }

    if(dbWallet){
      results.resolve(dbWallet);
    } else{
      results.resolve(null);
    }
  });
  return results.promise;
};

// Insert wallet into database
walletModel.insertOne = function(wallet){
  var results = q.defer();
  var wallets = [];
  // Insert wallets
  wallets.push(wallet);
  Wallet.collection.insert(wallets, function(err, dbWallet) {
    if(err){
      console.log('error occured in populating database');
      console.log(err);
    }
    else{
      // console.log('wallet inserted');
      results.resolve(dbWallet);
    }
  });
  return results.promise;
};

// update wallets
walletModel.updateOne = function(walletAddress, userId) {
  var results = q.defer();
  if(!userId || !walletAddress){
    results.reject({ status:'error', error:'Wallet or userId not supplied.' });
  }
  Wallet.findOne({ userId: userId }, function(err, dbWallet) {
    if (err) {
      return results.reject(err);
    }
    dbWallet.address = walletAddress;
    dbWallet.save();
    results.resolve(dbWallet);
  });
  return results.promise;
};

//delete wallet
walletModel.delete = function(userId){
  var results = q.defer();
  var error = false;
  if(!userId){
    results.reject({ status:'error', error:'Wallet or userId not supplied.' });
    error = true;
  }
  if(!error){
    Wallet.findOne({ userId: userId }, function(err, dbWallet) {
      if (err){
        results.reject(err);
      }
      dbWallet.remove();
      results.resolve(dbWallet);
    });
  }
  return results.promise;
};

//check input validation
function checkInputError(wallet) {
  return false;
}


module.exports = walletModel;
