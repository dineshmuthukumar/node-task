commonMaster = {}



function initializemodel(collectionname){
    var testModel = "default";
    return new Promise((resolve, reject) =>{
        switch (collectionname) {
        
            case "productModel":
                    testModel = require('../models/ProductModel.js');
                    break;
            case "userModel":
                    testModel = require('../models/UserModel.js');
                    break;
            case "orderModel":
                    testModel = require('../models/OrderModel.js');
                    break;

            default:
                // statements_def
                testModel = "";
                break;
        }
        
        resolve (testModel);
    });

}




commonMaster.addAndUpdate = function(collectionname,req,res){
    return new Promise((resolve, reject) => {
        initializemodel(collectionname).then((model)=>{
            try{
                    req = new model(req);
                    model.findOneAndUpdate({_id:req._id}, req, { new:true, upsert:true }, function(err,retdata){
                    if(err || !retdata){
                        return reject(err)
                    }else{
                        return resolve(retdata)
                    }
                })
            }catch(err){
                return reject(err)
            }
        },err=>{
            console.log(err);
            reject(err)
        })
    },err=>{
        console.log(err);
    })
}

commonMaster.findOne = function(collectionname,req) {
    return new Promise((resolve, reject) =>{
        initializemodel(collectionname).then((model)=>{
            try{
                model.findOne(req)
                .exec(function(err, user) {
                    if(err || !user) {
                            reject(err || 'No record found');
                    }else {
                        resolve(user);
                    }
                })
            } catch(err) {
                    reject(err);
            }
        },err=>{
            console.log(err);
            reject(err)
        })
    },err=>{
        console.log(err);
    })
    
};

commonMaster.findOneandUpdate = function(collectionname,req) {
    return new Promise((resolve, reject) => {
        initializemodel(collectionname).then((model)=>{
            try{
                    req = new model(req);
                    model.findOneAndUpdate({internalid:req.internalid}, { $set: req}, function(err,retdata){
                    if(err || !retdata){
                        return reject(err)
                    }else{
                        return resolve(retdata)
                    }
                })
            }catch(err){
                return reject(err)
            }
        },err=>{
            console.log(err);
            reject(err)
        })
    },err=>{
        console.log(err);
    })
};

commonMaster.findAll = function(collectionname,req) {
    return new Promise((resolve, reject) =>{
        initializemodel(collectionname).then((model)=>{
            try{
                model.find(req)
                .exec(function(err, user) {
                    if(err || !user) {
                        return reject(err || 'No record found');
                    }else {
                        resolve(user);
                    }
                })
            } catch(err) {
                return reject(err);
            }
        },err=>{
            console.log(err);
            reject(err)
        })
    },err=>{
        console.log(err);
    })
};

commonMaster.findAndRemove =(collectionname,req) => {
    return new Promise((resolve, reject)=> {
        initializemodel(collectionname).then((model)=>{
            try {
                model.deleteOne({_id:req._id}, req, { new:true, upsert:true }, function(err,retdata){
                    if(err || !retdata){
                        return reject(err)
                    }else{
                        return resolve(retdata)
                    }
                })
            } catch(err) {
                return reject(err);
            }
        },err=>{
            console.log(err);
            reject(err)
        })
    },err=>{
        console.log(err);
    })
};


commonMaster._get = async (model, projection = {}, selection = {}, options = {}) => {

    try {
        const query = model.find(projection);

        if (options.populate) query.populate(options.populate);

        if (options.sort) query.sort(options.sort)

        if (options.skip) query.skip(options.skip);

        if (options.limit) query.limit(options.limit);

        query.select(selection);

        const response = await query;

        return response;

    } catch (err) {
        console.log(err)
    }


}


module.exports = commonMaster;