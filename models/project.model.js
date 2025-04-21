const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: [true, "name is required"], unique: [true, "name must be unique"] },
  status: { type: String, enum: ['Active', 'Completed', 'On Hold'], default: 'Active' },
 description: { type: String },
},{timestamps:true});

module.exports = mongoose.model('workasana-projects', projectSchema);

