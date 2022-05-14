import NotificationModel from '../models/notification.js';
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';

export default {
        async getNotifications (req, res) {
                try {
                        const notifications = await NotificationModel.find({userID: req.userID}).sort({'createdAt': -1})
                        res.status(StatusCodes.OK).json(notifications)
                }
                catch(err) {
                        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
                }
        }
}