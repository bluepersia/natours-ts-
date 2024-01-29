import express from 'express';
const router = express.Router ();
import reviewController = require ('../controllers/reviewController');
import { setMine } from '../controllers/factory';

router.route ('/').get (reviewController.getAllReviews).post (setMine, reviewController.createReview);
router.route ('/:id').get (reviewController.getReview).patch (reviewController.isMine, reviewController.updateReview).delete (reviewController.isMine, reviewController.deleteReview);

export default router;