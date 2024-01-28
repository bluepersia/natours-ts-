import { Query, Schema, model} from 'mongoose';
import validator from 'validator'
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser 
{
    name:string,
    email:string,
    photo:string,
    role:string,
    password:string | undefined,
    passwordConfirm:string | undefined,
    passwordChangedAt:Date,
    passwordResetToken:string | undefined,
    passwordResetExpires:Date | undefined,
    active:boolean,
    comparePassword: (s:string, hash:string) => Promise<boolean>,
    hasPasswordChangedSince: (time:number) => boolean,
    genPasswordResetToken: () => string
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
    passwordChangedAt: Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active: {
        type:Boolean,
        default: true
    }
})

userSchema.pre (/^find/, function (next): void 
{
    (this as Query<any,any>).find ({active: { $ne: false}})
    next ();
});

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

userSchema.methods.genPasswordResetToken = function () : string
{
    const resetToken = crypto.randomBytes (32).toString ('hex');

    this.passwordResetToken = crypto.createHash ('sha256').update (resetToken).digest ('hex');
    this.passwordResetExpires = (Date.now() + (7 * 24 * 60 * 60 * 1000));

    return resetToken;
}

const User = model ('User', userSchema);


export default User;