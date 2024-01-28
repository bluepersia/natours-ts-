import { Request, Response } from "express";
import AppError from "../utility/AppError";

export default function (err:Error, req:Request, res:Response, next:Function) : void
{
    if (process.env.NODE_ENV === 'production')
    {
        if (err.name === 'CastError')
            err = handleCastErrorDb (err as CastError);
        else if (err.hasOwnProperty ('code') && (err as CodeError).code === 11000)
            err = handleDuplicateErrorDb (err as DuplicateError);
        else if (err.name === 'ValidationError')
            err = new AppError (err.message, 400);
        else if (err.name === 'JsonWebTokenError')
            err = new AppError ('Invalid token', 401);
        else if (err.name === 'TokenExpiredError')
            err = new AppError ('Token has expired', 401);
    }

    let status = 'error';
    let statusCode = 500;
    let message = "Something went very wrong."
    if (err instanceof AppError)
    {
        const appError = err as AppError;
        status = appError.status;
        statusCode = appError.statusCode;
        message = appError.message;
    }

    res.status (statusCode);

    if (process.env.NODE_ENV === 'development')
    {
        res.json ({
            status,
            message: err.message,
            err,
            stack: err.stack
        })
        return;
    }

    res.json ({
        status,
        message
    })
}



interface CastError extends Error
{
    path: string,
    value:string
}

function handleCastErrorDb (err:CastError) : AppError
{
    return new AppError (`Invalid ${err.path}: ${err.value}`, 400);
}

interface CodeError extends Error 
{
    code:number
}

interface DuplicateError extends Error
{
    keyValue: {
        [key:string]: string
    }
}

function handleDuplicateErrorDb (err:DuplicateError) : AppError
{
    const keyValue = Object.entries (err.keyValue)[0];
    const msg = `${keyValue[0]} ${keyValue[1]} already exists.`;
    return new AppError (msg[0].toUpperCase() + msg.slice (1), 400);
}

