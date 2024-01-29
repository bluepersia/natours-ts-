import express from 'express';
const router = express.Router ({mergeParams:true});
import reviewController = require ('../controllers/reviewController');
import authController = require ('../controllers/authController');
import { setMine } from '../controllers/factory';

router.use (authController.protect);

router.route ('/').get (reviewController.getAllReviews).post (setMine, reviewController.createReview);
router.route ('/:id').get (reviewController.getReview).patch (reviewController.isMine, reviewController.updateReview).delete (reviewController.isMine, reviewController.deleteReview);

export default router;