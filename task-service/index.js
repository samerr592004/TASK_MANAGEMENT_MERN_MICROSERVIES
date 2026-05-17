const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const amqp = require('amqplib')

const app = express()
const port = 3002


app.use(bodyParser.json())

mongoose.connect('mongodb://mongo:27017/tasks').then(() => {
  console.log('Connected to MongoDB')
}).catch((err) => {
  console.error('Error connecting to MongoDB', err)
})

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  userId: String,
  createdAt: { type: Date, default: Date.now }
})

const Task = mongoose.model('Task', taskSchema)

let connection,channel;
async function connectionWIthRabbotMQRetry(retries = 5, delay = 5000) {
  while(retries){
  try{

    
      connection = await amqp.connect('amqp://rabbitmq:')
      channel = await connection.createChannel()
      await channel.assertQueue('task_created')
      console.log('Connected to RabbitMQ')
      return
    
  }catch(error){
    console.error('Error connecting to RabbitMQ', error)
    retries--
    await new Promise(res => setTimeout(res, delay))
  }
}
}

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find()
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/tasks', async (req, res) => {
  try {
    const {title, description, userId} = req.body
    const task = new Task({title, description, userId})
    await task.save()

    const message = {taskId: task._id, userId,title}

    if(!channel){
      res.status(503).json({ error: 'RabbitMQ not available' })
    }

    channel.sendToQueue('task_created', Buffer.from(JSON.stringify(message)))



    res.status(201).json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: error.message })
  }
})



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Task service listening on port ${port}`)
  connectionWIthRabbotMQRetry()
})
