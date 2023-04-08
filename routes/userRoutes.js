const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

//TODO update and resetPassword routes yet to implemted

console.log('I LOVE INDIA');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.patch('/updatePassword', authController.updatePassword);
router.get('/getMe', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

module.exports = router;
