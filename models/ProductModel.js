var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var ProductModel = new Schema({
    id         : {type: String},
    name          : {type: String},
    description          : {type: String},
    price          : {type: String}
});

module.exports = mongoose.model("product", ProductModel, "product");/*  */