import express from 'express'
import {searchUser} from '../controllers/userController.js'

const router = express.Router()

router.get('/user', searchUser)

export default router
