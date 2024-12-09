const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/index");
const uploadController = require("../controllers/upload");
const transcribeController = require('../controllers/transcribe');
const openAiController = require('../controllers/openai');
const videoController = require('../controllers/videoController');

const { ensureAuth, ensureGuest } = require("../middleware/auth");
const awsKeys = require("../middleware/aws");


//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.get("/upload", ensureAuth, awsKeys, uploadController.getUpload);
router.post('/transcribeKey', transcribeController.transcribeFile)
router.post('/openai', openAiController.analyzeForClips)
router.get("/completed", videoController.getVideoClips);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;