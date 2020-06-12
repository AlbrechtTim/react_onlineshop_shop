const express = require('express');
const router = express.Router();

const { create, productById, read, remove, update, list, listRelatedProducts, listProductsCategories, listBySearch, getImage } = require('../controllers/product');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');

router.get('/product/productId', read);
router.get('products', list);
router.get('products/related/:productId', listRelatedProducts);
router.get('products/categories', listProductsCategories);
router.get('product/image/:productId', getImage);

router.post('/product/create/:userId', requireSignin, isAdmin, isAdmin, create);
router.post("/products/by/search", listBySearch);

router.delete('/product/:productId/:userId', requireSignin, isAdmin, isAdmin, remove);

router.put('/product/:productId/:userId', requireSignin, isAdmin, isAdmin, update);

router.param('userId', userById);
router.param('productId', productById);


module.exports = router;
