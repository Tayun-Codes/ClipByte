const aws = require("../middleware/aws");
const s3 = new aws.S3(); //older sdk syntax

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

/*
const listBuckets = async () => {
    //try-catch block: try to create params, succesful -> create objects and console.log! if it fails then catch it and return an error
    try {
      const params = {
        Bucket: 'clipbyte-test', //PUT INTO ENV OR GENERATE
      }
      const objects = await s3.listObjectsV2(params).promise() //calling listobects api with params, find my objects and return it when you get the response by accessing the client (aws) | listObjectsV2 ??
      console.log(objects)
    }
    catch (error) {
      console.log('err', error)
    }
  }
*/