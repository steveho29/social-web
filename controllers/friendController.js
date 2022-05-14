import UserModel from '../models/user.js'
import {
    ReasonPhrases,
    StatusCodes,
} from 'http-status-codes'
import NotificationModel from '../models/notification.js'
import { action } from '../models/notification.js'
import ChatRoomModel from '../models/chatRoom.js'
import { createSocketChatBucket } from './messageManageController.js'

export const getFriends = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userID)
        const { friends } = user

        let tempFriends = []
        for (let i = 0; i < friends.length; i++) {
            const user = await UserModel.findById(friends[i]._id)
            tempFriends.push({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                chatRoom: friends[i].chatRoom || null,
                avatar: user.avatar,
            })
        }

        return res.status(StatusCodes.OK).json(tempFriends)
    } catch (err) {
        console.log(err)
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}


export const addFriend = async (req, res) => {
    try {
        const data = req.body

        if(req.userID == data.userID) return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST)

        const user = await UserModel.findById(req.userID)
        const toUser = await UserModel.findById(data.userID)

        if (!user || !toUser) return res.status(StatusCodes.BAD_REQUEST).json({'message': 'User is not exist'})
        
        const requests = await NotificationModel.find({ 
            userID: toUser.id,
            from: user.id,
            action: action.ADD_FRIEND
        })
        if (requests.length > 0) 
            return res.status(StatusCodes.BAD_REQUEST).json({'message': 'Your request has been sent before!'})

        await NotificationModel.create({
            userID: toUser.id,
            from: user.id,
            action: action.ADD_FRIEND,
            message: user.lastName + ' ' + user.firstName + ' sent you a friend request.',
            status: false,
        })

        return res.status(StatusCodes.OK).json({'message':  toUser.firstName + ' received your request!'})
    }
    catch (err) {
        console.log(err)
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}


export const acceptFriend = async (req, res) => {
    try {
        console.log(req.body)
        const fromUserID = req.body.userID
        const userID = req.userID

        const newChatRom = new ChatRoomModel({
            users: [userID, fromUserID],
            totalMessage: 0,
            name: '',
        })
        const chatRoom = await newChatRom.save()

        const users = await UserModel.find({_id: {$in:[userID, fromUserID]}})
        const noti = []
        for (let user of users){
            const friendIds = user.friends.map((e) => e._id.toString())

            console.log(friendIds)
            for (let otherUser of users){
                console.log(otherUser)
                if (user._id === otherUser._id) continue
                if (friendIds.indexOf(otherUser._id) !== -1) {
                    await ChatRoomModel.deleteOne({'_id': chatRoom._id})
                    return res.status(StatusCodes.BAD_REQUEST).json({'message': 'You are already friends!'})
                }
                user.friends = [...user.friends, {'_id': otherUser._id, 'chatRoom': chatRoom._id}]

                
                const newNoti = await NotificationModel.create({
                    userID: user._id,
                    from: otherUser._id,
                    action: action.ACCEPT_FRIEND,
                    message: 'You and '+ otherUser.lastName + ' ' + otherUser.firstName + ' has become friend!',
                    status: false,
                })
                noti.push(newNoti)
                await NotificationModel.deleteMany({
                    userID: user._id,
                    from: otherUser._id,
                    action: action.ADD_FRIEND
                })
            }
            
            await UserModel.findOneAndUpdate(
                {
                    _id: user._id,
                },
                {
                    friends: user.friends,
                }
            )
            await createSocketChatBucket(chatRoom._id, 0)
        }
        return res.status(StatusCodes.OK).json({'message': 'Congrats! You are friend now!', 'noti': noti.pop()})
    }
    catch(err) {
        console.log(err)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}

