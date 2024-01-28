process.on ('uncaughtException', err =>
{
    console.log ('UNCAUGHT EXCEPTION... SHUTTING DOWN.');
    console.error (err);

    process.exit (1);
});

require ('dotenv').config ({path: './src/config.env'})
import app from './app';
import mongoose from 'mongoose';

const DB = process.env.DATABASE!.replace ('<PASSWORD>', process.env.DATABASE_PASSWORD!);
mongoose.connect (DB).then (() => console.log ('Mongoose connected.'))

const port = process.env.PORT || 3000;
const server = app.listen (port, () => console.log ('App listening at port ', port));


process.on ('unhandledRejection', err =>
{
    console.log ('UNHANDLED REJECTION... SHUTTING DOWN.')
    console.error (err);

    server.close (() => process.exit (1));
});