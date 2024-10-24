const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: String,
  name: String,
  photo: String,
});

module.exports = mongoose.model('Report', reportSchema);
