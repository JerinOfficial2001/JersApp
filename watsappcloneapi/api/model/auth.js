import mongoose from 'mongoose';

let Auth;

if (mongoose.models && mongoose.models.Auth) {
  Auth = mongoose.model('Auth');
} else {
  const authSchema = new mongoose.Schema({
    mobNum: {type: String, unique: true},
    password: String,
    name: String,
  });

  Auth = mongoose.model('Auth', authSchema);
}

export default Auth;
