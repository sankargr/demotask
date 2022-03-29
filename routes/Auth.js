const express = require('express')
const router = express.Router()
const auth = require('../controllers/AuthController')
const CommonLib = require("../components/CommonLib");

router.post('/signup',auth.signup)
router.post('/login',auth.login)
router.post('/changePwd',CommonLib.verifyToken,auth.changePwd)


router.post('/forgotPwd',auth.forgotPwd)

router.post('/resetPwd',auth.resetPwd)



module.exports =router