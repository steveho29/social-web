import express from 'express'
import postController from '../controllers/postController.js'
import auth from '../middleware/auth.js'
const router = express.Router()

router.get('/', postController.getPosts)

router.post('/', auth, postController.createPost)

router.post('/comment', auth, postController.createComment)

router.post('/like', auth, postController.like)
export default router