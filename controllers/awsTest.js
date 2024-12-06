const aws = require("../middleware/awsTest");
const s3 = new aws.S3(); //older sdk syntax

//written and used to initially test correct access of the aws-sdk package and to the cloud&bucket
module.exports = {
    listBuckets: async () => {
        try {
            const params = {
              Bucket: 'clipbyte-test',
            }
            const objects = await s3.listObjectsV2(params).promise() 
            console.log(objects)
          }
          catch (error) {
            console.log('err', error)
          }
    }
}