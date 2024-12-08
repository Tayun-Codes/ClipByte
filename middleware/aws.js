const aws = require("aws-sdk");

const awsKeys = (req, res, next) => {
    res.locals.keys = {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        region: process.env.REGION,
        bucketName: process.env.BUCKETNAME
    };
    next();
};  

module.exports = awsKeys;