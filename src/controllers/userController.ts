import User from '../models/userModel';
import AppError from '../utility/AppError';
import factory = require ('./factory');


export const getAllUsers = factory.getAll (User);
export const createUser = () => { throw new AppError ('This route is not implemented. Use /signup instead.', 400)}
export const getUser = factory.getOne (User);
export const updateUser = factory.updateOne (User);
export const deleteUser = factory.deleteOne (User);