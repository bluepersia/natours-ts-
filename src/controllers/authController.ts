const handle = require ('express-async-handler');
import { HydratedDocument } from 'mongoose';
import User, { IUser } from '../models/userModel';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import AppError from '../utility/AppError';
const util  = require ('util');

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


export interface IRequest extends Request
{
    user:HydratedDocument<IUser>
}

export const protect = handle (async (req:IRequest, res:Response, next:() => void) :Promise<void> =>
{
    let token;
    if (req.headers.authorization?.startsWith ('Bearer'))
        token = req.headers.authorization.split (' ')[1];
    else if (req.cookies.jwt)
        token = req.cookies.jwt;

    if (!token)
        throw new AppError ('You are not logged in', 401);

    const decoded = await util.promisify (jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById (decoded.id).select ('+password');

    if (!user)
        throw new AppError ('The user this token belongs to no longer exists.', 401);

    if (user.hasPasswordChangedSince (decoded.iat * 1000))
        throw new AppError ('Password has changed since login', 401);

    req.user = user;
    next ();

});