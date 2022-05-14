import express from 'express'
import {changeAvatar, getUserInfo, signin, signup} from '../controllers/userController.js'
import auth from '../middleware/auth.js'
const router = express.Router()

// router.get('/', userController.getUsers)

router.post("/signin", signin);

router.post("/signup", signup);

router.get("/:id", getUserInfo)


router.post("/avatar", auth, changeAvatar)



export default router