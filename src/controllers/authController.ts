const handle = require ('express-async-handler');
import { HydratedDocument } from 'mongoose';
import User, { IUser } from '../models/userModel';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import AppError from '../utility/AppError';

function signToken (id:string) : string 
{

    return jwt.sign ({id}, process.env.JWT_SECRET!, {expiresIn: process.env.JWT_EXPIRES_IN})
}


function signSend (user:HydratedDocument<IUser>, res:Response, statusCode = 200) : void
{
    const token = signToken (user.id);

    res.cookie ('jwt', token, {
        expires: new Date (Date.now() + (Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000)),
        secure: process.env.NODE_ENV === 'production',
        httpOnly:true
    })

    user.password = undefined;
    user.passwordConfirm = undefined;

    res.status (statusCode).json ({
        status: 'success',
        token,
        data: {
            user
        }
    })
}


export const signup = handle (async (req:Request, res:Response) : Promise<void> =>
{
    const {email, name, password, passwordConfirm} = req.body;

    const user = await User.create ({email, name, password, passwordConfirm});

    signSend (user, res, 201);
});


export const login = handle (async (req:Request, res:Response) : Promise<void> =>
{
    const {email, password} = req.body;

    if (!email || !password)
        throw new AppError ('Please provide email and password', 400);

    const user = await User.findOne ({email}).select ('+password');

    if (!user)
        throw new AppError ('No user with this email', 404);

    if (!(await user.comparePassword (password, user.password!)))
        throw new AppError ('Password is incorrect', 401);

    signSend (user, res);
});