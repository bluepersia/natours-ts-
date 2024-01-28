import { Response } from 'express';
import User from '../models/userModel';
import AppError from '../utility/AppError';
import { IRequest } from './authController';
import factory = require ('./factory');
const handle = require ('express-async-handler');


export const getAllUsers = factory.getAll (User);
export const createUser = () => { throw new AppError ('This route is not implemented. Use /signup instead.', 400)}
export const getUser = factory.getOne (User);
export const updateUser = factory.updateOne (User);
export const deleteUser = factory.deleteOne (User);


export const updateMe = handle (async (req:IRequest, res:Response) : Promise<void> =>
{
    let body:{[key:string]:string} = {};

    ['email', 'name', 'photo'].forEach (el => {
        if (req.body[el])
            body[el] = req.body[el];
    })

    const user = await User.findByIdAndUpdate (req.user.id, body, {new:true, runValidators:true});

    res.status (200).json ({
        status: 'success',
        data: {
            user
        }
    })
    
})