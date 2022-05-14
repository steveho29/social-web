import mongoose from 'mongoose'
import UserModel from './user.js'

const youtubeRoomSchema = mongoose.Schema(
        {
                creator: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: UserModel,
                },
                videoID: String,
                guessCanControl: Boolean,
                title: String,
                isPlay: Boolean,
                currentTime: Number,
                avatar: String,
        },
        { timestamps: true }
)
const YoutubeRoomModel = mongoose.model('youtube-room', youtubeRoomSchema)
export default YoutubeRoomModel