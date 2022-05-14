import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
    {
        firstName: String,
        lastName: String,
        email: String,
        avatar: String,
        friends: [
            {
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'users',
                    require: true,
                },
                chatRoom: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'chatRooms',
                    default: null,
                },
                require: false,
            },
        ],
        // chatRooms: [
        //     {
        //         _id: false,
        //         roomId: {
        //             type: mongoose.Schema.Types.ObjectId,
        //             ref: 'roomChats',
        //         },
        //         unread: {
        //             type: Number,
        //             default: 0,
        //         },
        //         lastChat: {
        //             type: Date,
        //             require: false,
        //         },
        //         require: false,
        //     },
        //],
        password: String,
        lastLogin: Date,
    },
    { timestamps: true }
)

const UserModel = mongoose.model('users', userSchema)

export default UserModel
