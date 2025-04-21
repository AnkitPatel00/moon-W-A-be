const mongoose = require('mongoose')

const tagsSchema = new mongoose.Schema({
  tag: { type: String, required: true ,unique:true},
  tasks:[{type: mongoose.Schema.Types.ObjectId}]
})

const TagModel = mongoose.model("workasana-tags", tagsSchema)

module.exports = TagModel