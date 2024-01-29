import express from 'express';
const router = express.Router ();
import bookingController = require ('../controllers/bookingController');
import authController = require ('../controllers/authController');


router.use (authController.protect);

router.get ('/stripe-checkout-session', bookingController.getStripeCheckoutSession);

router.get ('/my-bookings', bookingController.myBookings);

router.use (authController.restrictTo ('lead-guide', 'admin'));

router.route ('/').get (bookingController.getAllBookings).post (bookingController.createBooking);
router.route ('/:id').get (bookingController.getBooking).patch (bookingController.updateBooking).delete (bookingController.deleteBooking);


export default router;