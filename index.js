const initializeDatabase = require('./db/db.connect')
const experss = require('express')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const JWT_KEY= process.env.JWT_KEY
const UserModel = require('./models/user.model')
const ProjectModel = require('./models/project.model')
const TeamModel = require('./models/team.model')
const TaskModel = require('./models/task.model')
const { default: mongoose } = require('mongoose')
const TagModel = require('./models/tags.model')

const app = experss()
app.use(experss.json())
app.use(cors({origin:"*",credentials:true}))


const jwt_middleware = (req,res,next) => {
  
  try {
      const token = req.headers["authorization"]
  if(!token) throw new Error("Token require")
  
    const decodedToken = jwt.verify(token, JWT_KEY)
    
    if (decodedToken)
    {
      req.user = decodedToken
      next()
    }

  }
  catch (error)
  {
    res.status(500).json({error:error.message || "internal server error"})
  }

}


initializeDatabase()

//home

app.get("/",(req,res) => {
  res.send("Welcome to Workasana Server.")
})

//user register

app.post("/api/auth/signup", async (req, res) => {
  const {name,email,password} =req.body
  try {

    if (name.trim().length<6)
    {
      throw new Error("Name must be more than 5 letters")
    }
    if (password.trim().length<6)
    {
      throw new Error("Password must be more than 6 letters")
    }

    const salt =await bcryptjs.genSalt(10)
    const hashedPassword =await bcryptjs.hash(password,salt)
    
    const newUser = new UserModel({ name, email, password: hashedPassword })
    
    const savedUser = await newUser.save()

    if (!savedUser)
    {
     throw new Error ("failed to save user")
    }

    const userObj = savedUser.toObject()
    delete userObj.password

    res.status(201).json({message:`${name} Registered Successfully.`,"newUser":userObj})

  }
  catch (error)
  {

    if(error.name === "ValidationError")
    {
res.status(400).json({error:Object.values(error.errors)[0].message})
    }

    res.status(400).json({error:error.message || "internal server error"})

  }
})

//user login

app.post("/api/auth/login", async (req, res) => {
  const {email,password} = req.body
  try {

    if (!email) throw new Error("Email is Require")
    if (!password) throw new Error("Password is Require")
    
    const isUserExist =await UserModel.findOne({ email: email })
    
    if(!isUserExist) throw new Error("Incorrect Email")

    const passowrdCorrect = await bcryptjs.compare(password, isUserExist.password)
    
    if (!passowrdCorrect) throw new Error("Incorrect Password")
    
    const user ={_id:isUserExist._id,name:isUserExist.name,email:isUserExist.email}
   
    const token = jwt.sign({ user }, JWT_KEY, { expiresIn: "24h" })
    
    res.status(200).json({token})

  }
  catch (error)
  {
    res.status(500).json({error:error.message || "internal server error"})
  }
})


//Create a new task.
app.post("/api/tasks",jwt_middleware,async (req, res) => {
  const { project, team, owners } = req.body
  try {

    if(!mongoose.isValidObjectId(project)) throw new Error(`${project} invalid Project objectId`)
    if (!mongoose.isValidObjectId(team)) throw new Error(`${team} invalid Team objectId`)
    
    if(!owners.every((id)=>mongoose.isValidObjectId(id))) throw new Error(`Owners invalid objectId`)

    const isPojectExist =await ProjectModel.findById(project)
    const isTeamExist =await TeamModel.findById(team)

    
    if(!isPojectExist) throw new Error(`${project} not Exist!`)
    if(!isTeamExist) throw new Error(`${project} not Exist!`)
    
    const newTask = new TaskModel(req.body)
    const savedTask = await newTask.save()

    if(!savedTask) throw new Error("Error in saving Task")

    res.status(201).json({message:"task added successfully",newTask:savedTask})
  }
  catch (error)
  {
    if (error.name === "ValidationError")
    {
      res.status(400).json({error:Object.values(error.errors)[0].message})
    }

    res.status(500).json({error:error.message || "internal server error"})
  }
})

//fetch tasks with filter

app.get("/api/tasks",jwt_middleware, async (req, res) => {

  const { team, taskOwner, sortByDate, tags, taskStatus,projectId } = req.query
  const query = {}
  const sortBy = {}
  
  if (team)
  {
    const teamId = await TeamModel.findOne({ name: team }).select("_id")
    query.team =teamId
  }
  
  if (taskOwner)
    {
      const ownerId = await UserModel.findOne({ name: taskOwner }).select("_id")
      query.owners = { $in: ownerId }
    }

  
  if (tags)
    {
      query.tags = {$in:tags}
  }
  
  if (taskStatus)
    {
      query.status = taskStatus
  }
  
  if (projectId)
    {
      query.project = projectId
    }

      
  if (sortByDate)
    {
    sortBy.dueDate =
      parseInt(sortByDate)
  }
  
  try {

    const tasks = await TaskModel.find(query).select("_id name owners dueDate status").sort(sortBy).populate([{ path: "owners", select: "name _id"},{path:"project",select:"name"}])
    
    res.status(200).json(tasks)

  }
  catch (error)
  {
    res.status(500).json({error:error.message || "internal server error"})
  }
})


