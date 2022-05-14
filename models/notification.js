import mongoose from 'mongoose'
import UserModel from './user.js'
export const action = {
        ADD_FRIEND: 'ADD_FRIEND',
        ACCEPT_FRIEND: 'ACCEPT_FRIEND'
}
const notifcationSchema = mongoose.Schema(
        {
                userID: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: UserModel,
                },
                from: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: UserModel,   
                },
                action: String,
                message: String,
                status: Boolean
        },
        { timestamps: true }
)
const NotificationModel = mongoose.model('notification', notifcationSchema)
export default NotificationModel