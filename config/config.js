var config = {};
var env = process.argv[2] || 'prod';
console.log(env);
switch (env) {
    case 'dev':
        console.log("Development Config Initiated");
        process.env.NODE_ENV = "dev";
        break;
    case 'prod':
        console.log("Production Config Initiated");
        process.env.NODE_ENV = "prod"
        break;
}

config.dev = {
    token:"testkey",
    // db: 'mongodb+srv://root:Password_123@development.ld4xp.mongodb.net/netsuiteConnector?retryWrites=true&w=majority',
   // db: 'mongodb+srv://root:@development.ld4xp.mongodb.net/crud?retryWrites=true&w=majority',
    db:'mongodb://localhost:27017/crud', 
    host: "http://localhost",
    node_port: 3000,
    browser_sync_port: 3000,
  
    admin_mail_id: {
        id: "dineshmuthukumar448@gmail.com"
    }
};

config.prod = {
    token:"testkey",
    db: 'mongodb+srv://root:Password_123@development.ld4xp.mongodb.net/netsuiteUATConnector?retryWrites=true&w=majority',
    host: "https://netsuiteshopify.ml:442",
    node_port: 442,
    browser_sync_port: 442,
    mailer: {
        // id: "altrocksdev@gmail.com",
        // password: "Altrocks@2020"
        id : "fieldservicereport01@gmail.com",
        password : "fsr@admin$01"
    }
    
};
//jenkins added
module.exports = config;
