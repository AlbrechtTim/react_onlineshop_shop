const User = require('../models/user');
const jwt = require('jsonwebtoken'); //generate sign jsonwebtoken
const expressJwt = require('express-jwt') //authority check
const {errorHandler} = require('../helpers/dbErrorHandler');

exports.signup = (req, res) => {
  // console.log('req.body', req.body);
  const user = new User(req.body);
  user.save((err, user) => {
    if(err) {
      return res.status(400).json({
        err: errorHandler(err)
      });
    }
    user.salt = undefined
    user.hashed_password = undefined
    res.json({
      user
    });
  });
};

exports.signin = (req, res) => {
  //find based on Email
  const{email, password} = req.body;
  User.findOne({email}, (err, user) => {
    if(err || !user) {
      return res.status(400).json({
        err: 'User with this email does not exist.'
      });
    }
    //if user exist check the Password
    //authenticate method in user models
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: 'Email and password does not match'
      });
    }
    //generate sign token with user_id with secret Jwt
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
    //token as 'login_token' for cookies with expire date
    res.cookie('login_token', token, {expire: new Date() + 9999});
    //return response to user and frontend
    const {_id, name, email, role} = user;
    return res.json({token, user: {_id, email, name, role}});
  });
};

exports.signout = (req, res) => {
  res.clearCookie('login_token');
  res.json({ message: "You're now signed out." });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth"
});

exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: 'Access denied.'
    });
  }
  next()
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: 'Access denied. You do not have permission to access this resource.'
    });
  }
  next()
};
