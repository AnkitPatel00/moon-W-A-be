const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
 name: { type: String, required: [true,"name is required"], unique: [true,"name must be unique"] },
  description: { type: String },
 members:[{ type: mongoose.Schema.Types.ObjectId, ref: 'workasana-users', required: [true,"members id is required"] }]
},{timestamps:true});
module.exports = mongoose.model('workasana-team', teamSchema);

