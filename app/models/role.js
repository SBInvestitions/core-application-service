import mongoose, {Schema} from 'mongoose';

const RoleSchema  = new Schema({
    name: { type: String, required: true}
});

export default mongoose.model('Role', RoleSchema);