const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const MONGO_URI = process.env.MONGO_URI

const initializeDatabase = async() => {
  try {
    const isConnect = await mongoose.connect(MONGO_URI)
    if (isConnect)
    {
      console.log("Connected Successfully")
    }
  }
  catch (error)
  {
console.log("Failed to Connect: ",error)
  }
}

module.exports = initializeDatabase