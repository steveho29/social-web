import express from 'express'
import {} from '../controllers/userController.js'
import { getMessages } from './../controllers/messageManageController.js'

const router = express.Router()

router.get('/', getMessages)

export default router
