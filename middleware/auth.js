import jwt from "jsonwebtoken";
import 'dotenv/config'
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';

const auth = async (req, res, next) => {
  try {
    
    const token = req.headers.authorization.split(" ")[1];

    const isCustomAuth = token.length < 500;

    let decodedData;

    if (token && isCustomAuth) {      
      decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.userID = decodedData?.id;
      
    } else {
      decodedData = jwt.decode(token);
      req.userID = decodedData?.sub;
    }    

    next();
  
  } catch (error) {
    return res.status(StatusCodes.FORBIDDEN).send(ReasonPhrases.FORBIDDEN)
  }
};

export default auth;