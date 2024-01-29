import { Request, Response } from 'express';
import Tour from '../models/tourModel';
import factory = require ('./factory');
import AppError from '../utility/AppError';
import multer from 'multer';
import sharp from 'sharp';
import { IRequest } from './authController';
const handle = require ('express-async-handler');

export const getAllTours = factory.getAll (Tour);
export const createTour = factory.createOne (Tour);
export const getTour = factory.getOne (Tour);
export const updateTour = factory.updateOne (Tour);
export const deleteTour = factory.deleteOne (Tour);


const fileFilter = (req:Request, file:Express.Multer.File, cb:Function) : void =>
{
    if (file.mimetype.startsWith ('image'))
        cb(null, true);
    else 
        cb (new AppError ('Not an image. Please only use images.', 400), false);
}

const upload = multer ({
    storage: multer.memoryStorage (),
    fileFilter
})


export const uploadImages = upload.fields ([
    {name: 'imageCover', maxCount:1},
    {name: 'images', maxCount:3}
])

export const processImages = handle (async (req:IRequest, res:Response, next:Function): Promise<void> =>
{
    const files = req.files as {[key:string]: Express.Multer.File[]};

    if (files.imageCover)
    {
        req.body.imageCover = `tour-${req.params.id}-cover-${Date.now()}.jpeg`;

        await sharp (files.imageCover[0].buffer)
        .resize (2000, 1333)
        .toFormat ('jpeg')
        .jpeg ({quality: 100})
        .toFile (`public/img/tours/${req.body.imageCover}`)
    }

    if (files.images)
    {
        req.body.images = files.images.map ((img, i) => `tour-${req.params.id}-${i}-${Date.now()}.jpeg`);

        const promises = files.images.map (async (img, i) =>
        {
            return await sharp (img.buffer)
            .resize (2000, 1333)
            .toFormat ('jpeg')
            .jpeg ({quality: 100})
            .toFile (`public/img/tours/${req.body.images[i]}`)
        })

        await Promise.all (promises);
    }

    next ();
});