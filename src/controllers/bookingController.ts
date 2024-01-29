import { Response } from 'express';
import Tour from '../models/tourModel';
import AppError from '../utility/AppError';
import { IRequest } from './authController';
const stripe = require ('stripe')(process.env.STRIPE_SECRET_KEY);
const handle = require ('express-async-handler');


export const getStripeCheckoutSession = handle (async (req:IRequest, res:Response) : Promise<void> =>
{
    const tourId = req.params.tourId;

    const tour = await Tour.findById (tourId);

    if (!tour)
        throw new AppError ('No tour with that ID', 404);

    const session = await stripe.checkout.sessions.create ({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: process.env.HOME_URL,
        cancel_url: process.env.HOME_URL,
        customer_email: req.user.email,
        client_reference_id: tourId,
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: tour.name,
                        description: tour.summary,
                        images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`]
                    }
                }
            }
        ]
    })

    res.status (200).json ({
        status: 'success',
        session
    })
});
