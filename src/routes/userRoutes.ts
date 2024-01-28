import express from 'express';
const router = express.Router ();
import userController = require ('../controllers/userController');
import authController = require ('../controllers/authController');

router.post ('/signup', authController.signup);
router.post ('/login', authController.login);

router.post ('/forgot-password', authController.forgotPassword);

router.use (authController.protect);

router.use (authController.restrictTo ('admin'));

router.route ('/').get (userController.getAllUsers).post (userController.createUser);
router.route ('/:id').get (userController.getUser).patch (userController.updateUser).delete (userController.deleteUser);

export default router;