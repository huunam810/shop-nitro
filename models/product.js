var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    
    imagePath : { type: String, required: true, not: null },
    title : { type: String, required: true, not: null },
    description : { type: String, required: true, not: null },
    type : { type: String, required: true, not: null },
    price : { type: String, required: true, not: null },
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

module.exports= mongoose.model('Product',schema);