const aws = require("aws-sdk");

require("dotenv").config({ path: "./config/.env" });

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

module.exports = aws;