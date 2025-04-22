const mongoose = require('mongoose');
// Task Schema
const taskSchema = new mongoose.Schema({
 name: { type: String, required: [true,"name is required" ]},
 project: { type: mongoose.Schema.Types.ObjectId, ref: 'workasana-projects', required: [true,"project id is required"] },
 team: { type: mongoose.Schema.Types.ObjectId, ref: 'workasana-team',required: [true,"team id is required"] },
 owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'workasana-users', required: [true,"members id is required"] }],
  tags: [{ type: String }],
 dueDate:{type:String,required:true},
 timeToComplete: { type: Number,min:[1,"Time To Complete Must be More than 0"],max:[30,"Time To Complete Must be under 30"],required: [true,"time to complete is required"] },
 status: {type: String,enum: ['To Do', 'In Progress', 'Completed', 'Blocked'],message:"'Status must be either: To Do, In Progress, Completed, or Blocked'",default:'To Do'},
completedAt:Date 
}, { timestamps: true });

module.exports = mongoose.model('workasana-tasks', taskSchema);