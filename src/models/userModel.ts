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
    passwordChangedAt:Date
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
        required: [true, 'Please provide a password']
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

const User = model ('User', userSchema);


export default User;