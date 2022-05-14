import Post from "../models/post.js"
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';
import UserModel from "../models/user.js";
import moment from "moment";
import mongoose from "mongoose";
export default {
        async getPosts (req, res) {
                try {
                        const posts = await Post.find().sort({'createdAt': -1}).populate([
                                {path: 'creator', select: ['firstName', 'lastName', '_id', 'avatar']},
                                {path: 'comments.user', select: ['firstName', 'lastName', 'avatar', '_id']},
                        ])

                        // const posts = await Post.find().sort({'createdAt': -1}).populate('creator', ['firstName', 'lastName', '_id', 'avatar'])
                        return res.status(StatusCodes.OK).json(posts)
                }
                catch(err) {
                        console.log(err)
                        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
                }
        },

        async createPost(req, res){
                try {
                        await Post.create({
                                creator: mongoose.Types.ObjectId(req.userID),
                                content: req.body.content
                        })
                        console.log(req.body)
                        return res.status(StatusCodes.OK).json({'message': 'Post Created!'})
                }
                catch (err) {

                }
        },

        async createComment(req, res) {
                try {
                        const {postID, message} = req.body
                        const comment = {
                                message: message,
                                createdAt: moment().toDate(), 
                                user: mongoose.Types.ObjectId(req.userID)
                        }
                        await Post.findByIdAndUpdate(postID, {$push: {comments: comment}})
                        return res.status(StatusCodes.OK).json(comment)
                } catch(err){
                        console.log(err)
                        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
                }
                
        },

        async like(req, res) {
                try {
                        const {isLike, postID} = req.body
                        console.log(isLike)
                        if (isLike)
                                await Post.findByIdAndUpdate(postID, {$addToSet: {likes: mongoose.Types.ObjectId(req.userID)}})
                        else await Post.findByIdAndUpdate(postID, {$pull: {likes: mongoose.Types.ObjectId(req.userID)}})
                        return res.status(StatusCodes.OK).send(ReasonPhrases.OK)
                } catch (err) {
                        console.log(err)
                        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
                }
        }
}