require ('dotenv').config ({path: './src/config.env'})
import app from './app';
import mongoose from 'mongoose';

const DB = process.env.DATABASE!.replace ('<PASSWORD>', process.env.DATABASE_PASSWORD!);
mongoose.connect (DB).then (() => console.log ('Mongoose connected.'))

const port = process.env.PORT || 3000;
app.listen (port, () => console.log ('App listening at port ', port));