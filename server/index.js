const express = require('express')
const cors = require('cors')

const app = express()
const http = require('http').Server(app)
const PORT = 4000
const socketIO = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

let eventList = []

socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`)

  //event listener for new events
  socket.on('newEvent', (event) => {
    eventList.unshift(event)
    //sends the events back to the React app
    socket.emit('sendSchedules', eventList)
  })

  let interval = setInterval(function () {
    if (eventList.length > 0) {
      for (let i = 0; i < eventList.length; i++) {
        if (
          Number(eventList[i].hour) === new Date().getHours() &&
          Number(eventList[i].minute) === new Date().getMinutes() &&
          new Date().getSeconds() === 0
        ) {
          socket.emit('notification', {
            title: eventList[i].title,
            hour: eventList[i].hour,
            mins: eventList[i].minute
          })
        }
      }
    }
  }, 1000)

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected')
  })
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world'
  })
})

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})
