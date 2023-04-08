const User = require('../models/userModel');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { sendRes } = require('../utils/resJson');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;

  sendRes(false, 201, { user, token }, 'Success', 1, res);
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      phone: req.body.phone,
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    sendRes(true, 400, err, '', 1, res);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //ckeck if email and password exist

    if (!email || !password) {
      sendRes(true, 400, null, 'Please provide an email and password!', 1, res);
    }

    //check if user exist and password is correct

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      sendRes(true, 401, null, 'incorrect email or password!', 1, res);
    }

    // if everything is right the sends the token

    createSendToken(user, 200, res);
  } catch (err) {
    sendRes(true, 400, err, '', 1, res);
  }
};

exports.protect = async (req, res, next) => {
  try {
    //1) get the token from the user as bearer token
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      sendRes(
        true,
        401,
        err,
        'You are not logged in Please logIn to get access!',
        1,
        res
      );
    }

    //2) verify the token

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3) check if user exists

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      sendRes(
        true,
        401,
        err,
        'The user belonging to this token no longer exist!',
        1,
        res
      );
    }

    //4) check if user changed password after the token is issued

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      sendRes(
        true,
        401,
        err,
        'User recently changed password please login again!',
        1,
        res
      );
    }

    //GRANT ACCESS

    req.user = currentUser;
    next();
  } catch (err) {
    sendRes(true, 400, err, '', 1, res);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles === ['admin', 'user']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'you do not have a permission to perform this action!',
          403
        )
      );
    }

    next();
  };
};

exports.updatePassword = async (req, res, next) => {
  try {
    //get user password from the collection
    const user = await User.findById(req.user.id).select('+password');

    //check if the entered passwod is correct or nostrud
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      sendRes(true, 401, null, 'your current password is wrong.', 1, res);
    }

    //update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    sendRes(true, 400, err, '', 1, res);
  }
};

//TODO update and reset password yet to be implemented
