import { Response } from 'express';
import Tour from '../models/tourModel';
import Booking, { IBooking } from '../models/bookingModel';
import AppError from '../utility/AppError';
import { IRequest } from './authController';
import { HydratedDocument } from 'mongoose';
import factory = require ('./factory');
const stripe = require ('stripe')(process.env.STRIPE_SECRET_KEY);
const handle = require ('express-async-handler');

export const getAllBookings = factory.getAll (Booking);
export const createBooking = factory.createOne (Booking);
export const getBooking = factory.getOne (Booking);
export const updateBooking = factory.updateOne (Booking);
export const deleteBooking = factory.deleteOne (Booking);


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


export const myBookings = handle (async(req:IRequest, res:Response): Promise<void> =>
{
    const bookings = await Booking.find ({user: req.user.id});

    const tourPromises = bookings.map (async (booking:HydratedDocument<IBooking>) => await Tour.findById (booking.tour));

    const tours = await Promise.all (tourPromises);

    res.status (200).json ({
        status: 'success',
        result: tours.length,
        data: {
            tours
        }
    })
});