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
});

UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

export default mongoose.model('User', UserSchema);