//get task with projectId

app.get("/api/tasks/:projectId",jwt_middleware,async (req, res) => {

  const projectId = req.params.projectId


  try {

    const tasks = await TaskModel.find({project:projectId}).populate([{ path: "owners", select: "_id name" }])

    res.status(200).json(tasks)

  }
  catch (error)
  {
     res.status(500).json({error:error.message || "internal server error"})
  }
})


//get task with projectId

app.get("/api/tasks/taskDetails/:taskId",jwt_middleware,async (req, res) => {

  const taskId = req.params.taskId


  try {

    const tasks = await TaskModel.findById(taskId).populate([{ path: "owners", select: "-password" },{path:"project"},{path:"team"}])
    
    res.status(200).json(tasks)

  }
  catch (error)
  {
     res.status(500).json({error:error.message || "internal server error"})
  }
})




//update task

app.post("/api/tasks/:id",jwt_middleware,async (req, res) => {
const taskId = req.params.id
  const { project, team, owners,status } = req.body
  try {
    if(!mongoose.isValidObjectId(project)) throw new Error(`${project} invalid Project objectId`)
    if (!mongoose.isValidObjectId(team)) throw new Error(`${team} invalid Team objectId`)
    
    if(!owners.every((id)=>mongoose.isValidObjectId(id))) throw new Error(`Owners invalid objectId`)

    const isPojectExist =await ProjectModel.findById(project)
    const isTeamExist =await TeamModel.findById(team)

    
    if(!isPojectExist) throw new Error(`${project} not Exist!`)
    if (!isTeamExist) throw new Error(`${project} not Exist!`)
    
    
    const updatedTask = await TaskModel.findByIdAndUpdate(taskId,req.body,{new:true})

    if(!updatedTask) throw new Error("Error in updating Task")

    res.status(201).json({message:"task updated successfully",updatedTask})
  }
  catch (error)
  {
    if (error.name === "ValidationError")
    {
      res.status(400).json({error:Object.values(error.errors)[0].message})
    }

    res.status(500).json({error:error.message || "internal server error"})
  }
})
<

//handle mark as Complete

app.post('/api/tasks/complete/:id',jwt_middleware,async (req, res) => {
  const taskId = req.params.id
  try {
    const updatedTask = await TaskModel.findByIdAndUpdate(taskId, req.body, { new: true }).populate([{ path: "owners", select: "-password" },{path:"project"},{path:"team"}])
    res.status(201).json({message:"Task Updated Successfully",updatedTask})
  }
  catch (error)
  {
if (error.name === "ValidationError")
    {
      res.status(400).json({error:Object.values(error.errors)[0].message})
    }

    res.status(500).json({error:error.message || "internal server error"})
  }
})

//delete task

app.delete("/api/tasks/:id",jwt_middleware,async (req, res) => {
  const taskId = req.params.id
  try {
    const deletedTask = await TaskModel.findByIdAndDelete(taskId)

    if (!deletedTask) throw new Error("error in deleting task")
    
    res.status(200).json({message:"Task deleted successfully",deletedTask})

  }
  catch (error)
  {
    res.status(500).json({error:error.message || "internal server error"})
  }
})


//create new project

app.post("/api/projects",jwt_middleware,async (req, res) => {

  try {
    const newProject = new ProjectModel(req.body)
    const savedProject = await newProject.save()

    res.status(201).json({message:"new project created",newProject:savedProject})
  }
  catch (error)
  {
   
    if(error.name === "ValidationError")
    {
       res.status(400).json({error:Object.values(error.errors)[0].message})
      }
      
      res.status(500).json({error:error.message || "internal server error"})
  }
}) 

//fetch all project

app.get("/api/projects",jwt_middleware,async (req, res) => {
  
  const { projectName,projectStatus } = req.query

  const query ={}
  
  if (projectName)
  {
query.name = {$regex:projectName,$options:'i'}
  }
  if (projectStatus)
  {
query.status = projectStatus
  }

  try {
    
    const allProjects = await ProjectModel.find(query).select("_id name status description")
    
    if (!allProjects) throw new Error("error in getting projects")
    
    res.status(200).json(allProjects)
  }
  catch(error)
  {
res.status(500).json({error:error.message || "internal server error"})
  }
})

//create new team

app.post("/api/teams",jwt_middleware,async (req, res) => {

  try {
    const newTeam = new TeamModel(req.body)
    const savedTeam = await  newTeam.save()

    res.status(201).json({message:"new team created",newTeam:savedTeam})
  }
  catch (error)
  {
   
    if(error.name === "ValidationError")
    {
       res.status(400).json({error:Object.values(error.errors)[0].message})
      }
      
      res.status(500).json({error:error.message || "internal server error"})
  }
}) 

//add new memeber to team

