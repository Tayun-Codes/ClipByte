const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/index");
// const postsController = require("../controllers/posts");
const uploadController = require("../controllers/upload");
// const awsController = require("../controllers/aws");

const { ensureAuth, ensureGuest } = require("../middleware/auth");
const awsKeys = require("../middleware/aws");


//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.get("/upload", ensureAuth, awsKeys, uploadController.getUpload);
//router.post("/upload", uploadController.getLoading); //post aws
router.get("/completed", );
// router.get("/feed", ensureAuth, postsController.getFeed);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;