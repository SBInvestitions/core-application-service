import mongoose, {Schema} from 'mongoose';
import q from 'q';

//defining schema for subscribers emails table

const subscriberEmail = new Schema({
  email: { type: String },
  dateCreate: { type: Date, default: Date.now },
});

//To use our schema definition, we need to convert our blogSchema into a Model we can work with
const SubscribersEmails = mongoose.model('subscribersEmails', subscriberEmail);

//Initlizing interface object of this model.
const subscribersEmailsModel = {};

subscribersEmailsModel.getOne = function(email){
  const results = q.defer();
  if(!email){
    results.reject({ status:'error', error:'Email not supplied.' });
  }
  SubscribersEmails.findOne({ email: email }, function(err, dbEmail) {
    if (err){
      results.reject(err);
    }

    if(dbEmail){
      results.resolve(dbEmail);
    } else{
      results.reject({status:'error', error:'Invalid email supplied.'});
    }
  });
  return results.promise;
};

//Insert email into database if it has not the same
subscribersEmailsModel.insertOne = function(email){
  const results = q.defer();
  const emails = [];
  /*subscribersEmailsModel.getOne(email).then((res) => {
    results.resolve(res);
  }, (err) => {
    //Добавляем статью
    if(err.error === 'Invalid email supplied.'){
      const newEmail = {
        email: email,
        dateCreate: new Date(),
      };
      emails.push(newEmail);
      subscribersEmails.collection.insert(emails, function(err, dbEmail) {
        if(err){
          console.log('error occured in populating database');
          console.log(err);
        }
        else{
          results.resolve(dbEmail);
        }
      });
    }
  });*/
  SubscribersEmails.findOne({ email: email }, function(err, dbEmail) {
    if(err){
      return results.reject(err);
    }
    if (dbEmail) {
      results.resolve(dbEmail);
    } else {
      emails.push(email);
      SubscribersEmails.collection.insert(emails, function(err, dbWallet) {
        if(err){
          console.log('error occured in populating database');
          console.log(err);
        }
        else{
          // console.log('wallet inserted');
          results.resolve(dbWallet);
        }
      });
    }
  });
  return results.promise;
};

module.exports = subscribersEmailsModel;