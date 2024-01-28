import { HydratedDocument } from "mongoose";
import { IUser } from "../models/userModel";
import fs from 'fs';
import htmlToText from 'html-to-text';

const nodemailer = require ('nodemailer');
const Styliner = require ('styliner');


const styliner = new Styliner (__dirname + '/emails');

export default class Email 
{
    constructor (public user:HydratedDocument<IUser>, public data:{[key:string]:string}){}


    newTransport () 
    {
        if (process.env.NODE_ENV === 'development')
            return nodemailer.createTransport ({
                host:process.env.MAILTRAP_HOST,
                port: process.env.MAILTRAP_PORT,
                auth: {
                    user: process.env.MAILTRAP_USER,
                    pass: process.env.MAILTRAP_PASS
                }
            })

        return nodemailer.createTransport ({
            service: 'SendGrid',
            auth: {
                user: process.env.SENDGRID_USER,
                pass: process.env.SENDGRID_PASS
            }
        })
    }


    async send (subject:string, template:string) : Promise<void>
    {
        let html = await fs.promises.readFile (`${__dirname}/emails/${template}.html`, 'utf-8');

        Object.keys (this.data).forEach (key => {
            html = html.replace (`<${key.toUpperCase()}>`, this.data[key]);
        })

        html = await styliner.processHTML (html);

        const mailOpts = {
            to: this.user.email,
            from: process.env.EMAIL_FROM,
            subject,
            html,
            text: htmlToText.convert (html)
        }

        this.newTransport ().sendMail (mailOpts);

    }


    async sendWelcome () : Promise<void>
    {
        this.send ('Welcome to the Natours family', 'welcome');
    }

    async sendResetPassword () : Promise<void>
    {
        this.send ('Reset your password', 'resetPassword');
    }
}