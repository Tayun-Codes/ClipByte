const aws = require("../middleware/aws");

module.exports = {
  getUpload: async (req, res) => {
    try {
      res.render("upload.ejs", {
        user: req.user,
        title: 'Upload!'
    });
      
    } catch (err) {
      console.log(err);
    }
  },
}

//notes
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