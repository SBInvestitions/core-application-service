import mongoose, {Schema}   from 'mongoose';
import bcrypt   from 'bcrypt-nodejs';

const UserSchema = new Schema({
    name: { type: String },
    secondName: String,
    surName: String,
    birthDate: Schema.Types.Date,
    email: { type: String, required: true, trim: true, lowercase: true, index: { unique: true } },
    password: { type: String, required: true },
    role: [{type: Schema.Types.ObjectId, ref: 'Role'}],
    confirmed: Boolean,
    confirmationString: { type: String, required: false },
    userImg: String,
});

const User = mongoose.model('wallets', UserSchema);
const userModel = {};


// Get single wallet by its address.
userModel.getOne = function(userId){
  console.log('userModel get one', user);
  const results = q.defer();
  if(!userId){
    results.reject({ status:'error', error:'User address not supplied.' });
  }
  User.findOne({ _id: userId }, function(err, dbUser) {
    if (err){
      results.reject(err);
    }

    if(dbUser){
      results.resolve(dbUser);
    } else{
      results.resolve(null);
    }
  });
  return results.promise;
};

UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

export default mongoose.model('User', UserSchema);