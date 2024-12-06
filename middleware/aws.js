const aws = require("aws-sdk");

require("dotenv").config({ path: "./config/.env" });

const awsKeys = (req, res, next) => {
    res.locals.key = {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        region: process.env.REGION
    };
    next();
};  

module.exports = awsKeys;