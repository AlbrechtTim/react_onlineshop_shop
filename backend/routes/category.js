const express = require('express');
const router = express.Router();


const { create, read, update, remove, list, categoryById } = require('../controllers/category');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');

router.get('category/:categoryId', read);
router.get('categories', list);

router.post('/category/create/:userId', requireSignin, isAdmin, isAdmin, create);

router.put('/category/:categoryId/:userId', requireSignin, isAdmin, isAdmin, update);

router.delete('/category/:categoryId/:userId', requireSignin, isAdmin, isAdmin, remove);

router.param('categoryId', categoryById);
router.param('userId', userById);

module.exports = router;
