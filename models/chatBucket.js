import mongoose from 'mongoose'

const chatBucketSchema = mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'roomChats',
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: false,
        },
        seq: Number,
        messages: [
            {
                _id: false,
                message: String,
                from: mongoose.Schema.Types.ObjectId,
                to: mongoose.Schema.Types.ObjectId,
                time: Date,
            },
        ],
    },
    { timestamp: true }
)

const ChatBucketModel = mongoose.model('chatBuckets', chatBucketSchema)
export default ChatBucketModel
