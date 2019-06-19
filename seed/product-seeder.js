var Product = require('../models/product');
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/shopping', { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });

var products = [
    new Product({
        imagePath:"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/image/AppleInc/aos/published/images/i/ph/iphone/xr/iphone-xr-white-select-201809?wid=940&hei=1112&fmt=png-alpha&qlt=80&.v=1551226036668",
        title:"iphone xr white",
        type: "Iphone",
        description:"minion1",
        price: 100
    }),
    new Product({
        imagePath:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/image/AppleInc/aos/published/images/i/ph/iphone/xr/iphone-xr-blue-select-201809?wid=940&hei=1112&fmt=png-alpha&qlt=80&.v=1551226036356",
        title:"iphone xr blue",
        type: "Iphone",
        description:"minion1",
        price: 100
    }),
    new Product({
        imagePath:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/image/AppleInc/aos/published/images/i/ph/iphone/xr/iphone-xr-black-select-201809?wid=940&hei=1112&fmt=png-alpha&qlt=80&.v=1551226038992",
        title:"iphone xr black",
        type: "Iphone",
        description:"minion8",
        price: 100
    }),
    new Product({
        imagePath:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/image/AppleInc/aos/published/images/i/ph/iphone/xr/iphone-xr-yellow-select-201809?wid=940&hei=1112&fmt=png-alpha&qlt=80&.v=1551226036826",
        title:"iphone xr yellow",
        type: "Iphone",
        description:"minion10",
        price: 1000
    }),
    new Product({
        imagePath:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/image/AppleInc/aos/published/images/i/ph/iphone/xr/iphone-xr-red-select-201809?wid=940&hei=1112&fmt=png-alpha&qlt=80&.v=1551226038669",
        title:"iphone xr red",
        type: "Iphone",
        description:"minion12",
        price: 1002
    }),
    new Product({
        imagePath:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/image/AppleInc/aos/published/images/i/ph/iphone/xr/iphone-xr-coral-select-201809?wid=470&hei=556&fmt=png-alpha&.v=1551226036571",
        title:"iphone xr coral",
        type: "Iphone",
        description:"minion12",
        price: 1002
    }),
    new Product({
        imagePath:"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/image/AppleInc/aos/published/images/i/pa/ipad/pro/ipad-pro-12-select-201810?wid=485&hei=510&fmt=png-alpha&.v=1540576093087",
        title:"iPad Pro",
        type: "Ipad",
        description:"minion12",
        price: 1002
    }),
];

var done = 0;
for(var i =0 ; i<products.length;i++){
    products[i].save(function(err,result){
        done++;
        if(done === products.length){
            exit();
        }
    });
}
function exit(){
    mongoose.disconnect();
}
