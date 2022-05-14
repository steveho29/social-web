import moment from 'moment'

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import UserModel from '../models/user.js'
import MessageManageModel from '../models/chatBucket.js'
import ChatRoomModel from '../models/chatRoom.js'
import ChatBucketModel from '../models/chatBucket.js'
import 'dotenv/config'
import { StatusCodes } from 'http-status-codes'

const MESSAGE_ON_BUCKET = process.env.MESSAGE_ON_BUCKET

export const createSocketChatBucket = async (chatRoomId, seq, messages=[]) => {
    try {
        
        const newchatBucket = ChatBucketModel.create({
            roomId: chatRoomId,
            // owner: id,
            seq: seq,
            messages: messages,
        }) 
        return newchatBucket

    } catch (error) {
        console.log(error)
    }
}

export const addSocketMessageBucket = async (chatRoomId, message) => {
    try {
        const chatRoom = await ChatRoomModel.findById(chatRoomId)

        await ChatRoomModel.findByIdAndUpdate(chatRoomId,{$inc: { totalMessage: 1 },})
    
        const totalMessage = chatRoom.totalMessage

        const seq = Number(Math.floor(totalMessage / 20))

        let bucket = null
        if (totalMessage % 20 == 0 || totalMessage == 0) {
            bucket = await createSocketChatBucket(chatRoomId, seq)
            
        }
        
        bucket = await ChatBucketModel.findOneAndUpdate({roomId: chatRoomId,seq: seq,},{$push: { messages: message },})
        
        if (!bucket) {
            bucket = await createSocketChatBucket(chatRoomId, 0, [message])
            await ChatRoomModel.findByIdAndUpdate(chatRoomId, { totalMessage: 1 })
        }
        
    } catch (error) {
        console.log(error)
    }
}

export const createChatRoom = async (toUserID, fromUserID) => {
    const newChatRom = new ChatRoomModel({
        users: [toUserID, fromUserID],
        totalMessage: 0,
        name: '',
    })
    const chatRoom = await newChatRom.save()

    const toUser = await UserModel.findOne({
        _id: toUserID,
    })

    toUser.friends.map((friend) => {
        if (friend._id == fromUserID) {
            friend.chatRoom = chatRoom._id
        }
    })

    await UserModel.findOneAndUpdate(
        {
            _id: toUserID,
        },
        {
            friends: toUser.friends,
        }
    )

    const fromUser = await UserModel.findOne({
        _id: fromUserID,
    })

    fromUser.friends.map((friend) => {
        if (friend._id == toUserID) {
            friend.chatRoom = chatRoom._id
        }
    })

    await UserModel.findOneAndUpdate(
        {
            _id: fromUserID,
        },
        {
            friends: fromUser.friends,
        }
    )

    return chatRoom._id
}

export const addSocketMessage = async (message) => {
    const { from, to, chatRoom } = message

    try {
        if (!chatRoom) {
            const chatRoomId = await createChatRoom(message.from, message.to)
            await addSocketMessageBucket(chatRoomId, message)

            // await addSocketMessageBucket(chatRoomId, chatRoomId, message)
            // await addSocketMessageBucket(chatRoomId, from, message)
            // await addSocketMessageBucket(chatRoomId, to, message)
        } else {
            await addSocketMessageBucket(chatRoom, message)

            // await addSocketMessageBucket(chatRoom, chatRoom, message)
            // await addSocketMessageBucket(chatRoom, from, message)
            // await addSocketMessageBucket(chatRoom, to, message)
        }
    } catch (error) {
        console.log(error)
    }
}

export const getMessages = async (req, res) => {
    const { bucketSeq, chatRoomId } = req.query
    try {
        if (!chatRoomId) {
            return res.status(StatusCodes.BAD_REQUEST).json({'messsage': 'Cannot load messages'})
        } else {
            const chatRoom = await ChatRoomModel.findOne({
                _id: chatRoomId,
            })
            
            if (!chatRoom) return res.status(StatusCodes.BAD_REQUEST).json({'messsage': 'Cannot load messages'})

            const totalMessage = chatRoom.totalMessage

            let seq =  0

            if (bucketSeq) {
                seq = bucketSeq
            } else {
                seq = Number(Math.floor(totalMessage / 20))
                if (totalMessage % (MESSAGE_ON_BUCKET || 20) == 0 && totalMessage > 0) {
                    seq = seq - 1
                }
            }

            let chatBucket = await ChatBucketModel.findOne({
                roomId: chatRoomId,
                // owner: chatRoomId,
                seq: seq,
            })

            if (chatBucket?.messages?.length < 10 && seq > 0) {
                let prevChatBucket = await ChatBucketModel.findOne({
                    roomId: chatRoomId,
                    // owner: chatRoomId,
                    seq: seq - 1,
                })

                chatBucket.messages = [
                    ...prevChatBucket.messages,
                    ...chatBucket.messages,
                ]

                chatBucket.seq = seq - 1
            }
            console.log(chatBucket)
            res.status(200).json(chatBucket)
        }
    } catch (error) {
        console.log(error)
    }
}
