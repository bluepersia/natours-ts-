import express from 'express';
const router = express.Router ();
import reviewRouter from './reviewRoutes';
import tourController = require ('../controllers/tourController');

router.use ('/:tourId/reviews',reviewRouter);

router.route ('/').get (tourController.getAllTours).post (tourController.createTour);
router.route ('/:id').get (tourController.getTour).patch (tourController.updateTour).delete (tourController.deleteTour);

export default router;