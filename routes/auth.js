const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Mongoose = require('mongoose');
const google = require('googleapis');
const axios = require("axios")
const ConfirmationCode = require("../models/confirmationCode");
const JwtToken = require("../models/jwtToken");
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { body, param, validationResult } = require('express-validator');
const palabra_secreta_aes = process.env.VUE_APP_SECRET_WORD_AES || "very_secret_this_is_AES_12345"
const palabra_secreta_jwt = process.env.VUE_APP_SECRET_WORD_JWT


router.post("/login", async (req, res) => {
    
    passport.authenticate("local", async (err, user, info) => {
    try {
        console.log(user)
        if (err) {
            
            return res.status(400).json({ errors: err });
        }
        if (!user) {
            
            return res.status(400).json(info);
        }
  
        let userId = user._id;
        const isAdmin = user.isAdmin
        let message = { userId, isAdmin };
        let mensajeJson = JSON.stringify(message);
        
        let mensajeCifrado = CryptoJS.AES.encrypt(mensajeJson, palabra_secreta_aes).toString();
        res.status(200).json(mensajeCifrado);
    } catch (error) {
            console.log(error)
            return res.status(400).json({ errors: error });
    }
    })(req, res);
  });

///////////////////////////////////////////////////////

router.post("/register", [
    body('username').notEmpty(),
    body('password').isLength({ min: 6 })
  ],async (req, res) => {
    let { body, params } = req;
    
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    
    let hasError = false;
    
    if (!body.password) {
        errors.password = { msg: 'The password field cannot be blank' };
        hasError = true;
    }
    
    if (!body.username) {
        errors.username = { msg: 'The username field cannot be blank' };
        hasError = true;
    } else {
        let duplicatedUser = await User.findOne({ username: body.username });
        if (duplicatedUser && duplicatedUser.password!=null) {
            errors.username = { msg: 'This username is already in use' };
            hasError = true;
        }
    }
    
    if (hasError) {
        return res.status(400).json({ errors });
    }

    try {
        body.password = bcrypt.hashSync(body.password, 10);
        const userToFind = await User.findOneAndUpdate({"username": body.username},{ ...body });
        let userDB;
        let userId;
        if(userToFind!=null){
            userId = userToFind._id
            userDB =userToFind
        }else{
            userId = new Mongoose.Types.ObjectId();
            userDB = await User.create({ ...body, _id: userId });
        }
        
        return res.status(200).json({msg:"el usuario se ha creado correctamente"});
    } catch (err) {

        return res.status(500).json({ message: err.message });
    }
});

///////////////////////////////////////////////////////

router.post('/logout', function(req, res, next){
    req.session.destroy()
    res.status(401);
});

module.exports = router;