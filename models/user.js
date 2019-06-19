var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
info: {
    firstname: { type: String, required: true, not: null },
    lastname: { type: String, required: true, not: null },
    phone: String,
    address: String,  
},
local: { // Use local
    email: { 
        type: String, 
        required: true, 
        unique: true,
        not: null 
    },
    password: { type: String, required: true, not: null },
    activeToken: String,
    activeExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date
},
facebook: { // Use passport facebook
    id: String,
    token: String,
    email: String,
    name: String,
    photo: String
},
google: { // Use passport google
    id: String,
    token: String,
    email: String,
    name: String,
    photo: String
},
    newsletter: Boolean, // True or false
    roles: { type: String, required: true , not: null}, //ADMIN, MOD, MEMBER, VIP
    status: { type: String, required: true , not: null}, //ACTIVE, INACTIVE, SUSPENDED
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
}, 

);
userSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
}

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
}


userSchema.methods.isGroupAdmin = function(checkRole) {
    if (checkRole === "ADMIN") {
        return true;
    } else {
        return false;
    }
}

userSchema.methods.isInActivated = function(checkStatus) {
    if (checkStatus === "INACTIVE") {
        return true;
    } else {
        return false;
    }
};

userSchema.methods.isSuspended = function(checkStatus) {
    if (checkStatus === "SUSPENDED") {
        return true;
    } else {
        return false;
    }
};

module.exports= mongoose.model('User',userSchema);









// var userSchema = new Schema({
//     email: {
//         type: String, 
//     },
//     password: {
//         type: String, 
//     },
//     google: { // Use passport google
//         id: String,
//         token: String,
//         email: String,
//         name: String,
//         photo: String
//     },
// });

// userSchema.methods.encryptPassword = function(password) {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
// };

// userSchema.methods.validPassword = function(password) {
//     return bcrypt.compareSync(password, this.password);
// };