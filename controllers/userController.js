import moment from 'moment'
import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';

import UserModel from '../models/user.js'
import PostModel from '../models/post.js';
import { query } from 'express';

const secret = process.env.JWT_SECRET_kEY

export const signin = async (req, res) => {
    const { email, password } = req.body

    try {
        let user = await UserModel.findOne({ email })
        if (!user)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Email or Password is Incorrect!" })

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Email or Password is Incorrect!' })

        let token = jwt.sign({ email: user.email, id: user._id }, secret, {
            expiresIn: '3d',
        })
        
        user.lastLogin = moment().local()

        await UserModel.findByIdAndUpdate(user.id, {lastLogin: user.lastLogin})

        delete user.password // cannot delete
        user.password = null // must set to null
        user.token = token
        res.status(200).json({ user, token })
    } catch (err) {
        res.status(500).json({ message: `Something went wrong: ${err}` })
    }
}

export const signup = async (req, res) => {
    const {email, password, firstName, lastName} = req.body

    try {
        const oldUser = await UserModel.findOne({ email })

        if (oldUser)
            return res.status(400).json({ message: 'User already exists' })

        const hashedPassword = await bcrypt.hashSync(password, 12)

        const user = await UserModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            lastLogin: null,
        })


        res.status(200).json({ message: 'Sign Up Successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' })

        console.log(error)
    }
}


export const searchUser = async(req, res) => {
    try {
        const value = req.query.value || ''
        // const data = await UserModel.find( {
        //     firstName: {$regex: new RegExp(`${value}.*`), $options: 'i'}},{'_id': 1, 'firstName':1, 'lastName':1}).limit(10)
        const data = await UserModel.find({$text:{$search: value}, _id: {$ne: req.userID}},{'_id': 1, 'firstName':1, 'lastName':1}).limit(10)
        return res.status(StatusCodes.OK).json(data)
    } catch (err) {
        console.log(err)
        return res.status(StatusCodes.INSUFFICIENT_STORAGE).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}

export const getUserInfo = async(req, res) => {
    const userId = req.params.id
    try {
        const user = await UserModel.findOne({_id: userId}, {
            password: 0,
            lastLogin: 0,
            updateAt: 0
        })
        const posts = await PostModel.find({creator: userId}).sort({'createdAt': -1}).populate([
            {path: 'creator', select: ['firstName', 'lastName', '_id', 'avatar']},
            {path: 'comments.user', select: ['firstName', 'lastName', 'avatar', '_id']},
        ])
        return res.status(StatusCodes.OK).json({
            user,
            posts,
        })
    }
    catch(err) {
        console.log(err)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}

export const changeAvatar = async (req, res) => {
    try {
        const {url} = req.body
        console.log(req.body)
        const res = await UserModel.findByIdAndUpdate(req.userID, {'avatar': url})
        console.log(res)
        return res.status(StatusCodes.OK).send(ReasonPhrases.OK)
    }
    catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}


export const selfFetch = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userID)
        return res.status(StatusCodes.OK).json(user)
    }
    catch (err) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}