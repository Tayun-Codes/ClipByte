const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/index");
// const postsController = require("../controllers/posts");
const uploadController = require("../controllers/upload");
const transcribeController = require('../controllers/transcribe');

const { ensureAuth, ensureGuest } = require("../middleware/auth");
const awsKeys = require("../middleware/aws");


//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.get("/upload", ensureAuth, awsKeys, uploadController.getUpload);
router.post('/transcribeKey', transcribeController.transcribeFile)
router.get("/completed", );
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;