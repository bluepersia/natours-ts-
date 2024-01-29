import express from 'express';
const router = express.Router ();
import bookingController = require ('../controllers/bookingController');
import authController = require ('../controllers/authController');


router.use (authController.protect);

router.get ('/stripe-checkout-session', bookingController.getStripeCheckoutSession);

router.get ('/my-bookings', bookingController.myBookings);




export default router;