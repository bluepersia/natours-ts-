import { HydratedDocument, Schema, Types, model} from 'mongoose';
import { IUser } from './userModel';



export interface IReview 
{
    review:string,
    rating:number,
    createdAt:Date,
    tour:Types.ObjectId,
    user:HydratedDocument<IUser>
}


const reviewSchema = new Schema<IReview> ({
    review: {
        type:String,
        required: [true, 'Review must have text']
    },
    rating: {
        type:Number,
        min: 1,
        max: 5,
        required: [true, 'Review must have a rating']
    },
    createdAt: {
        type:Date,
        default: Date.now ()
    },
    tour: {
        type: Schema.ObjectId,
        ref: 'Tour'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
})

reviewSchema.pre (/^find/, function (next): void
{
    
})

const Review = model ('Review', reviewSchema);

export default Review;