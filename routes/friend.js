import express from 'express'
import { addFriend, getFriends, acceptFriend } from '../controllers/friendController.js'


const router = express.Router()

router.get('/', getFriends)
router.post('/addFriend', addFriend)
router.post('/acceptFriend', acceptFriend)

export default router
