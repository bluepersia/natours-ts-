import { Request, Response } from "express";
import { Model } from "mongoose";
import APIFeatures from "../utility/APIFeatures";
import AppError from "../utility/AppError";
import { IRequest } from "./authController";
const handle = require ('express-async-handler')



export const getAll = (Model:Model<any>) => handle (async (req:Request, res:Response) : Promise<void> => 
{
    let filter:{[key:string]:string} = {};;

    if (req.params.tourId)
        filter.tour = req.params.tourId;

    if (req.params.userId)
        filter.user = req.params.userId;

    const query = Model.find (filter);
    new APIFeatures (req.query, query).all ();
    const docs = await query;

    res.status (200).json ({
        status: 'success',
        result: docs.length,
        data: {
            docs
        }
    })
});

export const createOne = (Model:Model<any>) => handle (async (req:Request, res:Response) : Promise<void> =>
{
    if (req.params.tourId)
        req.body.tour = req.params.tourId;

    if (req.params.userId)
        req.body.user = req.params.userId;

    const doc = await Model.create (req.body);

    res.status (201).json ({
        status: 'success',
        data: {
            doc
        }
    })
});

export const getOne = (Model:Model<any>) => handle (async (req:Request, res:Response) : Promise<void> =>
{
    const doc = await Model.findById (req.params.id);

    if (!doc)
        throw new AppError ('No document was found with that ID', 404);

    res.status (200).json ({
        status: 'success',
        data: {
            doc
        }
    })
});

export const updateOne = (Model:Model<any>) => handle (async (req:Request, res:Response) : Promise<void> =>
{
    const doc = await Model.findByIdAndUpdate (req.params.id, req.body, {new:true, runValidators:true});

    if (!doc)
        throw new AppError ('No document was found with that ID', 404);

    res.status (200).json ({
        status: 'success',
        data: {
            doc
        }
    })
});

export const deleteOne = (Model:Model<any>) => handle (async (req:Request, res:Response) : Promise<void> =>
{
    const doc = await Model.findByIdAndDelete (req.params.id);

    if (!doc)
        throw new AppError ('No document was found with that ID', 404);

    res.status (204).json ({
        status: 'success',
        data: null
    })
});


export const setMine = (req:Request, res:Response, next:Function) : void =>
{
    req.params.userId = (req as IRequest).user.id;

    next();
}


export const isMine = (Model:Model<any>) => handle (async (req:IRequest, res:Response, next:Function) : Promise<void> =>
{
    const doc = await Model.findById (req.params.id);

    if (!doc)
        throw new AppError ('No document with that ID', 404);

    if (doc.user.toString() === req.user.id || doc.user.id === req.user.id || req.user.role === 'admin')
        return next ();

    throw new AppError ('This resource does not belong to you', 403);
});