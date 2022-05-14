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

// import { action as notiActionTypes } from './models/notification.js'

import cors from 'cors'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { addSocketMessage } from './controllers/messageManageController.js'
import YoutubeRoomModel from './models/youtubeRoom.js'

const app = express()
const server = http.createServer({}, app)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ extended: true }))
app.use(cors())

app.use('/user', userRoute) //Sign In/Up

app.use('/newsfeed', newsfeedRoute)

app.use('/search', auth, searchRoute)
app.use('/friends', auth, friendRoute)
app.use('/chat', auth, chatRoute)
app.use('/notifications', auth, notificationRoute)
app.use('/upload', auth, uploadRoute)
app.use('/storage', express.static('storage'));
app.use('/room', auth, roomRoute)


mongoose
    .connect(process.env.DB_API, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        io.on('connection', async (socket) => {
            try {
                const {token, id} = socket.handshake.headers

                // const decodedData = jwt.verify(
                //     token,
                //     process.env.JWT_SECRET_KEY
                // )

                socket.join(`${id}`)
                const room = await YoutubeRoomModel.findById(id)
                io.to(room._id).emit('update', room)
                

                socket.on('update_player', async (room) => {
                    console.log(room)
                    if (room){
                        await YoutubeRoomModel.findOneAndUpdate(room._id, room)
                        console.log(room)
                        io.to(room._id).emit('update', room)
                    }

                })


                socket.on('disconnect', () => {
                })


            } catch (err) {
                console.log(err)
                socket.disconnect()
            }
        })


    
        server.listen(process.env.PORT_2, process.env.HOST, () =>
            console.log(`${process.env.HOST}:${process.env.PORT_2}`)
        )
    })
    .catch(() => console.log(console.error.message))
