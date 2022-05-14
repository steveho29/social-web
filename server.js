import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import 'dotenv/config'
import * as http from 'http'

import userRoute from './routes/user.js'
import newsfeedRoute from './routes/newsfeed.js'
import friendRoute from './routes/friend.js'
import chatRoute from './routes/chat.js'
import searchRoute from './routes/search.js'
import notificationRoute from './routes/notifications.js'
import uploadRoute from './routes/upload.js'
import roomRoute from './routes/room.js'

import auth from './middleware/auth.js'
import headerMiddleware from './middleware/header.middleware.js'

// import { action as notiActionTypes } from './models/notification.js'

import cors from 'cors'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { addSocketMessage } from './controllers/messageManageController.js'

const app = express()
const server = http.createServer({}, app)
const corsOptions = {
    origin: function (origin, callback) {
        callback(null, true)
    },
  }
const io = new Server(server, {
    cors: {
        origin: corsOptions.origin,
        methods: ['GET', 'POST'],
    },
})


app.use(cors(corsOptions))
app.all('*', headerMiddleware)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ extended: true }))

app.use('/user',  userRoute) //Sign In/Up

app.use('/newsfeed',  newsfeedRoute)

app.use('/search',  auth, searchRoute)
app.use('/friends',  auth, friendRoute)
app.use('/chat',  auth, chatRoute)
app.use('/notifications', auth, notificationRoute)
app.use('/upload', auth, uploadRoute)
app.use('/storage',  express.static('storage'));
app.use('/room',  auth, roomRoute)

let onlineUser = []

const addOnlineUser = (userId, socketId) => {
    const newUser = {
        userId: userId,
        socketId: socketId,
    }
    onlineUser.push(newUser)
}

const removeOnlineUser = (socketId) => {
    onlineUser = onlineUser.filter((user) => user.socketId !== socketId)
}

const convertUserIdtoSocketId = (userId) => {
    const user = onlineUser.filter((user) => user.userId === userId)
    return user[0].socketId
}

mongoose
    .connect(process.env.DB_API, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        io.on('connection', (socket) => {
            try {
                const token = socket.handshake.headers.token
                const decodedData = jwt.verify(
                    token,
                    process.env.JWT_SECRET_KEY
                )
                addOnlineUser(decodedData.id, socket.id)

                socket.join(`${decodedData.id}`)
                

                socket.on('send_message', async (data) => {
                    data.from = decodedData?.id
                    console.log(data)
                    if (data.from){
                        addSocketMessage(data).then(() => {
                            io.to(data.to).emit('receive_message', data)
                        })
                    }
                })

                socket.on('changeVideo', async (data) => {

                })

                // socket.on('notifications', async(data) => {
                //     if(data?.action == notiActionTypes.ACCEPT_FRIEND)
                //         io.to(data.userID).emit('notifications', data)
                //         // io.to(data.from).emit('notifications', data)
                // })

                socket.on('disconnect', () => {
                    console.log('delete room', socket.id)
                    removeOnlineUser(socket.id)
                    console.log(onlineUser)
                })

                console.log(onlineUser)
            } catch (err) {
                console.log(err)
                socket.disconnect()
            }
        })


        
        server.listen(process.env.PORT, process.env.HOST,  () =>
            console.log(`${process.env.HOST}:${process.env.PORT}`)
        )
    })
    .catch(() => console.log(console.error.message))
