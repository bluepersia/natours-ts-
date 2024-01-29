import { HydratedDocument, Query, Schema, Types, model} from 'mongoose';
import { IUser } from './userModel';
import Tour from './tourModel';


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

async function calcRatingsAvgQuantity (tourId:Types.ObjectId) : Promise<void>
{
    const stats = await Review.aggregate ([
        {
            $match: { tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                ratingsAverage: { $avg: '$rating'},
                ratingsQuantity: { $sum: 1}
            }
        }
    ])

    const data = stats.length > 0 ? stats[0] : {ratingsAverage: 4.5, ratingsQuantity: 0}

    await Tour.findByIdAndUpdate (tourId, data);
} 

reviewSchema.pre (/^find/, function (next): void
{
    (this as Query<any,any>).populate ({
        path: 'user',
        select: 'name photo'
    })
})


reviewSchema.post ('save', function () : void
{
    calcRatingsAvgQuantity (this.tour);
});

reviewSchema.post (/(findOneAndUpdate|findOneAndDelete)/, function (doc) : void
{
    calcRatingsAvgQuantity (doc.tour);
});

const Review = model ('Review', reviewSchema);

export default Review;