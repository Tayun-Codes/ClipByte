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