import UserModel from "../models/user.js";
import {
	ReasonPhrases,
	StatusCodes,
} from 'http-status-codes';
import YoutubeRoomModel from "../models/youtubeRoom.js";


export const createRoom = async (req, res) => {
        try {
                const {title, avatar} = req.body
                const room = await YoutubeRoomModel.create({
                        title,
                        avatar,
                        isPlay: false,
                        videoID: '',
                        currentTime: 0,
                        guessCanControl: false,
                        creator: req.userID
                })
                console.log(room)
                return res.status(StatusCodes.OK).send(ReasonPhrases.OK)
        }
        catch(err) {
                console.log(err)
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
        }
}



export const loadRooms = async (req, res) => {
        try {
                const rooms = await YoutubeRoomModel.find({}).populate('creator', ['avatar'])
                return res.status(StatusCodes.OK).json({rooms})
        }
        catch(err) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
        }
}

export const getRoom = async(req, res) => {
        try {   
                console.log(req.params)
                const room = await YoutubeRoomModel.findById(req.params.id).populate('creator', ['avatar'])
                return res.status(StatusCodes.OK).json({room})
        }
        catch(err) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
        }
}  

export const updateRoom = async(req, res) => {
        try {
                const {room} = req.body
                const updatedRoom = await YoutubeRoomModel.findOneAndUpdate(room._id, room)
                return res.status(StatusCodes.OK).json({'room': updatedRoom})

        }catch (err) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
        }
}
