var mongoose = require('mongoose');
var passport = require('passport');
const express = require('express');
var router = express.Router();
var multer = require('multer');

var Product = mongoose.model('Product');
var Product = require("../models/product");

var  storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/images/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
  });
  
  var  fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  
  var  upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
  });


router.get('/', function (req, res, next) {
    Product.find(function (err, docs) {
        var productChunks = [];
        var chunkSize = 10;
       for (var i = 0; i < docs.length; i += chunkSize) {
           productChunks.push(docs.slice(i, i + chunkSize));
       }
        res.render('shop/list', {products: productChunks, layout: false});
   });
});

router.post('/', upload.single('imagePath'),(req, res) => {
   if (req.body._id == '')
       insertProduct(req, res);
       else
       updateProduct(req, res);
});

function insertProduct(req, res, next) {
   var product = new Product();
   console.log(req.file);
   product.imagePath = req.file.filename;
   product.title = req.body.title;
   product.description = req.body.description;
   product.type = req.body.type;
   product.price = req.body.price;
   product.save((err, doc) => {
       if (!err)
       res.redirect('product/add');
       else {
           if (err.name == 'ValidationError') {
               handleValidationError(err, req.body);
               res.render("shop/list", {
                   viewTitle: "Insert Product",
                   message: "Created product successfully",
                   layout: false,
                   product: req.body
               });
           }
           else
               console.log('Error during record insertion : ' + err);
       }
   });
}


function updateProduct(req, res) {
   Product.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
       if (!err) 
       res.redirect('product/add');
       else {
           if (err.name == 'ValidationError') {
               handleValidationError(err, req.body);
               res.render("shop/list", {
                   viewTitle: 'Update Product',
                   message: "Updated product successfully",
                   layout: false,
                   product: req.body
               });
           }
           else
               console.log('Error during record update : ' + err);
       }
   });
}

router.get('/add', (req, res) => {
    Product.find((err, docs) => {
        if (!err) {
            res.render("shop/add", {
                products: docs,
                layout: false
            });
        }
        else {
            console.log('Error in retrieving employee list :' + err);
        }
    });
});

function handleValidationError(err, body) {
   for (field in err.errors) {
       switch (err.errors[field].path) {
           case 'imagePath':
               body['imagePathError'] = err.errors[field].message;
               break;
           case 'title':
               body['titleError'] = err.errors[field].message;
               break;
           default:
               break;
       }
   }
}

router.get('/:productId', (req, res) => {
    var id = req.params.productId;
   Product.findById(id, (err, doc) => {
       if (!err) {
           res.render("shop/list", {
               viewTitle: "Update Product",
               layout: false,
               product: doc
           });
       }
   });
});

router.get('/delete/:productId', (req, res) => {
    const id = req.params.productId;
   Product.findByIdAndRemove({ _id: id }, (err, doc) => {
       if (!err) {
           res.redirect('/product/add');
       }
       else { console.log('Error in Product delete :' + err); }
   });
});
 
  module.exports = router;

function isLoggedInAdmin(req, res, next) {
    if (req.user && req.user.roles === "ADMIN" && req.user.provider === "admin") {
        return next();
    } else {
        return res.redirect('/admin/login');
    }
};
function notLoggedInAdmin(req, res, next) {
    if (!req.user) {
        return next();
    } else {
        if (req.user && req.user.roles !== "ADMIN" && req.user.provider !== "admin") {
            return next();
        } else {
            return res.redirect('/admin');
        }
    }
}