const aws = require("../middleware/aws");


exports.getLoading = (req, res) => {
    // async call to aws -> continue checking for successful
    // include a timeout ?
    // if (/*upload !successful (response from aws)*/) {
    //   return res.redirect("/upload");
    // }
    // res.render("loading", {
    //     //info to ejs
    //   title: "Login",
    // });
    console.log('getLoading')
  };

//

module.exports = {
  getUpload: async (req, res) => {
    try {
      res.render("upload.ejs");
    } catch (err) {
      console.log(err);
    }
  },

  s3upload: async (req, res) => {
    console.log(req, 'REQ')
    console.log(req.body, 'REQBODY')

    // try {
    //   s3.upload(params, function (err, data) {
    //     if (err) {
    //         console.error('Upload Error:', err);
    //         alert('Failed to upload file.');
    //         return;
    //     }
    //     alert('Successfully Uploaded! File URL: ' + data.Location);
    // }).on('httpUploadProgress', function (progress) {
    //     var uploaded = parseInt((progress.loaded * 100) / progress.total);
    //     document.querySelector("progress").value = uploaded;
    //     console.log('Upload Progress:', uploaded + '%');
    // });
    // }
  }
}

