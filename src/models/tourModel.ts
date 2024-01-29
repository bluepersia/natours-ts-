import {Schema, model} from 'mongoose';
import slugify from 'slugify';

export interface ITour 
{
    name:string,
    slug:string,
    duration:number,
    maxGroupSize:number,
    difficulty:string,
    ratingsAverage:number,
    ratingsQuantity:number,
    price:number,
    priceDiscount:number,
    summary:string,
    description:string,
    imageCover:string,
    images: [string],
    createdAt:Date,
    startDates:[Date],
    startLocation: {
        type:string,
        coordinates:number[],
        address:string,
        description:string
    },
    locations: [{
        type:string,
        coordinates:number[],
        address:string,
        description:string,
        day:number
    }]
}

const tourSchema = new Schema<ITour>({
    name: {
        type:String,
        required: true,
        maxlengt:40,
        minlength:10
    },
    slug: String,
    duration: {
        type: Number,
        required:true
    },
    maxGroupSize: {
        type:Number,
        required:true
    },
    difficulty: {
        type:String,
        required:true,
        enum: ['easy', 'medium', 'difficult']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min:1,
        max:5,
        set: (val:number) => Math.round (val * 10) / 10
    },
    ratingsQuantity: {
        type:Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    priceDiscount: {
        type:Number,
        validate: {
            validator: function (val:number) : boolean
            {
                return val < this.price;
            },
            message: "Discount must be lower than the price"
        }
    },
    summary: {
        type:String,
        required:true
    },
    description: String,
    imageCover: {
        type:String,
        required: true
    },
    images: [String],
    createdAt: Date,
    startDates: [Date],
    startLocation: {
        type: {
            type:String,
            default:'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address:String,
        description:String
    },
    locations: [{
        type: {
            type:String,
            default:'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address:String,
        description:String,
        day:Number
    }]
})

tourSchema.pre ('save', function(next) : void
{
    this.slug = slugify (this.name, {lower:true});
    next ();
});

const Tour =  model ('Tour', tourSchema);


export default Tour;