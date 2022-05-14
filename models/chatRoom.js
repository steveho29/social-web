import mongoose from 'mongoose'

const chatRoomSchema = mongoose.Schema(
    {
        name: String,
        totalMessage: {
            type: Number,
            default: 0,
            require: true,
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true,
            },
        ],
    },
    { timestamp: true }
)

const ChatRoomModel = mongoose.model('chatRooms', chatRoomSchema)
export default ChatRoomModel
