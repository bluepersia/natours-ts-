import express from 'express';
const router = express.Router ();
import userController = require ('../controllers/userController');

router.route ('/').get (userController.getAllUsers).post (userController.createUser);
router.route ('/:id').get (userController.getUser).patch (userController.updateUser).delete (userController.deleteUser);

export default router;