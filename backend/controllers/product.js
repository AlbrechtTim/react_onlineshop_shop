const Product = require('../models/product');
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.productById = (req, res, next, id) => {
    Product.findById(id).exec((err, product) => {
        if (err || !product) {
            return res.status(400).json({
                error: 'Product not found!'
            });
        }
        req.product = product;
        next();
    });
};

exports.read = (req, res) => {
    req.product.image = undefined;
    return res.json(req.product);
};

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded!'
            });
        }
        //check all form fields
        const { name, description, price, category, quantity, shipping } = fields;
        if (!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: 'All fields are required!'
            });
        };

        let product = new Product(fields);

        if (files.image) {
            //size shard
            //1kb = 1000
            //1mb = 1000000
            if (files.image.size > 1000000) {
                error: 'Image is to big! Make sure your Imagesize is not bigger than 1MB.'
            };
            product.image.data = fs.readFileSync(files.image.path);
            product.image.contentType = files.image.type;
        };

        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });

    });
};

exports.remove = (req, res) => {
    let product = req.product;
    product.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            deletedProduct,
            "message": 'Product deleted successfully.'
        });
    });
};

exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded!'
            });
        }
        //check all form fields
        const { name, description, price, category, quantity, shipping } = fields;
        if (!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: 'All fields are required!'
            });
        };

        let product = req.product;
        product = _.extend(product, fields);

        if (files.image) {
            /**
             * size shard
             * 1kb = 1000
             * 1mb = 1000000
            */
            if (files.image.size > 1000000) {
                error: 'Image is to big! Make sure your Imagesize is not bigger than 1MB.'
            };
            product.image.data = fs.readFileSync(files.image.path);
            product.image.contentType = files.image.type;
        };

        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });

    });
};

/**
 * Products by sell / arrival
 * for popular or new arrival
 * sell params = ?sortBy=sold&order=desc&limit=0
 * arrival params = ?sortBy=createdDate&order=desc&limit=0
 * returns all if no params are given
 */
exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 25;

    Product.find()
        .select("-image")
        .populate("category")
        .sort([[sortNy, order]])
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: 'No Products found.'
                });
            }
            res.json(Products);
        });
};

/**
 * find products based on same category
 * products with same category will be returned
 */
exports.listRelatedProducts = (res, req) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;
    Product.find({ _id: { $ne: req.product }, category: req.product.category })
        .limit(limit)
        .populate('category', '_id', 'name')
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: 'No Products found.'
                });
            }
            res.json(products);
        });
};

exports.listProductsCategories = (res, req) => {
    Product.distinct("category", {}, (err, categories) => {
        if (err) {
            return res.status(400).json({
                error: 'Categories not found.'
            });
        }
        res.json(categories);
    });
};

/**
 * list product by Search
 * search will be implemented in react frontend
 * categiroes as checkboxes and prices range with radio buttons
 * each click will use a api request
 */
exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    Product.find(findArgs)
        .select("-image")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found."
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

exports.getImage = (res, req) => {
    if(req.product.image.data) {
        res.set('Content-type', req.product.image.contentType);
        return res.send(req.product.image.data);
    };
    next();
};
