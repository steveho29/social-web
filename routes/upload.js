import express from "express";
import uploadController from '../controllers/upload.controller.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.post('/', auth, uploadController.uploadSingleFile)


export default router