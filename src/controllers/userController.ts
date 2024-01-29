import { Request, Response } from 'express';
import User from '../models/userModel';
import AppError from '../utility/AppError';
import { IRequest } from './authController';
import factory = require ('./factory');
import multer from 'multer';
import sharp from 'sharp';
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


export const deleteMe = handle (async (req:IRequest, res:Response) : Promise<void> =>
{
    await User.findByIdAndUpdate (req.user.id, { active:false});

    res.status (204).json ({
        status: 'success',
        data: null
    })
});


export const getMe = handle ((req:IRequest, res:Response) : void =>
{
    const { user} = req;

    res.status (200).json ({
        status: 'success',
        data: {
            user
        }
    })
});


const fileFilter = (req:Request, file:Express.Multer.File, cb:Function) : void =>
{
    if (file.mimetype.startsWith ('image'))
        cb (null, true);
    else 
        cb (new AppError ('Not an image. Please use images only', 400), false);
}

const upload = multer ({
    storage: multer.memoryStorage (),
    fileFilter
})

export const uploadPhoto = upload.single ('photo');

export const processPhoto = handle (async (req:IRequest, res:Response, next:() => void) : Promise<void> =>
{
    if (!req.file)
        return next ();

    req.body.photo = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp (req.file.buffer)
    .resize (500, 500)
    .toFormat ('jpeg')
    .jpeg ({quality:100})
    .toFile (`public/img/users/${req.body.photo}`);

    next ();
});