app.post("/api/teams/member/:id",jwt_middleware,async (req, res) => {
const teamId = req.params.id
  try {
    const teamWithNewMemeber = await TeamModel.findByIdAndUpdate(teamId,req.body,{new:true})

    res.status(201).json({message:"new member added",team:teamWithNewMemeber})
  }
  catch (error)
  {
   
    if(error.name === "ValidationError")
    {
       res.status(400).json({error:Object.values(error.errors)[0].message})
      }
      
      res.status(500).json({error:error.message || "internal server error"})
  }
}) 

//fetch all team

app.get("/api/teams",jwt_middleware,async(req,res) => {
  try {
    
    const allTeams = await TeamModel.find().populate({path:'members',select:"_id name"})
    
    if (!allTeams) throw new Error("error in getting teams")
    
    res.status(200).json(allTeams)

  }
  catch(error)
  {
res.status(500).json({error:error.message || "internal server error"})
  }
})


//fetch team with Id

app.get("/api/teams/:id",jwt_middleware,async(req, res) => {
  
const teamId = req.params.id

  try {
    const team = await TeamModel.findById(teamId).populate('members')
    
    if (!team) throw new Error("error in getting team")
    
    res.status(200).json(team)
  }
  catch(error)
  {
res.status(500).json({error:error.message || "internal server error"})
  }
})


//protected route

app.get('/api/auth/user',jwt_middleware, (req, res) => {
  
  res.status(200).json(req.user)

})

//all users

app.get('/api/auth/users',jwt_middleware, async(req, res) => {
  try
  {
    const users = await UserModel.find()
    res.status(200).json(users)
  }
  catch (error)
  {
res.status(500).json({error:error.message || "internal server error"})
  }
})


//create Tags

app.post('/api/tags', async (req, res) => {
  const {tasks} = req.body
  try {

    console.log(tasks)

    const tasksId = tasks.every((task) => mongoose.isValidObjectId(task))
    
    if(!tasksId) throw new Error("taskId is not valid") 

    const newTag = new TagModel(req.body)
    const savedTag = await newTag.save()

    res.status(201).json({message:"Tag Created Successfully",newTag:savedTag})

  }
  catch (error)
  {
     if(error.name === "ValidationError")
    {
       res.status(400).json({error:Object.values(error.errors)[0].message})
    }
      res.status(500).json({error:error.message || "internal server error"})
  }
})

//fetch tags

app.get("/api/tags", async(req,res) => {
  try {
    const tags = await TagModel.find()
    res.status(200).json(tags)
  }
  catch (error)
  {
    res.status(500).json({error:error.message || "internal server error"})
  }
})

//reporting

//tasks completed in the last week

app.get("/api/report/last-week",jwt_middleware,async (req, res) => {
  
  const sevendayAgoDate = new Date()
    
  sevendayAgoDate.setDate(sevendayAgoDate.getDate() - 7);

  try {
    const tasks = await TaskModel.find({status:"Completed",completedAt:{$gte:sevendayAgoDate}}).countDocuments()
    res.status(200).json({completedTask: tasks})
  }
  catch (error)
  {
    res.status(500).json({error:error.message || "internal server error"})
  }
})

//  total days of work pending

app.get("/api/report/pending",jwt_middleware,async (req, res) => {
  try {
    const pendingTask = await TaskModel.find({ status: {$ne:"Completed"} }).select("timeToComplete")
    res.status(200).json({"daysLeft": pendingTask.reduce((acc,obj)=>acc+obj.timeToComplete,0)})
  }
  catch (error)
  {
 res.status(500).json({ error: "internal server error" })
  }
})

//number of tasks closed by team, owner, or project

app.get("/api/report/closed-tasks",jwt_middleware,async (req,res) => {
  const {team,project,owner} = req.query
  const query = {}
  if (team)
  {
    const teamId = await TeamModel.findOne({ name: team }).select("_id")
    query.team =teamId
  }
  
  if (owner)
    {
      const ownerId = await UserModel.findOne({ name: owner }).select("_id")
      query.owners = { $in: ownerId }
    }
    
  if (project)
    {
      const projectId = await ProjectModel.findOne({ name: project }).select("_id")
      query.project =projectId
  }
  
  try {
    const taskCount =await TaskModel.find({ status: "Completed",...query}).countDocuments()
  res.status(200).json({task:taskCount})
  }
  catch (error)
  {
     res.status(500).json({ error: "internal server error" })
  }
})

app.get("/api/report/closed-tasks/teams",jwt_middleware,async(req,res) => {
  try {
     const closedByTeam =await TaskModel.find({ status: "Completed"}).populate({path:"team",populate:{path:"members"}})
      res.status(200).json({team:closedByTeam})
  }
  catch (error)
  {
     res.status(500).json({ error: "internal server error" })
  }
})


//server port

const PORT = process.env.PORT || 5000

app.listen(PORT,() => {
  console.log(`Server is Running on Port ${PORT}`)
})






