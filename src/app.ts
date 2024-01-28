import express from 'express';
const app = express ();
import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';
import globalErrorHandler from './controllers/errorController';
import AppError from './utility/AppError';

app.use (express.json ({limit:'10kb'}));

app.use ('/api/v1/tours', tourRouter);
app.use ('/api/v1/users', userRouter);

app.all ('*', () => { throw new AppError ('Route not found!', 404)});

app.use (globalErrorHandler);

export default app;