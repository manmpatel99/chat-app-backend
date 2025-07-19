const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  mobile: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  pinPersonal: String,
  pinGeneral: String
});

module.exports = mongoose.model('User', UserSchema);
