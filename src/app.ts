import express from 'express';
const app = express ();

import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
const xss = require ('xss-clean')
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import compression from 'compression'
import cookies from 'cookie-parser'
import bookingController = require ('./controllers/bookingController');
import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';
import reviewRouter from './routes/reviewRoutes';
import bookingRouter from './routes/bookingRoutes';
import globalErrorHandler from './controllers/errorController';
import AppError from './utility/AppError';


app.use (helmet ());
app.use (mongoSanitize ());
app.use (xss());
app.use (hpp ({whitelist:['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']}));

app.use (express.static (`${__dirname}/../public`, {
    setHeaders: res => res.header ('Cross-Origin-Resource-Policy', 'cross-origin')
}))

app.use (rateLimit ({
    windowMs: 5000,
    max: 5,
    message: 'Exceeded the rate limit'
}))

app.use (compression ());

app.use (cookies ());

app.post ('/stripe-webhook', express.raw ({type: 'application/json'}), bookingController.stripeWebHook);

app.use (express.json ({limit:'10kb'}));

app.use ('/api/v1/tours', tourRouter);
app.use ('/api/v1/users', userRouter);
app.use ('/api/v1/reviews', reviewRouter);
app.use ('/api/v1/bookings', bookingRouter);

app.all ('*', () => { throw new AppError ('Route not found!', 404)});

app.use (globalErrorHandler);

export default app;