const express = require('express');
const router = express.Router();

const {
  signup,
  signin, 
  signout,
  requireSignin
} = require('../controllers/auth');
const { userSignUpValidator } = require('../validator');

router.get('/signout', signout);

router.post('/signup', userSignUpValidator, signup);
router.post('/signin', signin);

module.exports = router;
