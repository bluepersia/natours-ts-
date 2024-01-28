import { Schema, model} from 'mongoose';
import validator from 'validator'
import bcrypt from 'bcryptjs';

export interface IUser 
{
    name:string,
    email:string,
    photo:string,
    role:string,
    password:string | undefined,
    passwordConfirm:string | undefined,
    passwordChangedAt:Date,
    comparePassword: (s:string, hash:string) => Promise<boolean>,
    hasPasswordChangedSince: (time:number) => boolean
}


const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Please provide your name']
    },
    email: {
        type:String,
        required: [true, 'Please provide an email'],
        lowercase: true,
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email address']
    },
    photo: {
        type:String,
        default: 'default.jpg'
    },
    role: {
        type:String,
        enum: {
            values: ['user', 'guide', 'lead-guide', 'admin'],
            message: 'Role must be user, guide, lead-guide or admin'
        },
        default: 'user'
    },
    password: {
        type:String,
        minlength: 8,
        required: [true, 'Please provide a password'],
        select: false
    },
    passwordConfirm: {
        type:String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (val:string) : boolean
            {
                return val === this.password;
            },
            message: 'Passwords must match!'
        }
    },
    passwordChangedAt: Date
})


userSchema.pre ('save', async function (next):Promise<void>
{
    if (this.isModified ('password'))
    {
        this.password = await bcrypt.hash (this.password!, 12);
        if (!this.isNew)
            this.passwordChangedAt = new Date (Date.now () - 1000);
    } 
    
    this.passwordConfirm = undefined;

    next ();
});

userSchema.methods.comparePassword = async function (s:string, hash:string) : Promise<boolean>
{
    return await bcrypt.compare (s, hash);
}

userSchema.methods.hasPasswordChangedSince = function (time:number) : boolean
{
    return this.passwordChangedAt && this.passwordChangedAt >= time;
}

const User = model ('User', userSchema);


export default User;