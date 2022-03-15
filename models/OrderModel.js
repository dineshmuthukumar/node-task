var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var OrderModel = new Schema({
    id         : {type: String},
    user_id         : {type: Schema.Types.ObjectId,ref:"users"},
    product_id         :  {type: Schema.Types.ObjectId,ref:"product"},
    quantity        : {type: Number},
    amount   :{type: String},
    status        : {type: String},
    created_at: {type: String},
    updated_at: {type: String}
});

module.exports = mongoose.model("orders", OrderModel, "orders");/*  */