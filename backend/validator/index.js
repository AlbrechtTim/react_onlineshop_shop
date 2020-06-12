exports.userSignUpValidator = (req, res, next) => {
  req.check('name', 'name is required').notEmpty();
  req.check('email', 'Email must be a valid email address')
  .matches(/.+\@.+\..+/)
  .withMessage('Email must be a valid email address')
  .isLength({min: 4});
  // .matches(/^(([^<>()[\]\\.,;:\s@\']+(\.[^<>()[\]\\.,;:\s@\']+)*)|(\'.+\'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
  req.check('password', 'A password is required').notEmpty();
  req.check('password')
  .isLength({min: 6})
  .withMessage('Password must contain at least 6 characters')
  .matches(/\d/)
  .withMessage('Password must contain a number');
  const errors = req.validationErrors();
  if(errors){
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({err: firstError});
  }
  next();
};
