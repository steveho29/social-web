import UserModel from "../models/user.js";
import {
	ReasonPhrases,
	StatusCodes,
} from 'http-status-codes';


export const func = async (req, res) => {
        try {

        }
        catch(err) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
        }
}