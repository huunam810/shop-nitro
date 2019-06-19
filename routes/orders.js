const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = mongoose.model('Order');

const Product = require("../models/product");
var Cart = require('../models/cart');


router.get('/', function (req, res, next) {
  Order.find( function(err, orders) {
      if (err) {
          return res.write('Error!');
      }
      var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
      });
      res.render('shop/order-list', { 
          orders: orders,
          layout: false 
      });
  });
});



router.get("/:orderId", (req, res, next) => {
  Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }
      res.render('shop/order-detail', {
        layout: false ,
        orders: order
      });
    })
});

router.delete("/:orderId", (req, res, next) => {
  Order.remove({ _id: req.params.orderId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Order deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/orders",
          body: { productId: "ID", quantity: "Number" }
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
