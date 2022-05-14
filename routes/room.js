import express from 'express'
import { createRoom, getRoom, loadRooms, updateRoom } from '../controllers/roomController.js';
import auth from '../middleware/auth.js'
const router = express.Router()

// router.get('/', userController.getUsers)

router.post("/", auth, createRoom);
router.get("/", loadRooms)
router.get("/:id", getRoom)
router.put("/", auth, updateRoom)

export default router