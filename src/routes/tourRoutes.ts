import express from 'express';
const router = express.Router ();
import reviewRouter from './reviewRoutes';
import tourController = require ('../controllers/tourController');
import authController = require ('../controllers/authController');

router.use ('/:tourId/reviews',reviewRouter);

router.route ('/').get (tourController.getAllTours).post (authController.protect, authController.restrictTo ('lead-guides', 'admin'), tourController.createTour);
router.route ('/:id').get (tourController.getTour).patch (authController.protect, authController.restrictTo ('lead-guides', 'admin'), tourController.uploadImages, tourController.processImages, tourController.updateTour).delete (authController.protect, authController.restrictTo ('lead-guides', 'admin'), tourController.deleteTour);

export default router;