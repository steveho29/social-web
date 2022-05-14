import express from 'express'
import notificationController from '../controllers/notificationController.js'
const router = express.Router()

router.get('/', notificationController.getNotifications)

export default router