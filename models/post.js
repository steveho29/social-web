import mongoose from 'mongoose'
import UserModel from './user.js'

const postSchema = mongoose.Schema(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: UserModel,
        },
        content: String,
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: UserModel,
                },
                message: String,
                createdAt: Date,
            }
        ],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: UserModel,
                unique: true,
                dropDups: true
            },
        ],
    },
    { timestamps: true }
)

const PostModel = mongoose.model('posts', postSchema)
export default PostModel
