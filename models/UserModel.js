var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var UserModel = new Schema({
    id         : {type: String},
    first_name          : {type: String},
    last_name          : {type: String},
    email             : {type: String},
    password: {type: String},
    address : {type: String}

});

module.exports = mongoose.model("users", UserModel, "users");/*  */