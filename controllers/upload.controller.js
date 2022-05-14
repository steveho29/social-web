import multer from 'multer'
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';

// STORAGE MULTER CONFIG
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "storage/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.jpg' && ext !== '.png' && ext !== '.mp4') {
            return cb(res.status(StatusCodes.FORBIDDEN).end('only jpg, png, mp4 is allowed'), false);
        }
        cb(null, true)
    }
});

const upload = multer({ storage: storage }).single("file");

export default {
    async uploadSingleFile(req, res) {
        try {
        upload(req, res, err => {
            try {
            if (err) {
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, err });
            }
            return res.status(StatusCodes.OK).json({ success: true, url: res.req.file.path, fileName: res.req.file.filename });
        }catch(err){
            return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST)
        }
        })
    
    } catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}

}